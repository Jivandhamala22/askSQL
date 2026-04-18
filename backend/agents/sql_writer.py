import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

PROMPT_TEMPLATE = """You are a SQL expert working with a SQLite database.
Your ONLY job is to answer questions about the data in the database.

STRICT RULES:
- Write ONLY a SELECT statement
- Do NOT use CREATE, DROP, DELETE, UPDATE, INSERT, WITH, or any DDL
- Do NOT use CTEs or temporary tables
- Return ONLY the raw SQL query, no explanation, no markdown, no backticks
- If the question is NOT about the database data (greetings, opinions, general knowledge, personal questions, anything unrelated to the tables),
    respond with exactly this single word: IRRELEVANT

DATABASE SCHEMA:
{schema}

QUESTION:
{question}

SQL:"""



def generate_sql(question: str, schema: str) -> str:
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

    # LLM flagged question as not database-related
    if raw.upper().startswith("IRRELEVANT"):
        raise ValueError(
            "This question is not related to the database. "
            "Try asking something like: 'Show total revenue by category' "
            "or 'Which customers are from Germany?'"
        )

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
