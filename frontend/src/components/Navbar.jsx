import { useState } from "react"

function AboutModal({ onClose, darkMode }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "var(--surface)", borderRadius: "12px",
          border: "1px solid var(--border)", padding: "28px",
          maxWidth: "480px", width: "100%",
        }}
      >
        <div style={{
          display: "flex", justifyContent: "space-between",
          alignItems: "flex-start", marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "36px", height: "36px", background: "var(--accent)",
              borderRadius: "8px", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              <span style={{
                color: "var(--accent-fg)", fontSize: "13px",
                fontWeight: "700", fontFamily: "monospace",
              }}>Q</span>
            </div>
            <div>
              <div style={{ fontWeight: "700", fontSize: "16px" }}>QuerySQL</div>
              <div style={{ fontSize: "12px", color: "var(--muted)" }}>v1.0 · beta</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "none",
              fontSize: "20px", color: "var(--muted)", lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <p style={{
          fontSize: "14px", color: "var(--muted)", lineHeight: "1.7",
          marginBottom: "16px",
        }}>
          QuerySQL translates plain English questions into SQL queries
          and runs them against your real database instantly, with no
          SQL knowledge required.
        </p>

        <div style={{
          background: "var(--bg)", borderRadius: "8px",
          padding: "14px", marginBottom: "16px",
        }}>
          <div style={{
            fontSize: "11px", fontWeight: "600", color: "var(--muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
            marginBottom: "10px",
          }}>
            How it works
          </div>
          {[
            ["1", "We ask a question in plain English"],
            ["2", "Schema Agent retrieves relevant tables using RAG"],
            ["3", "SQL Writer generates a query via Groq LLM"],
            ["4", "SQL Executor runs it safely, SELECT  statement only"],
            ["5", "Results appear in the browser instantly"],
          ].map(([n, text]) => (
            <div key={n} style={{
              display: "flex", gap: "10px", alignItems: "flex-start",
              marginBottom: "6px",
            }}>
              <span style={{
                width: "20px", height: "20px", borderRadius: "50%",
                background: "var(--surface)", border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "10px", fontWeight: "600", color: "var(--muted)",
                flexShrink: 0, marginTop: "1px",
              }}>{n}</span>
              <span style={{ fontSize: "13px", color: "var(--text)", lineHeight: "1.5" }}>
                {text}
              </span>
            </div>
          ))}
        </div>

        <div style={{
          fontSize: "12px", color: "var(--muted)",
          borderTop: "1px solid var(--border)", paddingTop: "12px",
        }}>
          Built with Python · FastAPI · LangChain · ChromaDB · React · Groq API
        </div>
      </div>
    </div>
  )
}

export default function Navbar({ darkMode, toggleDark }) {
  const [showAbout, setShowAbout] = useState(false)

  return (
    <>
      <nav style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: "56px",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 100,
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "28px", height: "28px", background: "var(--accent)",
            borderRadius: "6px", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              color: "var(--accent-fg)", fontSize: "13px",
              fontWeight: "700", fontFamily: "monospace",
            }}>G</span>
          </div>
          <span style={{ fontWeight: "700", fontSize: "16px" }}>
            QuerySQL
          </span>
          <span style={{
            fontSize: "11px", background: "#f0fdf4",
            color: "#16a34a", border: "1px solid #bbf7d0",
            borderRadius: "12px", padding: "2px 8px", fontWeight: "500",
          }}>
            beta
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          <button
            onClick={() => setShowAbout(true)}
            style={{
              padding: "6px 14px", fontSize: "13px",
              background: "transparent",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              color: "var(--muted)",
            }}
          >
            About
          </button>

          <button
            onClick={toggleDark}
            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: "36px", height: "36px", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)", background: "transparent",
              fontSize: "16px", display: "flex",
              alignItems: "center", justifyContent: "center",
              color: "var(--muted)",
            }}
          >
            {darkMode ? "☀" : "☾"}
          </button>

        </div>
      </nav>

      {showAbout && (
        <AboutModal onClose={() => setShowAbout(false)} darkMode={darkMode} />
      )}
    </>
  )
}