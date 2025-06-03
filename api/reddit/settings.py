
import os
import praw
from api.general_config import app_id

# --- CONFIGURATION ---
# It's best to store these in environment variables or a separate config file
# for security, rather than directly in the code.
# For now, you can put them directly for testing, but remove before sharing!

REDDIT_CLIENT_ID = os.environ.get("REDDIT_CLIENT_ID")
REDDIT_CLIENT_SECRET = os.environ.get("REDDIT_CLIENT_SECRET")
REDDIT_USERNAME = os.environ.get("REDDIT_USERNAME") # Your bot's username
REDDIT_PASSWORD = os.environ.get("REDDIT_PASSWORD") # Your bot's password
REDDIT_USER_AGENT = f"RefugeeAidBot/1.0 by u/{REDDIT_USERNAME}"  # User agent for the bot, should be unique and descriptive

required_credentials = [
    "REDDIT_CLIENT_ID",
    "REDDIT_CLIENT_SECRET",
    "REDDIT_USERNAME",
    "REDDIT_PASSWORD",
]

not_filled = [cred for cred in required_credentials if not os.environ.get(cred)]
if not_filled:
    raise ValueError(f"Missing required environment variables: {', '.join(not_filled)}")


# --- PRAW Setup ---
reddit = praw.Reddit(
    client_id=REDDIT_CLIENT_ID,
    client_secret=REDDIT_CLIENT_SECRET,
    username=REDDIT_USERNAME,
    password=REDDIT_PASSWORD,
    user_agent=REDDIT_USER_AGENT,
)
