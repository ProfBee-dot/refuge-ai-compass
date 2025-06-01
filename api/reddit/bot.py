import praw
import time
from settings import reddit
from text import POST_TITLE, POST_TEXT, DM_SUBJECT, DM_MESSAGE
from api.general_config import DEBUG

# Subreddits for posting
SUBREDDITS_TO_POST_TO = [
    "test"
] if DEBUG else [
    "humanitarian",
    "nonprofit",
    "grants",
    "refugees",
    "charity",
]

# List of NGO accounts to DM (replace with actual Reddit usernames)
NGO_ACCOUNTS_TO_DM = [
    # "ngo_account_1",
    # "ngo_account_2",
    # "another_ngo_reddit_user"
]


def make_post():
    """Makes a new text post in specified subreddits."""

    print("Attempting to make posts...")
    for subreddit_name in SUBREDDITS_TO_POST_TO:
        try:
            subreddit = reddit.subreddit(subreddit_name)
            # Check if the post already exists (simple check, could be more robust)
            # This is a very basic check. A more robust solution would involve
            # keeping a record of previous posts (e.g., in a database or file).
            # For now, let's just assume we post once.
            
            # To avoid spamming during development, you might want to uncomment
            # the following line and comment out the actual submit line.
            print(f"Would post to r/{subreddit_name} with title: {POST_TITLE}")
            
            submission = subreddit.submit(title=POST_TITLE, selftext=POST_TEXT)
            print(f"Successfully posted to r/{subreddit_name}. Post ID: {submission.id}")
            time.sleep(5) # Small delay to respect API limits
            
        except praw.exceptions.APIException as e:
            print(f"Error posting to r/{subreddit_name}: {e}")
            if "SUBREDDIT_NOTALLOWED" in str(e):
                print(f"Bot not allowed to post in r/{subreddit_name}. Please check permissions or subreddit rules.")

        except Exception as e:
            print(f"An unexpected error occurred while posting to r/{subreddit_name}: {e}")
    print("Finished attempting to make posts.")



def send_dms_to_ngos(array):
    """Sends direct messages to a list of NGO accounts."""

    print("Attempting to send DMs to NGOs...")
    listed_accounts = array if array else NGO_ACCOUNTS_TO_DM

    for ngo_username in listed_accounts:
        try:
            # Replace placeholder in message
            current_dm_message = DM_MESSAGE.replace("[NGO Account Name/Organization Name]", ngo_username)
            
            # Get the redditor object
            redditor = reddit.redditor(ngo_username)
            
            # Send the message
            redditor.message(subject=DM_SUBJECT, message=current_dm_message)
            print(f"Successfully sent DM to u/{ngo_username}")
            time.sleep(5) # Small delay to respect API limits
        except praw.exceptions.RedditAPIException as e:
            print(f"Error sending DM to u/{ngo_username}: {e}")
            if "USER_DOES_NOT_EXIST" in str(e):
                print(f"u/{ngo_username} does not exist or has blocked DMs.")
        except Exception as e:
            print(f"An unexpected error occurred while sending DM to u/{ngo_username}: {e}")
            
    print("Finished attempting to send DMs.")