import math
from typing import Dict, List, Any
from datetime import datetime

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in kilometers between two GPS points."""
    R = 6371.0 # Radius of earth in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class BehaviorProfiler:
    """
    Computes per-entity habitual normal behavior baselines and handles cold start priors.
    """
    def __init__(self):
        # Default cold start priors based on role
        self.role_priors = {
            "Developer": {"habitual_hours": [8,9,10,11,12,13,14,15,16,17,18], "allowed_resources": ["/api/v1/user/profile", "GitHub_Enterprise", "ssh://prod-node-01.internal:22"]},
            "SystemAdmin": {"habitual_hours": [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23], "allowed_resources": ["ActiveDirectory", "smb://vault/confidential_db", "rdp://admin-desktop:3389"]},
            "Accountant": {"habitual_hours": [9,10,11,12,13,14,15,16,17], "allowed_resources": ["/api/v1/finance/reports", "/api/v1/payroll/export"]},
            "Analyst": {"habitual_hours": [8,9,10,11,12,13,14,15,16,17], "allowed_resources": ["Salesforce", "/api/v1/user/profile"]},
        }

    def build_profile(self, logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculates statistical distributions over historical logs for a single entity."""
        if not logs:
            return self.get_cold_start_prior("user", "Developer")

        hours_hist = {str(h): 0 for h in range(24)}
        ips = {}
        locations = {}
        resources = {}
        devices = set()
        durations = []

        for log in logs:
            ts = log["timestamp"]
            if isinstance(ts, str):
                ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
            hour_str = str(ts.hour)
            hours_hist[hour_str] += 1

            ip = log.get("source_ip", "0.0.0.0")
            ips[ip] = ips.get(ip, 0) + 1

            loc = f"{log.get('country', 'US')}-{log.get('city', 'Unknown')}"
            locations[loc] = locations.get(loc, 0) + 1

            res = log.get("resource_accessed", "Unknown")
            resources[res] = resources.get(res, 0) + 1

            dev = log.get("device_id")
            if dev:
                devices.add(dev)

            dur = log.get("session_duration", 0.0)
            durations.append(dur)

        total_events = len(logs)

        # Normalize distributions
        hours_dist = {h: cnt / total_events for h, cnt in hours_hist.items()}
        avg_dur = sum(durations) / total_events if total_events > 0 else 0.0
        var_dur = sum((x - avg_dur) ** 2 for x in durations) / total_events if total_events > 0 else 1.0
        std_dur = math.sqrt(var_dur)

        return {
            "habitual_hours_json": hours_dist,
            "top_ips_json": ips,
            "top_locations_json": locations,
            "typical_resources_json": resources,
            "avg_session_duration": avg_dur,
            "std_session_duration": max(std_dur, 1.0),
            "known_devices_json": list(devices),
            "total_events": total_events
        }

    def get_cold_start_prior(self, entity_type: str, role: str) -> Dict[str, Any]:
        """Provides default prior profile for new entity with no prior log history."""
        prior = self.role_priors.get(role, self.role_priors["Developer"])
        hours_dist = {str(h): (1.0 / len(prior["habitual_hours"]) if h in prior["habitual_hours"] else 0.01) for h in range(24)}
        
        return {
            "habitual_hours_json": hours_dist,
            "top_ips_json": {"192.168.1.1": 10},
            "top_locations_json": {"US-New York": 10},
            "typical_resources_json": {r: 5 for r in prior["allowed_resources"]},
            "avg_session_duration": 3600.0,
            "std_session_duration": 1800.0,
            "known_devices_json": ["dev_default"],
            "total_events": 10
        }

profiler_instance = BehaviorProfiler()
