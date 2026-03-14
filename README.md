# FEDRAL.AI: Privacy-Preserving Federated Learning for ICU Biomarker Discovery


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

![System Architecture](./research_assets/system_architecture.png)

### Detailed Architecture
![Detailed Architecture](./research_assets/detailed_architecture.png)

### System Workflow
![System Workflow](./research_assets/system_architecture_flowchart.png)

### Federated Training Workflow
The training follows a recursive round-based approach to minimize communication overhead while maintaining privacy.

![Training Workflow](./research_assets/training_workflow.png)

### Training Sequence
![Training Sequence](./research_assets/training_sequence_detailed.png)

---

## 📊 Experiment Results
Our experiments compare traditional centralized learning against our robust Federated Learning approach. The results show only a minimal (5%) loss in utility for a significant gain in privacy and robustness.

### Privacy vs Utility Trade-off
![Privacy Utility](./research_assets/privacy_utility_detailed.png)

### Fairness Analysis
![Fairness Gap](./research_assets/fairness_gap_chart_hd.png)

### Concept: Silo vs Federated Learning
![Silo vs FL](./research_assets/concept_silo_vs_fl_hd.png)

| Scenario | Stability | Privacy Guarantee | Fairness Score | AUC Performance |
| :--- | :--- | :--- | :--- | :--- |
| **Baseline (Centralized)** | High | None | Medium | 0.96 |
| **FedAvg (Standard FL)** | Medium | None | Low | 0.92 |
| **Fedral (Private - ε=1.0)** | High | **High** | High | 0.91 |
| **Fedral (Robust Median)** | **Highest** | Medium | **High** | 0.93 |

---

## 🧬 Biomarker Discovery
Our federated learning approach enables discovery of critical ICU biomarkers while preserving patient privacy.

### Biomarker Importance Ranking
![Biomarker Importance](./research_assets/biomarker_importance.png)

### Detailed Heatmap Analysis
![Heatmap](./research_assets/heatmap_detailed.png)

### CWMED Logic Framework
![CWMED Logic](./research_assets/cwmed_logic_hd.png)

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

## 🖥️ Fedral.AI Web Dashboard

The central management console for federated learning experiments, hospital management, and compliance monitoring.

![Dashboard](./project_screenshots/fedral-ai-website/01_dashboard.png)
![Experiments](./project_screenshots/fedral-ai-website/02_experiments.png)
![Hospitals](./project_screenshots/fedral-ai-website/03_hospitals.png)
![Experiment Detail](./project_screenshots/fedral-ai-website/04_experiment_detail.png)
![Clients](./project_screenshots/fedral-ai-website/05_clients.png)
![Settings](./project_screenshots/fedral-ai-website/06_settings.png)
![Compliance](./project_screenshots/fedral-ai-website/07_compliance.png)
![Permissions](./project_screenshots/fedral-ai-website/08_permissions.png)
![Test Your Data](./project_screenshots/fedral-ai-website/09_test_your_data.png)

---

## 🏥 Hospital Agent Desktop Application

The desktop application used by participating hospitals to securely contribute their data to the federated learning network.

![Welcome Screen](./project_screenshots/hospital-agents-ss/01_welcome_screen.png)
![Data Upload](./project_screenshots/hospital-agents-ss/02_data_upload.png)
![File Validation](./project_screenshots/hospital-agents-ss/03_file_validation.png)
![CSV Guide](./project_screenshots/hospital-agents-ss/04_csv_guide.png)
![Disease Support](./project_screenshots/hospital-agents-ss/05_disease_support.png)
![Privacy Agreement](./project_screenshots/hospital-agents-ss/06_privacy_agreement.png)
![AI Inference](./project_screenshots/hospital-agents-ss/07_ai_inference.png)
![Analysis Results](./project_screenshots/hospital-agents-ss/08_analysis_results.png)
![Report Generation](./project_screenshots/hospital-agents-ss/09_report_generation.png)
![Testing Phase](./project_screenshots/hospital-agents-ss/10_testing_phase.png)
![Validation](./project_screenshots/hospital-agents-ss/11_validation.png)
![Tutorial](./project_screenshots/hospital-agents-ss/12_tutorial.png)
![Contribution](./project_screenshots/hospital-agents-ss/13_contribution.png)
![Thank You](./project_screenshots/hospital-agents-ss/14_thank_you.png)
![Enhanced Report](./project_screenshots/hospital-agents-ss/15_enhanced_report.png)
![Final Summary](./project_screenshots/hospital-agents-ss/16_final_summary.png)

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Acknowledgments
- **MIMIC-IV**: For providing the critical electronic health records.
- **Privacy-FL Community**: For inspiration on robust aggregation methods.
