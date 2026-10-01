export function getApiUrl(resource, codespaceName = import.meta.env.VITE_CODESPACE_NAME) {
  const name = codespaceName?.trim()
  return name
    ? `https://${name}-8000.app.github.dev/api/${resource}`
    : `/api/${resource}`
}

export async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`)
  }
  return response.json()
}

export function normalizeCollection(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  if (Array.isArray(payload?.data)) return payload.data
  return []
}