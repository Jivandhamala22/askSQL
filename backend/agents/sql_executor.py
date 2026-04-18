import sqlite3
import os
from typing import Tuple, List, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "database", "ecommerce.db")

# keywords that must never appear in a generated query
BLOCKED_KEYWORDS = [
    "DROP", "DELETE", "TRUNCATE", "UPDATE",
    "INSERT", "ALTER", "CREATE", "REPLACE",
    "ATTACH", "DETACH", "PRAGMA",
]


def run_sql(sql: str) -> Tuple[List[str], List[List[Any]]]:
    """
    Runs a SQL query safely on the database.

    Steps:
    1. Safety check — block any destructive keywords
    2. Execute the SELECT on the real database
    3. Return (column_names, rows) as plain Python lists

    Raises ValueError if the query is blocked or fails.
    """
    _safety_check(sql)

    conn = sqlite3.connect(DB_PATH)

    try:
        cursor = conn.execute(sql)

        if cursor.description is None:
            raise ValueError("Query returned no columns — is it a SELECT?")

        columns = [d[0] for d in cursor.description]
        rows = [list(row) for row in cursor.fetchall()]
        return columns, rows

    except sqlite3.OperationalError as e:
        raise ValueError(f"SQL error: {e}\nQuery was: {sql}")

    finally:
        conn.close()


def _safety_check(sql: str):
    """Raises ValueError if any blocked keyword is found."""
    sql_upper = sql.upper()
    for keyword in BLOCKED_KEYWORDS:
        if keyword in sql_upper:
            raise ValueError(
                f"Blocked keyword '{keyword}' detected. "
                "Only SELECT queries are allowed."
            )
