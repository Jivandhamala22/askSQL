import { useState } from "react"

const EXAMPLES = [
  "How many customers are there in total?",
  "What are the top 3 products by total sales?",
  "Show total revenue per product category",
  "List all delivered orders with customer names",
  "Which customers are from Germany?",
]

export default function QueryInput({ onSubmit, loading, hasSearched }) {
  const [question, setQuestion] = useState("")

  function handleSubmit(e) {
    e.preventDefault()
    const q = question.trim()
    if (q) onSubmit(q)
  }

  function useExample(q) {
    setQuestion(q)
    onSubmit(q)
  }

  return (
    <div style={{ marginBottom: "20px" }}>

      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: "8px", marginBottom: "10px",
      }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask your database anything in plain English..."
          disabled={loading}
          autoFocus
          style={{
            flex: 1, padding: "11px 16px", fontSize: "14px",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            outline: "none",
            background: "var(--surface)",
            color: "var(--text)",
          }}
          onFocus={e => e.target.style.borderColor = "#a1a1aa"}
          onBlur={e  => e.target.style.borderColor = "var(--border)"}
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

      {/* hide example pills once the user has searched */}
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