import { useState } from "react"

const EXAMPLES = [
  "How many customers are there in total?",
  "What are the top 3 products by total sales?",
  "Show total revenue per product category",
  "List all delivered orders with customer names",
  "Which customers are from Germany?",
]

export default function QueryInput({ onSubmit, loading }) {
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
    <div style={{ marginBottom: "24px" }}>

      <form onSubmit={handleSubmit} style={{
        display: "flex", gap: "8px", marginBottom: "12px"
      }}>
        <input
          type="text"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask your database anything in plain English..."
          disabled={loading}
          autoFocus
          style={{
            flex: 1,
            padding: "12px 16px",
            fontSize: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            background: "white",
          }}
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding: "12px 24px",
            fontSize: "15px",
            fontWeight: "500",
            background: loading ? "#ccc" : "#1a1a1a",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </form>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
        {EXAMPLES.map(q => (
          <button
            key={q}
            onClick={() => useExample(q)}
            disabled={loading}
            style={{
              padding: "5px 12px",
              fontSize: "12px",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "20px",
              cursor: "pointer",
              color: "#555",
            }}
          >
            {q}
          </button>
        ))}
      </div>

    </div>
  )
}
