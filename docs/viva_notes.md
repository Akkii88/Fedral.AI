# Viva Voce Explanation Notes

## Q1: Why Federated Learning for this project?
**Answer**: Healthcare data is sensitive and fragmented. FL allows us to train robust models without moving patient data from hospitals, satisfying privacy laws like HIPAA.

## Q2: How did you handle Data Heterogeneity (Non-IID)?
**Answer**: We implemented a "Robust Aggregation" strategy using Coordinate-wise Median. In our experiments, standard FedAvg performed poorly when data was skewed (Accuracy dropped), while Median aggregation remained stable by ignoring extreme outlier updates from biased clients.

## Q3: Explain your Differential Privacy implementation.
**Answer**: We used Local Differential Privacy (LDP). Before sending updates to the server, each client clips the gradient norm (to bound sensitivity) and adds Gaussian noise. This ensures that the server cannot reconstruct any single patient's data from the weight update.

## Q4: How do you ensure Fairness?
**Answer**: We measured "Demographic Parity Gap". This metric checks if the model's positive prediction rate is similar across sensitive groups (e.g., different demographics). In our design, we monitored this gap to ensure the model doesn't biasedly favor one group.

## Q5: How are biomarkers discovered?
**Answer**: We used an interpretable linear model. The magnitude of the learned weights corresponds to feature importance. Features with consistently high weights across the federated rounds are identified as potential biomarkers.
