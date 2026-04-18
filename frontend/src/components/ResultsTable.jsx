export default function ResultsTable({ columns, rows, rowCount, question }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "32px",
        textAlign: "center", color: "var(--muted)", fontSize: "14px",
      }}>
        Query ran successfully but returned no rows.
      </div>
    )
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: "var(--radius)", overflow: "hidden",
    }}>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", padding: "10px 14px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg)",
      }}>
        <span style={{
          fontSize: "11px", fontWeight: "600", color: "var(--muted)",
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          Results
        </span>
        <span style={{
          fontSize: "12px", color: "var(--muted)",
          background: "var(--surface)", border: "1px solid var(--border)",
          borderRadius: "10px", padding: "2px 9px",
        }}>
          {rowCount} {rowCount === 1 ? "row" : "rows"}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse", fontSize: "13px",
        }}>
          <thead>
            <tr style={{ background: "var(--bg)" }}>
              {columns.map(col => (
                <th key={col} style={{
                  textAlign: "left", padding: "9px 14px",
                  fontWeight: "600", color: "var(--muted)",
                  fontSize: "11px", textTransform: "uppercase",
                  letterSpacing: "0.05em", whiteSpace: "nowrap",
                  borderBottom: "1px solid var(--border)",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: "1px solid var(--border)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                {row.map((cell, j) => (
                  <td key={j} style={{
                    padding: "9px 14px", color: "var(--text)",
                    fontFamily: typeof cell === "number"
                      ? "monospace" : "inherit",
                  }}>
                    {cell === null || cell === undefined
                      ? <span style={{ color: "var(--muted)", fontStyle: "italic" }}>null</span>
                      : String(cell)
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}