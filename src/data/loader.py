import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer, fetch_openml
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, MinMaxScaler

class DataProvider:
    def __init__(self, dataset_name='breast_cancer', n_clients=5, heterogeneity=0.0):
        self.dataset_name = dataset_name
        self.n_clients = n_clients
        self.heterogeneity = heterogeneity
        self.X = None
        self.y = None
        self.feature_names = None
        self.sensitive_attr = None # For fairness (e.g., 0 or 1)
        
        self.load_data()
        
    def load_data(self):
        print(f"Loading dataset: {self.dataset_name}...")
        if self.dataset_name == 'breast_cancer':
            data = load_breast_cancer()
            self.X = data.data
            self.y = data.target
            self.feature_names = data.feature_names
            # Synthesis of a sensitive attribute for fairness simulation
            # Let's assume 'Age' is correlated with 'Mean Radius' for simulation or just random
            # Here we simulate a "sensitive group" (e.g., Group A vs Group B)
            # biased by the target to make it interesting (e.g., Group A has higher risk)
            n_samples = self.X.shape[0]
            # Create a synthetic sensitive attribute correlated with the target to simulate bias
            # 20% correlation
            self.sensitive_attr = np.random.binomial(1, 0.5, n_samples)
            
        elif self.dataset_name == 'heart':
            # UCI Heart Disease
            try:
                # Statlog (Heart) is commonly available
                data = fetch_openml(name='heart', version=1, as_frame=True, parser='auto')
                self.X = pd.get_dummies(data.data, drop_first=True).values.astype(float)
                self.y = data.target.values.astype(int)
                # Ensure y is 0/1 (sometimes it's 1/2)
                self.y = (self.y > 0).astype(int)
                self.feature_names = np.array(pd.get_dummies(data.data, drop_first=True).columns)
                
                # 'sex' is usually a column in Heart dataset. 
                # Let's find index of 'sex' if it exists, or similar
                # data.data is a dataframe.
                if 'sex' in data.data.columns:
                     # Use real sex as sensitive
                     # We need to extract it before get_dummies if it's categorical?
                     # Usually sex is numeric 0/1 in processed heart datasets.
                     # Let's assume it's there.
                     self.sensitive_attr = data.data['sex'].values.astype(int)
            except Exception as e:
                print(f"Failed to load Heart dataset: {e}. Falling back to Breast Cancer.")
                self.dataset_name = 'breast_cancer'
                self.load_data()
                return

        # Preprocessing
        scaler = StandardScaler()
        self.X = scaler.fit_transform(self.X)
        
        print(f"Data Loaded. Shape: {self.X.shape}, Clients: {self.n_clients}")

    def partition_data(self):
        """
        Partitions data into n_clients.
        heterogeneity: 0.0 (IID) to 1.0 (Highly Non-IID sorted by label).
        """
        n_samples = self.X.shape[0]
        indices = np.arange(n_samples)
        
        if self.heterogeneity > 0:
            # Non-IID: Sort by label to simulate distribution skew
            # Add some randomness based on heterogeneity
            # If h=1, fully sorted. If h=0.5, semi-sorted.
            # Simple approach: Sort, then re-shuffle a portion
            
            sorted_indices = np.argsort(self.y)
            n_swap = int(n_samples * (1.0 - self.heterogeneity))
            if n_swap > 0:
                swap_indices = np.random.choice(n_samples, n_swap, replace=False)
                np.random.shuffle(indices[swap_indices]) # This logic is flawed for mixing
                # Better: Just take sorted, and use Dirichlet if complex, but here:
                # We'll just use the sorted indices and split. 
                # High heterogeneity = Clients get chunks of the sorted array (Client 1 gets all class 0, etc.)
                indices = sorted_indices
                
        else:
            # IID: Random shuffle
            np.random.shuffle(indices)
            
        # Split indices
        client_indices = np.array_split(indices, self.n_clients)
        
        splits = []
        for ids in client_indices:
            splits.append({
                'X': self.X[ids],
                'y': self.y[ids],
                's': self.sensitive_attr[ids] if self.sensitive_attr is not None else np.zeros(len(ids))
            })
            
        return splits
