import { useState } from "react"

const EXAMPLES = [
  "How many customers are there in total?",
  "What are the top 3 products by total sales?",
  "Show total revenue per product category",
  "List all delivered orders with customer names",
  "Which customers are from Germany?",
]

// words that suggest a real database question
const DB_KEYWORDS = [
  "how many", "show", "list", "find", "get", "what", "which",
  "who", "where", "when", "count", "total", "average", "sum",
  "top", "most", "least", "highest", "lowest", "all", "orders",
  "customers", "products", "revenue", "sales", "compare",
  "between", "group", "filter", "search", "give me", "display",
]


function validate(q) {
  const lower = q.toLowerCase().trim()

  if (q.length < 10) {
    return "Question is too short — please ask a complete question."
  }
  if (q.split(" ").length < 3) {
    return "Please ask a complete question with at least 3 words."
  }
  if (!/[a-zA-Z]/.test(q)) {
    return "Question must contain actual words."
  }

  // check if it looks like a database question
  const looksLikeDBQuestion = DB_KEYWORDS.some(kw => lower.includes(kw))
  if (!looksLikeDBQuestion) {
    return "Please ask a question about your database — for example: 'Show all customers from Germany'."
  }

  return null
}


export default function QueryInput({ onSubmit, loading, hasSearched }) {
  const [question, setQuestion] = useState("")
  const [validationError, setValidationError] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const q = question.trim()

    const error = validate(q)
    if (error) {
      setValidationError(error)
      return
    }

    setValidationError(null)
    onSubmit(q)
  }

  function useExample(q) {
    setQuestion(q)
    setValidationError(null)
    onSubmit(q)
  }

  return (
    <div style={{ marginBottom: "20px" }}>

      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: "8px", marginBottom: "8px",
      }}>
        <input
          type="text"
          value={question}
          onChange={e => {
            setQuestion(e.target.value)
            if (validationError) setValidationError(null)
          }}
          placeholder="Ask your database anything in plain English..."
          disabled={loading}
          autoFocus
          style={{
            flex: 1, padding: "11px 16px", fontSize: "14px",
            border: `1px solid ${validationError ? "var(--danger)" : "var(--border)"}`,
            borderRadius: "var(--radius-sm)",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text)",
          }}
          onFocus={e => {
            if (!validationError)
              e.target.style.borderColor = "#a1a1aa"
          }}
          onBlur={e => {
            if (!validationError)
              e.target.style.borderColor = "var(--border)"
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding: "11px 22px", fontSize: "14px", fontWeight: "600",
            background: loading || !question.trim()
              ? "var(--border)" : "var(--accent)",
            color: loading || !question.trim()
              ? "var(--muted)" : "var(--accent-fg)",
            border: "none", borderRadius: "var(--radius-sm)",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      {/* inline validation error under the input */}
      {validationError && (
        <div style={{
          fontSize: "12px", color: "var(--danger)",
          marginBottom: "8px", paddingLeft: "4px",
        }}>
          {validationError}
        </div>
      )}

      {!hasSearched && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <span style={{
            fontSize: "11px", color: "var(--muted)",
            alignSelf: "center", marginRight: "2px",
          }}>
            Try:
          </span>
          {EXAMPLES.map(q => (
            <button
              key={q}
              onClick={() => useExample(q)}
              disabled={loading}
              style={{
                padding: "4px 11px", fontSize: "12px",
                background: "var(--surface)", color: "var(--muted)",
                border: "1px solid var(--border)",
                borderRadius: "20px",
              }}
              onMouseEnter={e => e.target.style.borderColor = "#a1a1aa"}
              onMouseLeave={e => e.target.style.borderColor = "var(--border)"}
            >
              {q}
            </button>
          ))}
        </div>
      )}

    </div>
  )
}