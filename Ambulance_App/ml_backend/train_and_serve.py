import pandas as pd
import numpy as np
import xgboost as xgb
from flask import Flask, request, jsonify
from sklearn.model_selection import train_test_split
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = None
hospital_mapping = {
    'hosp-apollo': 0,
    'hosp-miot': 1,
    'hosp-fortis': 2,
    'hosp-gleneagles': 3,
    'hosp-kauvery': 4,
    'hosp-rgggh': 5
}

def generate_synthetic_data(num_samples=15000):
    print("Generating synthetic hospital and vitals data for training...")
    np.random.seed(42)
    
    hosp_ids = np.random.choice(list(hospital_mapping.values()), num_samples)
    current_beds = np.random.randint(0, 16, num_samples)
    eta_minutes = np.random.randint(5, 61, num_samples)
    distance_km = eta_minutes / 2.2 # Approx distance
    
    # Generate Vitals
    # 70% normalish, 30% critical
    is_critical = np.random.rand(num_samples) < 0.3
    
    hr = np.where(is_critical, np.random.randint(110, 160, num_samples), np.random.randint(60, 100, num_samples))
    sys_bp = np.where(is_critical, np.random.randint(70, 95, num_samples), np.random.randint(100, 140, num_samples))
    spo2 = np.where(is_critical, np.random.randint(80, 92, num_samples), np.random.randint(94, 100, num_samples))
    
    # Target: suitability_score (0 to 100)
    score = np.full(num_samples, 100.0)
    
    # 1. Base distance penalty (farther = lower score)
    score -= distance_km * 2
    
    # 2. Bed availability bonus
    score += current_beds * 3
    
    # 3. MAJOR WEIGHT for Vitals
    for i in range(num_samples):
        # If patient is critical (low spo2, low bp, high hr)
        if is_critical[i]:
            # If critical, ETA becomes the biggest factor. >20 mins is a massive penalty
            if eta_minutes[i] > 20:
                score[i] -= (eta_minutes[i] - 20) * 4 # Extreme penalty for far hospitals when critical
            
            # If critical, they absolutely need a bed
            if current_beds[i] == 0:
                score[i] -= 100 # Fatal, cannot route here
            elif current_beds[i] < 2:
                score[i] -= 30
        else:
            # Stable patient, can travel slightly further if hospital has more beds
            pass
            
    # Normalize score somewhat between 0 and 100
    score = np.clip(score, 0, 100)
    
    df = pd.DataFrame({
        'hospital_id': hosp_ids,
        'current_beds': current_beds,
        'eta_minutes': eta_minutes,
        'distance_km': distance_km,
        'hr': hr,
        'sys_bp': sys_bp,
        'spo2': spo2,
        'suitability_score': score
    })
    
    return df

def train_model():
    global model
    df = generate_synthetic_data(15000)
    
    X = df[['hospital_id', 'current_beds', 'eta_minutes', 'distance_km', 'hr', 'sys_bp', 'spo2']]
    y = df['suitability_score']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training XGBoost Suitability Model...")
    model = xgb.XGBRegressor(
        objective='reg:squarederror',
        n_estimators=150,
        learning_rate=0.1,
        max_depth=6
    )
    
    model.fit(X_train, y_train)
    score = model.score(X_test, y_test)
    print(f"Suitability Model trained! R^2 Score: {score:.4f}")

@app.route('/api/v1/predict-hospital-scores', methods=['POST'])
def predict_hospital_scores():
    if not model:
        return jsonify({"error": "Model not trained yet"}), 500
        
    data = request.json
    hospitals = data.get('hospitals', [])
    vitals = data.get('vitals', {"hr": 80, "sys_bp": 120, "spo2": 98})
    
    hr = vitals.get('hr', 80)
    sys_bp = vitals.get('sys_bp', 120)
    spo2 = vitals.get('spo2', 98)
    
    results = []
    
    for h in hospitals:
        hosp_id_str = h.get('hospital_id', 'hosp-apollo')
        current_beds = float(h.get('current_beds', 5))
        eta_minutes = float(h.get('eta_minutes', 15))
        distance_km = float(h.get('distance_km', 5.0))
        
        hosp_id_encoded = hospital_mapping.get(hosp_id_str, 0)
        
        input_df = pd.DataFrame([{
            'hospital_id': hosp_id_encoded,
            'current_beds': current_beds,
            'eta_minutes': eta_minutes,
            'distance_km': distance_km,
            'hr': hr,
            'sys_bp': sys_bp,
            'spo2': spo2
        }])
        
        predicted_score = model.predict(input_df)[0]
        final_score = float(np.clip(predicted_score, 0, 100))
        
        # Simple heuristic for predicted beds for the UI
        beds_decrease = (eta_minutes / 20.0)
        if hr > 110 or spo2 < 90:
            beds_decrease += 1 # Critical patients consume beds faster
        final_beds = max(0, int(round(current_beds - beds_decrease)))
        
        results.append({
            "hospital_id": hosp_id_str,
            "ai_score": final_score,
            "predicted_beds_at_arrival": final_beds
        })
        
    return jsonify({"success": True, "predictions": results, "vitals_used": vitals})

if __name__ == '__main__':
    train_model()
    print("Starting Flask ML Server on port 5000...")
    app.run(host='0.0.0.0', port=5000)
