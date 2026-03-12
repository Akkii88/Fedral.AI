import pandas as pd
import numpy as np
import os

def generate_complex_dataset(num_samples=500000):
    np.random.seed(42)
    print(f"Starting generation of {num_samples} records...")
    
    # Core Features
    age = np.random.normal(55, 15, num_samples).astype(int)
    age = np.clip(age, 18, 95)
    
    # Biomarkers (Extended to 10 markers)
    markers = {}
    for i in range(1, 11):
        # Different markers have different distributions
        if i % 3 == 0:
            markers[f'biomarker{i}'] = np.random.gamma(shape=2, scale=2, size=num_samples)
        elif i % 2 == 0:
            markers[f'biomarker{i}'] = np.random.normal(100, 20, num_samples)
        else:
            markers[f'biomarker{i}'] = np.random.poisson(lam=i*2, size=num_samples).astype(float)
            
    # Categorical Data & Noise
    patient_id = [f"EXT-{i:06d}" for i in range(num_samples)]
    blood_group = np.random.choice(['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], num_samples)
    department = np.random.choice(['Emergency', 'Cardiology', 'Oncology', 'Neurology', 'General'], num_samples)
    zip_code = np.random.randint(10000, 99999, num_samples)
    
    # High-Dimensional Outcome Logic (Interaction Terms)
    # Outcome depends on complex non-linear interactions
    # Age + Biomarker1*Biomarker2 - log(Biomarker3) + outliers in Biomarker5
    logit = (
        (age - 55) / 30 * 0.4 + 
        (markers['biomarker1'] * markers['biomarker2']) / 500 * 0.6 -
        np.log1p(markers['biomarker3']) * 0.3 +
        (markers['biomarker4'] > 120).astype(int) * 0.5 +
        (markers['biomarker5'] - 10) * 0.1
    )
    
    # Normalize and convert to binary
    prob = 1 / (1 + np.exp(-logit))
    outcome = (prob > 0.55).astype(int)
    
    data_dict = {
        'patient_id': patient_id,
        'age': age,
        'blood_group': blood_group,
        'department': department,
        'zip_code': zip_code,
        'outcome': outcome
    }
    data_dict.update(markers)
    
    df = pd.DataFrame(data_dict)
    
    # Inject Heavy Missing Data & Outliers
    for i in range(1, 6):
        col = f'biomarker{i}'
        # Missing data (3%)
        mask = np.random.choice([True, False], size=num_samples, p=[0.03, 0.97])
        df.loc[mask, col] = np.nan
        # Outliers (1%)
        outlier_mask = np.random.choice([True, False], size=num_samples, p=[0.01, 0.99])
        df.loc[outlier_mask, col] = df[col].max() * 5
        
    output_path = 'demo/data/extreme_clinical_data_500k.csv'
    df.to_csv(output_path, index=False)
    print(f"Extreme Dataset generated: {output_path}")
    print(f"Samples: {num_samples}")
    print(f"Columns: {list(df.columns)}")

if __name__ == "__main__":
    generate_complex_dataset()
