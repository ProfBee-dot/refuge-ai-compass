from flask import Flask, request, jsonify
import csv
from textblob import TextBlob

app = Flask(__name__)

# Simple sentiment analysis using TextBlob
def analyze_sentiment(text):
    analysis = TextBlob(text)
    if analysis.sentiment.polarity > 0:
        return 'Positive'
    elif analysis.sentiment.polarity == 0:
        return 'Neutral'
    else:
        return 'Negative'

# CSV file to store data
CSV_FILE = 'feedback.csv'

# Ensure CSV file exists with headers
def init_csv():
    with open(CSV_FILE, 'a', newline='') as file:
        writer = csv.writer(file)
        # Write headers if file is empty
        if file.tell() == 0:
            writer.writerow([
                'Name', 'Gender', 'Age', 'Feeding Feedback', 'Shelter Feedback',
                'Personnel Feedback', 'Environment Feedback', 'Medical Feedback',
                'Employment Status', 'Marital Status', 'Camp Location',
                'Feeding Sentiment', 'Shelter Sentiment', 'Personnel Sentiment',
                'Environment Sentiment', 'Medical Sentiment'
            ])

@app.route('/submit', methods=['POST'])
def submit_feedback():
    init_csv()
    data = {
        'name': request.form['name'],
        'gender': request.form['gender'],
        'age': request.form['age'],
        'feeding_feedback': request.form['feeding_feedback'],
        'shelter_feedback': request.form['shelter_feedback'],
        'personnel_feedback': request.form['personnel_feedback'],
        'environment_feedback': request.form['environment_feedback'],
        'medical_feedback': request.form['medical_feedback'],
        'employment_status': request.form['employment_status'],
        'marital_status': request.form['marital_status'],
        'camp_location': request.form['camp_location'],
        'feeding_sentiment': analyze_sentiment(request.form['feeding_feedback']),
        'shelter_sentiment': analyze_sentiment(request.form['shelter_feedback']),
        'personnel_sentiment': analyze_sentiment(request.form['personnel_feedback']),
        'environment_sentiment': analyze_sentiment(request.form['environment_feedback']),
        'medical_sentiment': analyze_sentiment(request.form['medical_feedback'])
    }
    
    with open(CSV_FILE, 'a', newline='') as file:
        writer = csv.writer(file)
        writer.writerow([
            data['name'], data['gender'], data['age'], data['feeding_feedback'],
            data['shelter_feedback'], data['personnel_feedback'], data['environment_feedback'],
            data['medical_feedback'], data['employment_status'], data['marital_status'],
            data['camp_location'], data['feeding_sentiment'], data['shelter_sentiment'],
            data['personnel_sentiment'], data['environment_sentiment'], data['medical_sentiment']
        ])

    return jsonify({'message': 'Feedback submitted successfully!'})

if __name__ == '__main__':
    app.run(debug=True)