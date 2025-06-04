# JUST GENERAL CONFIG SETTINGS FOR ALMOST ALL THE SUB SERVICES

import os

from dotenv import load_dotenv

app_id = 'Has no significance, Just an ID so something can be imported form here'


# load env vars
load_dotenv()


DEBUG = os.getenv("DEBUG", 'TRUE').lower() == "true"

