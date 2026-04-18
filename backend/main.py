import sys
import os
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

    #@field_validator("question")
    #@classmethod
    #def validate_question(cls, v):
    #   v = v.strip()

    #  if len(v) < 10:
    #     raise ValueError(
        #        "Question too short. Please ask a complete question."
    #     )
    # if len(v.split()) < 3:
    #     raise ValueError(
    #        "Please ask a complete question with at least 3 words."
        #    )
    #  if not any(c.isalpha() for c in v):
    #     raise ValueError(
        #       "Question must contain actual words."
        #   )
        #return v



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
