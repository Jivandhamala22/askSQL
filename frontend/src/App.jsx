import { useState, useEffect } from "react"
import { askQuestion, fetchTables } from "./api/asksql"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import SchemaPanel from "./components/SchemaPanel"
import QueryInput from "./components/QueryInput"
import SQLPreview from "./components/SQLPreview"
import ResultsTable from "./components/ResultsTable"

export default function App() {
  const [result, setResult]               = useState(null)
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState(null)
  const [tables, setTables]               = useState([])
  const [schemaLoading, setSchemaLoading] = useState(true)
  const [hasSearched, setHasSearched]     = useState(false)
  const [darkMode, setDarkMode]           = useState(false)

  // apply dark mode to the HTML root element
  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme", darkMode ? "dark" : "light"
    )
  }, [darkMode])

  // load schema on first mount
  useEffect(() => {
    fetchTables()
      .then(data => setTables(data.tables))
      .catch(() => setTables([]))
      .finally(() => setSchemaLoading(false))
  }, [])

  async function handleQuestion(question) {
    setLoading(true)
    setError(null)
    setResult(null)
    setHasSearched(true)      // hide example pills from now on

    try {
      const data = await askQuestion(question)
      setResult(data)
    } catch (err) {
      setError(err.message)
      setResult(null) 
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar
        darkMode={darkMode}
        toggleDark={() => setDarkMode(d => !d)}
      />

      <main style={{
        flex: 1,
        maxWidth: "900px",
        margin: "0 auto",
        width: "100%",
        padding: "32px 20px",
      }}>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "26px", fontWeight: "700",
            marginBottom: "6px", color: "var(--text)",
          }}>
            Ask your database anything
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Type a question in plain English, QuerySQL writes the SQL,
            runs it, and shows us real results instantly.
          </p>
        </div>

        <SchemaPanel tables={tables} loading={schemaLoading} />

        <QueryInput
          onSubmit={handleQuestion}
          loading={loading}
          hasSearched={hasSearched}
        />

        {loading && (
          <div style={{
            display: "flex", gap: "6px", alignItems: "center",
            color: "var(--muted)", fontSize: "12px", margin: "14px 0",
            padding: "10px 14px", background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
          }}>
            <span style={{
              width: "8px", height: "8px", borderRadius: "50%",
              background: "#facc15", display: "inline-block",
              animation: "pulse 1s infinite",
            }} />
            Reading schema → Writing SQL → Running query...
          </div>
        )}

        {error && (
          <div style={{
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-bd)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 16px",
            color: "var(--danger)",
            fontSize: "13px",
            marginBottom: "16px",
          }}>
            <strong>Error: </strong>{error}
          </div>
        )}

        {result && !error &&(
          <div>
            <SQLPreview sql={result.sql} />
            <ResultsTable
              columns={result.columns}
              rows={result.rows}
              rowCount={result.row_count}
            />
          </div>
        )}

      </main>

      <Footer />
    </>
  )
}