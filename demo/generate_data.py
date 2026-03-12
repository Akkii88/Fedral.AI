import pandas as pd
import numpy as np
import os

# Create demo directory structure
os.makedirs('demo/data/HospitalA', exist_ok=True)
os.makedirs('demo/data/HospitalB', exist_ok=True)
os.makedirs('demo/data/HospitalC', exist_ok=True)

def generate_hospital_data(hospital_name, num_patients=200, seed=None):
    """Generate synthetic patient data for a hospital"""
    if seed:
        np.random.seed(seed)
    
    data = {
        'patient_id': range(1, num_patients + 1),
        'age': np.random.randint(18, 85, num_patients),
        'gender': np.random.choice(['M', 'F'], num_patients),
        'biomarker1': np.random.uniform(0.3, 2.0, num_patients),
        'biomarker2': np.random.uniform(0.5, 1.8, num_patients),
        'biomarker3': np.random.uniform(0.2, 1.5, num_patients),
        'comorbidity_score': np.random.randint(0, 5, num_patients),
    }
    
    # Create outcome based on features (with some noise)
    outcome_prob = (
        0.3 * (data['age'] > 60) +
        0.2 * (data['biomarker1'] > 1.2) +
        0.2 * (data['biomarker2'] > 1.0) +
        0.15 * (data['comorbidity_score'] > 2) +
        np.random.uniform(-0.1, 0.1, num_patients)
    )
    data['outcome'] = (outcome_prob > 0.5).astype(int)
    
    df = pd.DataFrame(data)
    return df

# Generate data for each hospital with different distributions
print("Generating synthetic hospital data...")

# Hospital A - General population
df_a = generate_hospital_data('HospitalA', num_patients=200, seed=42)
df_a.to_csv('demo/data/HospitalA/patients.csv', index=False)
print(f"✓ HospitalA: {len(df_a)} patients, {df_a['outcome'].sum()} positive outcomes")

# Hospital B - Slightly older population
df_b = generate_hospital_data('HospitalB', num_patients=180, seed=43)
df_b['age'] = df_b['age'] + 5  # Older population
df_b.to_csv('demo/data/HospitalB/patients.csv', index=False)
print(f"✓ HospitalB: {len(df_b)} patients, {df_b['outcome'].sum()} positive outcomes")

# Hospital C - Younger, healthier population
df_c = generate_hospital_data('HospitalC', num_patients=220, seed=44)
df_c['age'] = df_c['age'] - 10  # Younger population
df_c['comorbidity_score'] = df_c['comorbidity_score'] - 1  # Healthier
df_c['comorbidity_score'] = df_c['comorbidity_score'].clip(lower=0)
df_c.to_csv('demo/data/HospitalC/patients.csv', index=False)
print(f"✓ HospitalC: {len(df_c)} patients, {df_c['outcome'].sum()} positive outcomes")

print("\n✅ Synthetic data generation complete!")
print(f"Total patients across all hospitals: {len(df_a) + len(df_b) + len(df_c)}")
print("\nData files created:")
print("  - demo/data/HospitalA/patients.csv")
print("  - demo/data/HospitalB/patients.csv")
print("  - demo/data/HospitalC/patients.csv")
