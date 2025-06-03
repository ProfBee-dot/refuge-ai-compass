import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from flask import Flask, request, jsonify, render_template_string
import random
import json
import logging
import os
from datetime import datetime, timedelta
from math import radians, sin, cos, sqrt, atan2
from smtplib import SMTP_SSL
from email.mime.text import MIMEText
from gdacs.api import GDACSAPIReader, GDACSAPIError
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
from prophet import Prophet
import uuid

# Download NLTK data
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')

# Set up logging
logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(name)s - %(message)s')
logger = logging.getLogger(__name__)

# App initialization
app = Flask(__name__)

# Refugee camp coordinates
CAMP_LOCATIONS = {
    'Nairobi': {'lat': -1.2921, 'lon': 36.8219},
    'Melkadida': {'lat': 4.5417, 'lon': 41.9667}
}

# Organization email list and SMTP configuration
ORG_EMAILS = ['org1@example.com', 'org2@example.com']
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465
SMTP_USER = 'your_email@gmail.com'
SMTP_PASSWORD = 'your_app_password'
EVENTS_FILE = 'processed_events.json'

# NGO data for routing
NGO_DATA = pd.DataFrame({
    'NGO Name': ['Action Against Hunger', 'CARE International', 'UNHCR', 'Amel Association'],
    'Country': ['Kenya', 'Ethiopia', 'Kenya', 'Ethiopia'],
    'Area of Focus': ['Food Security', 'Humanitarian Aid', 'Refugee Protection', 'Health']
})

# Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# GDACS Notifications
def load_processed_events():
    if os.path.exists(EVENTS_FILE):
        try:
            with open(EVENTS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading processed events: {e}")
    return {}

def save_processed_events(events):
    try:
        with open(EVENTS_FILE, 'w') as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving processed events: {e}")

def send_notification(event, subject_prefix="GDACS Disaster Alert"):
    subject = f"{subject_prefix}: {event['eventtype']} ({event['alertlevel']}) near {event['camp']}"
    body = (
        f"New or worsening disaster detected:\n"
        f"Event Type: {event['eventtype']}\n"
        f"Alert Level: {event['alertlevel']}\n"
        f"Severity: {event['severity']}\n"
        f"Location: {event['country']}, {event['distance_km']:.1f} km from {event['camp']}\n"
        f"Coordinates: ({event['lat']}, {event['lon']})\n"
        f"Date: {event['fromdate']}\n"
        f"Event ID: {event['eventid']}\n"
        f"Please coordinate response via GDACS Virtual OSOCC: https://vosocc.unocha.org/"
    )
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = SMTP_USER
    msg['To'] = ', '.join(ORG_EMAILS)
    try:
        with SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, ORG_EMAILS, msg.as_string())
        logger.info(f"Notification sent for event {event['eventid']}")
    except Exception as e:
        logger.error(f"Failed to send notification for event {event['eventid']}: {e}")

def fetch_gdacs_events(limit=10, max_distance_km=500, debug_mock=False):
    if debug_mock:
        logger.info("Using mock GDACS event for testing")
        return [{
            'eventtype': 'EQ',
            'eventid': '123456',
            'alertlevel': 'Orange',
            'alertscore': 1.5,
            'severity': 6.0,
            'country': 'Kenya',
            'fromdate': '2025-06-01T09:00:00',
            'distance_km': 200,
            'camp': 'Nairobi',
            'lat': -1.5,
            'lon': 36.8
        }]
    try:
        client = GDACSAPIReader()
        events = client.latest_events(limit=limit)
        relevant_events = []
        processed_events = load_processed_events()
        features = events.features
        if not features:
            logger.info("No GDACS events found in response")
            return []
        for feature in features:
            props = feature.get('properties', {})
            coords = feature.get('geometry', {}).get('coordinates', [None, None])
            lon, lat = coords if coords else (None, None)
            if lat is None or lon is None:
                logger.warning(f"Skipping event {props.get('eventid', 'unknown')} due to missing coordinates")
                continue
            alert_level = props.get('alertlevel', 'Green')
            event_id = str(props.get('eventid', 'unknown'))
            alert_score = float(props.get('alertscore', 0))
            logger.debug(f"Event {event_id}: Alert={alert_level}, Score={alert_score}, Location=({lat}, {lon})")
            is_new = event_id not in processed_events
            is_worsening = False
            if not is_new:
                prev_score = processed_events.get(event_id, {}).get('alertscore', 0)
                prev_alert = processed_events.get(event_id, {}).get('alertlevel', 'Green')
                is_worsening = alert_score >= prev_score + 0.5 or (
                    alert_level in ['Orange', 'Red'] and prev_alert == 'Green'
                )
            if alert_level not in ['Orange', 'Red']:
                logger.debug(f"Event {event_id} filtered: Alert level is {alert_level}")
                continue
            for camp, loc in CAMP_LOCATIONS.items():
                distance = haversine(lat, lon, loc['lat'], loc['lon'])
                if distance <= max_distance_km:
                    if not (is_new or is_worsening):
                        logger.debug(f"Event {event_id} filtered: Not new or worsening")
                        continue
                    event = {
                        'eventtype': props.get('eventtype', 'Unknown'),
                        'eventid': event_id,
                        'alertlevel': alert_level,
                        'alertscore': alert_score,
                        'severity': props.get('severitydata', {}).get('severity', 0),
                        'country': props.get('country', ''),
                        'fromdate': props.get('fromdate', ''),
                        'distance_km': distance,
                        'camp': camp,
                        'lat': lat,
                        'lon': lon
                    }
                    relevant_events.append(event)
                    processed_events[event_id] = {
                        'alertscore': alert_score,
                        'alertlevel': alert_level,
                        'last_notified': datetime.utcnow().isoformat()
                    }
                    logger.info(f"Event {event_id} added for notification: {alert_level} near {camp}")
        save_processed_events(processed_events)
        return relevant_events
    except GDACSAPIError as e:
        logger.error(f"GDACS API error: {e}")
        return []
    except Exception as e:
        logger.error(f"Error fetching GDACS events: {e}")
        return []

# Refugee Recommendations
def simulate_refugee_data(n_samples=100):
    data = {
        'hhid_new': [f'ID_{i}' for i in range(n_samples)],
        'surveylocation': random.choices(['Nairobi', 'Melkadida'], weights=[0.5, 0.5], k=n_samples),
        'nationality_cat': random.choices(['Congolese', 'Somali'], weights=[0.5, 0.5], k=n_samples),
        'age': np.random.randint(18, 70, n_samples),
        'gender': random.choices(['Male', 'Female'], weights=[0.5, 0.5], k=n_samples),
        'education_years3': np.random.randint(0, 17, n_samples),
        'job': random.choices(['no work', 'Restaurant', 'Beauty/Hair salon', 'Selling clothing', 'Hawking', 'Security'], k=n_samples),
        'hhincome_ww_lcu': np.random.randint(0, 100000, n_samples),
        'assets': np.random.randint(0, 5, n_samples),
        'health': random.choices(['No Difficulty', 'Mild difficulty', 'Moderate difficulty', 'Severe difficulty'], k=n_samples),
        'mental_phq9': np.random.randint(0, 27, n_samples),
        'remittances_USD': np.random.randint(0, 500, n_samples)
    }
    return pd.DataFrame(data)

services = [
    {
        'name': 'Job Training', 'education_years3': 5, 'job': 'no work', 'hhincome_ww_lcu': 10000, 'assets': 1,
        'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'gender': 'Male', 'health': 'No Difficulty',
        'mental_phq9': 5, 'remittances_USD': 100, 'age': 30
    },
    {
        'name': 'Health Support', 'health': 'Severe difficulty', 'mental_phq9': 15, 'age': 50,
        'surveylocation': 'Melkadida', 'nationality_cat': 'Somali', 'gender': 'Female', 'education_years3': 0,
        'job': 'no work', 'hhincome_ww_lcu': 5000, 'assets': 0, 'remittances_USD': 0
    },
    {
        'name': 'Microfinance', 'hhincome_ww_lcu': 5000, 'assets': 0, 'remittances_USD': 0,
        'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'gender': 'Female', 'education_years3': 3,
        'job': 'Hawking', 'health': 'Mild difficulty', 'mental_phq9': 8, 'age': 35
    },
    {
        'name': 'Education Program', 'education_years3': 2, 'age': 25, 'job': 'no work',
        'surveylocation': 'Melkadida', 'nationality_cat': 'Somali', 'gender': 'Male', 'hhincome_ww_lcu': 2000,
        'assets': 1, 'health': 'No Difficulty', 'mental_phq9': 3, 'remittances_USD': 50
    }
]

def preprocess_data(df, service_df):
    numeric_cols = ['age', 'education_years3', 'hhincome_ww_lcu', 'assets', 'mental_phq9', 'remittances_USD']
    categorical_cols = ['surveylocation', 'nationality_cat', 'gender', 'job', 'health']
    required_cols = numeric_cols + categorical_cols
    missing_cols = [col for col in required_cols if col not in service_df.columns]
    if missing_cols:
        raise ValueError(f"service_df is missing required columns: {missing_cols}")
    num_imputer = SimpleImputer(strategy='mean')
    cat_imputer = SimpleImputer(strategy='most_frequent')
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', Pipeline([('imputer', num_imputer), ('scaler', StandardScaler())]), numeric_cols),
            ('cat', Pipeline([('imputer', cat_imputer), ('encoder', OneHotEncoder(handle_unknown='ignore'))]), categorical_cols)
        ]
    )
    X = preprocessor.fit_transform(df)
    X_services = preprocessor.transform(service_df.drop(columns=['name'], errors='ignore'))
    return X, X_services, preprocessor

def recommend_services(refugee_profile, X, X_services, preprocessor, top_n=3):
    similarity_scores = cosine_similarity(refugee_profile, X_services)
    top_indices = np.argsort(similarity_scores[0])[::-1][:top_n]
    return [services[i]['name'] for i in top_indices]

# Sentiment Analysis
def simulate_feedback_data(num_camps=2, num_feedbacks_per_camp=100):
    locations = ['Nairobi', 'Melkadida']
    nationalities = ['Congolese', 'Somali']
    camp_data = {
        'Camp ID': [str(uuid.uuid4())[:8] for _ in range(num_camps)],
        'Survey Location': locations,
        'Country': ['Kenya' if loc == 'Nairobi' else 'Ethiopia' for loc in locations],
        'Nationality': np.random.choice(nationalities, num_camps),
        'Urban': np.random.choice([0, 1], num_camps, p=[0.63, 0.37]),
        'Total Population': np.random.randint(500, 5000, num_camps)
    }
    camps_df = pd.DataFrame(camp_data)
    camps_df['Num Men'] = (camps_df['Total Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num Women'] = (camps_df['Total Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num Children'] = (camps_df['Total Population'] * np.random.uniform(0.2, 0.3, num_camps)).astype(int)
    camps_df['Num Elderly'] = camps_df['Total Population'] - (camps_df['Num Men'] + camps_df['Num Women'] + camps_df['Num Children'])
    categories = ['Nutrition', 'Healthcare', 'Sanitation', 'Shelter', 'Education', 'Safety']
    feedback_templates = {
        'Nutrition': ['We need more food supplies.', 'Food quality is poor.'],
        'Healthcare': ['Medical supplies are insufficient.', 'No doctors available.'],
        'Sanitation': ['Toilets are unclean.', 'Need better water systems.'],
        'Shelter': ['Tents are damaged.', 'Not enough shelters.'],
        'Education': ['Children need schools.', 'No vocational training.'],
        'Safety': ['Camp feels unsafe.', 'Need better lighting.']
    }
    feedback_data = []
    dates = pd.date_range(start='2025-01-01', periods=180, freq='D')
    for camp in camps_df.itertuples():
        for _ in range(num_feedbacks_per_camp):
            category = np.random.choice(categories)
            feedback_text = np.random.choice(feedback_templates[category])
            if getattr(camp, 'Num_Children') / camp.Total_Population > 0.25 and category == 'Nutrition':
                feedback_text += ' Children are hungry.'
            date = np.random.choice(dates)
            age = np.random.randint(18, 82)
            gender = np.random.choice(['Male', 'Female'], p=[0.47, 0.53])
            relationship = np.random.choice(['Head', 'Spouse', 'Child', 'Other'], p=[0.39, 0.20, 0.18, 0.23])
            food_insecure = np.random.choice([0, 1], p=[0.31, 0.69])
            feedback_data.append({
                'Feedback ID': str(uuid.uuid4())[:8],
                'Camp ID': camp.Camp_ID,
                'Survey Location': camp.Survey_Location,
                'Country': camp.Country,
                'Nationality': camp.Nationality,
                'Urban': camp.Urban,
                'Timestamp': date,
                'Feedback Text': feedback_text,
                'Category': category,
                'Age': age,
                'Gender': gender,
                'Relationship': relationship,
                'Food Insecure': food_insecure,
                'Num Men': getattr(camp, 'Num_Men'),
                'Num Women': getattr(camp, 'Num_Women'),
                'Num Children': getattr(camp, 'Num_Children'),
                'Num Elderly': getattr(camp, 'Num_Elderly'),
                'Total Population': camp.Total_Population
            })
    feedback_df = pd.DataFrame(feedback_data)
    sid = SentimentIntensityAnalyzer()
    feedback_df['Sentiment Score'] = feedback_df['Feedback Text'].apply(lambda x: sid.polarity_scores(x)['compound'])
    feedback_df['Sentiment'] = feedback_df['Sentiment Score'].apply(
        lambda x: 'Negative' if x < -0.1 else 'Positive' if x > 0.1 else 'Neutral'
    )
    feedback_df['Priority'] = feedback_df.apply(
        lambda row: 'High' if 'urgent' in row['Feedback Text'].lower() or row['Sentiment Score'] < -0.5 or row['Food Insecure'] == 1 else 'Medium',
        axis=1
    )
    return feedback_df

def train_category_classifier(feedback_df):
    stop_words = set(stopwords.words('english'))
    X = feedback_df['Feedback Text']
    y = feedback_df['Category']
    model = make_pipeline(TfidfVectorizer(stop_words=stop_words), MultinomialNB())
    model.fit(X, y)
    return model

def route_feedback_to_ngos(feedback_df, ngo_data):
    routing_results = []
    category_keywords = {
        'Nutrition': ['Food Security', 'Nutrition', 'Humanitarian Aid'],
        'Healthcare': ['Health', 'Medical', 'Humanitarian Aid'],
        'Sanitation': ['Water Sanitation', 'Humanitarian Aid'],
        'Shelter': ['Shelter', 'Housing', 'Humanitarian Aid'],
        'Education': ['Education', 'Youth Development'],
        'Safety': ['Return Assistance', 'Protection', 'Civil Society']
    }
    for _, row in feedback_df[feedback_df['Sentiment'] == 'Negative'].iterrows():
        relevant_ngos = ngo_data[
            (ngo_data['Country'] == row['Country']) & 
            (ngo_data['Area of Focus'].apply(lambda x: any(keyword in x for keyword in category_keywords[row['Category']])))
        ]['NGO Name'].tolist()
        routing_results.append({
            'Feedback ID': row['Feedback ID'],
            'Camp ID': row['Camp ID'],
            'Survey Location': row['Country'],
            'category': row['Category'],
            'Feedback Text': row['Feedback Text'],
            'Sentiment': row['Sentiment'],
            'Priority': row['Priority'],
            'NGOs Notified': relevant_ngos
        })
    return pd.DataFrame(routing_results)

# Resource Allocation
def simulate_camp_data(num_camps=2):
    camp_data = {
        'Camp_ID': [str(uuid.uuid4())[:8] for _ in range(num_camps)],
        'Country': ['Kenya', 'Ethiopia'],
        'Latitude': [-1.2921, 4.5417],
        'Longitude': [36.8219, 41.9667],
        'Total_Population': np.random.randint(500, 5000, num_camps),
    }
    camps_df = pd.DataFrame(camp_data)
    camps_df['Num_Men'] = (camps_df['Total_Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num_Women'] = (camps_df['Total_Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num_Children'] = (camps_df['Total_Population'] * np.random.uniform(0.2, 0.3, num_camps)).astype(int)
    camps_df['Num_Elderly'] = camps_df['Total_Population'] - (camps_df['Num_Men'] + camps_df['Num_Women'] + camps_df['Num_Children'])
    resource_types = ['Food (kg)', 'Water (L)', 'Medicine (units)', 'Shelter (units)']
    consumption_rates = {
        'Food (kg)': {'Men': 2.0, 'Women': 1.8, 'Children': 1.0, 'Elderly': 1.5},
        'Water (L)': {'Men': 15.0, 'Women': 12.0, 'Children': 8.0, 'Elderly': 10.0},
        'Medicine (units)': {'Men': 0.1, 'Women': 0.15, 'Children': 0.2, 'Elderly': 0.3},
        'Shelter (units)': {'Men': 0.01, 'Women': 0.01, 'Children': 0.005, 'Elderly': 0.01}
    }
    initial_quantities = {
        'Food (kg)': 10000,
        'Water (L)': 50000,
        'Medicine (units)': 2000,
        'Shelter (units)': 100
    }
    restock_frequencies = {
        'Food (kg)': 30,
        'Water (L)': 7,
        'Medicine (units)': 14,
        'Shelter (units)': 60
    }
    dates = pd.date_range(start='2025-01-01', periods=180, freq='D')
    resource_data = []
    for camp in camps_df.itertuples():
        for resource in resource_types:
            daily_consumption = (
                getattr(camp, 'Num_Men') * consumption_rates[resource]['Men'] +
                getattr(camp, 'Num_Women') * consumption_rates[resource]['Women'] +
                getattr(camp, 'Num_Children') * consumption_rates[resource]['Children'] +
                getattr(camp, 'Num_Elderly') * consumption_rates[resource]['Elderly']
            )
            daily_consumption *= np.random.uniform(0.9, 1.1, len(dates))
            stock = initial_quantities[resource]
            restock_freq = restock_frequencies[resource]
            for i, date in enumerate(dates):
                stock = max(0, stock - daily_consumption[i])
                if i % restock_freq == 0 and i > 0:
                    stock += initial_quantities[resource] * np.random.uniform(0.8, 1.2)
                resource_data.append({
                    'Camp_ID': camp.Camp_ID,
                    'Country': camp.Country,
                    'Resource_Type': resource,
                    'Date': date,
                    'Quantity': stock,
                    'Consumption_Rate': daily_consumption[i],
                    'Total_Population': camp.Total_Population,
                    'Num_Men': camp.Num_Men,
                    'Num_Women': camp.Num_Women,
                    'Num_Children': camp.Num_Children,
                    'Num_Elderly': camp.Num_Elderly
                })
    return pd.DataFrame(resource_data)

def train_prophet_model(data, camp_id, resource_type):
    df = data[(data['Camp_ID'] == camp_id) & (data['Resource_Type'] == resource_type)][['Date', 'Quantity']].rename(columns={'Date': 'ds', 'Quantity': 'y'})
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.05,
        seasonality_prior_scale=10.0
    )
    df_regressors = data[(data['Camp_ID'] == camp_id) & (data['Resource_Type'] == resource_type)][
        ['Date', 'Num_Men', 'Num_Women', 'Num_Children', 'Num_Elderly']
    ].rename(columns={'Date': 'ds'})
    df = df.merge(df_regressors, on='ds')
    for regressor in ['Num_Men', 'Num_Women', 'Num_Children', 'Num_Elderly']:
        model.add_regressor(regressor)
    model.fit(df)
    future = model.make_future_dataframe(periods=60)
    future = future.merge(df_regressors, on='ds', how='left').fillna(method='ffill')
    forecast = model.predict(future)
    threshold = {
        'Food (kg)': 500,
        'Water (L)': 2500,
        'Medicine (units)': 100,
        'Shelter (units)': 5
    }[resource_type]
    depletion_date = forecast[forecast['yhat'] < threshold]['ds'].min()
    return model, forecast, depletion_date

# Initialize data and models
np.random.seed(42)
refugee_df = simulate_refugee_data()
service_df = pd.DataFrame(services)
X, X_services, preprocessor = preprocess_data(refugee_df, service_df)
feedback_df = simulate_feedback_data()
category_model = train_category_classifier(feedback_df)
resource_data = simulate_camp_data()
prophet_models = {}
for camp_id in resource_data['Camp_ID'].unique():
    prophet_models[camp_id] = {}
    for resource_type in resource_data['Resource_Type'].unique():
        model, forecast, depletion_date = train_prophet_model(resource_data, camp_id, resource_type)
        prophet_models[camp_id][resource_type] = {'model': model, 'forecast': forecast, 'depletion_date': depletion_date}

# Flask Routes
@app.route('/')
def index():
    events = fetch_gdacs_events(debug_mock=True)
    alerts = [f"{e['eventtype']} ({e['alertlevel']}) near {e['camp']} at {e['fromdate']}" for e in events]
    return render_template_string('''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Refugee Support Dashboard</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 p-6">
            <div class="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
                <h1 class="text-3xl font-bold mb-6 text-center">Refugee Support Dashboard</h1>
                
                <h2 class="text-xl font-semibold mb-4">Disaster Alerts</h2>
                <p class="mb-4"><strong>Current Alerts:</strong> {{ alerts | join("; ") }}</p>
                <form action="/notify" method="POST" class="mb-6">
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Trigger GDACS Notifications</button>
                </form>
                
                <h2 class="text-xl font-semibold mb-4">Service Recommendations</h2>
                <form id="recommend-form" class="mb-6">
                    <input type="text" id="recommend-input" class="p-2 border rounded w-full mb-2" placeholder="Enter refugee profile (e.g., Nairobi, Male, 30)">
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Get Recommendations</button>
                </form>
                <div id="recommend-output" class="mb-6"></div>
                
                <h2 class="text-xl font-semibold mb-4">Feedback Analysis</h2>
                <form id="feedback-form" class="mb-6">
                    <input type="text" id="feedback-input" class="p-2 border rounded w-full mb-2" placeholder="Enter feedback text">
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Analyze Feedback</button>
                </form>
                <div id="feedback-output" class="mb-6"></div>
                
                <h2 class="text-xl font-semibold mb-4">Resource Forecasts</h2>
                <form action="/resources" method="POST" class="mb-6">
                    <select name="camp_id" class="p-2 border rounded mb-2">
                        {% for camp_id in camp_ids %}
                        <option value="{{ camp_id }}">{{ camp_id }}</option>
                        {% endfor %}
                    </select>
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">Check Resource Depletion</button>
                </form>
            </div>
            <script>
                document.getElementById('recommend-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const input = document.getElementById('recommend-input').value;
                    const response = await fetch('/recommend', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({input})
                    });
                    const data = await response.json();
                    document.getElementById('recommend-output').innerHTML = `<p><strong>Result:</strong> ${data.message}</p>`;
                });
                document.getElementById('feedback-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const input = document.getElementById('feedback-input').value;
                    const response = await fetch('/feedback', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({input})
                    });
                    const data = await response.json();
                    document.getElementById('feedback-output').innerHTML = `<p><strong>Result:</strong> ${data.message}</p>`;
                });
            </script>
        </body>
        </html>
    ''', alerts=alerts, camp_ids=resource_data['Camp_ID'].unique())

@app.route('/notify', methods=['POST'])
def notify():
    events = fetch_gdacs_events(debug_mock=True)
    for event in events:
        send_notification(event)
    return jsonify({'message': f"Sent {len(events)} GDACS notifications."})

@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json.get('input', '')
    try:
        profile = {
            'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'age': 30, 'gender': 'Male',
            'education_years3': 8, 'job': 'no work', 'hhincome_ww_lcu': 5000, 'assets': 1,
            'health': 'Mild difficulty', 'mental_phq9': 10, 'remittances_USD': 50
        }
        profile_df = pd.DataFrame([profile])
        profile_X = preprocessor.transform(profile_df)
        recommendations = recommend_services(profile_X, X, X_services, preprocessor)
        message = f"Recommended services: {', '.join(recommendations)}."
    except Exception as e:
        message = f"Error: {str(e)}"
    return jsonify({'message': message})

@app.route('/feedback', methods=['POST'])
def feedback():
    user_input = request.json.get('input', '')
    try:
        sid = SentimentIntensityAnalyzer()
        sentiment_score = sid.polarity_scores(user_input)['compound']
        sentiment = 'Negative' if sentiment_score < -0.1 else 'Positive' if sentiment_score > 0.1 else 'Neutral'
        category = category_model.predict([user_input])[0]
        if sentiment == 'Negative':
            routing = route_feedback_to_ngos(pd.DataFrame([{
                'Feedback ID': str(uuid.uuid4())[:8],
                'Camp ID': 'unknown',
                'Survey Location': 'Kenya',
                'Country': 'Kenya',
                'Feedback Text': user_input,
                'Category': category,
                'Sentiment': sentiment,
                'Priority': 'High' if sentiment_score < -0.5 else 'Medium'
            }]), NGO_DATA)
            ngos = routing['NGOs Notified'].iloc[0]
            message = f"Feedback: {user_input}<br>Sentiment: {sentiment}<br>Category: {category}<br>Notified NGOs: {', '.join(ngos)}"
        else:
            message = f"Feedback: {user_input}<br>Sentiment: {sentiment}<br>Category: {category}"
    except Exception as e:
        message = f"Error: {str(e)}"
    return jsonify({'message': message})

@app.route('/resources', methods=['POST'])
def resources():
    camp_id = request.form.get('camp_id')
    results = []
    for resource_type in prophet_models[camp_id]:
        depletion_date = prophet_models[camp_id][resource_type]['depletion_date']
        if depletion_date and depletion_date < pd.Timestamp('2025-07-01') + timedelta(days=7):
            relevant_ngos = NGO_DATA[
                (NGO_DATA['Country'] == resource_data[resource_data['Camp_ID'] == camp_id]['Country'].iloc[0]) &
                (NGO_DATA['Area of Focus'].str.contains('Food Security|Humanitarian Aid|Health'))
            ]['NGO Name'].tolist()
            event = {
                'eventtype': 'Resource Depletion',
                'eventid': f"{camp_id}_{resource_type}",
                'alertlevel': 'Red',
                'severity': 'Critical',
                'country': resource_data[resource_data['Camp_ID'] == camp_id]['Country'].iloc[0],
                'fromdate': depletion_date.isoformat(),
                'distance_km': 0,
                'camp': resource_data[resource_data['Camp_ID'] == camp_id]['Country'].iloc[0],
                'lat': CAMP_LOCATIONS[resource_data[resource_data['Camp_ID'] == camp_id]['Country'].iloc[0]]['lat'],
                'lon': CAMP_LOCATIONS[resource_data[resource_data['Camp_ID'] == camp_id]['Country'].iloc[0]]['lon']
            }
            send_notification(event, subject_prefix="Resource Depletion Alert")
            results.append(f"{resource_type} depletion predicted on {depletion_date} for Camp {camp_id}. Notified NGOs: {', '.join(relevant_ngos)}")
    return jsonify({'message': '<br>'.join(results) or 'No imminent depletions detected.'})

if __name__ == '__main__':
    app.run(debug=True)