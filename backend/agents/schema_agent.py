import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "ecommerce.db")

def get_table_info() -> list[dict]:
    """
    Returns a list of tables with their column names and types.
    Used by the /tables endpoint to show the user
    what the database contains before they ask a question.

    Example return value:
    [
      {
        "table": "customers",
        "columns": [
          {"name": "id",      "type": "INTEGER"},
          {"name": "name",    "type": "TEXT"},
          {"name": "email",   "type": "TEXT"},
          {"name": "city",    "type": "TEXT"},
          {"name": "country", "type": "TEXT"},
        ],
        "row_count": 5
      },
      ...
    ]
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    tables = [row[0] for row in cursor.fetchall()]

    result = []

    for table in tables:
        # column names and types
        cursor.execute(f"PRAGMA table_info({table})")
        columns = [
            {"name": row[1], "type": row[2]}
            for row in cursor.fetchall()
        ]

        # total row count
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        row_count = cursor.fetchone()[0]

        result.append({
            "table": table,
            "columns": columns,
            "row_count": row_count,
        })

    conn.close()
    return result


def get_schema() -> str:
    """
    Reads every table from the database and builds a rich schema
    context string for the LLM prompt.

    Returns a string containing:
      - the CREATE TABLE statement for each table
      - 2 sample rows per table so the LLM understands real values
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # get all user-created table names from SQLite's system table
    cursor.execute("""
        SELECT name FROM sqlite_master
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    """)
    tables = [row[0] for row in cursor.fetchall()]

    if not tables:
        raise RuntimeError(
            "No tables found in database. "
            "Did you run: python database/seed.py ?"
        )

    schema_parts = []

    for table in tables:
        # full CREATE TABLE statement
        cursor.execute(
            "SELECT sql FROM sqlite_master WHERE name=?", (table,)
        )
        create_stmt = cursor.fetchone()[0]

        # 2 sample rows so LLM understands real values
        cursor.execute(f"SELECT * FROM {table} LIMIT 2")
        rows = cursor.fetchall()
        col_names = [d[0] for d in cursor.description]

        sample_lines = "\n".join(
            "  " + str(dict(zip(col_names, row))) for row in rows
        )

        schema_parts.append(
            f"{create_stmt}\n\n-- sample rows from {table}:\n{sample_lines}"
        )

    conn.close()

    return "\n\n---\n\n".join(schema_parts)
