import sys
import os
import re
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

load_dotenv()

from agents.schema_agent import get_schema
from agents.sql_writer import generate_sql
from agents.sql_executor import run_sql
from agents.schema_agent import get_table_info
from agents.sql_chain import run_with_retry

app = FastAPI(title="AskSQL", version="1.0.0")

# matches greetings, farewells, small talk — any variation
GREETING_PATTERN = re.compile(
    r'^(hi+|hello+|hey+|bye+|goodbye|good\s*(morning|afternoon|evening|night)|'
    r'thanks?|thank\s*you|ok+|okay|yes|no|nope|yep|sure|'
    r'how\s*are\s*you|what\'?s?\s*up|sup|yo|howdy|'
    r'nice\s*to\s*meet|good\s*to\s*see|greetings|'
    r'hola|ciao|salut|bonjour|namaste)[\s!?.]*$',
    re.IGNORECASE
)

CONTENT_WORD_PATTERN = re.compile(r'\b[a-zA-Z]{4,}\b')


# allow React frontend (running on port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to the AskSQL API. Use the /ask endpoint to query your database with natural language."}
@app.get("/hello")
async def hello():
    return {"message": "Hello from AskSQL API!"}

# ── request and response shapes ─────────────────────────
class QuestionRequest(BaseModel):
    question: str

    @field_validator("question")
    @classmethod
    def validate_question(cls, v: str) -> str:
        v = v.strip()

        if not v:
            raise ValueError("Question cannot be empty.")

        if len(v) < 5:
            raise ValueError(
                "Question is too short. "
                "Try asking: 'How many customers are there?'"
            )

        if GREETING_PATTERN.match(v):
            raise ValueError(
                "That looks like a greeting, not a database question. "
                "Try: 'Show total revenue by category'"
            )

        if not CONTENT_WORD_PATTERN.search(v):
            raise ValueError(
                "Question doesn't seem to contain a meaningful query. "
                "Try: 'Which products have the most orders?'"
            )

        return v

class AttemptLog(BaseModel):
    attempt: int
    sql: str
    status: str  # "success" or "error"
    error: str | None = None

class QueryResponse(BaseModel):
    question: str
    sql: str
    columns: list[str]
    rows: list[list]
    row_count: int
    attempts: list[AttemptLog]


# ── main endpoint ────────────────────────────────────────
@app.post("/ask", response_model=QueryResponse)
def ask(req: QuestionRequest):
    """
    Full pipeline in one endpoint:
    1. schema_agent  → reads DB structure
    2. sql_writer    → generates SQL via Groq
    3. sql_executor  → runs safely on real DB
    """
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        schema = get_schema()
        columns, rows, sql, attempts_log = run_with_retry(req.question, schema)

        return QueryResponse(
            question=req.question,
            sql=sql,
            columns=columns,
            rows=rows,
            row_count=len(rows),
            attempts=attempts_log,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# ── health check ─────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "AskSQL"}

@app.get("/tables")                           
def tables():
    """
    Returns all table names and their columns.
    The React frontend uses this to show the user
    what they can ask questions about.
    """
    try:
        return {"tables": get_table_info()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
