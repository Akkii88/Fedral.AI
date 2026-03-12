import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from copy import deepcopy
from sklearn.metrics import accuracy_score, roc_auc_score

class FLClient:
    def __init__(self, client_id, data, model_class, input_dim, device='cpu', 
                 privacy_epsilon=None, privacy_delta=1e-5, clipping_norm=1.0):
        self.client_id = client_id
        self.device = device
        self.input_dim = input_dim
        
        # Data
        self.X = torch.tensor(data['X'], dtype=torch.float32).to(device)
        self.y = torch.tensor(data['y'], dtype=torch.float32).view(-1, 1).to(device)
        self.s = torch.tensor(data['s'], dtype=torch.float32).to(device) # Sensitive attr
        self.n_samples = len(self.X)
        
        # Model
        self.model = model_class(input_dim).to(device)
        
        # Privacy config
        self.privacy_epsilon = privacy_epsilon
        self.clipping_norm = clipping_norm
        
    def set_weights(self, weights):
        self.model.load_state_dict(weights)
        
    def train(self, epochs=1, lr=0.01, noise_multiplier=0.0):
        """
        Local training.
        Returns: weights_delta (or new_weights), metrics
        """
        original_weights = deepcopy(self.model.state_dict())
        optimizer = optim.SGD(self.model.parameters(), lr=lr)
        criterion = nn.BCELoss()
        
        self.model.train()
        for epoch in range(epochs):
            optimizer.zero_grad()
            outputs = self.model(self.X)
            loss = criterion(outputs, self.y)
            loss.backward()
            optimizer.step()
            
        # Differential Privacy (LDP) on Update
        # Calculate Delta
        new_weights = self.model.state_dict()
        weight_update = {}
        total_norm = 0.0
        
        for name in new_weights:
            delta = new_weights[name] - original_weights[name]
            total_norm += torch.norm(delta).item() ** 2
            weight_update[name] = delta
            
        total_norm = total_norm ** 0.5
        
        # Clipping
        clip_factor = 1.0
        if self.clipping_norm > 0:
            clip_factor = min(1.0, self.clipping_norm / (total_norm + 1e-8))
            
        # Add Noise (LDP)
        # simplistic LDP: Add Laplacian or Gaussian noise to the Update
        # If noise_multiplier > 0
        for name in weight_update:
            clipped_delta = weight_update[name] * clip_factor
            
            if noise_multiplier > 0:
                sigma = noise_multiplier * self.clipping_norm
                noise = torch.normal(0.0, sigma, size=clipped_delta.shape).to(self.device)
                clipped_delta += noise
                
            # Reconstruct "New Weights" effectively sent to server
            # We send the update, or the weights. FedAvg usually sends weights.
            # But mathematically w_new = w_old + delta
            # We will send w_new
            new_weights[name] = original_weights[name] + clipped_delta
            
        return new_weights, {'loss': loss.item(), 'norm': total_norm}

    def evaluate(self):
        self.model.eval()
        with torch.no_grad():
            preds = self.model(self.X).cpu().numpy()
            y_true = self.y.cpu().numpy()
            s_true = self.s.cpu().numpy()
            
        acc = accuracy_score(y_true, preds > 0.5)
        try:
            auc = roc_auc_score(y_true, preds)
        except:
            auc = 0.5
            
        # Fairness Metrics
        # Demographic Parity Gap: |P(pred=1|s=0) - P(pred=1|s=1)|
        mask0 = (s_true == 0)
        mask1 = (s_true == 1)
        
        p1_s0 = np.mean(preds[mask0] > 0.5) if np.sum(mask0) > 0 else 0
        p1_s1 = np.mean(preds[mask1] > 0.5) if np.sum(mask1) > 0 else 0
        dp_gap = abs(p1_s0 - p1_s1)
        
        return {'accuracy': acc, 'auc': auc, 'dp_gap': dp_gap}
