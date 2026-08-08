/**
 * src/api/client.js
 *
 * Cliente HTTP centralizado para todas las llamadas al backend Django.
 * - Añade automáticamente el token JWT a cada petición.
 * - Renueva el access token cuando expira (usando el refresh token).
 * - Si la renovación falla, cierra sesión automáticamente.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// ─── Helpers de localStorage ────────────────────────────────────────────────

export function getAccessToken()  { return localStorage.getItem('access') }
export function getRefreshToken() { return localStorage.getItem('refresh') }

export function saveTokens({ access, refresh }) {
  localStorage.setItem('access', access)
  if (refresh) localStorage.setItem('refresh', refresh)
}

export function clearTokens() {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('session')
}

export function saveSession(session) {
  localStorage.setItem('session', JSON.stringify(session))
}

export function loadSession() {
  try {
    return JSON.parse(localStorage.getItem('session'))
  } catch {
    return null
  }
}

// ─── Renovación de token ─────────────────────────────────────────────────────

let isRefreshing = false
let refreshQueue = []   // promesas en espera mientras se renueva el token

async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) throw new Error('Sin refresh token')

  const res = await fetch(`${BASE_URL}/api/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!res.ok) {
    clearTokens()
    window.location.href = '/login'
    throw new Error('Sesión expirada')
  }

  const data = await res.json()
  saveTokens({ access: data.access, refresh: data.refresh })
  return data.access
}

// ─── Fetch con reintentos ────────────────────────────────────────────────────

/**
 * apiFetch(path, options)
 *
 * Llama a BASE_URL + path con el token JWT en el header Authorization.
 * Si recibe 401, intenta renovar el token una vez y reintenta.
 *
 * @param {string} path  - p.ej. '/api/proyectos/'
 * @param {RequestInit} options
 * @returns {Promise<any>} - JSON parseado o null si la respuesta es 204
 */
export async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`

  const makeHeaders = (token) => {
    const headers = { ...options.headers }
    if (token) headers['Authorization'] = `Bearer ${token}`
    // Solo añade Content-Type si no es FormData (multipart lo pone el browser solo)
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }
    return headers
  }

  // Primera llamada
  let token = getAccessToken()
  let res = await fetch(url, { ...options, headers: makeHeaders(token) })

  // Si recibimos 401, intentar renovar token
  if (res.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true
      try {
        token = await refreshAccessToken()
        refreshQueue.forEach(resolve => resolve(token))
      } catch (err) {
        refreshQueue.forEach(reject => reject(err))
        throw err
      } finally {
        isRefreshing = false
        refreshQueue = []
      }
    } else {
      // Encolar mientras otro hilo ya está renovando
      token = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      })
    }

    // Reintentar con el nuevo token
    res = await fetch(url, { ...options, headers: makeHeaders(token) })
  }

  // Sin contenido (DELETE, logout, etc.)
  if (res.status === 204) return null

  const data = await res.json()

  if (!res.ok) {
    // Lanza un error con el cuerpo de la respuesta para mostrarlo en el UI
    const error = new Error(data?.detail || 'Error en la petición')
    error.data = data
    error.status = res.status
    throw error
  }

  return data
}

// ─── Métodos de conveniencia ─────────────────────────────────────────────────

export const api = {
  get:    (path)         => apiFetch(path, { method: 'GET' }),
  post:   (path, body)   => apiFetch(path, { method: 'POST',   body: body instanceof FormData ? body : JSON.stringify(body) }),
  put:    (path, body)   => apiFetch(path, { method: 'PUT',    body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch:  (path, body)   => apiFetch(path, { method: 'PATCH',  body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (path)         => apiFetch(path, { method: 'DELETE' }),
}
