from typing import Dict, Any, Tuple

class ExplainableAIEngine:
    """
    Generates feature attributions, natural language explanations, risk scores, and recommendations.
    """
    def generate_explanation(
        self, 
        log: Dict[str, Any], 
        feat_dict: Dict[str, float], 
        anomaly_score: float, 
        attack_type: str, 
        confidence: float
    ) -> Dict[str, Any]:

        # High-impact critical attack categories
        critical_attack_categories = [
            "Credential Misuse", "Impossible Travel", "Privilege Escalation", 
            "TOR Exit Node Access", "Insider Threat", "Session Hijacking", 
            "Abnormal Data Download", "Lateral Movement"
        ]

        # 1. Feature Attribution Breakdown (% normalized)
        total_weight = sum(feat_dict.values()) + 1e-6
        contributions = {k: round((v / total_weight) * 100, 1) for k, v in feat_dict.items() if v > 0.05}
        if not contributions:
            contributions = {"anomaly_deviation": 100.0}

        # 2. Risk Score (0 to 100)
        base_risk = (anomaly_score * 0.5 + confidence * 0.5) * 100
        if attack_type in critical_attack_categories:
            base_risk += 15.0 # Boost critical attack vectors to CRITICAL threshold
            
        risk_score = int(min(100, max(15, round(base_risk))))

        # 3. Severity Level
        if risk_score >= 80 or attack_type in ["Privilege Escalation", "Impossible Travel", "TOR Exit Node Access", "Credential Misuse"]:
            severity = "CRITICAL"
        elif risk_score >= 65:
            severity = "HIGH"
        elif risk_score >= 45:
            severity = "MEDIUM"
        else:
            severity = "LOW"

        # 4. Natural Language Explanation
        entity_id = log.get("entity_id")
        country = log.get("country")
        city = log.get("city")
        ip = log.get("source_ip")
        resource = log.get("resource_accessed")

        narrative_parts = [f"Event for entity '{entity_id}' triggered alert class [{attack_type}] with {confidence*100:.0f}% confidence."]

        if feat_dict.get("geo_rarity_score", 0) > 0.5:
            narrative_parts.append(f"Anomalous geographic origin detected from {city}, {country} (IP: {ip}), diverging from historical location baselines.")

        if feat_dict.get("device_surprise", 0) > 0.5:
            narrative_parts.append(f"Access initiated from unauthenticated device ID '{log.get('device_id')}' with unfamiliar OS fingerprint.")

        if feat_dict.get("resource_surprise", 0) > 0.5:
            narrative_parts.append(f"Unauthorized resource requested: '{resource}' outside entity's role privileges.")

        if feat_dict.get("cmd_score", 0) > 0.5:
            narrative_parts.append(f"High-risk command sequence executed: {log.get('command_sequence')}.")

        if feat_dict.get("off_hours_score", 0) > 0.5:
            narrative_parts.append(f"Access timestamp is outside habitual business hours.")

        explanation_text = " ".join(narrative_parts)

        # 5. Actionable Analyst Recommendations
        recommendations = {
            "Credential Misuse": "1. Immediately invalidate current JWT/OAuth session tokens for entity. 2. Force password reset & revoke Kerberos ticket.",
            "Brute Force": "1. Block source IP range in perimeter firewall. 2. Trigger mandatory MFA challenge on next authentication.",
            "Impossible Travel": "1. Terminate active connection immediately. 2. Verify physical user location with SOC security desk.",
            "Password Spraying": "1. Enable temporary IP rate-limiting on /api/v1/auth endpoint. 2. Lock targeted service accounts.",
            "Device Spoofing": "1. Quarantine MAC address at network switch/AP. 2. Push MDM re-registration agent.",
            "Insider Threat": "1. Revoke read/write access to confidential databases. 2. Escalate incident to Insider Risk Management team.",
            "Privilege Escalation": "1. Isolate host endpoint from corporate subnet. 2. Audit sudoers policy & terminate elevated bash subshell.",
            "Session Hijacking": "1. Flush active cookie sessions. 2. Invalidate refresh tokens and issue re-authentication prompt.",
            "Abnormal Data Download": "1. Restrict egress bandwidth for endpoint. 2. Audit DLP logs for exfiltrated data packages.",
            "Lateral Movement": "1. Isolate target host via EDR agent. 2. Inspect active SMB/RDP connections across domain.",
            "Impossible Login Time": "1. Require biometric MFA confirmation. 2. Check for automated cron jobs.",
            "Rare Country Login": "1. Block authentication attempts from non-geofenced countries. 2. Revoke VPN access.",
            "TOR Exit Node Access": "1. Blacklist public TOR exit node IP. 2. Conduct full EDR malware scan on host.",
            "VPN Abuse": "1. Disconnect active VPN tunnel. 2. Require device health compliance check before re-entry.",
            "Concurrent Sessions": "1. Terminate older session instance. 2. Limit maximum concurrent user sessions to 1.",
            "Suspicious API Usage": "1. Revoke Kubeconfig service account token. 2. Audit Kubernetes API server audit logs.",
            "Multiple Failed Logins": "1. Temporary lockout for account (15 mins). 2. Inspect IP reputation."
        }

        analyst_rec = recommendations.get(attack_type, "1. Review entity access history. 2. Monitor for suspicious follow-up telemetry.")

        return {
            "anomaly_score": round(anomaly_score, 4),
            "attack_type": attack_type,
            "confidence_score": round(confidence, 2),
            "severity": severity,
            "risk_score": risk_score,
            "feature_contributions_json": contributions,
            "natural_language_explanation": explanation_text,
            "analyst_recommendation": analyst_rec
        }

xai_engine_instance = ExplainableAIEngine()
