import sqlite3
import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

DB_PATH = os.path.join(os.path.dirname(__file__), "database", "ecommerce.db")

# ── Step A: read real schema from the database ──────────
def get_schema() -> str:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
    """)
    tables = [row[0] for row in cursor.fetchall()]

    schema_parts = []
    for table in tables:
        # get CREATE TABLE statement
        cursor.execute(
            "SELECT sql FROM sqlite_master WHERE name=?", (table,)
        )
        create_stmt = cursor.fetchone()[0]

        # get 2 sample rows so the LLM understands real values
        cursor.execute(f"SELECT * FROM {table} LIMIT 2")
        rows = cursor.fetchall()
        col_names = [d[0] for d in cursor.description]

        sample = "\n".join(
            "  " + str(dict(zip(col_names, row))) for row in rows
        )

        schema_parts.append(
            f"{create_stmt}\n\n-- sample rows:\n{sample}"
        )

    conn.close()
    return "\n\n---\n\n".join(schema_parts)


# ── Step B: ask Groq to write SQL ───────────────────────
def generate_sql(question: str, schema: str) -> str:
    client = Groq(api_key=os.getenv("GROQ_API_KEY"))

    prompt = f"""You are a SQL expert. Given the database schema below, write a 
single SQLite SQL query to answer the question. 
Return ONLY the SQL query, no explanation, no markdown, no backticks.

SCHEMA:
{schema}

QUESTION:
{question}

SQL:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
    )

    return response.choices[0].message.content.strip()


# ── Step C: run the SQL safely ───────────────────────────
BLOCKED = ["DROP", "DELETE", "TRUNCATE", "UPDATE", "INSERT", "ALTER"]

def run_sql(sql: str):
    sql_upper = sql.upper()
    for keyword in BLOCKED:
        if keyword in sql_upper:
            raise ValueError(f"Blocked keyword detected: {keyword}")

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.execute(sql)
    columns = [d[0] for d in cursor.description]
    rows = cursor.fetchall()
    conn.close()
    return columns, rows


# ── Main: tie it all together ────────────────────────────
if __name__ == "__main__":
    question = "Show total revenue per product category"

    print(f"\nQuestion: {question}")
    print("-" * 40)

    print("Reading schema...")
    schema = get_schema()

    print("Asking Groq to write SQL...")
    sql = generate_sql(question, schema)
    print(f"\nGenerated SQL:\n{sql}")

    print("\nRunning query...")
    columns, rows = run_sql(sql)

    print(f"\nResults ({len(rows)} rows):")
    print("  " + " | ".join(columns))
    print("  " + "-" * 30)
    for row in rows:
        print("  " + " | ".join(str(v) for v in row))