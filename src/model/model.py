import torch
import torch.nn as nn
import torch.nn.functional as F

class LinearBiomarkerModel(nn.Module):
    """
    Logistic Regression Model.
    Weights directly correspond to Feature Importance (Biomarkers).
    """
    def __init__(self, input_dim):
        super(LinearBiomarkerModel, self).__init__()
        self.linear = nn.Linear(input_dim, 1)
        
    def forward(self, x):
        return torch.sigmoid(self.linear(x))
        
    def get_feature_importance(self):
        """Returns the absolute weights as importance scores."""
        return self.linear.weight.detach().cpu().numpy().flatten()

class MLPBiomarkerModel(nn.Module):
    """
    Simple MLP for non-linear relationships.
    Feature importance is harder (needs Gradient-based methods).
    """
    def __init__(self, input_dim, hidden_dim=32):
        super(MLPBiomarkerModel, self).__init__()
        self.layer1 = nn.Linear(input_dim, hidden_dim)
        self.layer2 = nn.Linear(hidden_dim, 1)
        self.relu = nn.ReLU()
        
    def forward(self, x):
        x = self.relu(self.layer1(x))
        x = self.layer2(x)
        return torch.sigmoid(x)
