#!/bin/bash

# Experiment 1: Baseline (IID)
echo "Running Baseline..."
python3 src/experiments/runner.py --exp_name baseline --rounds 20 --n_clients 5

# Experiment 2: Non-IID Data
echo "Running Non-IID..."
python3 src/experiments/runner.py --exp_name non_iid --rounds 20 --n_clients 5 --heterogeneity 0.8

# Experiment 3: Robustness (Non-IID + Median Aggregation)
echo "Running Robust..."
python3 src/experiments/runner.py --exp_name robust_median --rounds 20 --n_clients 5 --heterogeneity 0.8 --strategy median

# Experiment 4: Privacy (Epsilon = 1.0)
echo "Running Private..."
python3 src/experiments/runner.py --exp_name private_eps1 --rounds 20 --n_clients 5 --privacy_epsilon 1.0
