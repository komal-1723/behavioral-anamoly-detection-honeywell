from datetime import datetime
from typing import List, Dict, Any
from backend.engine.generator import generator_instance, ATTACK_TYPES

class CyberAttackSimulator:
    def __init__(self):
        self.generator = generator_instance

    def simulate_attack_burst(self, attack_type: str, target_entity_id: str = None, intensity: int = 5) -> List[Dict[str, Any]]:
        if attack_type not in ATTACK_TYPES:
            raise ValueError(f"Unknown attack type: {attack_type}. Must be one of {ATTACK_TYPES}")

        # Pick entity
        if target_entity_id and target_entity_id in self.generator.entity_map:
            entity = self.generator.entity_map[target_entity_id]
        else:
            entity = self.generator.entity_pool[0]

        logs = []
        now = datetime.utcnow()
        for i in range(intensity):
            timestamp = now
            record = self.generator._generate_attack_record(entity, timestamp, attack_type)
            logs.append(record)

        return logs

attack_simulator_instance = CyberAttackSimulator()
