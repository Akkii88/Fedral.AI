import argparse
import torch
import numpy as np
import pandas as pd
import sys
import os

# Fix path for imports if run directly
sys.path.append(os.getcwd())

from src.data.loader import DataProvider
from src.model.model import LinearBiomarkerModel, MLPBiomarkerModel
from src.core.client import FLClient
from src.core.server import FLServer

def run_experiment(args):
    print(f"--- Starting Experiment: {args.exp_name} ---")
    print(f"Clients: {args.n_clients}, Heterogeneity: {args.heterogeneity}, Privacy(eps): {args.privacy_epsilon}")
    
    # 1. Data
    data_provider = DataProvider(dataset_name=args.dataset, n_clients=args.n_clients, heterogeneity=args.heterogeneity)
    splits = data_provider.partition_data()
    input_dim = data_provider.X.shape[1]
    
    # 2. Setup Clients
    clients = []
    model_class = LinearBiomarkerModel if args.model == 'linear' else MLPBiomarkerModel
    
    for i in range(args.n_clients):
        # Identify malicious clients? (future work)
        client = FLClient(i, splits[i], model_class, input_dim, 
                          privacy_epsilon=args.privacy_epsilon, 
                          clipping_norm=args.clipping_norm)
        clients.append(client)
        
    # 3. Setup Server
    global_model = model_class(input_dim)
    server = FLServer(global_model, strategy=args.strategy)
    
    # 4. Training Loop
    history = []
    
    for round_idx in range(args.rounds):
        print(f"Round {round_idx+1}/{args.rounds}")
        
        # 4.1 Broadcast
        global_weights = server.get_weights()
        
        # 4.2 Client Local Training
        updates = []
        sample_counts = []
        
        for client in clients:
            client.set_weights(global_weights)
            # Add noise if Privacy Enabled
            # Simple simulation: noise_multiplier derived from epsilon (simplified)
            # In real DP-SGD, sigma = sqrt(2 log(1.25/delta)) / epsilon
            noise_mult = 0.0
            if args.privacy_epsilon is not None:
                noise_mult = 1.0 / args.privacy_epsilon # Rough proxy for simulation
                
            new_w, metrics = client.train(epochs=args.local_epochs, noise_multiplier=noise_mult)
            updates.append(new_w)
            sample_counts.append(client.n_samples)
            
        # 4.3 Aggregation
        aggregated_weights = server.aggregate(updates, sample_counts)
        server.update_model(aggregated_weights)
        
        # 4.4 Evaluation
        metrics = server.evaluate_global(clients)
        history.append(metrics)
        print(f"  Accuracy: {metrics['accuracy']:.4f}, AUC: {metrics['auc']:.4f}, Fairness Gap: {metrics['dp_gap']:.4f}")
        
    # 5. Biomarker Discovery Analysis
    print("\n--- Biomarker Discovery ---")
    if args.model == 'linear':
        feature_importance = server.global_model.get_feature_importance()
        feature_names = data_provider.feature_names
        
        # Sort
        indices = np.argsort(np.abs(feature_importance))[::-1]
        top_k = 10
        print(f"Top {top_k} Features:")
        for i in range(top_k):
            idx = indices[i]
            print(f"  {feature_names[idx]}: {feature_importance[idx]:.4f}")
            
        # Save results
        df = pd.DataFrame({'Feature': feature_names, 'Importance': feature_importance})
        df.to_csv(f"biomarkers_{args.exp_name}.csv", index=False)
        
    return history

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--exp_name', type=str, default='baseline')
    parser.add_argument('--dataset', type=str, default='breast_cancer') # or 'heart'
    parser.add_argument('--n_clients', type=int, default=5)
    parser.add_argument('--heterogeneity', type=float, default=0.0)
    parser.add_argument('--rounds', type=int, default=10)
    parser.add_argument('--local_epochs', type=int, default=1)
    parser.add_argument('--model', type=str, default='linear')
    parser.add_argument('--strategy', type=str, default='avg') # avg, median, trimmed_mean
    parser.add_argument('--privacy_epsilon', type=float, default=None) # Set to e.g. 1.0
    parser.add_argument('--clipping_norm', type=float, default=1.0)
    
    args = parser.parse_args()
    run_experiment(args)
