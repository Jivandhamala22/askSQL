import { useState } from "react"
import { askQuestion } from "./api/asksql"
import QueryInput from "./components/QueryInput"
import SQLPreview from "./components/SQLPreview"
import ResultsTable from "./components/ResultsTable"

export default function App() {
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  async function handleQuestion(question) {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await askQuestion(question)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "40px 20px" }}>

      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>
          AskSQL
        </h1>
        <p style={{ color: "#666", fontSize: "15px" }}>
          Ask your database anything in plain English.
        </p>
      </div>

      <QueryInput onSubmit={handleQuestion} loading={loading} />

      {loading && (
        <div style={{
          display: "flex", gap: "8px", alignItems: "center",
          color: "#888", fontSize: "13px", margin: "16px 0",
        }}>
          <span>Reading schema</span>
          <span>→</span>
          <span>Writing SQL</span>
          <span>→</span>
          <span>Running query...</span>
        </div>
      )}

      {error && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fca5a5",
          borderRadius: "8px", padding: "12px 16px",
          color: "#dc2626", fontSize: "14px", marginBottom: "16px",
        }}>
          {error}
        </div>
      )}

      {result && (
        <>
          <SQLPreview sql={result.sql} />
          <ResultsTable
            columns={result.columns}
            rows={result.rows}
            rowCount={result.row_count}
          />
        </>
      )}

    </div>
  )
}