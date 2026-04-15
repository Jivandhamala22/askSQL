import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "ecommerce.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "schema.sql")

def seed():
    conn = sqlite3.connect(DB_PATH)

    # create tables
    with open(SCHEMA_PATH) as f:
        conn.executescript(f.read())

    # customers
    conn.executemany(
        "INSERT OR IGNORE INTO customers (name, email, city, country) VALUES (?,?,?,?)",
        [
            ("Alice Smith",  "alice@mail.com",  "Berlin",    "Germany"),
            ("Bob Jones",    "bob@mail.com",    "Paris",     "France"),
            ("Carol White",  "carol@mail.com",  "London",    "UK"),
            ("David Brown",  "david@mail.com",  "Berlin",    "Germany"),
            ("Eva Martinez", "eva@mail.com",    "Madrid",    "Spain"),
        ]
    )

    # products
    conn.executemany(
        "INSERT OR IGNORE INTO products (name, price, category, stock) VALUES (?,?,?,?)",
        [
            ("iPhone 15",           999.99, "Electronics", 50),
            ("MacBook Air M3",     1299.99, "Electronics", 20),
            ("AirPods Pro",         249.99, "Electronics", 75),
            ("Running Shoes",        89.99, "Clothing",   100),
            ("Python Crash Course",  39.99, "Books",      300),
            ("Clean Code",           45.99, "Books",      150),
        ]
    )

    # orders
    conn.executemany(
        "INSERT OR IGNORE INTO orders (id, customer_id, status, total_amount, created_at) VALUES (?,?,?,?,?)",
        [
            (1, 1, "delivered", 1249.98, "2024-01-15"),
            (2, 2, "shipped",     39.99, "2024-02-01"),
            (3, 3, "delivered",  339.98, "2024-02-10"),
            (4, 1, "pending",     45.99, "2024-03-01"),
            (5, 4, "delivered",   89.99, "2024-03-05"),
        ]
    )

    # order items
    conn.executemany(
        "INSERT OR IGNORE INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?,?,?,?)",
        [
            (1, 1, 1, 999.99),
            (1, 3, 1, 249.99),
            (2, 5, 1,  39.99),
            (3, 3, 1, 249.99),
            (3, 4, 1,  89.99),
            (4, 6, 1,  45.99),
            (5, 4, 1,  89.99),
        ]
    )

    conn.commit()
    conn.close()
    print(f"Database ready at: {DB_PATH}")
    print("Tables: customers, products, orders, order_items")

if __name__ == "__main__":
    seed()
