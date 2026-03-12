import pandas as pd
import numpy as np
import requests
import pickle
import argparse
import time
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

class HospitalAgent:
    def __init__(self, hospital_name, data_path, server_url):
        self.hospital_name = hospital_name
        self.data_path = data_path
        self.server_url = server_url
        self.model = LogisticRegression(max_iter=1000, random_state=42)
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.num_samples = 0
        
    def load_data(self):
        """Load and prepare local hospital data"""
        print(f"\n[{self.hospital_name}] Loading data from {self.data_path}")
        data = pd.read_csv(self.data_path)
        
        # Features and target
        feature_cols = ['age', 'biomarker1', 'biomarker2', 'biomarker3', 'comorbidity_score']
        X = data[feature_cols]
        y = data['outcome']
        
        # Train-test split
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        
        self.num_samples = len(self.X_train)
        print(f"[{self.hospital_name}] Loaded {self.num_samples} training samples, {len(self.X_test)} test samples")
        
    def train_local_model(self):
        """Train model on local data"""
        print(f"[{self.hospital_name}] Training local model...")
        self.model.fit(self.X_train, self.y_train)
        
        # Evaluate
        y_pred = self.model.predict(self.X_test)
        accuracy = accuracy_score(self.y_test, y_pred)
        
        print(f"[{self.hospital_name}] ✓ Training complete. Local accuracy: {accuracy:.2%}")
        return accuracy
        
    def send_update_to_server(self, accuracy):
        """Send model update to central server"""
        print(f"[{self.hospital_name}] Sending update to server...")
        
        # Serialize model coefficients
        update = pickle.dumps(self.model.coef_)
        
        try:
            response = requests.post(
                f"{self.server_url}/upload_update",
                files={'update': update},
                data={
                    'hospital': self.hospital_name,
                    'num_samples': self.num_samples,
                    'accuracy': accuracy
                }
            )
            
            if response.status_code == 200:
                print(f"[{self.hospital_name}] ✓ Update sent successfully")
                return True
            else:
                print(f"[{self.hospital_name}] ✗ Failed to send update: {response.text}")
                return False
                
        except Exception as e:
            print(f"[{self.hospital_name}] ✗ Error sending update: {e}")
            return False
            
    def get_global_model(self):
        """Retrieve global model from server"""
        print(f"[{self.hospital_name}] Fetching global model...")
        
        try:
            response = requests.get(f"{self.server_url}/get_global_model")
            
            if response.status_code == 200:
                coef = pickle.loads(response.content)
                self.model.coef_ = coef
                print(f"[{self.hospital_name}] ✓ Global model updated")
                
                # Evaluate with global model
                y_pred = self.model.predict(self.X_test)
                accuracy = accuracy_score(self.y_test, y_pred)
                print(f"[{self.hospital_name}] Global model accuracy on local test: {accuracy:.2%}")
                return True
            else:
                print(f"[{self.hospital_name}] ✗ No global model available yet")
                return False
                
        except Exception as e:
            print(f"[{self.hospital_name}] ✗ Error fetching global model: {e}")
            return False
            
    def run_training_round(self):
        """Execute one complete training round"""
        print(f"\n{'='*60}")
        print(f"[{self.hospital_name}] Starting training round")
        print(f"{'='*60}")
        
        # Load data
        self.load_data()
        
        # Train local model
        accuracy = self.train_local_model()
        
        # Send update to server
        self.send_update_to_server(accuracy)
        
        # Wait a bit for server to aggregate
        time.sleep(2)
        
        # Get global model
        self.get_global_model()
        
        print(f"[{self.hospital_name}] ✓ Training round complete\n")

def main():
    parser = argparse.ArgumentParser(description='Hospital Agent for Federated Learning')
    parser.add_argument('--hospital', type=str, required=True, 
                       choices=['HospitalA', 'HospitalB', 'HospitalC'],
                       help='Hospital name')
    parser.add_argument('--server', type=str, default='http://localhost:5000',
                       help='Server URL')
    parser.add_argument('--rounds', type=int, default=1,
                       help='Number of training rounds')
    
    args = parser.parse_args()
    
    # Construct data path
    data_path = f'demo/data/{args.hospital}/patients.csv'
    
    # Create agent
    agent = HospitalAgent(
        hospital_name=args.hospital,
        data_path=data_path,
        server_url=args.server
    )
    
    # Run training rounds
    for round_num in range(args.rounds):
        if args.rounds > 1:
            print(f"\n{'#'*60}")
            print(f"# ROUND {round_num + 1} / {args.rounds}")
            print(f"{'#'*60}")
        
        agent.run_training_round()
        
        if round_num < args.rounds - 1:
            print(f"\nWaiting 5 seconds before next round...")
            time.sleep(5)

if __name__ == '__main__':
    main()
