import { useState } from "react"

export default function SQLPreview({ sql }) {
  const [copied, setCopied] = useState(false)

  function copy() {
    navigator.clipboard.writeText(sql)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      background: "white",
      border: "1px solid #ddd",
      borderRadius: "10px",
      padding: "16px",
      marginBottom: "16px",
    }}>

      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
      }}>
        <span style={{ fontSize: "12px", fontWeight: "600",
          color: "#888", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          Generated SQL
        </span>
        <button
          onClick={copy}
          style={{
            fontSize: "12px", padding: "4px 10px",
            background: "transparent", border: "1px solid #ddd",
            borderRadius: "6px", cursor: "pointer", color: "#555",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <pre style={{
        background: "#f8f8f8",
        borderRadius: "6px",
        padding: "12px",
        fontSize: "13px",
        overflowX: "auto",
        whiteSpace: "pre-wrap",
        lineHeight: "1.6",
        margin: 0,
      }}>
        {sql}
      </pre>

    </div>
  )
}
