"""
FEDRAL.AI Hospital Agent - Cross-Platform Desktop Application

This agent allows hospitals to participate in federated learning with zero technical knowledge.

Usage:
1. Double-click this app
2. Select your patient CSV file
3. Enter hospital name
4. Done! Model trains and submits automatically

Works on: Windows, Mac, Linux
"""

import pandas as pd
import numpy as np
import pickle
import requests
import tkinter as tk
from tkinter import filedialog, simpledialog, messagebox, ttk
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import threading
import os
import json
from datetime import datetime

# Configuration
SERVER_URL = "http://localhost:5000"  # Change to your production server
AGENT_VERSION = "1.0.0"
CONFIG_FILE = "hospital_config.json"

class HospitalAgent:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("FEDRAL.AI Hospital Agent")
        self.root.geometry("500x400")
        self.root.resizable(False, False)
        
        self.hospital_name = None
        self.hospital_id = None
        self.file_path = None
        self.model = None
        
        # Load saved config if exists
        self.load_config()
        
        # Setup GUI
        self.setup_gui()
        
    def load_config(self):
        """Load saved hospital configuration"""
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r') as f:
                    config = json.load(f)
                    self.hospital_name = config.get('hospital_name')
                    self.hospital_id = config.get('hospital_id')
            except:
                pass
    
    def save_config(self):
        """Save hospital configuration"""
        config = {
            'hospital_name': self.hospital_name,
            'hospital_id': self.hospital_id,
            'last_run': datetime.now().isoformat()
        }
        with open(CONFIG_FILE, 'w') as f:
            json.dump(config, f)
    
    def setup_gui(self):
        """Create the GUI interface"""
        # Header
        header = tk.Label(
            self.root, 
            text="🏥 FEDRAL.AI Hospital Agent",
            font=("Arial", 18, "bold"),
            fg="#667eea"
        )
        header.pack(pady=20)
        
        # Info label
        if self.hospital_name:
            info_text = f"Hospital: {self.hospital_name}"
        else:
            info_text = "Welcome! First time setup required."
        
        info = tk.Label(self.root, text=info_text, font=("Arial", 10))
        info.pack(pady=5)
        
        # Instructions
        instructions = tk.Label(
            self.root,
            text="Select your patient CSV file to contribute to federated learning.\n"
                 "Your patient data never leaves your computer.",
            font=("Arial", 9),
            fg="gray",
            wraplength=400,
            justify="center"
        )
        instructions.pack(pady=10)
        
        # Select file button
        self.select_btn = tk.Button(
            self.root,
            text="📁 Select CSV File",
            command=self.select_file,
            font=("Arial", 12, "bold"),
            bg="#667eea",
            fg="white",
            padx=30,
            pady=10,
            cursor="hand2"
        )
        self.select_btn.pack(pady=20)
        
        # Progress bar
        self.progress = ttk.Progressbar(
            self.root,
            length=400,
            mode='indeterminate'
        )
        self.progress.pack(pady=10)
        
        # Status label
        self.status_label = tk.Label(
            self.root,
            text="Ready to start",
            font=("Arial", 9),
            fg="green"
        )
        self.status_label.pack(pady=5)
        
        # Footer
        footer = tk.Label(
            self.root,
            text=f"Version {AGENT_VERSION} | Privacy-Preserving Federated Learning",
            font=("Arial", 8),
            fg="gray"
        )
        footer.pack(side="bottom", pady=10)
    
    def select_file(self):
        """Open file picker dialog"""
        self.file_path = filedialog.askopenfilename(
            title="Select Patient CSV File",
            filetypes=[("CSV Files", "*.csv"), ("All Files", "*.*")]
        )
        
        if not self.file_path:
            return
        
        # If first time, ask for hospital name
        if not self.hospital_name:
            self.hospital_name = simpledialog.askstring(
                "Hospital Information",
                "Enter your hospital name:",
                parent=self.root
            )
            
            if not self.hospital_name:
                messagebox.showerror("Error", "Hospital name is required!")
                return
        
        # Start training in background thread
        self.select_btn.config(state="disabled")
        thread = threading.Thread(target=self.run_training)
        thread.start()
    
    def update_status(self, message, color="black"):
        """Update status label"""
        self.status_label.config(text=message, fg=color)
        self.root.update()
    
    def run_training(self):
        """Main training workflow"""
        try:
            # Step 1: Register hospital
            self.progress.start()
            self.update_status("Registering with server...", "blue")
            self.register_hospital()
            
            # Step 2: Load and validate data
            self.update_status("Loading patient data...", "blue")
            data = self.load_data()
            
            # Step 3: Train local model
            self.update_status("Training local model...", "blue")
            accuracy = self.train_model(data)
            
            # Step 4: Send update to server
            self.update_status("Sending update to server...", "blue")
            self.send_update(accuracy, len(data))
            
            # Step 5: Success
            self.progress.stop()
            self.update_status("✓ Complete! Update submitted successfully.", "green")
            
            messagebox.showinfo(
                "Success",
                f"Training complete!\n\n"
                f"Local Accuracy: {accuracy:.1%}\n"
                f"Samples: {len(data)}\n"
                f"Update sent to FEDRAL.AI server.\n\n"
                f"Thank you for contributing to federated learning!"
            )
            
            # Save config
            self.save_config()
            
        except Exception as e:
            self.progress.stop()
            self.update_status(f"✗ Error: {str(e)}", "red")
            messagebox.showerror("Error", f"An error occurred:\n\n{str(e)}")
        
        finally:
            self.select_btn.config(state="normal")
    
    def register_hospital(self):
        """Register hospital with central server"""
        try:
            response = requests.post(
                f"{SERVER_URL}/api/agent/register",
                json={
                    'hospital_name': self.hospital_name,
                    'agent_version': AGENT_VERSION,
                    'first_run': not os.path.exists(CONFIG_FILE)
                },
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                self.hospital_id = result.get('hospital_id', self.hospital_name)
            else:
                raise Exception(f"Server returned {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            raise Exception("Cannot connect to server. Please check your internet connection.")
        except Exception as e:
            raise Exception(f"Registration failed: {str(e)}")
    
    def load_data(self):
        """Load and validate CSV data"""
        try:
            data = pd.read_csv(self.file_path)
            
            # Validate required columns
            required_cols = ['age', 'biomarker1', 'biomarker2', 'outcome']
            missing = [col for col in required_cols if col not in data.columns]
            
            if missing:
                raise Exception(
                    f"CSV missing required columns: {', '.join(missing)}\n\n"
                    f"Required columns: {', '.join(required_cols)}"
                )
            
            # Remove any rows with missing values
            data = data.dropna(subset=required_cols)
            
            if len(data) < 10:
                raise Exception("Not enough data. Need at least 10 patient records.")
            
            return data
            
        except FileNotFoundError:
            raise Exception("File not found. Please select a valid CSV file.")
        except pd.errors.EmptyDataError:
            raise Exception("CSV file is empty.")
        except Exception as e:
            raise Exception(f"Error loading data: {str(e)}")
    
    def train_model(self, data):
        """Train logistic regression model locally"""
        try:
            # Prepare features and target
            feature_cols = ['age', 'biomarker1', 'biomarker2']
            X = data[feature_cols]
            y = data['outcome']
            
            # Train-test split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train model
            self.model = LogisticRegression(max_iter=1000, random_state=42)
            self.model.fit(X_train, y_train)
            
            # Evaluate
            y_pred = self.model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            return accuracy
            
        except Exception as e:
            raise Exception(f"Training failed: {str(e)}")
    
    def send_update(self, accuracy, num_samples):
        """Send model update to central server"""
        try:
            # Serialize model coefficients
            update_data = pickle.dumps(self.model.coef_)
            
            # Send to server using new endpoint
            response = requests.post(
                f"{SERVER_URL}/api/agent/upload_model",
                files={'update': ('model.pkl', update_data, 'application/octet-stream')},
                data={
                    'hospital_name': self.hospital_name,
                    'num_samples': num_samples,
                    'accuracy': accuracy
                },
                timeout=30
            )
            
            if response.status_code != 200:
                raise Exception(f"Server returned {response.status_code}")
            
            # Save model locally as backup
            with open(f"local_model_{self.hospital_name}.pkl", "wb") as f:
                pickle.dump(self.model, f)
                
        except requests.exceptions.ConnectionError:
            # Offline mode - save locally
            with open(f"pending_update_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pkl", "wb") as f:
                pickle.dump({
                    'hospital': self.hospital_name,
                    'coef': self.model.coef_,
                    'num_samples': num_samples,
                    'accuracy': accuracy
                }, f)
            raise Exception("Offline mode: Update saved locally. Will sync when online.")
        except Exception as e:
            raise Exception(f"Upload failed: {str(e)}")
    
    def run(self):
        """Start the application"""
        self.root.mainloop()

if __name__ == "__main__":
    app = HospitalAgent()
    app.run()
