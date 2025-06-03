import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from flask import Flask, request, jsonify, render_template_string
import gdacs.api as gc
import json
import math
from datetime import datetime
import logging
import random

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Haversine distance function
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth radius in km
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1)*math.cos(lat2)*math.sin(dlon/2)**2
    c = 2*math.asin(math.sqrt(a))
    return R * c

# Simulating dataset based on data_3countries_refugees_public.csv
def simulate_refugee_data(n_samples=100):
    data = {
        'hhid': [f'ID_{i}' for i in range(n_samples)],
        'surveylocation': random.choices(['Nairobi', 'Melkadida'], weights=[0.5, 0.5], k=n_samples),
        'nationality_cat': random.choices(['Congolese', 'Somali'], weights=[0.5, 0.5], k=n_samples),
        'age': np.random.randint(18, 70, n_samples),
        'gender': random.choices(['Male', 'Female'], weights=[0.5, 0.0], k=n_samples),
        'education_years3': np.random.randint(0, 17, n_samples),
        'job': random.choices(['no work', 'Restaurant', 'Hawking'], k=n_samples),
        'hhincome_ww_lcu': np.random.randint(0, 100000, n_samples),
        'assets': np.random.randint(0, 5, n_samples),
        'health': random.choices(['No Difficulty', 'Mild difficulty', 'Moderate difficulty', 'Severe difficulty'], k=n_samples),
        'mental_phq9': np.random.randint(0, 27, n_samples),
        'remittances_USD': np.random.randint(0, 500, n_samples)
    }
    return pd.DataFrame(data)

# Define services, including disaster-specific ones
services = [
    {
        'name': 'Job Training', 'crisis_types': ['none'],
        'education_years3': 10, 'job': 'no work', 'hhincome_ww_lcu': 5000, 'assets': 2,
        'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'gender': 'Male',
 'health': 'No Difficulty',
        'mental_phq9': 5, 'remittances_USD': 100, 'age': 30
    },
    {
        'name': 'Health Support', 'crisis_types': ['EQ', 'TC', 'FL'],
        'health': 'Severe difficulty', 'mental_phq9': 15, 'age': 50,
        'surveylocation': 'Melkadida', 'nationality_cat': 'Somali', 'gender': 'Female',
 'education_years3': 0,
        'job': 'no work', 'hhincome_ww_lcu': 5000, 'assets': 0, 'remittances_USD': 0
    },
    {
        'name': 'Microfinance', 'crisis_types': ['FL', 'TC'],
        'hhincome_ww_lcu': 5000, 'assets': 0, 'remittances_USD': 0,
        'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'gender': 'Female',
 'education_years3': 3,
        'job': 'Hawking', 'health': 'Mild difficulty', 'mental_phq9': 8, 'age': 35
    },
    {
        'name': 'Education Program', 'crisis_types': ['none'],
        'education_years3': 2, 'age': 25, 'job': 'no work',
        'surveylocation': 'Melkadida', 'nationality_cat': 'Somali', 'gender': 'Male',
 'hhincome_ww_lcu': 2000,
        'assets': 1, 'health': 'No Difficulty', 'mental_phq9': 3, 'remittances_USD': 50
    },
    {
        'name': 'Shelter Assistance', 'crisis_types': ['EQ', 'TC'],
        'hhincome_ww_lcu': 3000, 'assets': 0, 'health': 'Moderate difficulty',
        'surveylocation': 'Nairobi', 'nationality_cat': 'Somali', 'gender': 'Male',
 'education_years3': 5,
        'job': 'no work', 'mental_phq9': 10, 'remittances_USD': 20, 'age': 40
    },
    {
        'name': 'Food Aid', 'crisis_types': ['FL', 'DR'],
        'hhincome_ww_lcu': 2000, 'assets': 0, 'health': 'Mild difficulty',
        'surveylocation': 'Melkadida', 'nationality_cat': 'Congolese', 'gender': 'Female',
 'education_years3': 4,
        'job': 'no work', 'mental_phq9': 12, 'remittances_USD': 0, 'age': 45
    }
]

# Fetch and filter GDACS events
def get_relevant_crises(locations=[{'name': 'Nairobi', 'lat': -1.286389, 'lon': 36.817223},
                                   {'name': 'Melkadida', 'lat': 4.516667, 'lon': 41.966667}],
                        radius_km=500, min_alert='Orange'):
    try:
        client = gc.GDACSAPIReader()
        events = client.latest_events(limit=50)  # Fetch more for better coverage
        relevant_events = []
        
        alert_priority = {'Green': 1, 'Orange': 2, 'Red': 3}
        if min_alert not in alert_priority:
            min_alert = 'Orange'
        
        for feature in events.get('features', []):
            props = feature['properties']
            coords = feature['geometry']['coordinates']  # [lon, lat]
            alert_level = props.get('alertlevel', 'Green')
            
            # Check alert level
            if alert_priority.get(alert_level, 1) < alert_priority.get(min_alert, 2):
                continue
                
            # Check location proximity or country
            event_country = props.get('iso3', '')
            if event_country in ['KEN', 'ETH']:
                relevant_events.append({
                    'event_type': props['eventtype'],
                    'alert_level': alert_level,
                    'severity': props['severitydata']['severity'],
                    'location': props['country'] or 'Off-shore',
                    'date': props['fromdate'],
                    'coords': coords
                })
                continue
                
            # Check distance to Nairobi or Melkadida
            for loc in locations:
                distance = haversine(loc['lat'], loc['lon'], coords[1], coords[0])
                if distance <= radius_km:
                    relevant_events.append({
                        'event_type': props['eventtype'],
                        'alert_level': alert_level,
                        'severity': props['severitydata']['severity'],
                        'location': props['country'] or 'Off-shore',
                        'date': props['fromdate'],
                        'coords': coords,
                        'near': loc['name']
                    })
                    break
                    
        return relevant_events
    except gc.GDACSAPIError as e:
        logger.error(f"GDACS API error: {e}")
        return []

# Preprocess data
def preprocess_data(df, service_df):
    numeric_cols = ['age', 'education_years3', 'hhincome_ww_lcu', 'assets', 'mental_phq9', 'remittances_USD']
    categorical_cols = ['surveylocation', 'nationality_cat', 'gender', 'job', 'health']
    
    # Validate columns
    required_cols = numeric_cols + categorical_cols
    missing_cols = [col for col in required_cols if col not in service_df.columns]
    if missing_cols:
        raise ValueError(f"service_df missing columns: {missing_cols}")

    # Handle missing values
    num_imputer = SimpleImputer(strategy='mean')
    cat_imputer = SimpleImputer(strategy='most_frequent')
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline(steps=[('imputer', num_imputer), ('scaler', StandardScaler())]), numeric_cols),
            ('cat', Pipeline(steps=[('imputer', cat_imputer), ('encoder', OneHotEncoder(handle_unknown='ignore'))]), categorical_cols)
        ]
    )
    
    X = preprocessor.fit_transform(df)
    X_services = preprocessor.transform(service_df.drop(columns=['name', 'crisis_types'], errors='ignore'))
    return X, X_services, preprocessor

# Recommendation system with crisis awareness
def recommend_services(refugee_df, X, X_services, preprocessor, crises, top_n=3):
    refugee_X = preprocessor.transform(refugee_df)
    crisis_types = set(c['event_type'] for c in crises)
    
    # Adjust weights for crisis-relevant services
    weights = np.ones(X_services.shape[0])
    for i, svc in enumerate(services):
        if any(c in svc['crisis_types'] for c in crisis_types) or svc['crisis_types'] == ['none']:
            weights[i] += 2 if any(c in ['Red', 'Orange'] for c in [cr['alert_level'] for cr in crises]) else 1
    
    similarity_scores = cosine_similarity(refugee_X, X_services) * weights
    top_indices = np.argsort(similarity_scores[0])[::-1][:top_n]
    return [services[i]['name'] for i in top_indices]

# Flask app
app = Flask(__name__)

# Load data
df = simulate_refugee_data()
service_df = pd.DataFrame(services)
X, X_services, preprocessor = preprocess_data(df, service_df)

@app.route('/')
def index():
    crises = get_relevant_crises()
    crisis_alert = "No major crises detected near Nairobi or Melkadida."
    if crises:
        crisis_alert = "CRISIS ALERT: " + "; ".join(
            [f"{c['event_type']} ({c['alert_level']}) in {c['location']} (Severity: {c['severity']}) on {c['date']}"
             for c in crises]
        )
    
    return render_template_string('''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Refugee Crisis Support Chatbot</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h1 class="text-2xl font-bold mb-4 text-center">Refugee Crisis Support Chatbot</h1>
            <p class="text-red-600 mb-4">{{crisis_alert}}</p>
            <div id="chat" class="mb-4 h-64 overflow-y-auto border p-4 rounded"></div>
            <form id="chat-form" class="flex flex-col space-y-2">
                <input type="text" id="user-input" name="input" class="flex-1 p-2 border rounded-md" placeholder="Enter details (e.g., Nairobi, unemployed)">
                    <select name="location" class="p-2 border rounded-md">
                    <option value="Nairobi">Nairobi</option>
                    <option value="Melkadida">Melkadida</option>
                </select>
                <button type="submit" class="bg-blue-500 text-white p-2 rounded-md">Send</button>
            </form>
        </div>
        <script>
            document.getElementById('chat-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const input = document.getElementById('user-input').value;
                const location = document.querySelector('select[name="location"]').value;
                const chat = document.getElementById('chat');
                chat.innerHTML += `<p><strong>You:</strong> ${input} (${location})</p>`;
                const response = await fetch('/recommend', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({input, location})
                });
                const data = await response.json();
                chat.innerHTML += `<p><strong>Bot:</strong> ${data.message}</p>`;
                chat.scrollTopEnd = chat.scrollHeight;
                document.getElementById('user-input').value = '';
            });
        </script>
    </body>
    </html>
    ''', crisis_alert=crisis_alert)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    user_input = data.get('input', '')
    location = data.get('location', 'Nairobi')
    
    try:
        # Simplified parsing (use NLP for production)
        profile = {
            'surveylocation': location,
            'nationality_cat': 'Random',
            'age': 30,
            'gender': 'Male',
            'education_years3': 5,
            'job': 'no work',
            'hhincome_ww_lcu': 5000,
            'assets': 1,
            'health': 'Mild difficulty',
            'mental_phq9': 10,
            'remittances_USD': 50
        }
        profile_df = pd.DataFrame([profile])
        crises = get_relevant_crises()
        recommendations = recommend_services(profile_df, X, X_services, preprocessor, crises)
        message = f"Based on your profile and current crises, we recommend: {', '.join(recommendations)}."
        if crises:
            message += " Note: Active crises may impact service availability."
    except Exception as e:
        logger.error(f"Recommendation error: {e}")
        message = f"Error processing request: {str(e)}. Please provide more details."
    
    return jsonify({'message': message})

if __name__ == '__main__':
    app.run(debug=True)