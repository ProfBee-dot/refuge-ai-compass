import pandas as pd
import numpy as np
import uuid
from datetime import datetime, timedelta
from nltk.sentiment.vader import SentimentIntensityAnalyzer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import make_pipeline

# Download required NLTK data
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')

# Function to simulate feedback data based on codebook
def simulate_feedback_data(num_camps=10, num_feedbacks_per_camp=500, start_date='2025-01-01', days=180):
    # Define camps based on surveylocation and nationality_cat
    locations = ['Addis', 'Kakuma', 'Kampala', 'Melkadida', 'Nairobi', 'Nakivale']
    nationalities = ['Congolese', 'Eritrean', 'Somali', 'South Sudanese']
    camp_data = {
        'Camp ID': [str(uuid.uuid4())[:8] for _ in range(num_camps)],
        'Survey Location': np.random.choice(locations, num_camps, p=[0.12, 0.15, 0.10, 0.30, 0.14, 0.19]),  # Based on frequency
        'Country': ['Ethiopia' if loc == 'Addis' or loc == 'Melkadida' else 'Kenya' if loc in ['Kakuma', 'Kampala', 'Nairobi'] else 'Uganda' for loc in np.random.choice(locations, num_camps)],
        'Nationality': np.random.choice(nationalities, num_camps, p=[0.27, 0.08, 0.60, 0.05]),  # Based on nationality_cat
        'Urban': np.random.choice([0, 1], num_camps, p=[0.63, 0.37]),  # Based on urban
        'Total Population': np.random.randint(500, 5000, num_camps)
    }
    camps_df = pd.DataFrame(camp_data)
    
    # Simulate demographics based on codebook
    camps_df['Num Men'] = (camps_df['Total Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num Women'] = (camps_df['Total Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num Children'] = (camps_df['Total Population'] * np.random.uniform(0.2, 0.3, num_camps)).astype(int)
    camps_df['Num Elderly'] = camps_df['Total Population'] - (camps_df['Num Men'] + camps_df['Num Women'] + camps_df['Num Children'])
    
    # Define feedback categories and templates influenced by codebook variables
    categories = ['Nutrition', 'Healthcare', 'Sanitation', 'Shelter', 'Education', 'Safety']
    feedback_templates = {
        'Nutrition': [
            'We need more food supplies, especially for children.' if np.random.rand() < 0.69 else 'Food quality is poor.',  # 69% food insecure (hh_HFIAP_d)
            'Not enough fruits or meat for our diet.' if np.random.rand() < 0.62 else 'Food distribution is uneven.'  # 62% no fruits (variety3_fruit_d)
        ],
        'Healthcare': [
            'Medical supplies are insufficient.' if np.random.rand() < 0.37 else 'No doctors available.',  # 37% severe/extreme community difficulty (health_community)
            'Long waiting times for healthcare.'
        ],
        'Sanitation': [
            'Toilets are unclean and overcrowded.',
            'Need better water purification systems.'
        ],
        'Shelter': [
            'Tents are damaged and leaking.',
            'Not enough shelters for new arrivals.'
        ],
        'Education': [
            'Children need more access to schools.' if np.random.rand() < 0.96 else 'No vocational training.',  # 96% no vocational training (vocational)
            'Lack of educational materials.'
        ],
        'Safety': [
            'Camp feels unsafe at night.',
            'Need better lighting in common areas.'
        ]
    }
    
    # Simulate feedback data
    feedback_data = []
    dates = pd.date_range(start=start_date, periods=days, freq='D')
    
    for camp in camps_df.itertuples():
        for _ in range(num_feedbacks_per_camp):
            category = np.random.choice(categories)
            feedback_text = np.random.choice(feedback_templates[category])
            # Add variation based on demographics and conditions
            if getattr(camp, 'Num_Children') / camp.Total_Population > 0.25 and category == 'Nutrition':
                feedback_text += ' Children are hungry.'
            if camp.Urban == 1 and category == 'Shelter':
                feedback_text += ' Urban housing is too expensive.'
            if camp.Nationality == 'Somali' and category == 'Education':
                feedback_text += ' Language barriers limit access.'
            feedback_text += ' ' + np.random.choice(['Urgent!', 'Please help.', 'This is critical.', ''], p=[0.2, 0.3, 0.2, 0.3])
            date = np.random.choice(dates)
            
            # Simulate demographic details
            age = np.random.randint(18, 82)  # Based on age range
            gender = np.random.choice(['Male', 'Female'], p=[0.47, 0.53])  # Based on gender
            relationship = np.random.choice(['Head', 'Spouse', 'Child', 'Other'], p=[0.39, 0.20, 0.18, 0.23])  # Based on relationship3
            food_insecure = np.random.choice([0, 1], p=[0.31, 0.69])  # Based on hh_HFIAP_d
            
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
    
    # Apply sentiment analysis using VADER
    sid = SentimentIntensityAnalyzer()
    feedback_df['Sentiment Score'] = feedback_df['Feedback Text'].apply(lambda x: sid.polarity_scores(x)['compound'])
    feedback_df['Sentiment'] = feedback_df['Sentiment Score'].apply(
        lambda x: 'Negative' if x < -0.1 else 'Positive' if x > 0.1 else 'Neutral'
    )
    
    # Assign priority based on sentiment, food insecurity, and keywords
    feedback_df['Priority'] = feedback_df.apply(
        lambda row: 'High' if 'urgent' in row['Feedback Text'].lower() or row['Sentiment Score'] < -0.5 or row['Food Insecure'] == 1 else 'Medium',
        axis=1
    )
    
    return feedback_df

# Function to train category classifier
def train_category_classifier(feedback_df):
    stop_words = set(stopwords.words('english'))
    X = feedback_df['Feedback Text']
    y = feedback_df['Category']
    model = make_pipeline(TfidfVectorizer(stop_words=stop_words), MultinomialNB())
    model.fit(X, y)
    return model

# Function to route feedback to NGOs
def route_feedback_to_ngos(feedback_df, ngo_data):
    # Placeholder NGO data based on surveylocation countries
    ngo_data = pd.DataFrame({
        'NGO Name': ['Action Against Hunger', 'CARE International', 'UNHCR', 'Amel Association'],
        'Country': ['Kenya', 'Uganda', 'Ethiopia', 'Ethiopia'],
        'Area of Focus': ['Food Security', 'Humanitarian Aid', 'Refugee Protection', 'Health']
    })
    
    routing_results = []
    for _, row in feedback_df[feedback_df['Sentiment'] == 'Negative'].iterrows():
        category_keywords = {
            'Nutrition': ['Food Security', 'Nutrition', 'Humanitarian Aid'],
            'Healthcare': ['Health', 'Medical', 'Humanitarian Aid'],
            'Sanitation': ['Water Sanitation', 'Humanitarian Aid'],
            'Shelter': ['Shelter', 'Housing', 'Humanitarian Aid'],
            'Education': ['Education', 'Youth Development', 'Humanitarian Aid'],
            'Safety': ['Protection', 'Safety', 'Humanitarian Aid']
        }
        
        relevant_ngos = ngo_data[
            (ngo_data['Country'] == row['Country']) &
            (ngo_data['Area of Focus'].apply(lambda x: any(keyword in x for keyword in category_keywords[row['Category']]))
        )]['NGO Name'].tolist()
        
        routing_results.append({
            'Feedback ID': row['Feedback ID'],
            'Camp ID': row['Camp ID'],
            'Survey Location': row['Survey Location'],
            'Category': row['Category'],
            'Feedback Text': row['Feedback Text'],
            'Sentiment': row['Sentiment'],
            'Priority': row['Priority'],
            'NGOs Notified': relevant_ngos
        })
    
    return pd.DataFrame(routing_results)

# Simulate feedback data
np.random.seed(42)
feedback_df = simulate_feedback_data()

# Train category classifier
category_model = train_category_classifier(feedback_df)

# Route negative feedback to NGOs
routing_df = route_feedback_to_ngos(feedback_df, None)

# Save results
feedback_df.to_csv('simulated_feedback_data_enhanced.csv', index=False)
routing_df.to_csv('feedback_routing_results_enhanced.csv', index=False)

# Example output
print("Sample Feedback Data:")
print(feedback_df[['Feedback ID', 'Camp ID', 'Survey Location', 'Nationality', 'Feedback Text', 'Category', 'Sentiment', 'Priority']].head())
print("\nSample Routing Results:")
print(routing_df[['Feedback ID', 'Camp ID', 'Survey Location', 'Category', 'NGOs Notified']].head())