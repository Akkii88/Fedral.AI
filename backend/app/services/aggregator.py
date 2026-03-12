import torch
import copy
import numpy as np

# We'll reuse the Robust Aggregator logic we wrote earlier, but make it stateless or Service-based.
class AggregationService:
    @staticmethod
    def fed_avg(weights_list, sample_counts):
        if not weights_list: return None
        total_samples = sum(sample_counts)
        aggregated_weights = copy.deepcopy(weights_list[0])
        
        for key in aggregated_weights.keys():
            aggregated_weights[key] = torch.zeros_like(aggregated_weights[key])
            for weights, count in zip(weights_list, sample_counts):
                aggregated_weights[key] += weights[key] * (count / total_samples)
        return aggregated_weights

    @staticmethod
    def coordinate_median(weights_list):
        if not weights_list: return None
        aggregated_weights = copy.deepcopy(weights_list[0])
        for key in aggregated_weights.keys():
            stacked = torch.stack([w[key] for w in weights_list])
            aggregated_weights[key] = torch.median(stacked, dim=0).values
        return aggregated_weights
