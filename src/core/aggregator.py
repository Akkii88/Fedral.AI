import torch
import copy
import numpy as np

class Aggregator:
    @staticmethod
    def fed_avg(weights_list, sample_counts):
        """
        Standard Weighted Average.
        """
        total_samples = sum(sample_counts)
        aggregated_weights = copy.deepcopy(weights_list[0])
        
        for key in aggregated_weights.keys():
            aggregated_weights[key] = torch.zeros_like(aggregated_weights[key])
            
            for weights, count in zip(weights_list, sample_counts):
                aggregated_weights[key] += weights[key] * (count / total_samples)
                
        return aggregated_weights

    @staticmethod
    def coordinate_median(weights_list):
        """
        Coordinate-wise Median. Robust to outliers.
        Ignores sample counts (usually).
        """
        aggregated_weights = copy.deepcopy(weights_list[0])
        
        for key in aggregated_weights.keys():
            # Stack all client tensors for this key
            # Shape: (n_clients, *param_shape)
            stacked = torch.stack([w[key] for w in weights_list])
            
            # Median along dim 0
            aggregated_weights[key] = torch.median(stacked, dim=0).values
            
        return aggregated_weights
        
    @staticmethod
    def trimmed_mean(weights_list, beta=0.1):
        """
        Trimmed Mean. Discards top and bottom beta fraction.
        """
        if len(weights_list) <= 2:
            return Aggregator.fed_avg(weights_list, [1]*len(weights_list))
            
        aggregated_weights = copy.deepcopy(weights_list[0])
        n = len(weights_list)
        k = int(n * beta)
        
        for key in aggregated_weights.keys():
            stacked = torch.stack([w[key] for w in weights_list])
            # Sort along client dimension
            sorted_stack, _ = torch.sort(stacked, dim=0)
            
            # Trim
            if k > 0:
                trimmed = sorted_stack[k:-k]
            else:
                trimmed = sorted_stack
                
            aggregated_weights[key] = torch.mean(trimmed, dim=0)
            
        return aggregated_weights
