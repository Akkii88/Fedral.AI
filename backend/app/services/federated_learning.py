"""
Federated Learning Service for Hospital Testing Feature

Handles contributions from hospitals, applies differential privacy,
and aggregates model weights for federated learning.
"""

import hashlib
import json
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel
import numpy as np


class ContributionData(BaseModel):
    """Model weight contribution from a hospital"""
    model_version: str
    weight_deltas: Dict[str, List[float]]  # Layer name -> weight deltas
    samples_count: int
    privacy_budget: float = 1.0


class FederatedLearningService:
    """Handles federated learning contributions"""
    
    # Privacy parameters
    MIN_PRIVACY_BUDGET = 0.1
    MAX_PRIVACY_BUDGET = 10.0
    NOISE_MULTIPLIER = 1.0
    
    @staticmethod
    def validate_contribution(contribution: ContributionData) -> tuple[bool, Optional[str]]:
        """
        Validate a contribution before accepting it
        
        Args:
            contribution: The contribution data to validate
            
        Returns:
            Tuple of (is_valid, error_message)
        """
        # Check model version
        if not contribution.model_version:
            return False, "Model version is required"
        
        # Check privacy budget
        if not (FederatedLearningService.MIN_PRIVACY_BUDGET <= 
                contribution.privacy_budget <= 
                FederatedLearningService.MAX_PRIVACY_BUDGET):
            return False, f"Privacy budget must be between {FederatedLearningService.MIN_PRIVACY_BUDGET} and {FederatedLearningService.MAX_PRIVACY_BUDGET}"
        
        # Check samples count
        if contribution.samples_count < 10:
            return False, "Minimum 10 samples required for contribution"
        
        # Check weight deltas
        if not contribution.weight_deltas:
            return False, "Weight deltas are required"
        
        # Validate weight delta structure
        for layer_name, deltas in contribution.weight_deltas.items():
            if not isinstance(deltas, list):
                return False, f"Weight deltas for layer '{layer_name}' must be a list"
            if len(deltas) == 0:
                return False, f"Weight deltas for layer '{layer_name}' cannot be empty"
        
        return True, None
    
    @staticmethod
    def apply_differential_privacy(
        weight_deltas: Dict[str, List[float]], 
        epsilon: float,
        sensitivity: float = 1.0
    ) -> Dict[str, List[float]]:
        """
        Apply differential privacy to weight deltas using Laplace mechanism
        
        Args:
            weight_deltas: Original weight deltas
            epsilon: Privacy budget (smaller = more privacy)
            sensitivity: Sensitivity of the query
            
        Returns:
            Noised weight deltas
        """
        noised_deltas = {}
        
        for layer_name, deltas in weight_deltas.items():
            # Calculate Laplace noise scale
            scale = sensitivity / epsilon
            
            # Add Laplace noise to each weight
            deltas_array = np.array(deltas)
            noise = np.random.laplace(0, scale, size=deltas_array.shape)
            noised_array = deltas_array + noise
            
            noised_deltas[layer_name] = noised_array.tolist()
        
        return noised_deltas
    
    @staticmethod
    def compute_contribution_hash(contribution: ContributionData) -> str:
        """
        Compute a hash of the contribution for deduplication
        
        Args:
            contribution: The contribution data
            
        Returns:
            SHA-256 hash of the contribution
        """
        # Create a deterministic string representation
        contribution_str = json.dumps({
            'model_version': contribution.model_version,
            'samples_count': contribution.samples_count,
            'weight_deltas': {
                k: [round(v, 6) for v in vals]  # Round to avoid floating point issues
                for k, vals in contribution.weight_deltas.items()
            }
        }, sort_keys=True)
        
        return hashlib.sha256(contribution_str.encode()).hexdigest()
    
    @staticmethod
    def aggregate_contributions(
        contributions: List[Dict[str, List[float]]],
        weights: Optional[List[float]] = None
    ) -> Dict[str, List[float]]:
        """
        Aggregate multiple contributions using weighted averaging
        
        Args:
            contributions: List of weight delta dictionaries
            weights: Optional weights for each contribution (e.g., based on sample count)
            
        Returns:
            Aggregated weight deltas
        """
        if not contributions:
            return {}
        
        # Use uniform weights if not provided
        if weights is None:
            weights = [1.0 / len(contributions)] * len(contributions)
        else:
            # Normalize weights
            total_weight = sum(weights)
            weights = [w / total_weight for w in weights]
        
        # Get all layer names
        all_layers = set()
        for contrib in contributions:
            all_layers.update(contrib.keys())
        
        # Aggregate each layer
        aggregated = {}
        for layer_name in all_layers:
            # Collect deltas for this layer from all contributions
            layer_deltas = []
            layer_weights = []
            
            for i, contrib in enumerate(contributions):
                if layer_name in contrib:
                    layer_deltas.append(np.array(contrib[layer_name]))
                    layer_weights.append(weights[i])
            
            if layer_deltas:
                # Weighted average
                weighted_sum = sum(
                    delta * weight 
                    for delta, weight in zip(layer_deltas, layer_weights)
                )
                aggregated[layer_name] = weighted_sum.tolist()
        
        return aggregated
    
    @staticmethod
    def get_privacy_report(epsilon: float, samples_count: int) -> Dict:
        """
        Generate a privacy report for a contribution
        
        Args:
            epsilon: Privacy budget used
            samples_count: Number of samples in the contribution
            
        Returns:
            Privacy report dictionary
        """
        # Calculate privacy guarantees
        # Lower epsilon = stronger privacy
        privacy_level = "Strong" if epsilon < 1.0 else "Moderate" if epsilon < 5.0 else "Weak"
        
        return {
            "epsilon": epsilon,
            "privacy_level": privacy_level,
            "samples_count": samples_count,
            "explanation": f"With ε={epsilon}, individual patient data is protected with {privacy_level.lower()} privacy guarantees.",
            "recommendation": "Lower epsilon values provide stronger privacy but may reduce model accuracy." if epsilon > 2.0 else "Privacy budget is appropriate."
        }
