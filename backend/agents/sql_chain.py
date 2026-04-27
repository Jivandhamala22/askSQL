"""
sql_chain.py  —  LangChain retry loop
──────────────────────────────────────
Wraps sql_writer + sql_executor in an agentic retry loop.

Flow:
Attempt 1: generate SQL → run it → return results if success
Attempt 2: if failed, feed error back to LLM → regenerate → retry
Attempt 3: one final try with even more explicit correction prompt
Give up: raise the last error to the caller

This is the first real agentic behaviour in the project —
the agent observes its own failure and self-corrects.
"""

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

from agents.sql_writer import clean_sql, PROMPT_TEMPLATE
from agents.sql_executor import run_sql

load_dotenv()

MAX_RETRIES = 3

# ── retry prompt: shown on attempt 2 and 3 ──────────────────
RETRY_PROMPT_TEMPLATE = """You are a SQL expert working with a SQLite database.
Your previous SQL was REJECTED. Study the rejection reason and fix it.

BANNED KEYWORDS — never use these under any circumstances:
CREATE, TEMPORARY, TEMP, DROP, DELETE, UPDATE, INSERT, ALTER, WITH

You must write ONE single SELECT statement and nothing else.

SQLITE SELECT PATTERNS you are allowed to use:
- Simple query:       SELECT col FROM table WHERE condition
- Aggregation:        SELECT col, SUM(x), COUNT(*) FROM table GROUP BY col
- JOIN:               SELECT a.col, b.col FROM a JOIN b ON a.id = b.id
- Subquery in WHERE:  SELECT col FROM table WHERE x > (SELECT AVG(x) FROM table)
- Subquery in HAVING: SELECT col, SUM(x) AS total FROM table GROUP BY col HAVING total > (SELECT AVG(...))
- Date formatting:    SELECT strftime('%Y-%m', date_col) AS period FROM table GROUP BY period
- Ordering:           SELECT col FROM table ORDER BY col DESC LIMIT 10

DATABASE SCHEMA:
{schema}

ORIGINAL QUESTION:
{question}

YOUR PREVIOUS SQL THAT WAS REJECTED:
{previous_sql}

REJECTION REASON:
{error}

Write ONE clean SELECT statement that answers the original question:"""



def _build_chain(prompt_template: str):
    """
    Builds a LangChain chain:
    PromptTemplate → ChatGroq LLM → StrOutputParser

    PromptTemplate: formats the prompt string with variables
    ChatGroq:       calls Groq API with the formatted prompt
    StrOutputParser: extracts plain text string from LLM response
    """
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.1,
        max_tokens=300,
    )

    prompt = PromptTemplate.from_template(prompt_template)
    parser = StrOutputParser()

    # the pipe operator | chains these three together
    # prompt → llm → parser runs in sequence automatically
    return prompt | llm | parser

class IrrelevantQuestionError(ValueError):
    """Raised when LLM signals the question is not database-related.
    This should NOT be retried."""
    pass

def run_with_retry(question: str, schema: str):
    
    """ Main entry point for the agentic retry loop.
        Returns: (columns, rows) on success ,Raises:  ValueError with the last error message on total failure  """
    
    last_error = None
    last_sql = None
    attempt_logs = []

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            if attempt == 1:
                # first attempt — use the standard prompt from sql_writer
                print(f"  [LangChain] Attempt {attempt}: generating SQL...")
                chain = _build_chain(PROMPT_TEMPLATE)
                raw = chain.invoke({
                    "schema": schema,
                    "question": question,
                })
            else:
                # retry — feed the previous error back to the LLM
                print(f"  [LangChain] Attempt {attempt}: retrying with error context...")
                print(f"  Previous error: {last_error}")
                chain = _build_chain(RETRY_PROMPT_TEMPLATE)
                raw = chain.invoke({
                    "schema": schema,
                    "question": question,
                    "previous_sql": last_sql,
                    "error": last_error,
                })

            # clean the raw LLM output
            sql = clean_sql(raw.strip())
            last_sql = sql
            print(f"  Generated SQL:\n  {sql}")

            if sql.upper().startswith("IRRELEVANT"):
                raise IrrelevantQuestionError(f"This question '{question}' is irrelevant to the database. "
                "Try asking: 'Show total revenue by category'")

            # try to run it
            columns, rows = run_sql(sql)

            attempt_logs.append({
                "attempt": attempt,
                "sql": sql,
                "status": "success",
                "error": None,
            })

            # success — return immediately
            print(f"  [LangChain] Success on attempt {attempt}!")
            return columns, rows, sql, attempt_logs

        except ValueError as e:
            last_error = str(e)

            if isinstance(e, IrrelevantQuestionError):
                raise  # don't retry irrelevant questions

            print(f"  [LangChain] Attempt {attempt} failed: {last_error}")

            attempt_logs.append({
                "attempt": attempt,
                "sql": last_sql or "",
                "status": "failure",
                "error": last_error,
            })

            if attempt == MAX_RETRIES:
                # exhausted all retries
                raise ValueError(
                    f"Could not generate valid SQL after {MAX_RETRIES} attempts. "
                    f"Last error: {last_error}"
                )
            # else: loop continues to next attempt

        except Exception as e:
            # unexpected error — don't retry, raise immediately
            raise ValueError(f"Unexpected error in SQL chain: {str(e)}")