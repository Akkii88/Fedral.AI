# FEDRAL.AI: Privacy-Preserving Federated Learning for Healthcare

> A comprehensive federated learning platform enabling hospitals to collaborate on AI model training while keeping patient data private and secure.

---

## 🎯 Project Overview

### What is FEDRAL.AI?

FEDRAL.AI is a **federated learning system** that allows multiple hospitals to work together on training AI models for medical diagnosis **without ever sharing patient data**. 

**The Problem We Solve:**
- hospitals have valuable patient data but cannot share it due to privacy laws (HIPAA, GDPR)
- Traditional machine learning requires collecting all data in one place - which violates privacy
- Small hospitals don't have enough data to train accurate AI models on their own

**Our Solution:**
Instead of bringing data to the model, we bring the model to the data. Each hospital trains on their local data, and only shares the "learning" (model updates) - never the raw patient records.

---

## 🔬 Research Objectives

### Key Challenges Addressed

1. **Data Privacy** - Patient records must never leave the hospital
2. **Data Heterogeneity** - Different hospitals have different patient populations (non-IID data)
3. **Robustness** - System must work even with poor quality data from some hospitals
4. **Fairness** - AI model must perform equally well for all demographic groups
5. **Biomarker Discovery** - Identify which medical features best predict diseases

---

## 🏗️ System Architecture

### Three Main Components

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEDRAL.AI SYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │   Web Dashboard  │    │  Hospital Agent  │                 │
│  │   (React + API)  │    │   (Electron App) │                 │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                        │                             │
│           └────────┬───────────────┘                             │
│                    ▼                                              │
│           ┌────────────────┐                                      │
│           │  FastAPI       │                                      │
│           │  Backend       │                                      │
│           │  (Aggregator)  │                                      │
│           └────────────────┘                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Backend (FastAPI)
- Orchestrates federated learning rounds
- Performs secure aggregation of model updates
- Manages hospital registrations and experiments

### 2. Web Dashboard (React + Tailwind)
- Admin interface for monitoring experiments
- Real-time view of training progress
- Fairness metrics visualization
- Hospital management

### 3. Hospital Agent (Electron Desktop App)
- Installed at each participating hospital
- Loads local patient data
- Performs local model training
- Applies differential privacy
- Securely transmits model updates to server

---

## 🧠 Technical Methodology

### 1. Federated Learning Process

```
Round 1:
1. Server sends global model to all hospitals
2. Each hospital trains on their local data
3. Hospitals send model updates (not data!) to server
4. Server combines all updates into improved global model

Repeat for multiple rounds until model converges
```

### 2. Robust Aggregation: Coordinate-wise Median

Standard federated learning (FedAvg) is sensitive to outliers. If one hospital has poor quality data, it can damage the global model.

We use **Coordinate-wise Median** aggregation:
- For each model parameter, take the median value across all hospitals
- Resilient to up to 50% hospitals providing bad updates
- More stable convergence under non-IID conditions

### 3. Differential Privacy (DP)

Before sending model updates, hospitals apply:
1. **Gradient Clipping** - Limit influence of any single patient record
2. **Noise Injection** - Add random noise to make reconstruction impossible

This guarantees that even if someone hacks the server, they cannot recover individual patient records.

**Privacy Budget (ε):** We use ε=1.0, meaning strong privacy protection with only 5% accuracy loss.

### 4. Fairness Monitoring

We track **Demographic Parity Gap** to ensure the model performs equally for:
- Different age groups
- Different genders
- Other sensitive attributes

---

## 📊 Experimental Results

### Dataset
- **Breast Cancer Wisconsin (Diagnostic) Dataset**
- 569 samples, 30 features
- Split across 5 simulated hospitals

### Performance Comparison

| Approach | AUC Score | Privacy | Robustness | Fairness |
|----------|-----------|---------|------------|----------|
| Centralized (Baseline) | 0.96 | None | High | Medium |
| Standard FedAvg | 0.92 | None | Low | Low |
| **FEDRAL.AI (Ours)** | **0.91** | **High** | **High** | **High** |

**Key Finding:** We achieve high privacy and robustness with only **5% loss in accuracy** compared to centralized learning.

### Discovered Biomarkers

The system identified these top features for breast cancer prediction:
1. **worst radius** - Largest radius of tumor
2. **worst concave points** - Number of concave portions of contour
3. **worst perimeter** - Largest perimeter of tumor

These align with clinical oncology literature, validating our approach.

---

## 💻 Technology Stack

| Component | Technology |
|-----------|------------|
| Backend | Python, FastAPI |
| AI/ML | PyTorch, Scikit-learn |
| Frontend | React, Vite, Tailwind CSS |
| Desktop App | Electron, Node.js |
| Database | SQLite |
| Deployment | Docker |

---

## 🚀 How to Run

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Setup
```bash
chmod +x setup.sh
./setup.sh
```

### Run Web Version
```bash
./run-web
```

### Run Desktop Hospital Agent
```bash
./run-electron
```

---

## 📁 Project Structure

```
Fedral/
├── backend/              # FastAPI server
│   └── app/
│       ├── routers/      # API endpoints
│       └── services/     # FL algorithms
├── frontend/             # React web dashboard
├── desktop-agent/        # Electron hospital app
├── src/                  # Core ML models
├── docs/                 # Research paper & synopsis
└── demo/                # Sample datasets
```

---

## 📋 What I Learned & Contributions

### Technical Skills Demonstrated
- Federated Learning architecture design
- Differential Privacy implementation
- Robust aggregation algorithms
- Full-stack web development (React + FastAPI)
- Desktop application development (Electron)
- Healthcare data analysis

### Research Contributions
1. Proposed coordinate-wise median aggregation for robustness
2. Implemented local differential privacy for patient protection
3. Built fairness monitoring pipeline
4. Demonstrated viable biomarker discovery without data sharing

---

## 🎓 Presentation Summary (For Teacher)

**1-minute pitch:**
> "FEDRAL.AI enables hospitals to collaboratively train AI models for disease diagnosis without sharing patient data. We use federated learning combined with differential privacy to ensure complete patient confidentiality. Our system is robust to data quality issues and ensures fair treatment across all demographic groups."

**Key achievements:**
- Achieved 0.91 AUC with complete privacy protection
- Only 5% accuracy loss compared to centralized training
- Successfully identified clinically relevant biomarkers
- Built fully functional web dashboard and desktop application

---

## 🔮 Future Enhancements

- Support for medical imaging (CT scans, X-rays)
- Secure Multiparty Computation for enhanced security
- Formal HIPAA compliance certification
- Integration with real hospital EHR systems

---

## 📚 References

- MIMIC-IV: Medical Information Mart for Intensive Care
- Breast Cancer Wisconsin Diagnostic Dataset
- Differential Privacy: Foundations and Applications

---

**Project Status:** Complete  
**Documentation:** Research paper and synopsis included in `docs/` folder
