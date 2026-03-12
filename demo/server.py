from flask import Flask, request, jsonify
import pickle
import numpy as np
from datetime import datetime
import json

app = Flask(__name__)

# Store model updates and metadata
updates = []
hospital_metadata = {}
training_rounds = []
global_model_coef = None

@app.route('/upload_update', methods=['POST'])
def upload_update():
    """Receive model update from a hospital"""
    hospital = request.form['hospital']
    num_samples = int(request.form.get('num_samples', 0))
    accuracy = float(request.form.get('accuracy', 0.0))
    
    file = request.files['update']
    coef = pickle.load(file)
    
    # Store update
    updates.append({
        'hospital': hospital,
        'coef': coef,
        'num_samples': num_samples,
        'accuracy': accuracy,
        'timestamp': datetime.now().isoformat()
    })
    
    # Update metadata
    if hospital not in hospital_metadata:
        hospital_metadata[hospital] = {
            'first_seen': datetime.now().isoformat(),
            'total_updates': 0,
            'total_samples': 0
        }
    
    hospital_metadata[hospital]['total_updates'] += 1
    hospital_metadata[hospital]['total_samples'] += num_samples
    hospital_metadata[hospital]['last_update'] = datetime.now().isoformat()
    hospital_metadata[hospital]['last_accuracy'] = accuracy
    
    # Aggregate global model
    aggregate_global_model()
    
    print(f"✓ Update received from {hospital} ({num_samples} samples, {accuracy:.2%} accuracy)")
    
    return jsonify({
        'status': 'success',
        'message': f'Update received from {hospital}',
        'global_model_updated': True
    })

def aggregate_global_model():
    """Federated averaging of model updates"""
    global global_model_coef
    
    if not updates:
        return
    
    # Weighted average by number of samples
    total_samples = sum(u['num_samples'] for u in updates)
    
    if total_samples > 0:
        weighted_coefs = []
        for update in updates:
            weight = update['num_samples'] / total_samples
            weighted_coefs.append(weight * update['coef'])
        
        global_model_coef = np.sum(weighted_coefs, axis=0)
    else:
        # Simple average if no sample counts
        global_model_coef = np.mean([u['coef'] for u in updates], axis=0)
    
    # Record training round
    training_rounds.append({
        'round': len(training_rounds) + 1,
        'timestamp': datetime.now().isoformat(),
        'num_hospitals': len(set(u['hospital'] for u in updates)),
        'total_samples': total_samples,
        'avg_accuracy': np.mean([u['accuracy'] for u in updates])
    })

@app.route('/get_global_model', methods=['GET'])
def get_global_model():
    """Send global model to hospitals"""
    if global_model_coef is None:
        return jsonify({'error': 'No global model available yet'}), 404
    
    return pickle.dumps(global_model_coef)

@app.route('/dashboard', methods=['GET'])
def dashboard():
    """Dashboard API for metrics"""
    return jsonify({
        'hospitals': list(hospital_metadata.keys()),
        'num_hospitals': len(hospital_metadata),
        'num_updates': len(updates),
        'global_model_coef': global_model_coef.tolist() if global_model_coef is not None else None,
        'hospital_metadata': hospital_metadata,
        'training_rounds': training_rounds,
        'latest_round': training_rounds[-1] if training_rounds else None
    })

@app.route('/hospital/<hospital_name>', methods=['GET'])
def hospital_detail(hospital_name):
    """Get details for a specific hospital"""
    if hospital_name not in hospital_metadata:
        return jsonify({'error': 'Hospital not found'}), 404
    
    hospital_updates = [u for u in updates if u['hospital'] == hospital_name]
    
    return jsonify({
        'name': hospital_name,
        'metadata': hospital_metadata[hospital_name],
        'updates': hospital_updates
    })

@app.route('/reset', methods=['POST'])
def reset():
    """Reset all data (for demo purposes)"""
    global updates, hospital_metadata, training_rounds, global_model_coef
    updates = []
    hospital_metadata = {}
    training_rounds = []
    global_model_coef = None
    
    return jsonify({'status': 'reset complete'})

@app.route('/')
def home():
    return jsonify({
        'service': 'Federated Learning Demo Server',
        'status': 'running',
        'endpoints': {
            'POST /upload_update': 'Receive model update from hospital',
            'GET /get_global_model': 'Get global model',
            'GET /dashboard': 'Get dashboard metrics',
            'GET /hospital/<name>': 'Get hospital details',
            'POST /reset': 'Reset all data'
        }
    })

if __name__ == '__main__':
    print("🚀 Federated Learning Demo Server")
    print("=" * 50)
    print("Server running on http://localhost:5000")
    print("Endpoints:")
    print("  - POST /upload_update")
    print("  - GET  /get_global_model")
    print("  - GET  /dashboard")
    print("  - GET  /hospital/<name>")
    print("=" * 50)
    app.run(port=5000, debug=True)
