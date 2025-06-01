import torch
from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
import speech_recognition as sr
from api.persona import REFUGEE_SUPPORT_PROMPT

# Initialize model and tokenizer
model_name = "facebook/blenderbot-1B-distill"
tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
model = BlenderbotForConditionalGeneration.from_pretrained(model_name)

# Initialize speech recognizer
recognizer = sr.Recognizer()

# Conversation history
chat_history = []

print("🤖 Refugee Support Chatbot is now running. Type or speak to start. Type 'exit' to quit.")

# Main chat loop
while True:
    print("\n🎤 Listening... (Say something or type below)")
    user_input = None

    try:
        # Let user choose to type or speak
        choice = input("🟡 Press [Enter] to speak OR type your message: ")

        if choice.strip() != "":
            user_input = choice.strip()
        else:
            # Use voice input if user presses Enter without typing
            with sr.Microphone() as source:
                print("🎙️ Speak now...")
                audio = recognizer.listen(source)
                user_input = recognizer.recognize_google(audio)
    except sr.UnknownValueError:
        print("❌ Sorry, I didn't understand that.")
        continue
    except sr.RequestError:
        print("❌ Could not request results from the speech recognition service.")
        continue

    if user_input is None:
        continue

    print("You:", user_input)

    if user_input.lower() in ["exit", "quit", "bye"]:
        print("👋 Goodbye! Stay safe.")
        break

    # Save user input to chat history
    chat_history.append(f"You: {user_input}")

    # Keep only the last few exchanges to avoid input length errors
    MAX_TURNS = 6
    recent_history = chat_history[-MAX_TURNS * 2:]  # 6 exchanges (user+bot)
    conversation = "\n".join(recent_history)
    full_input = REFUGEE_SUPPORT_PROMPT + conversation + "\nBot:"

    # Tokenize and generate response
    inputs = tokenizer(full_input, return_tensors="pt", truncation=True)
    output_ids = model.generate(
        **inputs,
        max_length=200,
        pad_token_id=tokenizer.eos_token_id,
        no_repeat_ngram_size=3,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.7
    )

    reply = tokenizer.decode(output_ids[0], skip_special_tokens=True)

    # Extract only the bot's reply
    bot_reply = reply.split("Bot:")[-1].strip()
    print("Chatbot:", bot_reply)
    chat_history.append(f"Bot: {bot_reply}")