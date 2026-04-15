# AskSQL

Ask your database questions in plain English. Get back real SQL and real results — no SQL knowledge required.

## How it works

1. You type a question in plain English
2. Schema Agent retrieves relevant tables using RAG (ChromaDB)
3. SQL Writer generates a SQL query via Groq LLM
4. SQL Executor runs it safely on the real database
5. Results appear in the browser instantly

## Tech stack

- **Backend**: Python, FastAPI
- **Agents**: LangChain
- **LLM**: Groq API (llama-3.3-70b-versatile)
- **Vector DB**: ChromaDB + sentence-transformers
- **Database**: SQLite
- **Frontend**: React + Vite
- **Cloud**: AWS (Lambda + S3)

## Project structure
asksql/
├── backend/
│   ├── database/
│   │   ├── schema.sql        # table definitions
│   │   ├── seed.py           # creates and seeds the db
│   │   └── ecommerce.db      # local db (gitignored)
│   ├── .env                  # secrets (gitignored)
│   └── test_groq.py          # groq connection test
├── requirements.txt
└── README.md

## Setup

```bash
# 1. clone the repo
git clone https://github.com/YOUR_USERNAME/asksql.git
cd asksql

# 2. create virtual environment
python -m venv venv
source venv/bin/activate      # windows: venv\Scripts\activate

# 3. install dependencies
pip install -r requirements.txt

# 4. create your .env file
cp backend/.env.example backend/.env
# then add your GROQ_API_KEY

# 5. seed the database
python backend/database/seed.py
```

## Get a free Groq API key

Sign up at https://console.groq.com — no credit card needed.

## Daily build log

| Step | What was built |
|------|---------------|
| Step 1 | Groq API connection test |
| Step 2 | SQLite database with seed data |
