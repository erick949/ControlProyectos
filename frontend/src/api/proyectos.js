/**
 * src/api/proyectos.js
 * Funciones para el CRUD de proyectos y catálogos.
 */

import { api, apiFetch } from './client'

/**
 * Lista proyectos con filtros opcionales.
 * El backend ya filtra según el rol: jefe ve todos, investigador solo los suyos.
 *
 * @param {{ search?, linea?, estado? }} filtros
 */
export async function getProyectos(filtros = {}) {
  const params = new URLSearchParams()
  if (filtros.search) params.set('search', filtros.search)
  if (filtros.linea)  params.set('linea',  filtros.linea)
  if (filtros.estado && filtros.estado !== 'Todos') params.set('estado', filtros.estado)

  const query = params.toString()
  return api.get(`/api/proyectos/${query ? '?' + query : ''}`)
}

/**
 * Crea un proyecto. Usa multipart/form-data para subir el PDF.
 *
 * @param {{ linea, nombre, descripcion, estado?, pdf: File }} data
 */
export async function crearProyecto(data) {
  const form = new FormData()
  form.append('linea',       data.linea)
  form.append('nombre',      data.nombre)
  form.append('descripcion', data.descripcion)
  form.append('estado',      data.estado || 'Activo')
  if (data.pdf) form.append('pdf', data.pdf)

  return apiFetch('/api/proyectos/', { method: 'POST', body: form })
}

/** Obtiene el detalle de un proyecto por ID. */
export async function getProyecto(id) {
  return api.get(`/api/proyectos/${id}/`)
}

/**
 * Actualiza un proyecto. Si se pasa un File en data.pdf, lo sube como multipart.
 */
export async function actualizarProyecto(id, data) {
  if (data.pdf instanceof File) {
    const form = new FormData()
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined) form.append(k, v) })
    return apiFetch(`/api/proyectos/${id}/`, { method: 'PATCH', body: form })
  }
  return api.patch(`/api/proyectos/${id}/`, data)
}

/** Elimina un proyecto (solo jefe). */
export async function eliminarProyecto(id) {
  return api.delete(`/api/proyectos/${id}/`)
}

/** Estadísticas para el Dashboard. */
export async function getEstadisticas() {
  return api.get('/api/proyectos/estadisticas/')
}

/** Catálogo de líneas de investigación. */
export async function getLineas() {
  return api.get('/api/proyectos/lineas/')
}
