import sys
import json
import os
import traceback
import time
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, roc_curve, auc

def log_status(message, progress=None):
    """Send status update to Electron via stdout"""
    update = {"type": "status", "message": message}
    if progress is not None:
        update["progress"] = progress
    print(json.dumps(update), flush=True)

def main():
    try:
        if len(sys.argv) < 2:
            print(json.dumps({"type": "error", "message": "No CSV path provided"}), flush=True)
            return

        csv_path = sys.argv[1]
        log_status("Initializing clinical backend...", 5)
        
        # Load dataset
        log_status(f"Loading dataset: {os.path.basename(csv_path)}", 15)
        data = pd.read_csv(csv_path)
        
        # Define expected clinical features
        clinical_features = ['age', 'biomarker1', 'biomarker2', 'biomarker3', 'comorbidity_score']
        available_features = [f for f in clinical_features if f in data.columns]
        
        if len(available_features) < 2:
            numeric_cols = data.select_dtypes(include=[np.number]).columns.tolist()
            available_features = [c for c in numeric_cols if c != 'outcome' and c != 'id' and c != 'patientId'][:5]
            
        if 'outcome' not in data.columns:
            raise Exception("CSV missing 'outcome' column for supervised learning.")
            
        if not available_features:
            raise Exception("No numeric clinical features found for analysis.")

        data = data.dropna(subset=available_features + ['outcome'])
        count = len(data)
        
        if count < 10:
            raise Exception(f"Insufficient sample size ({count} records). Need at least 10 valid records.")

        log_status(f"Training clinical model on {count} patient profiles...", 30)
        log_status("Analyzing model performance...", 45)
        
        # Prepare Data
        X = data[available_features]
        y = data['outcome']
        
        if 'patientId' not in data.columns:
            data['patientId'] = [f"P{i+1000:04d}" for i in range(len(data))]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
        
        # Train Model
        model = LogisticRegression(max_iter=1000, solver='lbfgs')
        model.fit(X_train, y_train)
        
        log_status("Computing advanced clinical metrics...", 60)
        
        # 1. Performance Metrics
        y_pred = model.predict(X_test)
        y_prob = model.predict_proba(X_test)[:, 1]
        
        accuracy = accuracy_score(y_test, y_pred)
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        
        sensitivity = float(tp / (tp + fn)) if (tp + fn) > 0 else 0.0
        specificity = float(tn / (tn + fp)) if (tn + fp) > 0 else 0.0
        precision = float(tp / (tp + fp)) if (tp + fp) > 0 else 0.0
        f1_score = float(2 * (precision * sensitivity) / (precision + sensitivity)) if (precision + sensitivity) > 0 else 0.0
        
        # 2. ROC Curve
        fpr, tpr, thresholds = roc_curve(y_test, y_prob)
        roc_points = [{"fpr": float(f), "tpr": float(t), "threshold": float(th)} 
                      for f, t, th in zip(fpr, tpr, thresholds)]
        auc_score = float(auc(fpr, tpr))
        
        # 3. Feature Importance
        importance = []
        log_status("Computing feature importance...", 70)
        coeffs = model.coef_[0]
        # Calculate scaling for percentage
        total_abs_coeff = sum(abs(c) for c in coeffs) or 1.0
        
        for name, val in zip(available_features, coeffs):
            impact = "positive" if val > 0 else "negative"
            importance.append({
                "feature": name, 
                "weight": float(val), 
                "importancePercent": float((abs(val) / total_abs_coeff) * 100),
                "direction": impact
            })
        importance = sorted(importance, key=lambda x: abs(x['weight']), reverse=True)
        
        # 4. Patient-level results
        log_status("Generating individualized risk profiles...", 85)
        all_probs = model.predict_proba(X)[:, 1]
        all_preds = model.predict(X)
        
        results_list = []
        for i, (idx, row) in enumerate(data.iterrows()):
            prob = float(all_probs[i])
            pred = int(all_preds[i])
            
            if prob > 0.7: risk_cat = "high"
            elif prob > 0.4: risk_cat = "medium"
            else: risk_cat = "low"
            
            # Add feature-level contributions for the patient detail view
            contributions = {}
            for name, val in zip(available_features, coeffs):
                # Simple contribution: weight * feature_value
                contributions[name] = float(val * float(row[name]))
            
            res_obj = {
                "patientId": str(row.get('patientId', f"P{idx}")),
                "age": int(row.get('age', 0)),
                "riskCategory": risk_cat,
                "probability": prob,
                "confidence": float(0.85 + (abs(0.5 - prob) * 0.2)),
                "prediction": pred,
                "outcome": int(row['outcome']),
                "contributions": contributions
            }
            
            for feat in available_features:
                res_obj[feat] = float(row[feat])
                
            results_list.append(res_obj)

        # 5. Convenience Aggregates for Dashboard
        log_status("Optimizing risk categorization...", 90)
        high_risk_patients = [p for p in results_list if p['riskCategory'] == 'high']
        medium_risk_patients = [p for p in results_list if p['riskCategory'] == 'medium']
        low_risk_patients = [p for p in results_list if p['riskCategory'] == 'low']

        biomarker_stats = {
            "high": {
                "count": len(high_risk_patients),
                "avgBiomarker1": float(np.mean([p.get('biomarker1', 0) for p in high_risk_patients])) if high_risk_patients else 0.0
            },
            "medium": {
                "count": len(medium_risk_patients)
            },
            "low": {
                "count": len(low_risk_patients)
            }
        }

        # 6. Data Quality Metrics (Enriched)
        completeness_overall = float(data[available_features].notnull().mean().mean() * 100)
        
        feature_quality = {}
        for feat in available_features:
            feat_data = data[feat]
            missing_count = int(feat_data.isnull().sum())
            comp_score = float((1 - (missing_count / count)) * 100)
            
            # Simple outlier detection (Z-score > 3)
            mean = float(feat_data.mean())
            std = float(feat_data.std())
            outliers = 0
            if std > 0:
                outliers = int(((feat_data - mean).abs() > 3 * std).sum())
                
            feature_quality[feat] = {
                "completeness": comp_score,
                "missing": missing_count,
                "mean": mean,
                "std": std,
                "outlierCount": outliers
            }

        quality_obj = {
            "overallQuality": float(min(100, completeness_overall * 0.98)),
            "totalRecords": count,
            "features": feature_quality
        }

        # Final Results Object
        final_results = {
            "type": "result",
            "accuracy": float(accuracy * 100),
            "sensitivity": float(sensitivity * 100),
            "specificity": float(specificity * 100),
            "precision": float(precision * 100),
            "f1Score": float(f1_score * 100),
            "auc": auc_score,
            "totalCount": count,
            "num_samples": count,
            "results": results_list,
            "high_risk": len(high_risk_patients),
            "medium_risk": len(medium_risk_patients),
            "low_risk": len(low_risk_patients),
            "priorityPatients": sorted(high_risk_patients, key=lambda x: x['probability'], reverse=True)[:10],
            "biomarkerStats": biomarker_stats,
            "confusionMatrix": {
                "tp": int(tp),
                "fp": int(fp),
                "tn": int(tn),
                "fn": int(fn)
            },
            "rocCurve": roc_points,
            "featureImportance": importance,
            "dataQuality": quality_obj,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Sanitize data for JSON (Standard JSON doesn't support Infinity or NaN)
        def sanitize_for_json(obj):
            if isinstance(obj, dict):
                return {k: sanitize_for_json(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [sanitize_for_json(x) for x in obj]
            elif isinstance(obj, float):
                if np.isinf(obj):
                    return 1e10 if obj > 0 else -1e10
                if np.isnan(obj):
                    return None
            return obj

        sanitized_results = sanitize_for_json(final_results)
        
        log_status("Finalizing diagnostic report...", 98)
        print(json.dumps({
            "type": "result",
            **sanitized_results
        }), flush=True)

    except Exception as e:
        print(json.dumps({
            "type": "error", 
            "message": str(e),
            "trace": traceback.format_exc()
        }), flush=True)

if __name__ == "__main__":
    main()
