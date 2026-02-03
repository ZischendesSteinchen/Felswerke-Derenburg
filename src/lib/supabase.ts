// API Client für direkte PostgreSQL-Verbindung über Backend
// Automatisch die richtige API-URL ermitteln basierend auf dem aktuellen Host
function getApiUrl(): string {
  // Wenn VITE_API_URL gesetzt ist, diese verwenden
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL
  }
  
  // Im Browser: API auf demselben Host wie Frontend, Port 3001
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    return `http://${host}:3001/api`
  }
  
  // Fallback für Development
  return 'http://localhost:3001/api'
}

const API_URL = getApiUrl()

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    return response.json()
  }

  async delete(endpoint: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
  }
}

export const api = new ApiClient(API_URL)

