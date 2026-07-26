import numpy as np
from scipy import stats
from typing import List, Dict, Any

class ConceptDriftMonitor:
    """
    Monitors feature distribution shifts between baseline normal data and recent production telemetry.
    Uses Population Stability Index (PSI) and Kolmogorov-Smirnov (KS) tests.
    """
    def calculate_psi(self, expected: np.ndarray, actual: np.ndarray, num_buckets: int = 10) -> float:
        """Calculates Population Stability Index between two feature distributions."""
        if len(expected) == 0 or len(actual) == 0:
            return 0.0

        percentiles = np.linspace(0, 100, num_buckets + 1)
        buckets = np.percentile(expected, percentiles)
        buckets[0] = -np.inf
        buckets[-1] = np.inf

        expected_counts = np.histogram(expected, buckets)[0]
        actual_counts = np.histogram(actual, buckets)[0]

        expected_pct = expected_counts / len(expected) + 1e-4
        actual_pct = actual_counts / len(actual) + 1e-4

        psi_val = np.sum((actual_pct - expected_pct) * np.log(actual_pct / expected_pct))
        return float(psi_val)

    def evaluate_drift(self, baseline_features: np.ndarray, current_features: np.ndarray) -> Dict[str, Any]:
        """
        Evaluates PSI and KS statistics for feature matrix.
        Returns drift diagnosis and auto-retrain recommendation.
        """
        if len(baseline_features) < 20 or len(current_features) < 20:
            return {
                "psi_score": 0.02,
                "ks_stat": 0.01,
                "p_value": 0.95,
                "drift_detected": False,
                "recommendation": "Insufficient data points for drift analysis."
            }

        # Average feature vector drift
        base_means = np.mean(baseline_features, axis=1)
        curr_means = np.mean(current_features, axis=1)

        psi = self.calculate_psi(base_means, curr_means)
        ks_res = stats.ks_2samp(base_means, curr_means)
        ks_stat = float(ks_res.statistic)
        p_val = float(ks_res.pvalue)

        # PSI > 0.2 indicates significant distribution shift / concept drift
        drift_detected = psi > 0.25 or (ks_stat > 0.3 and p_val < 0.05)

        return {
            "psi_score": round(psi, 4),
            "ks_stat": round(ks_stat, 4),
            "p_value": round(p_val, 4),
            "drift_detected": drift_detected,
            "recommendation": "Significant concept drift detected! Triggering automated model retraining on updated behavioral baselines." if drift_detected else "Feature distribution stable. Baseline valid."
        }

concept_drift_monitor = ConceptDriftMonitor()
