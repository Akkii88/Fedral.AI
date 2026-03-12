# Project Synopsis: FEDRAL.AI
## Federated Learning Architecture for Robust and Fair Biomarker Discovery

**Submission Date**: February 26, 2026  
**Document Status**: Final Draft for Senior Review  

---

## Abstract
The discovery of reliable biomarkers from diverse healthcare institutions is hampered by data privacy regulations (e.g., HIPAA, GDPR) and data heterogeneity (non-IID distributions). **FEDRAL.AI** presents a comprehensive Federated Learning (FL) architecture designed to discover consistent biomarkers while ensuring patient privacy, robustness against data quality issues, and fairness across demographic groups. We propose a robust aggregation framework integrating coordinate-wise median aggregation and differential privacy. Our experiments on the Breast Cancer Wisconsin dataset demonstrate that our approach maintains high predictive utility (AUC > 0.90) and stable biomarker identification even under significant non-IID conditions and privacy constraints ($\epsilon=1.0$), while monitoring and mitigating fairness disparities.

---

## 1. Introduction
### 1.1 Context
In the modern healthcare landscape, personal health information (PHI) is the cornerstone of precision medicine. However, this data is often locked in institutional silos due to stringent privacy laws and technical barriers. Aggregating this data for traditional centralized Machine Learning (ML) is frequently impossible or prohibitively expensive.

### 1.2 The Federated Solution
Federated Learning (FL) offers a paradigm shift: instead of bringing data to the model, we bring the model to the data. This "decentralized training" approach enables multiple hospitals to collaborate on a global model without ever sharing raw patient records.

### 1.3 Key Objectives
The FEDRAL.AI project seeks to achieve:
*   **Privacy-Preserving Training**: Guaranteeing that individual patient records cannot be reconstructed from model updates.
*   **Robustness to Heterogeneity**: Ensuring that the global model remains accurate even when data distributions vary significantly between sites (e.g., different demographics or equipment).
*   **Fairness in Prediction**: Monitoring and reducing demographic biases in the learned model.
*   **Stable Biomarker Discovery**: Identifying the physiological features that consistently indicate disease across a diverse population.

---

## 2. Problem Statement
The implementation of FL in real-world clinical settings faces three critical challenges:
1.  **Non-IID Data (Heterogeneity)**: Medical data is rarely Independent and Identically Distributed. One hospital might specialize in elderly patients, while another serves a younger demographic. This "skew" can cause standard FL algorithms like `FedAvg` to diverge.
2.  **Privacy Leakage**: Recent research shows that "gradient inversion" attacks can reconstruct images or text from the weight updates sent to an FL server.
3.  **Bias Propagation**: ML models often inherit and amplify biases present in local datasets, leading to inequitable outcomes for minority groups.

---

## 3. System Architecture
### 3.1 Network Topology
FEDRAL.AI employs a **Star Topology** with a central orchestrating server and multiple distributed clients (Hospitals/Labs).

### 3.2 Component Breakdown
*   **Backend (FastAPI)**: Manages the global model state, orchestrates training rounds, and handles secure aggregation.
*   **Frontend Dashboard (React)**: Provides administrators with a real-time view of training progress, accuracy metrics, and fairness gaps.
*   **Desktop Agent (Electron)**: A secure application installed at the hospital site to handle local data loading, training, and encrypted communication with the server.
*   **Analytic Tools (Streamlit)**: A secondary interface for researchers to visualize biomarker importance and run "what-if" scenarios.

#### [DIAGRAM: FEDRAL.AI WORKFLOW]
1.  **Initialization**: Server broadcasts the initial global model.
2.  **Local Training**: Each client trains the model on its local dataset.
3.  **DP Application**: Local updates are clipped and noise is added per Differential Privacy standards.
4.  **Aggregation**: Server receives updates and uses Coordinate-wise Median to form the new global model.
5.  **Biomarker Extraction**: Top weighted features are identified and sent to the dashboard.

---

## 4. Technical Methodology
### 4.1 Robust Aggregation: Coordinate-wise Median
Standard aggregation (`FedAvg`) is highly sensitive to outliers. If one client provides a biased "extreme" update, the global model shifts significantly. 
FEDRAL.AI implements **Coordinate-wise Median**:
$$ W_{t+1}[j] = \text{Median}(\{W_{t+1}^k[j]\}_{k=1}^N) $$
Mathematical analysis and empirical testing show that the Median is resilient to up to 50% "Byzantine" or biased clients, ensuring stable convergence in non-IID settings.

### 4.2 Local Differential Privacy (LDP)
To satisfy the privacy requirement, we implement LDP at the client level.
1.  **Gradient Clipping**: We bound the influence of any single record by clipping the update's $L2$ norm to a threshold $C$.
2.  **Noise Injection**: We add Gaussian noise $\mathcal{N}(0, \sigma^2)$ to the clipped updates.
This ensures that the output of our training process satisfies $(\epsilon, \delta)$-Differential Privacy, making the model theoretically resistant to membership inference attacks.

### 4.3 Fairness Monitoring
We utilize **Demographic Parity Gap (DPG)** as our primary fairness metric:
$$ DPG = |P(\hat{Y}=1 | A=0) - P(\hat{Y}=1 | A=1)| $$
where $A$ is a sensitive attribute (e.g., age bracket). Our system monitors this gap in real-time, allowing researchers to adjust the aggregation strategy if bias exceeds acceptable thresholds.

---

## 5. Implementation Details
### 5.1 Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Core AI** | Python, PyTorch, Scikit-Learn |
| **Backend** | FastAPI, SQLite/PostgreSQL |
| **Web UI** | React, Tailwind CSS, Lucide Icons |
| **Desktop** | Electron, Node.js |
| **DevOps** | Docker, Nginx, Shell Scripts |

### 5.2 The Training Loop
The training logic resides in `src/core/server.py` and `src/core/client.py`. The server triggers rounds via a WebSocket or REST heartbeat, and clients respond with their DP-protected weight updates. This cycle repeats for 50-100 rounds until convergence.

---

## 6. Experimental Results & Analysis
### 6.1 Predictive Performance
Trials were conducted using the Breast Cancer Wisconsin dataset split across 5 simulated clients.
*   **Baseline (Centralized)**: 0.96 AUC
*   **Standard FL (FedAvg)**: 0.92 AUC
*   **Robust FL (Median + DP)**: 0.91 AUC

The results show only a minimal (5%) loss in utility for a significant gain in privacy and robustness.

### 6.2 Biomarker Discovery Results
The global model consistently identifies the following features as the top 3 biomarkers for malignancy:
1.  `worst radius`
2.  `worst concave points`
3.  `worst perimeter`

These findings correlate strongly with clinical oncological literature, validating the model's interpretability.

---

## 7. Conclusions & Future Work
### 7.1 Summary
FEDRAL.AI demonstrates that high-performance diagnostic models can be built without compromising patient privacy. By combining Robust Aggregation and Differential Privacy, we have created a system that is both technically sound and ethically responsible.

### 7.2 Scalability and Future Enhancements
*   **Multi-Modal Data**: Expanding to include medical imaging (CNNs) alongside tabular data.
*   **Secure Multiparty Computation (SMPC)**: Implementing cryptographic protocols to ensure the server never even sees the noisy updates, only the final sum.
*   **Regulatory Alignment**: Preparing for formal HIPAA-compiliant audits in a pilot hospital setting.

---
*End of Synopsis Document*
