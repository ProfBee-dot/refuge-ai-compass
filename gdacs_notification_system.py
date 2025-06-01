import json
import logging
import os
from datetime import datetime
from math import radians, sin, cos, sqrt, atan2
from smtplib import SMTP_SSL
from email.mime.text import MIMEText
from gdacs.api import GDACSAPIReader, GDACSAPIError
import geojson

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Refugee camp coordinates
CAMP_LOCATIONS = {
    'Nairobi': {'lat': -1.2921, 'lon': 36.8219},
    'Melkadida': {'lat': 4.5167, 'lon': 41.9667}
}

# Organization email list (replace with actual emails)
ORG_EMAILS = ['org1@example.com', 'org2@example.com']  # Placeholder emails

# SMTP configuration (replace with your credentials)
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 465
SMTP_USER = 'your_email@gmail.com'  # Replace with your email
SMTP_PASSWORD = 'your_app_password'  # Replace with Gmail app password

# File to store processed events
EVENTS_FILE = 'processed_events.json'

# Haversine formula to calculate distance (in km)
def haversine(lat1, lon1, lat2, lon2):
    R = 6371  # Earth's radius in km
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c

# Load processed events from file
def load_processed_events():
    if os.path.exists(EVENTS_FILE):
        try:
            with open(EVENTS_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading processed events: {e}")
    return {}

# Save processed events to file
def save_processed_events(events):
    try:
        with open(EVENTS_FILE, 'w') as f:
            json.dump(events, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving processed events: {e}")

# Send email notification
def send_notification(event):
    subject = f"GDACS Disaster Alert: {event['eventtype']} ({event['alertlevel']}) near {event['camp']}"
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

# Fetch and process GDACS events
def fetch_gdacs_events(limit=10, max_distance_km=500):
    try:
        client = GDACSAPIReader()
        events = client.latest_events(limit=limit)
        relevant_events = []
        processed_events = load_processed_events()
        
        # Handle GeoJSON object
        if hasattr(events, 'features'):
            features = events.features
        else:
            events_dict = dict(events)
            features = events_dict.get('features', [])
            logger.warning("Converted GeoJSON to dict due to missing features attribute")
        
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
            
            # Check if event is new or worsening
            is_new = event_id not in processed_events
            is_worsening = False
            if not is_new:
                prev_score = processed_events.get(event_id, {}).get('alertscore', 0)
                prev_alert = processed_events.get(event_id, {}).get('alertlevel', 'Green')
                is_worsening = alert_score >= prev_score + 0.5 or (
                    alert_level in ['Orange', 'Red'] and prev_alert == 'Green'
                )
            
            if alert_level not in ['Orange', 'Red'] or not (is_new or is_worsening):
                continue
            
            # Check proximity to refugee camps
            for camp, loc in CAMP_LOCATIONS.items():
                distance = haversine(lat, lon, loc['lat'], loc['lon'])
                if distance <= max_distance_km:
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
                    # Update processed events
                    processed_events[event_id] = {
                        'alertscore': alert_score,
                        'alertlevel': alert_level,
                        'last_notified': datetime.utcnow().isoformat()
                    }
        
        save_processed_events(processed_events)
        return relevant_events
    except GDACSAPIError as e:
        logger.error(f"GDACS API error: {e}")
        return []
    except Exception as e:
        logger.error(f"Error fetching GDACS events: {e}")
        return []

# Main function to check events and notify
def notify_organizations():
    logger.info("Checking for new or worsening GDACS events")
    events = fetch_gdacs_events()
    for event in events:
        logger.info(f"Processing event {event['eventid']} near {event['camp']}")
        send_notification(event)

if __name__ == '__main__':
    notify_organizations()