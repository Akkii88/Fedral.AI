import torch
from .aggregator import Aggregator
import numpy as np

class FLServer:
    def __init__(self, global_model, test_loader=None, device='cpu', strategy='avg'):
        self.global_model = global_model.to(device)
        self.test_loader = test_loader # Optional central test set
        self.device = device
        self.strategy = strategy
        
    def aggregate(self, updates, sample_counts):
        if self.strategy == 'avg':
            return Aggregator.fed_avg(updates, sample_counts)
        elif self.strategy == 'median':
            return Aggregator.coordinate_median(updates)
        elif self.strategy == 'trimmed_mean':
            return Aggregator.trimmed_mean(updates, beta=0.1)
        else:
            return Aggregator.fed_avg(updates, sample_counts)
            
    def update_model(self, new_weights):
        self.global_model.load_state_dict(new_weights)
        
    def get_weights(self):
        return self.global_model.state_dict()
        
    def evaluate_global(self, val_data_clients):
        # Distributed evaluation: Average client metrics
        metrics = {'accuracy': [], 'auc': [], 'dp_gap': []}
        
        for client in val_data_clients:
            client.set_weights(self.get_weights())
            m = client.evaluate()
            for k, v in m.items():
                metrics[k].append(v)
                
        # Aggregate
        avg_metrics = {k: np.mean(v) for k, v in metrics.items()}
        return avg_metrics
