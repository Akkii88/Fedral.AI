# FEDRAL.AI: Privacy-Preserving Federated Learning for ICU Biomarker Discovery

![Project Hero Image](docs/hero_image.png)

## 📋 Overview
**FEDRAL.AI** is a state-of-the-art privacy-preserving federated learning platform designed for robust and fair biomarker discovery in Intensive Care Units (ICUs). Leveraging the **MIMIC-IV** dataset, this project enables multiple healthcare institutions to collaborate on training high-performance AI models without ever sharing sensitive patient data.

### Key Research Focus
- **Robustness**: Resilient against non-IID (Independent and Identically Distributed) data and adversarial outliers.
- **Fairness**: Ensuring equitable model performance across diverse patient demographics.
- **Privacy**: Implementing Differential Privacy (DP) and secure aggregation to protect patient confidentiality.
- **Biomarker Discovery**: Extracting interpretable and clinical-ready insights from complex ICU electronic health records.

---

## 🏗️ System Architecture

### High-Level Design
The system consists of a centralized **Federated Server** and multiple **Hospital Agent** nodes. Each node performs local training on its internal MIMIC-IV slice and shares only encrypted gradients or model weights.

```mermaid
graph TD
    subgraph Hospitals ["Hospital Clients (Local Nodes)"]
        H1[Hospital A]
        H2[Hospital B]
        H3[Hospital N]
    end

    subgraph FedServer ["Federated Training Server (Central Hub)"]
        Aggregator[Global Model Aggregator]
        Verifier[Robustness & Fairness Verifier]
        Encrypter[Privacy Layer / DP]
    end

    subgraph Data ["MIMIC-IV Dataset (Local)"]
        D1[(Patient Data A)]
        D2[(Patient Data B)]
        DN[(Patient Data N)]
    end

    H1 --- D1
    H2 --- D2
    H3 --- DN

    H1 -- "Local Gradients" --> FedServer
    H2 -- "Local Gradients" --> FedServer
    H3 -- "Local Gradients" --> FedServer

    FedServer -- "Aggregated Global Model" --> H1
    FedServer -- "Aggregated Global Model" --> H2
    FedServer -- "Aggregated Global Model" --> H3

    style FedServer fill:#2c3e50,stroke:#3498db,stroke-width:4px,color:#fff
    style Hospitals fill:#34495e,stroke:#bdc3c7,stroke-width:2px,color:#fff
```

### Federated Training Workflow
The training follows a recursive round-based approach to minimize communication overhead while maintaining privacy.

```mermaid
flowchart LR
    Start([Start FL Round]) --> Distribute[Distribute Global Model]
    Distribute --> LocalTrain[Local Training on MIMIC-IV Data]
    LocalTrain --> Aggregation[Secure Aggregation]
    Aggregation --> PrivacyCheck[Privacy & DP Verification]
    PrivacyCheck --> UpdateGlobal[Update Global Model]
    UpdateGlobal --> NextRound{Next Round?}
    NextRound -- Yes --> Distribute
    NextRound -- No --> End([Final Biomarker Discovery])
```

---

## 📊 Experiment Results
Our experiments compare traditional centralized learning against our robust Federated Learning approach. The results show only a minimal (5%) loss in utility for a significant gain in privacy and robustness.

| Scenario | Stability | Privacy Guarantee | Fairness Score | AUC Performance |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline (Centralized)** | High | None | Medium | 0.96 |
| **FedAvg (Standard FL)** | Medium | None | Low | 0.92 |
| **Fedral (Private - ε=1.0)** | High | **High** | High | 0.91 |
| **Fedral (Robust Median)** | **Highest** | Medium | **High** | 0.93 |

---

## 🛠️ Technology Stack
- **Backend**: FastAPI (Python 3.9+)
- **Frontend**: React + Vite (Tailwind CSS)
- **Desktop**: Electron (Hospital Agent)
- **AI/ML**: PyTorch / TensorFlow, Scikit-learn
- **Database**: SQLite (SQLModel)
- **Deployment**: Docker & Docker Compose

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- Docker (optional)

### Setup & Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/USER_NAME/privacy-preserving-fl-icu.git
   cd privacy-preserving-fl-icu
   ```
2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### Running the Application
- **Web Dashboard**: `./run-web`
- **Hospital Agent (Desktop)**: `./run-electron`
- **Run All Experiments**: `./run_all_experiments.sh`

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments
- **MIMIC-IV**: For providing the critical electronic health records.
- **Privacy-FL Community**: For inspiration on robust aggregation methods.
