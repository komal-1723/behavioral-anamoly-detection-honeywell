from typing import Dict, Any, Tuple

class AttackClassifier:
    """
    Multi-class classifier mapping anomalous telemetry feature vectors into specific attack taxonomy categories.
    """
    def classify(self, log: Dict[str, Any], feat_dict: Dict[str, float]) -> Tuple[str, float]:
        cmd_seq = str(log.get("command_sequence", ""))
        country = log.get("country", "US")
        ip = log.get("source_ip", "")
        status = log.get("login_status", "SUCCESS")
        resource = log.get("resource_accessed", "")
        dev_id = log.get("device_id", "")
        app = log.get("application", "")

        # Rule & Feature Decision Tree for 17 Attack Types
        if "Pyongyang" in log.get("city", "") or country == "KP":
            return "Rare Country Login", 0.95
            
        if "185.220." in ip:
            return "TOR Exit Node Access", 0.98

        if "dump_hashes" in cmd_seq or "clear_logs" in cmd_seq:
            return "Credential Misuse", 0.94

        if "failed_auth_attempt" in cmd_seq or (status == "FAILED" and feat_dict.get("failed_login_score", 0) > 0.8):
            if "185.220." in ip:
                return "Password Spraying", 0.92
            if "consecutive_fail" in cmd_seq:
                return "Multiple Failed Logins", 0.90
            return "Brute Force", 0.88

        if feat_dict.get("geo_rarity_score", 0) > 0.8:
            return "Impossible Travel", 0.93

        if "dev_unrecognized" in dev_id or "Kali" in log.get("operating_system", ""):
            return "Device Spoofing", 0.96

        if "payroll" in resource or "exfiltrate" in cmd_seq or "bulk_download" in cmd_seq:
            if "bulk_download" in cmd_seq:
                return "Abnormal Data Download", 0.95
            return "Insider Threat", 0.91

        if "sudo su" in cmd_seq or "chmod +s" in cmd_seq or "adduser backdoor" in cmd_seq:
            return "Privilege Escalation", 0.97

        if "psexec" in cmd_seq or "net use" in cmd_seq:
            return "Lateral Movement", 0.94

        if "kubectl" in cmd_seq or app == "Kubernetes_Cluster":
            return "Suspicious API Usage", 0.92

        if log.get("vpn_used") and country in ["RU", "KP", "CN"]:
            return "VPN Abuse", 0.89

        if feat_dict.get("off_hours_score", 0) > 0.85:
            return "Impossible Login Time", 0.87

        if "Modified_Session_Cookie" in log.get("device_fingerprint", ""):
            return "Session Hijacking", 0.91

        if "parallel_session" in cmd_seq:
            return "Concurrent Sessions", 0.88

        # Fallback default
        return "Credential Misuse", 0.75

attack_classifier_instance = AttackClassifier()
