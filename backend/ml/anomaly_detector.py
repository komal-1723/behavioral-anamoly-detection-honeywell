import numpy as np

from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM

from datetime import datetime
from typing import List, Dict, Any, Tuple
from backend.ml.profiler import haversine_distance, profiler_instance

class MultiModelAnomalyDetector:
    def __init__(self):
        self.iso_forest = IsolationForest(n_estimators=100, contamination=0.03, random_state=42)
        self.one_class_svm = OneClassSVM(nu=0.03, kernel="rbf", gamma="scale")
        self.lof = LocalOutlierFactor(n_neighbors=20, novelty=True, contamination=0.03)
        
        self.is_trained = False
        self.quantile_threshold = 0.85 # Cutoff score for top 1-3% anomaly alerting

    def extract_feature_vector(self, log: Dict[str, Any], profile: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Converts log + entity profile into numerical feature vector + feature dict.
        """
        ts = log["timestamp"]
        if isinstance(ts, str):
            ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))

        # Feature 1: Off-hours penalty
        hour_dist = profile.get("habitual_hours_json", {})
        hour_prob = hour_dist.get(str(ts.hour), 0.01)
        off_hours_score = max(0.0, 1.0 - hour_prob * 10)

        # Feature 2: Geo Velocity / Rarity
        lat = log.get("latitude", 0.0)
        lon = log.get("longitude", 0.0)
        top_locs = profile.get("top_locations_json", {})
        current_loc = f"{log.get('country', 'US')}-{log.get('city', 'Unknown')}"
        geo_rarity_score = 0.0 if current_loc in top_locs else 0.9

        # Feature 3: Unrecognized Device
        known_devs = profile.get("known_devices_json", [])
        device_surprise = 0.0 if log.get("device_id") in known_devs else 1.0

        # Feature 4: Resource Rarity
        top_resources = profile.get("typical_resources_json", {})
        resource_surprise = 0.0 if log.get("resource_accessed") in top_resources else 0.85

        # Feature 5: Login Failure & MFA/VPN status
        failed_login_score = 1.0 if log.get("login_status") == "FAILED" else 0.0
        no_mfa_score = 1.0 if not log.get("mfa_enabled", True) else 0.0
        vpn_risk_score = 0.8 if log.get("vpn_used", False) and log.get("country") in ["KP", "RU", "IR", "CN"] else 0.0

        # Feature 6: Session Duration Z-Score
        avg_dur = profile.get("avg_session_duration", 3600.0)
        std_dur = profile.get("std_session_duration", 1800.0)
        dur = log.get("session_duration", 3600.0)
        duration_zscore = abs(dur - avg_dur) / (std_dur + 1.0)
        duration_anomaly_score = min(1.0, duration_zscore / 5.0)

        # Feature 7: Command Sequence Suspicion
        cmd_seq = str(log.get("command_sequence", ""))
        suspicious_cmds = ["sudo su", "dump_hashes", "psexec", "bulk_download", "chmod +s", "exfiltrate"]
        cmd_score = 1.0 if any(cmd in cmd_seq for cmd in suspicious_cmds) else 0.0

        features_dict = {
            "off_hours_score": float(off_hours_score),
            "geo_rarity_score": float(geo_rarity_score),
            "device_surprise": float(device_surprise),
            "resource_surprise": float(resource_surprise),
            "failed_login_score": float(failed_login_score),
            "no_mfa_score": float(no_mfa_score),
            "vpn_risk_score": float(vpn_risk_score),
            "duration_anomaly_score": float(duration_anomaly_score),
            "cmd_score": float(cmd_score)
        }

        vector = np.array(list(features_dict.values()), dtype=np.float32)
        return vector, features_dict

    def train(self, training_data: List[Tuple[Dict[str, Any], Dict[str, Any]]]):
        """
        Trains Isolation Forest, One-Class SVM, and LOF on baseline normal telemetry features.
        """
        X = []
        for log, profile in training_data:
            vec, _ = self.extract_feature_vector(log, profile)
            X.append(vec)

        X_mat = np.array(X)
        if len(X_mat) < 10:
            return

        self.iso_forest.fit(X_mat)
        self.one_class_svm.fit(X_mat)
        self.lof.fit(X_mat)
        
        self.is_trained = True

    def predict(self, log: Dict[str, Any], profile: Dict[str, Any]) -> Tuple[float, Dict[str, float], bool]:
        """
        Computes composite anomaly score (0.0 to 1.0), feature attribution dict, and anomaly flag.
        """
        vec, feat_dict = self.extract_feature_vector(log, profile)
        X_test = vec.reshape(1, -1)

        # 1. Statistical Z-Score / Rule Engine Baseline Score
        stat_score = float(np.mean(vec))

        if self.is_trained:
            # Scikit-learn isolation models return decision_function (higher is normal, lower is anomalous)
            iso_score = float(-self.iso_forest.decision_function(X_test)[0])
            svm_score = float(-self.one_class_svm.decision_function(X_test)[0])
            lof_score = float(-self.lof.score_samples(X_test)[0])
            
            # Normalize to 0-1 range
            iso_norm = 1.0 / (1.0 + np.exp(-iso_score * 3))
            svm_norm = 1.0 / (1.0 + np.exp(-svm_score * 3))
            lof_norm = 1.0 / (1.0 + np.exp(-lof_score * 3))

            # Ensemble weighted score
            ensemble_score = (0.4 * stat_score) + (0.25 * iso_norm) + (0.2 * svm_norm) + (0.15 * lof_norm)
        else:
            ensemble_score = stat_score

        composite_score = min(1.0, max(0.0, float(ensemble_score)))
        is_anomaly = composite_score >= self.quantile_threshold or feat_dict["cmd_score"] > 0.8 or feat_dict["geo_rarity_score"] > 0.85

        return composite_score, feat_dict, is_anomaly

anomaly_detector_instance = MultiModelAnomalyDetector()
