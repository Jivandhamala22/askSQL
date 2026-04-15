from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

response = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[
        {
            "role": "user",
            "content": "Write a SQL query to get all customers who placed more than 2 orders. Table: orders(id, customer_id, amount)"
        }
    ],
    temperature=0.1,
)

print(response.choices[0].message.content)
