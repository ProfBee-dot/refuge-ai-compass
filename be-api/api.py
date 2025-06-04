from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api.knowledge_base import faq_data
from api.app import generate_response  # We'll need to adapt our chatbot logic for API use
from api.reddit import bot

app = FastAPI()

origins = [
    "http://localhost:8080",  # The origin of your React frontend (adjust if different)
    "http://localhost:5173",  # Or the other common React development port
    # Add other origins if needed (e.g., your production URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (POST, GET, OPTIONS, etc.)
    allow_headers=["*"],  # Allows all headers
)

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@app.post("/chat")
async def chat(request: ChatRequest):
    user_message = request.message
    chatbot_response = generate_response(user_message, faq_data) ## faq_data for nltk
    return ChatResponse(response=chatbot_response)



class AidRequest(BaseModel):
    details: str
    targets_users: list
    target_groups: list 


@app.post("/request-aid")
def request_aid(request: AidRequest):
    try:
        bot.make_post( request )

    except Exception as err:
        return {"message": f"Error: {err}"}
    
    return {"message": "SUccessfully made posts"}