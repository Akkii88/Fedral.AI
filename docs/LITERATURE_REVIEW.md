# Literature Review: Federated Learning for Healthcare

## 5. Literature Review

The application of machine learning in healthcare has been extensively studied, with significant focus on privacy-preserving methods. This section reviews relevant works across federated learning, differential privacy, and biomarker discovery domains.

### 5.1 Federated Learning in Healthcare

Federated Learning (FL) has emerged as a promising paradigm for collaborative healthcare AI training. McMahan et al. (2017) introduced Federated Averaging (FedAvg), demonstrating that FL could achieve comparable accuracy to centralized training on image classification tasks. Subsequent work by Rieke et al. (2020) explored FL for medical imaging, showing that cross-silo FL between hospitals could improve model generalization without data sharing.

Key developments in healthcare FL include:
- **Li et al. (2020)** - Proposed FedProx to address heterogeneity in medical data
- **Sheller et al. (2020)** - Applied FL to brain tumor segmentation across institutions
- **Dayan et al. (2021)** - Used FL for ICU mortality prediction with MIMIC-III data

### 5.2 Robust Aggregation Methods

Standard FedAvg struggles with non-IID data distributions common in healthcare settings. Several robust aggregation methods have been proposed:

| Reference | Dataset | Model | Performance Criteria |
|-----------|---------|-------|---------------------|
| 1 | XYZ | SVM | 90.17 |
| 3 | YZ | LR | 67.9 |
| - | - | - | - |

*(Note: Use ChatGPT or search to fill in the above table with actual published research papers. Below are suggested references to research)*

**Suggested References to Search:**
1. "FedAvg" - McMadden et al. - Communication-Efficient Learning of Deep Networks
2. "Byzantine-tolerant FL" - Blanchard et al. - Machine Learning with Adversaries
3. "CoCoA" - ghadai et al. - Communication-Efficient Distributed ML
4. "FedProx" - Li et al. - Federated Optimization in Heterogeneous Networks
5. "Coordinate-wise Median" - Y et al. - Robust Aggregation for FL

### 5.3 Differential Privacy in Medical ML

Differential Privacy (DP) provides theoretical guarantees against membership inference attacks. Abadi et al. (2016) pioneered DP-SGD, enabling private neural network training. In healthcare, Kaissis et al. (2020) demonstrated DP-compliant MRI segmentation, while Jayaraj et al. (2021) applied LDP to electronic health records.

Key DP parameters:
- **ε (epsilon)**: Privacy budget - lower values = stronger privacy
- **δ**: Failure probability
- **C**: Gradient clipping bound

Our approach uses ε=1.0, representing a strong privacy regime.

### 5.4 Fairness in Healthcare AI

Ensuring equitable AI across demographic groups is critical. Mehrabi et al. (2021) surveyed fairness in ML, identifying demographic parity and equalized odds as common metrics. In clinical settings, Seyyed-Kalantari et al. (2021) showed that chest X-ray models exhibit racial disparities, emphasizing the need for fairness-aware training.

### 5.5 Biomarker Discovery Methods

Traditional biomarker discovery relies on statistical tests and feature selection. Modern approaches use:
- **LASSO Regression** - Sparse feature selection
- **Random Forest** - Feature importance ranking
- **SHAP Values** - Interpretable feature attributions

Our approach uses linear model weight magnitudes for stable biomarker identification across heterogeneous data distributions.

---

## Instructions to Generate Literature Review Table

Use the following structure to create your literature review comparison table. Search each paper and fill in the details:

### Template for Table Generation:

```
| Reference | Dataset | Model | Performance Criteria | Key Finding |
|-----------|---------|-------|---------------------|-------------|
| McMahan et al. (2017) | MNIST | CNN | 99.4% accuracy | Introduced FedAvg |
| Li et al. (2020) | CIFAR-100 | ResNet | 78.9% accuracy | Handled heterogeneity |
| Sheller et al. (2020) | BraTS | U-Net | 0.89 Dice | FL for segmentation |
| Kaissis et al. (2020) | Medical Imaging | CNN | ε=1.0 DP | DP-compliant ML |
| Dayan et al. (2021) | MIMIC-III | LSTM | 0.76 AUROC | ICU prediction |
```

### Search Keywords for Papers:
- "Federated Learning healthcare AUC"
- "Differential Privacy medical data"
- "Non-IID Federated Learning benchmark"
- "Fairness healthcare machine learning"

### Recommended Databases:
- Google Scholar (scholar.google.com)
- PubMed (for healthcare-specific papers)
- ArXiv (recent FL research)

---

*Note: Fill in the table with actual papers you find. The example values (90.17, 67.9) should be replaced with real performance metrics from published research.*
