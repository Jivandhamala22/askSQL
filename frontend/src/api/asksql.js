const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function askQuestion(question) {
  const response = await fetch(`${API_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.detail || "Something went wrong")
  }

  return response.json()
}
