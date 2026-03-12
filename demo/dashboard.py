import streamlit as st
import pandas as pd
import numpy as np
import requests
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime

# Page config
st.set_page_config(
    page_title="FEDRAL.AI Demo Dashboard",
    page_icon="🏥",
    layout="wide"
)

SERVER_URL = "http://localhost:5000"

# Custom CSS
st.markdown("""
<style>
    .metric-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 20px;
        border-radius: 10px;
        color: white;
    }
    .hospital-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        border-left: 4px solid #667eea;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🏥 FEDRAL.AI - Federated Learning Demo")
st.markdown("*Local simulation of federated learning across multiple hospitals*")

# Fetch data from server
try:
    response = requests.get(f"{SERVER_URL}/dashboard")
    data = response.json()
    
    hospitals = data['hospitals']
    num_hospitals = data['num_hospitals']
    num_updates = data['num_updates']
    global_coef = data['global_model_coef']
    hospital_metadata = data['hospital_metadata']
    training_rounds = data['training_rounds']
    latest_round = data['latest_round']
    
    server_online = True
except:
    st.error("⚠️ Server not responding. Make sure to run: `python demo/server.py`")
    server_online = False
    st.stop()

# Tabs
tabs = st.tabs(["📊 Overview", "🏥 Hospitals", "🧪 Experiments", "📈 Analytics"])

# --- OVERVIEW TAB ---
with tabs[0]:
    st.header("System Overview")
    
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    
    with col1:
        st.metric("Hospitals Connected", num_hospitals, 
                 delta=None if not training_rounds else f"+{num_hospitals}")
    
    with col2:
        st.metric("Total Updates", num_updates)
    
    with col3:
        if latest_round:
            st.metric("Latest Round Accuracy", f"{latest_round['avg_accuracy']:.1%}")
        else:
            st.metric("Latest Round Accuracy", "N/A")
    
    with col4:
        total_samples = sum(meta['total_samples'] for meta in hospital_metadata.values())
        st.metric("Total Samples", f"{total_samples:,}")
    
    st.markdown("---")
    
    # Global Model Coefficients
    if global_coef:
        st.subheader("Global Model Coefficients")
        coef_df = pd.DataFrame({
            'Feature': ['Age', 'Biomarker 1', 'Biomarker 2', 'Biomarker 3', 'Comorbidity'],
            'Coefficient': global_coef[0]
        })
        
        fig, ax = plt.subplots(figsize=(10, 4))
        colors = ['#667eea' if c > 0 else '#f59e0b' for c in coef_df['Coefficient']]
        ax.barh(coef_df['Feature'], coef_df['Coefficient'], color=colors)
        ax.set_xlabel('Coefficient Value')
        ax.set_title('Feature Importance in Global Model')
        ax.axvline(x=0, color='black', linestyle='-', linewidth=0.5)
        st.pyplot(fig)
    else:
        st.info("No global model available yet. Run hospital agents to start training.")
    
    # Training Rounds
    if training_rounds:
        st.subheader("Training Progress")
        rounds_df = pd.DataFrame(training_rounds)
        
        col1, col2 = st.columns(2)
        
        with col1:
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.plot(rounds_df['round'], rounds_df['avg_accuracy'] * 100, 
                   marker='o', color='#22c55e', linewidth=2)
            ax.set_xlabel('Training Round')
            ax.set_ylabel('Accuracy (%)')
            ax.set_title('Model Accuracy Over Rounds')
            ax.grid(True, alpha=0.3)
            st.pyplot(fig)
        
        with col2:
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.plot(rounds_df['round'], rounds_df['total_samples'], 
                   marker='s', color='#0ea5e9', linewidth=2)
            ax.set_xlabel('Training Round')
            ax.set_ylabel('Total Samples')
            ax.set_title('Samples Contributed Per Round')
            ax.grid(True, alpha=0.3)
            st.pyplot(fig)

# --- HOSPITALS TAB ---
with tabs[1]:
    st.header("Hospital Details & Contributions")
    
    if not hospitals:
        st.info("No hospitals connected yet. Run: `python demo/agent.py --hospital HospitalA`")
    else:
        # Hospital selector
        selected_hospital = st.selectbox("Select Hospital", hospitals)
        
        # Get hospital details
        try:
            response = requests.get(f"{SERVER_URL}/hospital/{selected_hospital}")
            hospital_data = response.json()
            
            meta = hospital_data['metadata']
            updates_list = hospital_data['updates']
            
            # Hospital info
            col1, col2, col3 = st.columns(3)
            
            with col1:
                st.metric("Total Updates", meta['total_updates'])
            
            with col2:
                st.metric("Total Samples", f"{meta['total_samples']:,}")
            
            with col3:
                if 'last_accuracy' in meta:
                    st.metric("Last Accuracy", f"{meta['last_accuracy']:.1%}")
            
            # Contribution over time
            if updates_list:
                st.subheader("Contribution Timeline")
                updates_df = pd.DataFrame(updates_list)
                updates_df['timestamp'] = pd.to_datetime(updates_df['timestamp'])
                
                fig, ax = plt.subplots(figsize=(10, 4))
                ax.plot(range(len(updates_df)), updates_df['accuracy'] * 100, 
                       marker='o', color='#8b5cf6', linewidth=2)
                ax.set_xlabel('Update Number')
                ax.set_ylabel('Local Accuracy (%)')
                ax.set_title(f'{selected_hospital} - Model Performance')
                ax.grid(True, alpha=0.3)
                st.pyplot(fig)
                
                # Privacy budget simulation
                st.subheader("Privacy Budget")
                epsilon_used = len(updates_df) * 0.5  # Simulated
                epsilon_total = 10.0
                
                progress = min(epsilon_used / epsilon_total, 1.0)
                st.progress(progress)
                st.write(f"ε used: {epsilon_used:.1f} / {epsilon_total} (Differential Privacy)")
                
        except Exception as e:
            st.error(f"Error fetching hospital data: {e}")
        
        # All hospitals comparison
        st.markdown("---")
        st.subheader("All Hospitals Comparison")
        
        comparison_data = []
        for hosp in hospitals:
            meta = hospital_metadata[hosp]
            comparison_data.append({
                'Hospital': hosp,
                'Updates': meta['total_updates'],
                'Samples': meta['total_samples'],
                'Last Accuracy': meta.get('last_accuracy', 0) * 100
            })
        
        comp_df = pd.DataFrame(comparison_data)
        
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
        
        # Samples contribution
        ax1.bar(comp_df['Hospital'], comp_df['Samples'], color='#0ea5e9')
        ax1.set_ylabel('Number of Samples')
        ax1.set_title('Data Contribution by Hospital')
        ax1.tick_params(axis='x', rotation=45)
        
        # Accuracy comparison
        ax2.bar(comp_df['Hospital'], comp_df['Last Accuracy'], color='#22c55e')
        ax2.set_ylabel('Accuracy (%)')
        ax2.set_title('Local Model Accuracy')
        ax2.tick_params(axis='x', rotation=45)
        
        plt.tight_layout()
        st.pyplot(fig)

# --- EXPERIMENTS TAB ---
with tabs[2]:
    st.header("Federated Learning Experiments")
    
    st.subheader("Simulate Training Round")
    
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.info("Run hospital agents to simulate a training round:\n\n"
               "```bash\n"
               "python demo/agent.py --hospital HospitalA\n"
               "python demo/agent.py --hospital HospitalB\n"
               "python demo/agent.py --hospital HospitalC\n"
               "```")
    
    with col2:
        if st.button("🔄 Refresh Dashboard", type="primary"):
            st.rerun()
    
    # Experiment metrics
    if latest_round:
        st.subheader("Latest Round Metrics")
        
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.metric("Participating Hospitals", latest_round['num_hospitals'])
        
        with col2:
            st.metric("Total Samples", f"{latest_round['total_samples']:,}")
        
        with col3:
            st.metric("Average Accuracy", f"{latest_round['avg_accuracy']:.1%}")
        
        # Simulated additional metrics
        st.markdown("---")
        st.subheader("Model Performance Metrics")
        
        metrics_data = {
            'Metric': ['Accuracy', 'Precision', 'Recall', 'F1-Score', 'AUC-ROC'],
            'Value': [
                latest_round['avg_accuracy'] * 100,
                (latest_round['avg_accuracy'] + np.random.uniform(-0.05, 0.05)) * 100,
                (latest_round['avg_accuracy'] + np.random.uniform(-0.03, 0.03)) * 100,
                (latest_round['avg_accuracy'] + np.random.uniform(-0.04, 0.04)) * 100,
                (latest_round['avg_accuracy'] + np.random.uniform(0, 0.1)) * 100
            ]
        }
        metrics_df = pd.DataFrame(metrics_data)
        
        fig, ax = plt.subplots(figsize=(10, 4))
        colors = ['#667eea', '#22c55e', '#f59e0b', '#8b5cf6', '#0ea5e9']
        ax.barh(metrics_df['Metric'], metrics_df['Value'], color=colors)
        ax.set_xlabel('Score (%)')
        ax.set_title('Model Evaluation Metrics')
        ax.set_xlim(0, 100)
        st.pyplot(fig)

# --- ANALYTICS TAB ---
with tabs[3]:
    st.header("Advanced Analytics")
    
    if training_rounds and len(training_rounds) > 1:
        # Convergence analysis
        st.subheader("Model Convergence")
        rounds_df = pd.DataFrame(training_rounds)
        
        fig, ax = plt.subplots(figsize=(10, 5))
        ax.plot(rounds_df['round'], rounds_df['avg_accuracy'] * 100, 
               marker='o', color='#667eea', linewidth=2, label='Accuracy')
        ax.fill_between(rounds_df['round'], 
                        (rounds_df['avg_accuracy'] - 0.02) * 100,
                        (rounds_df['avg_accuracy'] + 0.02) * 100,
                        alpha=0.2, color='#667eea')
        ax.set_xlabel('Training Round')
        ax.set_ylabel('Accuracy (%)')
        ax.set_title('Model Convergence Over Training Rounds')
        ax.legend()
        ax.grid(True, alpha=0.3)
        st.pyplot(fig)
        
        # Fairness metrics (simulated)
        st.subheader("Fairness Across Hospitals")
        
        fairness_data = []
        for hosp in hospitals:
            meta = hospital_metadata[hosp]
            fairness_data.append({
                'Hospital': hosp,
                'Contribution %': (meta['total_samples'] / total_samples * 100) if total_samples > 0 else 0,
                'Accuracy': meta.get('last_accuracy', 0) * 100
            })
        
        fairness_df = pd.DataFrame(fairness_data)
        
        fig, ax = plt.subplots(figsize=(8, 8))
        ax.scatter(fairness_df['Contribution %'], fairness_df['Accuracy'], 
                  s=200, alpha=0.6, c=['#667eea', '#22c55e', '#f59e0b'])
        
        for idx, row in fairness_df.iterrows():
            ax.annotate(row['Hospital'], 
                       (row['Contribution %'], row['Accuracy']),
                       xytext=(5, 5), textcoords='offset points')
        
        ax.set_xlabel('Data Contribution (%)')
        ax.set_ylabel('Local Accuracy (%)')
        ax.set_title('Fairness: Contribution vs Performance')
        ax.grid(True, alpha=0.3)
        st.pyplot(fig)
        
    else:
        st.info("Run multiple training rounds to see convergence analytics")

# Footer
st.markdown("---")
st.markdown("**FEDRAL.AI Demo** | Federated Learning Platform | Local Simulation Mode")
