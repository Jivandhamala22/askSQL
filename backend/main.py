import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

from agents.schema_agent import get_schema
from agents.sql_writer import generate_sql
from agents.sql_executor import run_sql

app = FastAPI(title="AskSQL", version="1.0.0")

# allow React frontend (running on port 5173) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
async def hello():
    return {"message": "Hello from AskSQL API!"}
    
# ── request and response shapes ─────────────────────────
class QuestionRequest(BaseModel):
    question: str


class QueryResponse(BaseModel):
    question: str
    sql: str
    columns: list[str]
    rows: list[list]
    row_count: int


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
        sql = generate_sql(req.question, schema)
        columns, rows = run_sql(sql)

        return QueryResponse(
            question=req.question,
            sql=sql,
            columns=columns,
            rows=rows,
            row_count=len(rows),
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")


# ── health check ─────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "service": "AskSQL"}
