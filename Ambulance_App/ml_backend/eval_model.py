import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error, mean_absolute_error

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
        'distance_km': distance_km,
        'hr': hr,
        'sys_bp': sys_bp,
        'spo2': spo2,
        'suitability_score': score
    })
    return df

print("1. Generating 15,000 synthetic patient scenarios...")
df = generate_synthetic_data()

X = df[['hospital_id', 'current_beds', 'eta_minutes', 'distance_km', 'hr', 'sys_bp', 'spo2']]
y = df['suitability_score']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

print("2. Training XGBoost Regressor...")
model = xgb.XGBRegressor(
    objective='reg:squarederror',
    n_estimators=150,
    learning_rate=0.1,
    max_depth=6
)
model.fit(X_train, y_train)

print("3. Evaluating Model...")
y_pred = model.predict(X_test)

r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)

print("-" * 30)
print(f"R-Squared (RÂ²) Score : {r2:.4f} ({(r2 * 100):.2f}%)")
print(f"Mean Absolute Error   : {mae:.2f} points (out of 100)")
print("-" * 30)
