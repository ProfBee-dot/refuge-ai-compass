import torch
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
from api.persona import REFUGEE_SUPPORT_PROMPT
from knowledge_base import get_faq_answer, get_form_help
from nltk.corpus import stopwords
from nltk.corpus import wordnet
from nltk.stem import WordNetLemmatizer
import re
import os
import nltk

# Set the NLTK data path to the nltk_data directory in the same directory as app.py
nltk_data_path = os.path.join(os.path.dirname(__file__), "nltk_data")
nltk.data.path.append(nltk_data_path)

stop_words = set(stopwords.words('english'))



stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()

# Load model and tokenizer (move outside the function for efficiency)
model_name = "facebook/blenderbot-1B-distill"
tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
model = BlenderbotForConditionalGeneration.from_pretrained(model_name)

# Conversation history (we'll need to manage this per user in a real API)
chat_history = []

def preprocess(text):
    text = text.lower()
    text = re.sub(r'[^\w\s]', '', text) # Remove punctuation
    words = text.split()
    words = [lemmatizer.lemmatize(w) for w in words if w not in stop_words]
    return " ".join(words)

# def generate_response(user_input):
#     user_input = user_input.strip()

#     # Append user message
#     chat_history.append(user_input)

#     # Check for functional queries first
#     form_help_response = get_form_help(user_input)
#     if form_help_response:
#         chat_history.append(form_help_response)
#         return form_help_response

#     faq_response = get_faq_answer(user_input)
#     if faq_response:
#         chat_history.append(faq_response)
#         return faq_response

#     # If no direct function match, use the Blenderbot model
#     MAX_TURNS = 6
#     recent_history = chat_history[-MAX_TURNS * 2:]
#     conversation = "\n".join(recent_history)
#     full_input = REFUGEE_SUPPORT_PROMPT + "\n\n" + conversation

#     # Tokenize and generate
#     inputs = tokenizer(full_input, return_tensors="pt", truncation=True)
#     output_ids = model.generate(
#         **inputs,
#         max_length=200,
#         pad_token_id=tokenizer.eos_token_id,
#         no_repeat_ngram_size=3,
#         do_sample=True,
#         top_k=50,
#         top_p=0.95,
#         temperature=0.7
#     )

def generate_response(user_message, knowledge_base):
    processed_message = preprocess(user_message)
    best_match_key = None
    max_similarity = 0

    for key, answer in knowledge_base.items():
        processed_key = preprocess(key)
        # Simple similarity: count of common words
        common_words = set(processed_message.split()) & set(processed_key.split())
        similarity = len(common_words)

        if similarity > max_similarity and similarity > 0: # You might need a better threshold
            max_similarity = similarity
            best_match_key = key

    if best_match_key:
        return knowledge_base[best_match_key]
    else:
        return "I'm sorry, I'm not sure how to answer that right now. Can you rephrase your question?"
    # Decode and display response
    reply = tokenizer.decode(output_ids[0], skip_special_tokens=True)
    chat_history.append(reply)
    return reply

if __name__ == '__main__':
    print("🤖 Refugee Support Chatbot is now running in interactive mode. Type your message to begin. Type 'exit' to quit.")
    while True:
        user_input = input("\nYou: ").strip()

        if user_input.lower() in ["exit", "quit", "bye"]:
            print("👋 Goodbye! Stay strong, and take care.")
            break

        response = generate_response(user_input)
        print("Chatbot:", response)