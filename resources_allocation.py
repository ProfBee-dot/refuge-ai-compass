import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import uuid
from prophet import Prophet

# Function to simulate camp resource and demographic data
def simulate_camp_data(num_camps=10, days=180, start_date='2025-01-01'):
    # Define camps with realistic attributes based on provided datasets
    camp_data = {
        'Camp_ID': [str(uuid.uuid4())[:8] for _ in range(num_camps)],
        'Country': np.random.choice(['Yemen', 'Uganda', 'Bangladesh', 'Kenya', 'Lebanon'], num_camps),
        'Latitude': np.random.uniform(0, 45, num_camps),  # Simplified for simulation
        'Longitude': np.random.uniform(30, 100, num_camps),
        'Total_Population': np.random.randint(500, 5000, num_camps),
    }
    
    # Calculate demographic distributions (men, women, children, elderly)
    camps_df = pd.DataFrame(camp_data)
    camps_df['Num_Men'] = (camps_df['Total_Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num_Women'] = (camps_df['Total_Population'] * np.random.uniform(0.3, 0.4, num_camps)).astype(int)
    camps_df['Num_Children'] = (camps_df['Total_Population'] * np.random.uniform(0.2, 0.3, num_camps)).astype(int)
    camps_df['Num_Elderly'] = camps_df['Total_Population'] - (camps_df['Num_Men'] + camps_df['Num_Women'] + camps_df['Num_Children'])
    
    # Initialize resource data
    resource_types = ['Food (kg)', 'Water (L)', 'Medicine (units)', 'Shelter (units)']
    consumption_rates = {
        'Food (kg)': {'Men': 2.0, 'Women': 1.8, 'Children': 1.0, 'Elderly': 1.5},  # kg/day per person
        'Water (L)': {'Men': 15.0, 'Women': 12.0, 'Children': 8.0, 'Elderly': 10.0},  # L/day per person
        'Medicine (units)': {'Men': 0.1, 'Women': 0.15, 'Children': 0.2, 'Elderly': 0.3},  # units/day per person
        'Shelter (units)': {'Men': 0.01, 'Women': 0.01, 'Children': 0.005, 'Elderly': 0.01}  # units/day per person
    }
    initial_quantities = {
        'Food (kg)': 10000,  # Starting stock
        'Water (L)': 50000,
        'Medicine (units)': 2000,
        'Shelter (units)': 100
    }
    restock_frequencies = {
        'Food (kg)': 30,  # Days between restocks
        'Water (L)': 7,
        'Medicine (units)': 14,
        'Shelter (units)': 60
    }
    
    # Simulate daily resource data
    dates = pd.date_range(start=start_date, periods=days, freq='D')
    resource_data = []
    
    for camp in camps_df.itertuples():
        for resource in resource_types:
            # Calculate daily consumption based on demographics
            daily_consumption = (
                getattr(camp, 'Num_Men') * consumption_rates[resource]['Men'] +
                getattr(camp, 'Num_Women') * consumption_rates[resource]['Women'] +
                getattr(camp, 'Num_Children') * consumption_rates[resource]['Children'] +
                getattr(camp, 'Num_Elderly') * consumption_rates[resource]['Elderly']
            )
            # Add random variation (±10%)
            daily_consumption *= np.random.uniform(0.9, 1.1, days)
            
            # Initialize stock
            stock = initial_quantities[resource]
            restock_freq = restock_frequencies[resource]
            
            for i, date in enumerate(dates):
                # Apply consumption
                stock = max(0, stock - daily_consumption[i])
                
                # Simulate restocking
                if i % restock_freq == 0 and i > 0:
                    stock += initial_quantities[resource] * np.random.uniform(0.8, 1.2)  # ±20% variation
                
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

# Simulate data
np.random.seed(42)  # For reproducibility
data = simulate_camp_data()

# Training Prophet model for each camp and resource
def train_prophet_model(data, camp_id, resource_type):
    # Filter data for specific camp and resource
    df = data[(data['Camp_ID'] == camp_id) & (data['Resource_Type'] == resource_type)][['Date', 'Quantity']].rename(columns={'Date': 'ds', 'Quantity': 'y'})
    
    # Initialize and train model
    model = Prophet(
        daily_seasonality=True,
        weekly_seasonality=True,
        yearly_seasonality=False,
        changepoint_prior_scale=0.05,  # Adjust for flexibility
        seasonality_prior_scale=10.0
    )
    
    # Add demographic regressors
    df_regressors = data[(data['Camp_ID'] == camp_id) & (data['Resource_Type'] == resource_type)][
        ['Date', 'Num_Men', 'Num_Women', 'Num_Children', 'Num_Elderly']
    ].rename(columns={'Date': 'ds'})
    df = df.merge(df_regressors, on='ds')
    
    for regressor in ['Num_Men', 'Num_Women', 'Num_Children', 'Num_Elderly']:
        model.add_regressor(regressor)
    
    model.fit(df)
    
    # Forecast 60 days
    future = model.make_future_dataframe(periods=60)
    future = future.merge(df_regressors, on='ds', how='left').fillna(method='ffill')
    forecast = model.predict(future)
    
    # Check for depletion (threshold: 5% of initial stock)
    threshold = {
        'Food (kg)': 500,
        'Water (L)': 2500,
        'Medicine (units)': 100,
        'Shelter (units)': 5
    }[resource_type]
    depletion_date = forecast[forecast['yhat'] < threshold]['ds'].min()
    
    return model, forecast, depletion_date

# Example: Train model and check depletion for one camp and resource
camp_id = data['Camp_ID'].iloc[0]
resource_type = 'Food (kg)'
model, forecast, depletion_date = train_prophet_model(data, camp_id, resource_type)

# Alert logic
if depletion_date and depletion_date < pd.Timestamp('2025-07-01') + timedelta(days=7):
    # Filter NGOs for the camp's country and relevant focus area
    ngo_data = pd.read_csv('NGO_List_with_Focus_Areas.csv')
    relevant_ngos = ngo_data[(ngo_data['Country'] == data[data['Camp_ID'] == camp_id]['Country'].iloc[0]) & 
                             (ngo_data['Area of Focus'].str.contains('Food Security|Humanitarian Aid'))]
    print(f"Alert: {resource_type} depletion predicted on {depletion_date} for Camp {camp_id}")
    print(f"Notify NGOs: {relevant_ngos['NGO Name'].tolist()}")

# Save simulated data to CSV
data.to_csv('simulated_camp_resource_data.csv', index=False)