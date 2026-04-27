import streamlit as st
import requests
import pandas as pd

API_URL = "http://localhost:8000"

# ── page config ─────────────────────────────────────────
st.set_page_config(
    page_title="AskSQL",
    page_icon="🗄️",
    layout="centered",
    initial_sidebar_state="collapsed",
)

# ── custom CSS to match React UI as closely as possible ─
st.markdown("""
<style>
  /* hide streamlit default header and footer */
#MainMenu { visibility: hidden; }
footer    { visibility: hidden; }
header    { visibility: hidden; }

  /* main font */
html, body, [class*="css"] {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

  /* make dataframe header bold */
.dataframe thead tr th {
    font-weight: 600 !important;
    background: #f8f8f8 !important;
}

  /* pill buttons for examples */
div.stButton > button {
    border-radius: 20px !important;
    font-size: 12px !important;
    padding: 4px 14px !important;
    border: 1px solid #ddd !important;
    background: white !important;
    color: #555 !important;
    height: auto !important;
}
div.stButton > button:hover {
    border-color: #999 !important;
    color: #111 !important;
}
</style>
""", unsafe_allow_html=True)


# ── helper: call FastAPI ─────────────────────────────────
def call_api(question: str) -> tuple[int, dict]:
    try:
        response = requests.post(
            f"{API_URL}/ask",
            json={"question": question},
            timeout=60,
        )
        data = response.json()

        if response.status_code == 422:
                errors = data.get("detail", [])
                if isinstance(errors, list) and errors:
                    msg = errors[0].get("msg", "Invalid input.")
                    # strip the "Value error, " prefix Pydantic adds
                    msg = msg.replace("Value error, ", "")
                else:
                    msg = "Invalid input."
                return 422, {"detail": msg}

        return response.status_code, data

    except requests.exceptions.ConnectionError:
        return 503, {"detail": "Cannot connect to server. Is FastAPI running?"}
    except requests.exceptions.Timeout:
        return 504, {"detail": "Request timed out. Try again."}



def get_tables() -> list:
    try:
        r = requests.get(f"{API_URL}/tables", timeout=10)
        return r.json().get("tables", [])
    except Exception:
        return []


# ── header ───────────────────────────────────────────────
st.markdown("## 🗄️ AskSQL")
st.markdown(
    "<p style='color:#888; margin-top:-12px; margin-bottom:24px;'>"
    "Ask your database anything in plain English.</p>",
    unsafe_allow_html=True,
)

# ── schema panel ─────────────────────────────────────────
with st.expander("📋 Your database schema", expanded=True):
    tables = get_tables()
    if tables:
        cols = st.columns(len(tables))
        for i, t in enumerate(tables):
            with cols[i]:
                st.markdown(
                    f"**`{t['table']}`**  "
                    f"<span style='font-size:11px; color:#888; "
                    f"background:#f0f0f0; padding:1px 7px; "
                    f"border-radius:10px;'>{t['row_count']} rows</span>",
                    unsafe_allow_html=True,
                )
                for col in t["columns"]:
                    st.markdown(
                        f"<span style='font-size:12px; "
                        f"background:white; border:1px solid #eee; "
                        f"border-radius:4px; padding:1px 7px; "
                        f"margin:2px; display:inline-block;'>"
                        f"{col['name']} "
                        f"<span style='color:#bbb'>{col['type'].lower()}</span>"
                        f"</span>",
                        unsafe_allow_html=True,
                    )
    else:
        st.warning("Could not load schema. Is the FastAPI server running?")

st.markdown("---")

# ── initialise session state ─────────────────────────────
if "question" not in st.session_state:
    st.session_state.question = ""
if "run_query" not in st.session_state:
    st.session_state.run_query = False


# ── example pills ────────────────────────────────────────
EXAMPLES = [
    "How many customers are there in total?",
    "What are the top 3 products by total sales?",
    "Show total revenue per product category",
    "List all delivered orders with customer names",
    "Which customers are from Germany?",
    "Show me the monthly revenue trend",
]

st.markdown(
    "<p style='font-size:12px; color:#888; margin-bottom:6px;'>Try:</p>",
    unsafe_allow_html=True,
)

ex_cols = st.columns(3)
for i, example in enumerate(EXAMPLES):
    with ex_cols[i % 3]:
        if st.button(example, key=f"ex_{i}"):
            st.session_state.question = example
            st.session_state.run_query = True   # ← auto-run on click


# ── question input + ask button ──────────────────────────
with st.form(key="query_form", clear_on_submit=False):
    question_input = st.text_input(
        label="question",
        label_visibility="collapsed",
        placeholder="Ask your database anything in plain English...",
        value=st.session_state.question,
    )
    ask_clicked = st.form_submit_button(
        "Ask",
        type="primary",
        use_container_width=False,
    )

# sync typed input back to session state
if question_input:
    st.session_state.question = question_input

# trigger run if Ask clicked or Enter pressed
if ask_clicked:
    st.session_state.run_query = True



# ── run pipeline ─────────────────────────────────────────
if st.session_state.run_query and st.session_state.question.strip():
    st.session_state.run_query = False           # ← reset flag immediately

    with st.spinner("Reading schema → Writing SQL → Running query..."):
        status_code, data = call_api(st.session_state.question)

    if status_code != 200:
        st.error(data.get("detail", "Something went wrong."))

    else:
        # ── pipeline trace ───────────────────────────────
        st.markdown("**Pipeline trace**")
        for a in data.get("attempts", []):
            is_success = a["status"] == "success"
            icon        = "✓" if is_success else "✗"
            color       = "#f0fdf4" if is_success else "#fff5f5"
            border      = "#bbf7d0" if is_success else "#fca5a5"
            label_color = "#16a34a" if is_success else "#dc2626"
            msg = "SQL generated and executed successfully" if is_success \
                else "SQL blocked or failed — retrying"

            st.markdown(
                f"<div style='background:{color}; border:1px solid {border}; "
                f"border-radius:8px; padding:10px 14px; margin-bottom:8px;'>"
                f"<span style='color:{label_color}; font-weight:600;'>"
                f"{icon} Attempt {a['attempt']}</span> "
                f"<span style='color:#888; font-size:13px;'>{msg}</span>"
                f"<pre style='background:#f8f8f8; border-radius:4px; "
                f"padding:8px; margin:6px 0 0; font-size:12px; "
                f"white-space:pre-wrap;'>{a['sql']}</pre>"
                + (
                    f"<div style='color:#dc2626; font-size:11px; "
                    f"margin-top:4px;'>↳ {a['error']}</div>"
                    if a.get("error") else ""
                )
                + "</div>",
                unsafe_allow_html=True,
            )

        # ── generated SQL ────────────────────────────────
        st.markdown("**Generated SQL**")
        st.code(data["sql"], language="sql")

        # ── results ──────────────────────────────────────
        rows     = data.get("rows", [])
        columns  = data.get("columns", [])
        row_count = data.get("row_count", 0)

        st.markdown(
            f"**Results** "
            f"<span style='font-size:12px; color:#888;'>"
            f"{row_count} {'row' if row_count == 1 else 'rows'}</span>",
            unsafe_allow_html=True,
        )

        if rows:
            df = pd.DataFrame(rows, columns=columns)
            st.dataframe(df, use_container_width=True, hide_index=True)
        else:
            st.info("Query ran successfully but returned no rows.")

elif st.session_state.run_query and not st.session_state.question.strip():
    st.session_state.run_query = False
    st.error("Please enter a question before clicking Ask.")


# ── footer ───────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<div style='text-align:center; color:#888; font-size:12px;'>"
    "Built by <strong>Jeewan Dhamala</strong> · "
    "<a href='https://github.com/Jivandhamala22' target='_blank' "
    "style='color:#888;'>GitHub</a> · "
    "<a href='https://www.linkedin.com/in/jeewan-dhamala' target='_blank' "
    "style='color:#888;'>LinkedIn</a>"
    "</div>",
    unsafe_allow_html=True,
)