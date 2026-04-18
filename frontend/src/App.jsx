import { useState, useEffect } from "react"
import { askQuestion, fetchTables } from "./api/asksql"
import QueryInput from "./components/QueryInput"
import SQLPreview from "./components/SQLPreview"
import ResultsTable from "./components/ResultsTable"
import SchemaPanel from "./components/SchemaPanel"

export default function App() {
  // single state — only ONE thing can be shown at a time
  // { type: "result", data: {...} }
  // { type: "error",  message: "..." }
  // null = show nothing
  const [response, setResponse]           = useState(null)
  const [loading, setLoading]             = useState(false)
  const [tables, setTables]               = useState([])
  const [schemaLoading, setSchemaLoading] = useState(true)

  useEffect(() => {
    fetchTables()
      .then(data => setTables(data.tables))
      .catch(() => setTables([]))
      .finally(() => setSchemaLoading(false))
  }, [])

  async function handleQuestion(question) {
    setLoading(true)
    setResponse(null)

    if (question.trim().length < 5) {
      setResponse({
        type: "error",
        message: "Question is too short — please ask a complete question."
      })
      setLoading(false)
      return
    }

    try {
      const data = await askQuestion(question)
      setResponse({ type: "result", data })
    } catch (err) {
      const message = err instanceof Error    // ← replace from here
        ? err.message
        : typeof err === "string"
          ? err
          : "An unexpected error occurred"
      setResponse({ type: "error", message }) // ← to here
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

      <SchemaPanel tables={tables} loading={schemaLoading} />

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

      {response?.type === "error" && (
        <div style={{
          background: "#fff5f5", border: "1px solid #fca5a5",
          borderRadius: "8px", padding: "12px 16px",
          color: "#dc2626", fontSize: "14px", marginBottom: "16px",
        }}>
          {response.message}
        </div>
      )}

      {response?.type === "result" && (
        <>
          <SQLPreview sql={response.data.sql} />
          <ResultsTable
            columns={response.data.columns}
            rows={response.data.rows}
            rowCount={response.data.row_count}
          />
        </>
      )}

    </div>
  )
}