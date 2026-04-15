import sys
import os

# make sure Python can find the backend/ folder
sys.path.insert(0, os.path.dirname(__file__))

from agents.schema_agent import get_schema
from agents.sql_writer import generate_sql
from agents.sql_executor import run_sql


if __name__ == "__main__":
    question = ["Which customers are from Germany?", "Which products are in the Electronics category?", 
    "What are the total sales for each product?", "How many customers are there in total?", 
    "What is the average order amount?", "Which orders were placed in the last month?", 
    "Show total revenue per product category"]


    print(f"\nQuestion: {question[6]}")
    print("-" * 40)

    print("Reading schema...")
    schema = get_schema()

    print("Asking Groq to write SQL...")
    sql = generate_sql(question[6], schema)
    print(f"\nGenerated SQL:\n  {sql}")

    print("\nRunning query...")
    columns, rows = run_sql(sql)

    print(f"\nResults ({len(rows)} rows):")
    print("  " + " | ".join(columns))
    print("  " + "-" * 30)
    for row in rows:
        print("  " + " | ".join(str(v) for v in row))