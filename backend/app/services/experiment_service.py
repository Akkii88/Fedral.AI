import uuid
import threading
import time
import random
from typing import Dict, List, Optional
from pydantic import BaseModel

# --- Domain Models ---
class ExperimentConfig(BaseModel):
    name: str
    dataset: str = "breast_cancer"
    clients: int = 5
    rounds: int = 10
    privacy_epsilon: Optional[float] = None
    fairness_enforced: bool = False
    robust_aggregation: bool = False

class RoundMetrics(BaseModel):
    round_id: int
    accuracy: float
    auc: float
    fairness_gap: float
    timestamp: float

class ExperimentState(BaseModel):
    id: str
    config: ExperimentConfig
    status: str  # 'created', 'running', 'completed', 'paused'
    current_round: int = 0
    metrics: List[RoundMetrics] = []
    biomarkers: Dict[str, float] = {}
    
# --- Service Logic ---
class ExperimentService:
    def __init__(self):
        self._experiments: Dict[str, ExperimentState] = {}
        self._threads: Dict[str, threading.Thread] = {}
        
    def create_experiment(self, config: ExperimentConfig) -> ExperimentState:
        exp_id = str(uuid.uuid4())[:8]
        exp = ExperimentState(
            id=exp_id,
            config=config,
            status="created"
        )
        self._experiments[exp_id] = exp
        return exp

    def list_experiments(self) -> List[ExperimentState]:
        return list(self._experiments.values())

    def get_experiment(self, exp_id: str) -> Optional[ExperimentState]:
        return self._experiments.get(exp_id)

    def start_experiment(self, exp_id: str):
        exp = self._experiments.get(exp_id)
        if not exp or exp.status == "running":
            return
        
        exp.status = "running"
        # Run simulation in background thread
        t = threading.Thread(target=self._run_simulation, args=(exp_id,))
        t.start()
        self._threads[exp_id] = t
        return exp

    def _run_simulation(self, exp_id: str):
        """
        Simulates the FL training loop round-by-round.
        In a real system, this would trigger the actual FLServer/Client code we wrote in `src/`.
        For interactivity, we will simulate the *progress* while generating realistic metrics 
        based on our earlier research findings.
        """
        exp = self._experiments[exp_id]
        
        # Initial baseline metrics
        current_acc = 0.55
        current_auc = 0.60
        current_gap = 0.15 # Unfair
        
        for r in range(1, exp.config.rounds + 1):
            if exp.status == 'paused':
                while exp.status == 'paused':
                    time.sleep(1)
                if exp.status != 'running': break

            time.sleep(2) # Simulate round duration
            
            # Improvement logic
            current_acc += random.uniform(0.01, 0.05) * (1.0 - current_acc)
            current_auc += random.uniform(0.01, 0.04) * (1.0 - current_auc)
            
            # Fairness logic
            if exp.config.fairness_enforced:
                current_gap *= 0.8 # Improves fast
            else:
                current_gap *= 0.98 # Improves slow
                
            metrics = RoundMetrics(
                round_id=r,
                accuracy=round(current_acc, 4),
                auc=round(current_auc, 4),
                fairness_gap=round(current_gap, 4),
                timestamp=time.time()
            )
            
            exp.current_round = r
            exp.metrics.append(metrics)
            
        exp.status = "completed"
        # Generate Biomarkers
        if exp.config.dataset == 'breast_cancer':
             exp.biomarkers = {
                 "mean radius": 0.25,
                 "worst texture": 0.18,
                 "concave points": 0.15,
                 "area error": -0.12,
                 "radius error": -0.10
             }
