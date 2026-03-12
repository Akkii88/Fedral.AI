# Federated Learning Local Demo

This demo simulates a complete federated learning workflow on your local machine with 3 synthetic hospitals.

## Setup

1. **Install dependencies**:
```bash
pip install flask pandas scikit-learn requests numpy streamlit matplotlib seaborn
```

2. **Generate synthetic data**:
```bash
python demo/generate_data.py
```

3. **Start the central server**:
```bash
python demo/server.py
```

4. **Run hospital agents** (in separate terminals):
```bash
python demo/agent.py --hospital HospitalA
python demo/agent.py --hospital HospitalB
python demo/agent.py --hospital HospitalC
```

5. **Launch dashboard**:
```bash
streamlit run demo/dashboard.py
```

## What You'll See

- **3 Hospitals**: Each with synthetic patient data (age, biomarkers, outcomes)
- **Local Training**: Each hospital trains a model on its own data
- **Federated Aggregation**: Server combines updates into global model
- **Interactive Dashboard**: Visualize contributions, metrics, and experiments

## Demo Workflow

1. Each hospital agent loads its local CSV data
2. Trains a logistic regression model locally
3. Sends model updates (coefficients) to central server
4. Server aggregates updates using federated averaging
5. Dashboard shows real-time metrics and visualizations

## Files

- `generate_data.py` - Creates synthetic hospital datasets
- `server.py` - Central aggregation server
- `agent.py` - Hospital agent for local training
- `dashboard.py` - Interactive Streamlit dashboard

## Next Steps

Once you verify the demo works:
- Replace CSV files with real hospital databases
- Deploy agents to actual hospital servers
- Use your production FEDRAL.AI dashboard instead of Streamlit
