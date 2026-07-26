import asyncio
import json
import random
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from backend.engine.generator import generator_instance
from backend.ml.profiler import profiler_instance
from backend.ml.anomaly_detector import anomaly_detector_instance
from backend.ml.attack_classifier import attack_classifier_instance
from backend.ml.explainability import xai_engine_instance

router = APIRouter(prefix="/stream", tags=["Real-time Streaming"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Simulate real-time continuous log generation every 2 seconds
            await asyncio.sleep(2.0)
            
            # 10% chance of random attack burst in real-time stream
            entity = random.choice(generator_instance.entity_pool)
            now = datetime.utcnow()
            
            if random.random() < 0.12:
                attack_type = random.choice([
                    "Impossible Travel", "Brute Force", "Credential Misuse", 
                    "Device Spoofing", "TOR Exit Node Access", "Lateral Movement"
                ])
                log_data = generator_instance._generate_attack_record(entity, now, attack_type)
            else:
                log_data = generator_instance._generate_normal_record(entity, now)

            # Analyze on the fly
            prof = profiler_instance.get_cold_start_prior(log_data["entity_type"], "Developer")
            comp_score, feat_dict, is_anomaly = anomaly_detector_instance.predict(log_data, prof)

            alert_data = None
            if is_anomaly or log_data["label"] != "normal":
                atk, conf = attack_classifier_instance.classify(log_data, feat_dict)
                xai = xai_engine_instance.generate_explanation(log_data, feat_dict, comp_score, atk, conf)
                alert_data = xai

            payload = {
                "type": "TELEMETRY_EVENT",
                "log": {
                    "entity_id": log_data["entity_id"],
                    "entity_type": log_data["entity_type"],
                    "timestamp": log_data["timestamp"].isoformat(),
                    "source_ip": log_data["source_ip"],
                    "country": log_data["country"],
                    "city": log_data["city"],
                    "device_id": log_data["device_id"],
                    "resource_accessed": log_data["resource_accessed"],
                    "login_status": log_data["login_status"],
                    "label": log_data["label"]
                },
                "analysis": {
                    "anomaly_score": round(comp_score, 4),
                    "is_anomaly": is_anomaly,
                    "alert": alert_data
                }
            }

            await websocket.send_json(payload)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
