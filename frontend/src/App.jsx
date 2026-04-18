import { useState, useEffect } from "react"
import { askQuestion, fetchTables } from "./api/asksql"
import QueryInput from "./components/QueryInput"
import SQLPreview from "./components/SQLPreview"
import ResultsTable from "./components/ResultsTable"
import SchemaPanel from "./components/SchemaPanel"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

export default function App() {
  const [response, setResponse]           = useState(null)
  const [loading, setLoading]             = useState(false)
  const [tables, setTables]               = useState([])
  const [schemaLoading, setSchemaLoading] = useState(true)
  const [darkMode, setDarkMode]           = useState(false)

  // apply dark class to <body> whenever darkMode changes
  useEffect(() => {
    document.body.classList.toggle("dark", darkMode)
  }, [darkMode])

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
      const message = err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "An unexpected error occurred"
      setResponse({ type: "error", message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "var(--bg)",
    }}>

      {/* ── sticky top navbar ── */}
      <Navbar darkMode={darkMode} toggleDark={() => setDarkMode(d => !d)} />

      {/* ── main content ── */}
      <main style={{
        flex: 1,
        maxWidth: "860px",
        width: "100%",
        margin: "0 auto",
        padding: "40px 20px",
      }}>

        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>
            AskSQL
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "15px" }}>
            Ask your database anything in plain English.
          </p>
        </div>

        <SchemaPanel tables={tables} loading={schemaLoading} />

        <QueryInput onSubmit={handleQuestion} loading={loading} />

        {loading && (
          <div style={{
            display: "flex", gap: "8px", alignItems: "center",
            color: "var(--muted)", fontSize: "13px", margin: "16px 0",
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

      </main>

      {/* ── footer ── */}
      <Footer />

    </div>
  )
}