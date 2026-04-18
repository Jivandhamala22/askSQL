import { useState } from "react"

export default function SchemaPanel({ tables, loading }) {
const [open, setOpen] = useState(true)

if (loading) {
    return (
    <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: "var(--radius)", padding: "14px 16px",
        marginBottom: "16px", fontSize: "13px", color: "var(--muted)",
    }}>
        Loading schema...
    </div>
    )
}

if (!tables || tables.length === 0) return null

const totalRows = tables.reduce((sum, t) => sum + t.row_count, 0)

return (
<div style={{
    background: "var(--surface)", border: "1px solid var(--border)",
    borderRadius: "var(--radius)", marginBottom: "20px",
    overflow: "hidden",
}}>

    <button
        onClick={() => setOpen(o => !o)}
        style={{
        width: "100%", padding: "12px 16px",
        display: "flex", justifyContent: "space-between",
        alignItems: "center", background: "transparent",
        border: "none", cursor: "pointer",
        borderBottom: open ? "1px solid var(--border)" : "none",
        }}
    >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{
            fontSize: "11px", fontWeight: "600", color: "var(--muted)",
            textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
            Your database
        </span>
        <span style={{
            fontSize: "11px", background: "var(--bg)",
            border: "1px solid var(--border)", borderRadius: "12px",
            padding: "1px 8px", color: "var(--muted)",
        }}>
            {tables.length} tables · {totalRows} total rows
        </span>
        </div>
        <span style={{
        fontSize: "12px", color: "var(--muted)",
        transform: open ? "rotate(180deg)" : "rotate(0deg)",
        transition: "transform 0.2s",
        display: "inline-block",
        }}>
        ▾
        </span>
    </button>

    {open && (
        <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "10px", padding: "14px 16px",
        }}>
        {tables.map(t => (
            <div key={t.table} style={{
            background: "var(--bg)", border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)", padding: "10px 12px",
            }}>
            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: "8px",
            }}>
                <span style={{
                fontSize: "13px", fontWeight: "600",
                fontFamily: "monospace", color: "var(--text)",
                }}>
                {t.table}
                </span>
                <span style={{
                fontSize: "11px", color: "var(--muted)",
                background: "white", border: "1px solid var(--border)",
                borderRadius: "10px", padding: "1px 7px",
                }}>
                {t.row_count}
                </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {t.columns.map(col => (
                <div key={col.name} style={{
                    display: "flex", justifyContent: "space-between",
                    fontSize: "11px",
                }}>
                    <span style={{ color: "var(--text)", fontFamily: "monospace" }}>
                    {col.name}
                    </span>
                    <span style={{ color: "var(--muted)" }}>
                    {col.type.toLowerCase()}
                    </span>
                </div>
                ))}
            </div>
            </div>
        ))}
        </div>
    )}

    </div>
)
}