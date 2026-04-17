export default function ResultsTable({ columns, rows, rowCount }) {
  if (!rows || rows.length === 0) {
    return (
      <div style={{
        background: "white", border: "1px solid #ddd",
        borderRadius: "10px", padding: "24px", textAlign: "center",
        color: "#888", fontSize: "14px",
      }}>
        Query ran successfully but returned no rows.
      </div>
    )
  }

  return (
    <div style={{
      background: "white", border: "1px solid #ddd",
      borderRadius: "10px", padding: "16px",
    }}>

      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "12px",
      }}>
        <span style={{ fontSize: "12px", fontWeight: "600",
          color: "#888", textTransform: "uppercase", letterSpacing: "0.05em"
        }}>
          Results
        </span>
        <span style={{ fontSize: "12px", color: "#888" }}>
          {rowCount} {rowCount === 1 ? "row" : "rows"}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{
          width: "100%", borderCollapse: "collapse", fontSize: "14px",
        }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee" }}>
              {columns.map(col => (
                <th key={col} style={{
                  textAlign: "left", padding: "8px 12px",
                  fontWeight: "600", color: "#444", whiteSpace: "nowrap",
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{
                borderBottom: "1px solid #f0f0f0",
                background: i % 2 === 0 ? "white" : "#fafafa",
              }}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "8px 12px", color: "#333" }}>
                    {cell ?? <span style={{ color: "#bbb" }}>NULL</span>}
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
