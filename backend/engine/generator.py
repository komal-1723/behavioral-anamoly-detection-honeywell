import random
import uuid
import math
from datetime import datetime, timedelta
from typing import List, Dict, Any, Tuple

# --- Pre-defined Enterprise Entities & Baselines ---
DEPARTMENTS = ["Engineering", "Finance", "HR", "IT_Ops", "Executive", "Sales"]
ROLES = ["Developer", "SystemAdmin", "Accountant", "Analyst", "CISO", "SalesRep"]
ENTITY_TYPES = ["user", "service_account", "edge_device"]

CITIES = [
    {"country": "US", "city": "New York", "lat": 40.7128, "lon": -74.0060},
    {"country": "US", "city": "San Francisco", "lat": 37.7749, "lon": -122.4194},
    {"country": "UK", "city": "London", "lat": 51.5074, "lon": -0.1278},
    {"country": "DE", "city": "Berlin", "lat": 52.5200, "lon": 13.4050},
    {"country": "JP", "city": "Tokyo", "lat": 35.6762, "lon": 139.6503},
    {"country": "SG", "city": "Singapore", "lat": 1.3521, "lon": 103.8198},
    {"country": "IN", "city": "Bengaluru", "lat": 12.9716, "lon": 77.5946},
]

RARE_ATTACK_COUNTRIES = [
    {"country": "KP", "city": "Pyongyang", "lat": 39.0392, "lon": 125.7625},
    {"country": "RU", "city": "Moscow", "lat": 55.7558, "lon": 37.6173},
    {"country": "IR", "city": "Tehran", "lat": 35.6892, "lon": 51.3890},
    {"country": "CN", "city": "Beijing", "lat": 39.9042, "lon": 116.4074},
]

APPLICATIONS = ["AWS_Console", "GitHub_Enterprise", "ActiveDirectory", "Internal_ERP", "Salesforce", "Kubernetes_Cluster"]
RESOURCES = [
    "/api/v1/auth/login", "/api/v1/user/profile", "/api/v1/finance/reports", 
    "smb://vault/confidential_db", "ssh://prod-node-01.internal:22", 
    "/api/v1/payroll/export", "rdp://admin-desktop:3389", "mqtt://broker.edge:1883"
]

OPERATING_SYSTEMS = ["Windows 11 Enterprise", "macOS Sonoma", "Ubuntu Linux 22.04 LTS", "Android 14", "Debian Embedded 12"]
BROWSERS = ["Chrome 126.0", "Firefox 127.0", "Edge 126.0", "Safari 17.5", "Python-requests/2.31"]
AUTH_METHODS = ["password", "token", "certificate", "biometric"]
PROTOCOLS = ["HTTPS", "SSH", "RDP", "TLS", "MQTT"]

ATTACK_TYPES = [
    "Credential Misuse",
    "Brute Force",
    "Impossible Travel",
    "Password Spraying",
    "Device Spoofing",
    "Insider Threat",
    "Privilege Escalation",
    "Session Hijacking",
    "Abnormal Data Download",
    "Lateral Movement",
    "Impossible Login Time",
    "Rare Country Login",
    "TOR Exit Node Access",
    "VPN Abuse",
    "Concurrent Sessions",
    "Suspicious API Usage",
    "Multiple Failed Logins"
]

def generate_entity_pool(num_users: int = 50, num_devices: int = 20) -> List[Dict[str, Any]]:
    pool = []
    # Users
    for i in range(1, num_users + 1):
        dept = random.choice(DEPARTMENTS)
        role = random.choice(ROLES)
        home_loc = random.choice(CITIES)
        pool.append({
            "entity_id": f"usr_{i:03d}",
            "entity_type": "user",
            "department": dept,
            "role": role,
            "home_location": home_loc,
            "habitual_start_hour": random.randint(7, 9),
            "habitual_end_hour": random.randint(17, 19),
            "primary_device_id": f"dev_{i:03d}",
            "primary_mac": f"00:1B:44:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{random.randint(10,99):02X}",
            "os": "Windows 11 Enterprise" if role != "Developer" else "macOS Sonoma",
            "browser": "Chrome 126.0"
        })
    # Service Accounts
    for i in range(1, 10):
        pool.append({
            "entity_id": f"svc_acc_{i:02d}",
            "entity_type": "service_account",
            "department": "IT_Ops",
            "role": "SystemAdmin",
            "home_location": CITIES[0],
            "habitual_start_hour": 0,
            "habitual_end_hour": 23,
            "primary_device_id": f"dev_svc_{i:02d}",
            "primary_mac": f"52:54:00:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{random.randint(10,99):02X}",
            "os": "Ubuntu Linux 22.04 LTS",
            "browser": "Python-requests/2.31"
        })
    # Edge Devices
    for i in range(1, num_devices + 1):
        pool.append({
            "entity_id": f"edge_dev_{i:03d}",
            "entity_type": "edge_device",
            "department": "IT_Ops",
            "role": "Analyst",
            "home_location": random.choice(CITIES),
            "habitual_start_hour": 0,
            "habitual_end_hour": 23,
            "primary_device_id": f"edge_hw_{i:03d}",
            "primary_mac": f"B8:27:EB:{random.randint(10,99):02X}:{random.randint(10,99):02X}:{random.randint(10,99):02X}",
            "os": "Debian Embedded 12",
            "browser": "Python-requests/2.31"
        })
    return pool

class SyntheticDataGenerator:
    def __init__(self):
        self.entity_pool = generate_entity_pool(50, 20)
        self.entity_map = {e["entity_id"]: e for e in self.entity_pool}

    def generate_random_ip(self, country: str = "US") -> str:
        if country == "US":
            return f"192.168.{random.randint(1,10)}.{random.randint(1,254)}"
        elif country in ["UK", "DE"]:
            return f"82.165.{random.randint(1,254)}.{random.randint(1,254)}"
        elif country in ["KP", "RU", "IR", "CN"]:
            return f"185.220.{random.randint(100,105)}.{random.randint(1,254)}" # Simulating TOR/Suspicious range
        else:
            return f"10.0.{random.randint(1,20)}.{random.randint(1,254)}"

    def _generate_normal_record(self, entity: Dict[str, Any], timestamp: datetime) -> Dict[str, Any]:
        home_loc = entity["home_location"]
        is_success = True
        login_status = "SUCCESS"
        mfa_enabled = True if entity["entity_type"] == "user" else False
        vpn_used = True if random.random() > 0.4 else False
        session_duration = round(random.uniform(300, 28800), 2) # 5 mins to 8 hrs
        
        resource = random.choice(RESOURCES)
        app = random.choice(APPLICATIONS)
        cmd_seq = '["auth_check", "session_init", "fetch_data", "logout"]'

        return {
            "entity_id": entity["entity_id"],
            "entity_type": entity["entity_type"],
            "timestamp": timestamp,
            "source_ip": self.generate_random_ip(home_loc["country"]),
            "country": home_loc["country"],
            "city": home_loc["city"],
            "latitude": home_loc["lat"],
            "longitude": home_loc["lon"],
            "department": entity["department"],
            "role": entity["role"],
            "device_id": entity["primary_device_id"],
            "device_type": "workstation" if entity["entity_type"] == "user" else "iot_gateway",
            "device_fingerprint": f"{entity['os']} | MAC:{entity['primary_mac']} | Prot:{random.choice(PROTOCOLS)}",
            "operating_system": entity["os"],
            "browser": entity["browser"],
            "auth_method": random.choice(AUTH_METHODS),
            "mfa_enabled": mfa_enabled,
            "vpn_used": vpn_used,
            "session_duration": session_duration,
            "login_status": login_status,
            "resource_accessed": resource,
            "application": app,
            "command_sequence": cmd_seq,
            "network_protocol": random.choice(PROTOCOLS),
            "label": "normal"
        }

    def _generate_attack_record(self, entity: Dict[str, Any], timestamp: datetime, attack_type: str) -> Dict[str, Any]:
        record = self._generate_normal_record(entity, timestamp)
        record["label"] = attack_type

        if attack_type == "Credential Misuse":
            record["login_status"] = "SUCCESS"
            record["mfa_enabled"] = False
            record["vpn_used"] = False
            record["resource_accessed"] = "smb://vault/confidential_db"
            record["command_sequence"] = '["dump_hashes", "export_table", "clear_logs"]'
            
        elif attack_type == "Brute Force":
            record["login_status"] = "FAILED"
            record["session_duration"] = round(random.uniform(0.5, 3.0), 2)
            record["auth_method"] = "password"
            record["command_sequence"] = '["failed_auth_attempt", "retry_exceeded"]'

        elif attack_type == "Impossible Travel":
            # Jump from home location to Tokyo or Pyongyang within 10 minutes
            far_loc = RARE_ATTACK_COUNTRIES[0] if random.random() > 0.5 else CITIES[4]
            record["country"] = far_loc["country"]
            record["city"] = far_loc["city"]
            record["latitude"] = far_loc["lat"]
            record["longitude"] = far_loc["lon"]
            record["source_ip"] = self.generate_random_ip(far_loc["country"])
            record["vpn_used"] = False

        elif attack_type == "Password Spraying":
            record["login_status"] = "FAILED"
            record["resource_accessed"] = "/api/v1/auth/login"
            record["source_ip"] = "185.220.101.44"

        elif attack_type == "Device Spoofing":
            record["device_id"] = f"dev_unrecognized_{random.randint(800,999)}"
            record["device_fingerprint"] = f"Unknown_OS | MAC:FF:FF:FF:00:11:22 | Prot:RAW"
            record["operating_system"] = "Kali Linux 2024.1"
            record["browser"] = "curl/7.88.1"

        elif attack_type == "Insider Threat":
            record["resource_accessed"] = "/api/v1/payroll/export"
            record["session_duration"] = 43200 # 12 hours continuous
            record["command_sequence"] = '["query_all_records", "compress_tar", "exfiltrate_s3"]'

        elif attack_type == "Privilege Escalation":
            record["command_sequence"] = '["whoami", "sudo su", "chmod +s /bin/bash", "adduser backdoor"]'
            record["resource_accessed"] = "ssh://prod-node-01.internal:22"

        elif attack_type == "Session Hijacking":
            record["source_ip"] = "198.51.100.77"
            record["device_fingerprint"] = "Modified_Session_Cookie_Header"
            record["vpn_used"] = False

        elif attack_type == "Abnormal Data Download":
            record["session_duration"] = 18000
            record["resource_accessed"] = "smb://vault/confidential_db"
            record["command_sequence"] = '["bulk_download_tb", "transfer_external"]'

        elif attack_type == "Lateral Movement":
            record["resource_accessed"] = "rdp://admin-desktop:3389"
            record["command_sequence"] = '["psexec.exe", "net use \\\\domain-controller", "enum_shares"]'

        elif attack_type == "Impossible Login Time":
            # Set time to 03:15 AM for a normal daytime user
            dt = record["timestamp"].replace(hour=3, minute=15)
            record["timestamp"] = dt

        elif attack_type == "Rare Country Login":
            rare_loc = random.choice(RARE_ATTACK_COUNTRIES)
            record["country"] = rare_loc["country"]
            record["city"] = rare_loc["city"]
            record["latitude"] = rare_loc["lat"]
            record["longitude"] = rare_loc["lon"]
            record["source_ip"] = self.generate_random_ip(rare_loc["country"])

        elif attack_type == "TOR Exit Node Access":
            record["source_ip"] = f"185.220.101.{random.randint(1,250)}"
            record["vpn_used"] = False

        elif attack_type == "VPN Abuse":
            record["vpn_used"] = True
            record["source_ip"] = "10.200.50.12"
            record["country"] = "RU"

        elif attack_type == "Concurrent Sessions":
            record["command_sequence"] = '["parallel_session_active_ip_conflict"]'

        elif attack_type == "Suspicious API Usage":
            record["application"] = "Kubernetes_Cluster"
            record["resource_accessed"] = "/api/v1/namespaces/kube-system/pods"
            record["command_sequence"] = '["kubectl exec -it malicious-pod -- bash"]'

        elif attack_type == "Multiple Failed Logins":
            record["login_status"] = "FAILED"
            record["command_sequence"] = '["consecutive_fail_1", "consecutive_fail_2", "consecutive_fail_3"]'

        return record

    def generate_dataset(self, count: int = 1000, anomaly_rate: float = 0.03) -> List[Dict[str, Any]]:
        dataset = []
        num_anomalies = int(count * anomaly_rate)
        num_normals = count - num_anomalies

        base_time = datetime.utcnow() - timedelta(days=7)

        # Generate normal baseline logs
        for i in range(num_normals):
            entity = random.choice(self.entity_pool)
            # Sample time weighted around business hours
            hour_offset = random.randint(0, 168) # hours in 7 days
            timestamp = base_time + timedelta(hours=hour_offset, minutes=random.randint(0, 59))
            rec = self._generate_normal_record(entity, timestamp)
            dataset.append(rec)

        # Generate injected attack telemetry
        for i in range(num_anomalies):
            entity = random.choice(self.entity_pool)
            attack_type = random.choice(ATTACK_TYPES)
            timestamp = base_time + timedelta(hours=random.randint(0, 168), minutes=random.randint(0, 59))
            rec = self._generate_attack_record(entity, timestamp, attack_type)
            dataset.append(rec)

        # Sort chronologically
        dataset.sort(key=lambda x: x["timestamp"])
        return dataset

generator_instance = SyntheticDataGenerator()
