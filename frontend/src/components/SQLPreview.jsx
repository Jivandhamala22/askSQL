import { useState } from "react"

export default function SQLPreview({ sql, question }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", marginBottom: "12px",
      overflow: "hidden",
    }}>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            fontSize: "11px", fontWeight: "600", color: "var(--muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Generated SQL
          </span>
          <span style={{
            fontSize: "11px", background: "#f0fdf4",
            color: "var(--success)", border: "1px solid #bbf7d0",
            borderRadius: "10px", padding: "1px 8px",
          }}>
            SELECT only
          </span>
        </div>
        <button
          onClick={copy}
          style={{
            fontSize: "12px", padding: "4px 10px",
            background: "var(--surface)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", color: "var(--muted)",
            transition: "border-color 0.15s",
          }}
        >
          {copied ? "Copied ✓" : "Copy"}
        </button>
      </div>

      <pre style={{
        padding: "14px 16px", fontSize: "13px", lineHeight: "1.7",
        overflowX: "auto", whiteSpace: "pre-wrap",
        color: "var(--text)", margin: 0,
        background: "var(--surface)",
      }}>
        {sql}
      </pre>

    </div>
  )
}