const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function askQuestion(question) {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    const body = await response.json()

    let message
    if (typeof body.detail === "string") {
      // normal FastAPI error: { "detail": "some message" }
      message = body.detail
    } else if (Array.isArray(body.detail)) {
      // Pydantic validation error: [{ "msg": "...", "loc": [...] }]
      message = body.detail.map(e => e.msg).join(", ")
    } else {
      message = "Something went wrong"
    }

    throw new Error(message)
  }

  return response.json()
}

export async function fetchTables() {
  const response = await fetch(`${API_URL}/tables`)
  if (!response.ok) throw new Error("Could not load schema")
  return response.json()
}