export default function SchemaPanel({ tables, loading }) {

    if (loading) {
      return (
        <div style={{
          background: "white", border: "1px solid #ddd",
          borderRadius: "10px", padding: "16px",
          color: "#aaa", fontSize: "13px",
        }}>
          Loading schema...
        </div>
      )
    }
  
    if (!tables || tables.length === 0) return null
  
    return (
      <div style={{
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "24px",
      }}>
  
        <div style={{
          fontSize: "12px", fontWeight: "600", color: "#888",
          textTransform: "uppercase", letterSpacing: "0.05em",
          marginBottom: "12px",
        }}>
          Your database — {tables.length} tables
        </div>
  
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {tables.map(t => (
            <div key={t.table} style={{
              background: "#fafafa",
              border: "1px solid #eee",
              borderRadius: "8px",
              padding: "10px 12px",
            }}>
  
              <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "6px",
              }}>
                <span style={{
                  fontSize: "13px", fontWeight: "600",
                  fontFamily: "monospace", color: "#1a1a1a",
                }}>
                  {t.table}
                </span>
                <span style={{
                  fontSize: "11px", color: "#888",
                  background: "#eee", borderRadius: "12px",
                  padding: "2px 8px",
                }}>
                  {t.row_count} {t.row_count === 1 ? "row" : "rows"}
                </span>
              </div>
  
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {t.columns.map(col => (
                  <span key={col.name} style={{
                    fontSize: "11px",
                    background: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    padding: "2px 7px",
                    color: "#555",
                  }}>
                    {col.name}
                    <span style={{ color: "#aaa", marginLeft: "3px" }}>
                      {col.type.toLowerCase()}
                    </span>
                  </span>
                ))}
              </div>
  
            </div>
          ))}
        </div>
  
      </div>
    )
  }