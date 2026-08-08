/**
 * src/api/usuarios.js
 * Funciones para gestión de investigadores (solo jefe).
 */

import { api, apiFetch } from './client'

/** Lista investigadores. Acepta filtro ?search=nombre */
export async function getInvestigadores(search = '') {
  const query = search ? `?search=${encodeURIComponent(search)}` : ''
  return api.get(`/api/usuarios/${query}`)
}

/**
 * Crea un investigador. Si se incluye un avatar (File), usa multipart.
 *
 * @param {{ email, nombre, password, perfil: { clave, area_participacion, division, linea_investigacion, avatar? } }} data
 */
export async function crearInvestigador(data) {
  if (data.perfil?.avatar instanceof File) {
    const form = new FormData()
    form.append('email',    data.email)
    form.append('nombre',   data.nombre)
    form.append('password', data.password || '')
    // Perfil anidado: DRF acepta perfil.campo en multipart
    Object.entries(data.perfil).forEach(([k, v]) => {
      if (v !== undefined) form.append(`perfil.${k}`, v)
    })
    return apiFetch('/api/usuarios/', { method: 'POST', body: form })
  }
  return api.post('/api/usuarios/', data)
}

/** Detalle de un investigador. */
export async function getInvestigador(id) {
  return api.get(`/api/usuarios/${id}/`)
}

/** Actualiza un investigador (parcial). */
export async function actualizarInvestigador(id, data) {
  return api.patch(`/api/usuarios/${id}/`, data)
}

/** Elimina un investigador. */
export async function eliminarInvestigador(id) {
  return api.delete(`/api/usuarios/${id}/`)
}

/** Activa o desactiva la cuenta de un investigador. */
export async function toggleActivarInvestigador(id) {
  return api.post(`/api/usuarios/${id}/activar/`, {})
}
