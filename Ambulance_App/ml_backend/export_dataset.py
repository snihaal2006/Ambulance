import pandas as pd
import numpy as np

def generate_synthetic_data(num_samples=15000):
    np.random.seed(42)
    hosp_ids = np.random.choice([1, 2, 3, 4, 5, 6], num_samples)
    current_beds = np.random.randint(0, 15, num_samples)
    eta_minutes = np.random.randint(2, 45, num_samples)
    distance_km = eta_minutes * (40 / 60) + np.random.normal(0, 1, num_samples)
    distance_km = np.abs(distance_km)
    
    is_critical = np.random.choice([True, False], num_samples, p=[0.3, 0.7])
    hr = np.where(is_critical, np.random.randint(110, 160, num_samples), np.random.randint(60, 100, num_samples))
    sys_bp = np.where(is_critical, np.random.randint(70, 95, num_samples), np.random.randint(100, 140, num_samples))
    spo2 = np.where(is_critical, np.random.randint(80, 92, num_samples), np.random.randint(94, 100, num_samples))
    
    score = np.full(num_samples, 100.0)
    score -= distance_km * 2
    score += current_beds * 3
    
    for i in range(num_samples):
        if is_critical[i]:
            if eta_minutes[i] > 20:
                score[i] -= (eta_minutes[i] - 20) * 4
            if current_beds[i] == 0:
                score[i] -= 100
            elif current_beds[i] < 2:
                score[i] -= 30
                
    score = np.clip(score, 0, 100)
    
    df = pd.DataFrame({
        'hospital_id': hosp_ids,
        'current_beds': current_beds,
        'eta_minutes': eta_minutes,
        'distance_km': np.round(distance_km, 2),
        'hr': hr,
        'sys_bp': sys_bp,
        'spo2': spo2,
        'suitability_score': np.round(score, 2)
    })
    return df

df = generate_synthetic_data(15000)
df.to_csv('hospital_routing_dataset.csv', index=False)
print("Saved to hospital_routing_dataset.csv")
