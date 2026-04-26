export default function PipelineSteps({ attempts, loading }) {

    // while loading show animated steps
    if (loading) {
    return (
        <div style={{
        display: "flex", gap: "6px", alignItems: "center",
        margin: "16px 0", flexWrap: "wrap",
        }}>
        {["Reading schema", "Writing SQL", "Running query"].map((step, i) => (
            <span key={step} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{
                fontSize: "12px", padding: "4px 10px",
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: "20px", color: "var(--muted)",
                animation: "pulse 1.5s infinite",
                animationDelay: `${i * 0.3}s`,
            }}>
                {step}
            </span>
            {i < 2 && <span style={{ color: "var(--border)", fontSize: "12px" }}>→</span>}
            </span>
        ))}
        <style>{`
            @keyframes pulse {
            0%, 100% { opacity: 0.4; }
            50%       { opacity: 1;   }
            }
        `}</style>
        </div>
    )
    }

    // after response — show real attempt results
    if (!attempts || attempts.length === 0) return null

    return (
    <div style={{ margin: "16px 0" }}>

        <div style={{
        fontSize: "11px", fontWeight: "600", color: "var(--muted)",
        textTransform: "uppercase", letterSpacing: "0.06em",
        marginBottom: "8px",
        }}>
        Pipeline trace
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        {attempts.map((a) => (
            <div key={a.attempt} style={{
            background: "var(--surface)",
            border: `1px solid ${a.status === "success" ? "#bbf7d0" : "#fca5a5"}`,
            borderRadius: "8px",
            padding: "10px 12px",
            }}>

            <div style={{
                display: "flex", justifyContent: "space-between",
                alignItems: "center", marginBottom: a.error ? "6px" : "0",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{
                    fontSize: "10px", fontWeight: "600",
                    padding: "2px 7px", borderRadius: "4px",
                    background: a.status === "success" ? "#f0fdf4" : "#fff5f5",
                    color: a.status === "success" ? "#16a34a" : "#dc2626",
                }}>
                    {a.status === "success" ? "✓" : "✗"} Attempt {a.attempt}
                </span>
                <span style={{
                    fontSize: "11px", color: "var(--muted)",
                }}>
                    {a.status === "success"
                    ? "SQL generated and executed successfully"
                    : "SQL blocked or failed — retrying"}
                </span>
                </div>
            </div>

              {/* show the SQL that was generated */}
            <pre style={{
                fontSize: "11px", background: "var(--bg)",
                borderRadius: "4px", padding: "6px 8px",
                margin: "6px 0 0", overflowX: "auto",
                whiteSpace: "pre-wrap", color: "var(--text)",
                lineHeight: "1.5",
            }}>
                {a.sql}
            </pre>

              {/* show the error if it failed */}
            {a.error && (
                <div style={{
                fontSize: "11px", color: "#dc2626",
                marginTop: "4px", paddingLeft: "2px",
                }}>
                ↳ {a.error}
                </div>
            )}

            </div>
        ))}
        </div>
    </div>
    )
}