from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
import datetime
import random
import requests

app = Flask(__name__)
CORS(app)

# Load Model and Encoders
try:
    with open('agriculture_model_improved.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('label_encoders_improved.pkl', 'rb') as f:
        encoders = pickle.load(f)
        scaler = encoders.get('scaler')
    print("Model and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    encoders = None
    scaler = None

# Load Monthly Rainfall Averages
try:
    rainfall_df = pd.read_csv('rainfall_monthly_averages.csv')
    rainfall_data = rainfall_df.set_index('District').to_dict('index')
    print("Rainfall data loaded successfully.")
except Exception as e:
    print(f"Error loading rainfall data: {e}")
    rainfall_data = {}

# Cost Map (Same as in augment_data.py)
COST_MAP = {
    'Rice': 40000, 'Banana': 100000, 'Maize': 30000, 'Linseed': 20000,
    'Cowpea(Lobia)': 25000, 'Peas & beans (Pulses)': 35000, 'Rapeseed &Mustard': 25000,
    'Sugarcane': 80000, 'Tobacco': 50000, 'Wheat': 35000, 'Jute': 45000,
    'Mesta': 20000, 'Potato': 60000, 'Turmeric': 70000, 'Ginger': 80000,
    'Arecanut': 90000, 'Black pepper': 100000, 'Cashewnut': 50000, 'Tapioca': 40000
}

def get_estimated_cost(crop, area):
    base = 30000
    for key in COST_MAP:
        if key.lower() in str(crop).lower():
            base = COST_MAP[key]
            break
    return area * base

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "online",
        "message": "Smart Agriculture Backend is Running",
        "endpoints": ["/info", "/predict", "/forecast", "/recommend", "/advisory"]
    })


@app.route('/info', methods=['GET'])
def get_info():
    if not encoders:
        return jsonify({"error": "Model not loaded"}), 500
    
    return jsonify({
        "districts": list(encoders['district'].classes_),
        "seasons": list(encoders['season'].classes_),
        "crops": list(encoders['crop'].classes_)
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not encoders:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.json
    district = data.get('district')
    season = data.get('season')
    crop = data.get('crop')
    area = float(data.get('area'))
    rainfall = float(data.get('rainfall')) 
    
    # Calculate Cost if not provided (User might not know exact cost)
    # But for prediction, we need it as feature.
    cost = data.get('cost')
    if not cost:
        cost = get_estimated_cost(crop, area)
    
    try:
        district_enc = encoders['district'].transform([district])[0]
        season_enc = encoders['season'].transform([season])[0]
        crop_enc = encoders['crop'].transform([crop])[0]
        
        # Scale numerical features
        numerical_features = np.array([[area, rainfall, cost]])
        numerical_features_scaled = scaler.transform(numerical_features)
        
        # Combine features: District, Season, Crop, Area_Scaled, Rainfall_Scaled, Cost_Scaled
        features = np.array([[district_enc, season_enc, crop_enc, 
                              numerical_features_scaled[0][0], 
                              numerical_features_scaled[0][1], 
                              numerical_features_scaled[0][2]]])
                              
        prediction_log = model.predict(features)[0]
        prediction = np.expm1(prediction_log)
        
        return jsonify({
            "production": prediction,
            "yield": prediction / area if area > 0 else 0,
            "estimated_cost": cost
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    district = data.get('district')
    current_month_idx = data.get('month_idx', datetime.datetime.now().month - 1)
    
    if district not in rainfall_data:
        return jsonify({"error": "District rainfall data not found"}), 404
        
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    forecast_data = []
    
    for i in range(3):
        idx = (current_month_idx + i) % 12
        month_name = months[idx]
        predicted_rainfall = rainfall_data[district].get(month_name, 0)
        
        erosion_risk = "Low"
        if predicted_rainfall > 300:
            erosion_risk = "High"
        elif predicted_rainfall > 100:
            erosion_risk = "Medium"
            
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
import datetime
import random
import requests

app = Flask(__name__)
CORS(app)

# Load Model and Encoders
try:
    with open('agriculture_model_improved.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('label_encoders_improved.pkl', 'rb') as f:
        encoders = pickle.load(f)
        scaler = encoders.get('scaler')
    print("Model and encoders loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None
    encoders = None
    scaler = None

# Load Monthly Rainfall Averages
try:
    rainfall_df = pd.read_csv('rainfall_monthly_averages.csv')
    rainfall_data = rainfall_df.set_index('District').to_dict('index')
    print("Rainfall data loaded successfully.")
except Exception as e:
    print(f"Error loading rainfall data: {e}")
    rainfall_data = {}

# Cost Map (Same as in augment_data.py)
COST_MAP = {
    'Rice': 40000, 'Banana': 100000, 'Maize': 30000, 'Linseed': 20000,
    'Cowpea(Lobia)': 25000, 'Peas & beans (Pulses)': 35000, 'Rapeseed &Mustard': 25000,
    'Sugarcane': 80000, 'Tobacco': 50000, 'Wheat': 35000, 'Jute': 45000,
    'Mesta': 20000, 'Potato': 60000, 'Turmeric': 70000, 'Ginger': 80000,
    'Arecanut': 90000, 'Black pepper': 100000, 'Cashewnut': 50000, 'Tapioca': 40000
}

def get_estimated_cost(crop, area):
    base = 30000
    for key in COST_MAP:
        if key.lower() in str(crop).lower():
            base = COST_MAP[key]
            break
    return area * base

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "online",
        "message": "Smart Agriculture Backend is Running",
        "endpoints": ["/info", "/predict", "/forecast", "/recommend", "/advisory"]
    })


@app.route('/info', methods=['GET'])
def get_info():
    if not encoders:
        return jsonify({"error": "Model not loaded"}), 500
    
    return jsonify({
        "districts": list(encoders['district'].classes_),
        "seasons": list(encoders['season'].classes_),
        "crops": list(encoders['crop'].classes_)
    })

@app.route('/predict', methods=['POST'])
def predict():
    if not model or not encoders:
        return jsonify({"error": "Model not loaded"}), 500
    
    data = request.json
    district = data.get('district')
    season = data.get('season')
    crop = data.get('crop')
    area = float(data.get('area'))
    rainfall = float(data.get('rainfall')) 
    
    # Calculate Cost if not provided (User might not know exact cost)
    # But for prediction, we need it as feature.
    cost = data.get('cost')
    if not cost:
        cost = get_estimated_cost(crop, area)
    
    try:
        district_enc = encoders['district'].transform([district])[0]
        season_enc = encoders['season'].transform([season])[0]
        crop_enc = encoders['crop'].transform([crop])[0]
        
        # Scale numerical features
        numerical_features = np.array([[area, rainfall, cost]])
        numerical_features_scaled = scaler.transform(numerical_features)
        
        # Combine features: District, Season, Crop, Area_Scaled, Rainfall_Scaled, Cost_Scaled
        features = np.array([[district_enc, season_enc, crop_enc, 
                              numerical_features_scaled[0][0], 
                              numerical_features_scaled[0][1], 
                              numerical_features_scaled[0][2]]])
                              
        prediction_log = model.predict(features)[0]
        prediction = np.expm1(prediction_log)
        
        return jsonify({
            "production": prediction,
            "yield": prediction / area if area > 0 else 0,
            "estimated_cost": cost
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    district = data.get('district')
    area = float(data.get('area'))
    budget = data.get('budget') # Low, Medium, High
    slope = data.get('slope') # Flat, Gentle, Steep
    rainfall = float(data.get('rainfall', 0)) # Expected rainfall
    season = data.get('season', 'Kharif') # Default to Kharif if not provided
    
    # Budget Limits
    budget_limit = {
        'Low': 20000 * area,
        'Medium': 50000 * area,
        'High': 1000000 * area
    }
    limit = budget_limit.get(budget, 1000000 * area)
    
    # Slope Suitability
    slope_suitability = {
        'Flat': ['Rice', 'Wheat', 'Jute', 'Potato', 'Sugarcane'],
        'Gentle': ['Maize', 'Soyabean', 'Pulses', 'Vegetables'],
        'Steep': ['Tea', 'Coffee', 'Rubber', 'Arecanut', 'Black pepper', 'Cashewnut', 'Turmeric', 'Ginger']
    }
    
    # Get all crops
    all_crops = list(encoders['crop'].classes_)
    candidates = []
    
    for crop in all_crops:
        est_cost = get_estimated_cost(crop, area)
        
        # 1. Budget Check
        if est_cost > limit:
            continue
            
        # 2. Slope Check
        is_suitable_slope = False
        if slope == 'Steep':
            if any(c.lower() in crop.lower() for c in slope_suitability['Steep']):
                is_suitable_slope = True
        elif slope == 'Flat':
             if any(c.lower() in crop.lower() for c in slope_suitability['Flat']):
                is_suitable_slope = True
        else:
            is_suitable_slope = True # Gentle is okay for most
            
        # 3. ML Prediction for Yield
        if is_suitable_slope:
            try:
                # Prepare features for prediction
                district_enc = encoders['district'].transform([district])[0]
                season_enc = encoders['season'].transform([season])[0]
                crop_enc = encoders['crop'].transform([crop])[0]
                
                # Scale numerical features [Area, Rainfall, Cost]
                numerical_features = np.array([[area, rainfall, est_cost]])
                numerical_features_scaled = scaler.transform(numerical_features)
                
                features = np.array([[district_enc, season_enc, crop_enc, 
                                      numerical_features_scaled[0][0], 
                                      numerical_features_scaled[0][1], 
                                      numerical_features_scaled[0][2]]])
                                      
                prediction_log = model.predict(features)[0]
                prediction_production = np.expm1(prediction_log)
                predicted_yield = prediction_production / area if area > 0 else 0
                
                candidates.append({
                    "crop": crop,
                    "production": prediction_production,
                    "yield": predicted_yield,
                    "cost": est_cost
                })
            except Exception as e:
                print(f"Skipping {crop} due to error: {e}")
                continue

    # 4. Rank by Yield (or Production)
    # Sort by Yield (tons/hectare) descending
    candidates.sort(key=lambda x: x['yield'], reverse=True)

    return jsonify({
        "recommendations": candidates[:5], # Top 5
        "best_crop": candidates[0] if candidates else None
    })

@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.json
    district = data.get('district')
    current_month_idx = data.get('month_idx', datetime.datetime.now().month - 1)
    
    if district not in rainfall_data:
        return jsonify({"error": "District rainfall data not found"}), 404
        
    months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    forecast_data = []
    
    for i in range(3):
        idx = (current_month_idx + i) % 12
        month_name = months[idx]
        predicted_rainfall = rainfall_data[district].get(month_name, 0)
        
        erosion_risk = "Low"
        if predicted_rainfall > 300:
            erosion_risk = "High"
        elif predicted_rainfall > 100:
            erosion_risk = "Medium"
            
        forecast_data.append({
            "month": month_name,
            "rainfall": predicted_rainfall,
            "erosion_risk": erosion_risk
        })
        
    return jsonify({
        "forecast": forecast_data,
        "advisory": [] # This will be populated by the /advisory endpoint
    })

def get_weather_forecast(lat, lon):
    try:
        # Open-Meteo API (Free, no key)
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&daily=temperature_2m_max,precipitation_sum,wind_speed_10m_max&timezone=auto"
        response = requests.get(url)
        data = response.json()
        return data
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None

@app.route('/advisory', methods=['POST'])
def advisory():
    data = request.json
    lat = data.get('lat')
    lon = data.get('lon')
    crop = data.get('crop')
    sowing_date = data.get('sowing_date') # String YYYY-MM-DD
    
    if not lat or not lon:
        return jsonify({"error": "Location required"}), 400
        
    weather = get_weather_forecast(lat, lon)
    if not weather:
        return jsonify({"error": "Could not fetch weather data"}), 500
        
    daily = weather.get('daily', {})
    dates = daily.get('time', [])
    temps = daily.get('temperature_2m_max', [])
    rains = daily.get('precipitation_sum', [])
    winds = daily.get('wind_speed_10m_max', [])
    
    forecast_list = []
    alerts = []
    
    for i in range(len(dates)):
        day_data = {
            "date": dates[i],
            "temp": temps[i],
            "rain": rains[i],
            "wind": winds[i]
        }
        forecast_list.append(day_data)
        
        # Rule Engine for Alerts
        if rains[i] > 50:
            alerts.append(f"⚠️ Heavy rain ({rains[i]}mm) predicted on {dates[i]}. Ensure drainage.")
        if winds[i] > 30:
            alerts.append(f"⚠️ High wind ({winds[i]}km/h) predicted on {dates[i]}. Support tall crops.")
        if temps[i] > 35:
            alerts.append(f"⚠️ High heat ({temps[i]}°C) on {dates[i]}. Irrigate to cool soil.")
            
    # Crop Specific Logic (Mock)
    crop_advice = ""
    if crop:
        if "Rice" in crop:
            if any(r > 20 for r in rains):
                crop_advice = "Rice benefits from this rain, but ensure water level doesn't exceed 5cm."
            else:
                crop_advice = "Dry spell ahead. Maintain standing water for Rice."
        elif "Maize" in crop:
            if any(r > 50 for r in rains):
                crop_advice = "Maize is sensitive to waterlogging. Clear drainage channels immediately!"
    
    return jsonify({
        "forecast": forecast_list,
        "alerts": alerts,
        "crop_advice": crop_advice
    })


if __name__ == '__main__':
    app.run(debug=True, port=5000)