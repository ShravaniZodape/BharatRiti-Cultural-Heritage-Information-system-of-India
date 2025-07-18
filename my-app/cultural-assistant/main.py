from fastapi import FastAPI
from pydantic import BaseModel
from ollama import Client
import psycopg2
from fastapi.middleware.cors import CORSMiddleware
import traceback

app = FastAPI()
client = Client(host="http://localhost:11434")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_CONFIG = {
    "dbname": "project_sgd",
    "user": "postgres",
    "password": "Vjti@123",
    "host": "localhost",
    "port": "5432"
}

class AIRequest(BaseModel):
    state: str
    question: str

@app.post("/ai/ask")
def ask_ai(payload: AIRequest):
    state_name = payload.state.strip()
    user_question = payload.question.strip().lower()

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM output_polygon WHERE LOWER(name) = LOWER(%s)", (state_name,))
            row = cur.fetchone()

        if not row:
            return {"response": f"Sorry, I couldn't find any information for the state '{state_name}'."}

        fields = {
            "languages": row[2],
            "dance": row[3],
            "cuisine": row[4],
            "festival": row[5],
            "tradition": row[6],
            "history": row[7]
        }

        matched_fields = []
        for key in fields:
            if key in user_question or key + "s" in user_question:
                matched_fields.append(key)

        if not matched_fields:
            matched_fields = list(fields.keys())

        context = f"You are an assistant helping with cultural information about {state_name}.\n\n"
        for key in matched_fields:
            context += f"{key.capitalize()}: {fields[key]}\n"

        context += f"\nUser Question: {payload.question.strip()}\n"
        context += "Answer using only the information provided above. Include all relevant points. Keep your answer simple and clear."

        response = client.chat(
            model="mistral",
            messages=[
                {"role": "system", "content": "You are a helpful Indian cultural assistant."},
                {"role": "user", "content": context}
            ]
        )

        return {"response": response['message']['content']}

    except Exception as e:
        print(traceback.format_exc())
        return {"error": str(e)}

    finally:
        if conn:
            conn.close()
