/**
 * src/api/auth.js
 * Funciones de autenticación.
 */

import { api, saveTokens, saveSession, clearTokens } from './client'

/**
 * Inicia sesión. Guarda tokens y session en localStorage.
 * @returns {{ role, nombre, email, id }}
 */
export async function login(usuario, contrasena) {
  const data = await api.post('/api/auth/login/', { usuario, contrasena })
  saveTokens({ access: data.access, refresh: data.refresh })
  const session = { role: data.role, nombre: data.nombre, email: data.email, id: data.id }
  saveSession(session)
  return session
}

/** Invalida el refresh token en el servidor y limpia localStorage. */
export async function logout(refreshToken) {
  try {
    await api.post('/api/auth/logout/', { refresh: refreshToken })
  } catch {
    // Ignorar errores de red en logout
  } finally {
    clearTokens()
  }
}

/** Registro público de un investigador nuevo (sin estar autenticado). */
export async function registroPublico(formData) {
  return api.post('/api/auth/registro/', formData)
}

/** Devuelve los datos del usuario autenticado actualmente. */
export async function getMe() {
  return api.get('/api/auth/me/')
}

/** Cambia la contraseña del usuario autenticado. */
export async function changePassword(oldPassword, newPassword) {
  return api.post('/api/auth/change-password/', {
    old_password: oldPassword,
    new_password: newPassword,
  })
}
