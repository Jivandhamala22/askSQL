import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

PROMPT_TEMPLATE = """You are a SQL expert working with a SQLite database.
Given the schema below, write a single SQL query to answer the question.
Return ONLY the SQL query — no explanation, no markdown, no backticks.

DATABASE SCHEMA:
{schema}

QUESTION:
{question}

SQL:"""


def generate_sql(question: str, schema: str) -> str:
    """
    Sends the question + schema context to Groq and returns
    a clean SQL string ready for execution.
    """
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = PROMPT_TEMPLATE.format(
        schema=schema,
        question=question
    )

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=300,
    )

    raw = response.choices[0].message.content.strip()

    return clean_sql(raw)


def clean_sql(sql: str) -> str:
    """
    Strips any markdown fences or extra whitespace the LLM
    might have added despite the prompt instructions.
    """
    # remove ```sql ... ``` fences if present
    if "```" in sql:
        lines = sql.split("\n")
        lines = [l for l in lines if not l.strip().startswith("```")]
        sql = "\n".join(lines)

    # take only the first statement (safety against multi-statement output)
    if ";" in sql:
        sql = sql.split(";")[0].strip() + ";"

    return sql.strip()
