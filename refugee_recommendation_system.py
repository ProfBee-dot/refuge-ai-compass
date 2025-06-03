import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from flask import Flask, request, jsonify, render_template_string
import random

# Simulating dataset based on data_3countries_refugees_public.csv
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

# Define services for recommendation, including all required columns
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

# Preprocess data
def preprocess_data(df, service_df):
    numeric_cols = ['age', 'education_years3', 'hhincome_ww_lcu', 'assets', 'mental_phq9', 'remittances_USD']
    categorical_cols = ['surveylocation', 'nationality_cat', 'gender', 'job', 'health']

    # Validate that service_df has all required columns
    required_cols = numeric_cols + categorical_cols
    missing_cols = [col for col in required_cols if col not in service_df.columns]
    if missing_cols:
        raise ValueError(f"service_df is missing required columns: {missing_cols}")

    # Handle missing values
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

# Recommendation system
def recommend_services(refugee_profile, X, X_services, preprocessor, top_n=3):
    similarity_scores = cosine_similarity(refugee_profile, X_services)
    top_indices = np.argsort(similarity_scores[0])[::-1][:top_n]
    return [services[i]['name'] for i in top_indices]

# Flask app
app = Flask(__name__)

# Simulate data
df = simulate_refugee_data()
service_df = pd.DataFrame(services)
X, X_services, preprocessor = preprocess_data(df, service_df)

# Home route with chatbot UI
@app.route('/')
def index():
    return render_template_string('''
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Refugee Support Chatbot</title>
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gray-100 flex items-center justify-center h-screen">
            <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                <h1 class="text-2xl font-bold mb-4 text-center">Refugee Support Chatbot</h1>
                <div id="chat" class="mb-4 h-64 overflow-y-auto border p-4 rounded"></div>
                <form id="chat-form" class="flex">
                    <input type="text" id="user-input" class="flex-1 p-2 border rounded-l-lg" placeholder="Enter your details or ask for help...">
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded-r-lg">Send</button>
                </form>
            </div>
            <script>
                document.getElementById('chat-form').addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const input = document.getElementById('user-input').value;
                    const chat = document.getElementById('chat');
                    chat.innerHTML += `<p><strong>You:</strong> ${input}</p>`;
                    const response = await fetch('/recommend', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({input})
                    });
                    const data = await response.json();
                    chat.innerHTML += `<p><strong>Bot:</strong> ${data.message}</p>`;
                    chat.scrollTop = chat.scrollHeight;
                    document.getElementById('user-input').value = '';
                });
            </script>
        </body>
        </html>
    ''')

# Recommendation route
@app.route('/recommend', methods=['POST'])
def recommend():
    user_input = request.json.get('input', '')
    
    # Parse user input (simplified for demo; in practice, use NLP to extract features)
    try:
        profile = {
            'surveylocation': 'Nairobi', 'nationality_cat': 'Congolese', 'age': 30, 'gender': 'Male',
            'education_years3': 8, 'job': 'no work', 'hhincome_ww_lcu': 5000, 'assets': 1,
            'health': 'Mild difficulty', 'mental_phq9': 10, 'remittances_USD': 50
        }
        profile_df = pd.DataFrame([profile])
        profile_X = preprocessor.transform(profile_df)
        recommendations = recommend_services(profile_X, X, X_services, preprocessor)
        message = f"Based on your profile, we recommend: {', '.join(recommendations)}."
    except Exception as e:
        message = f"Sorry, I couldn't process your request: {str(e)}. Please provide more details."
    
    return jsonify({'message': message})

if __name__ == '__main__':
    app.run(debug=True)