// ─────────────────────────────────────────────────────────────────────────────
// http.client.ts
// Cliente HTTP genérico — ÚNICO punto donde se importa API_URL y se usa fetch.
//
// Responsabilidades:
//   1. Construir la URL completa (API_URL + path).
//   2. Adjuntar headers de autenticación cuando se recibe un token.
//   3. Lanzar un Error con el mensaje del backend si la respuesta NO es ok.
//   4. Parsear el body de forma segura (respuestas 204 / body vacío → null).
//
// Principio D (Dependency Inversion):
//   Los servicios de dominio (auth, tasks, team, teamMembers) dependen de
//   esta abstracción — no de `fetch` directamente. Si mañana se reemplaza
//   fetch por axios u otro cliente, solo se toca este archivo.
// ─────────────────────────────────────────────────────────────────────────────

import { API_URL } from "@/config/api.config";

// ── Helpers privados ─────────────────────────────────────────────────────────

/**
 * Construye los headers para la petición.
 * - Siempre añade `Content-Type: application/json` (salvo en GET/DELETE sin body,
 *   pero el backend lo ignora si no hay body, así que es inofensivo).
 * - Si se proporciona `token`, añade `Authorization: Bearer <token>`.
 */
const buildHeaders = (token?: string): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Lee el body de la respuesta de forma segura.
 * - Si el status es 204 (No Content) o el body está vacío, retorna `null`.
 * - De lo contrario, intenta parsear como JSON.
 */
const safeJson = async <T>(res: Response): Promise<T | null> => {
  if (res.status === 204) return null;

  const text = await res.text();
  if (!text) return null;

  return JSON.parse(text) as T;
};

/**
 * Valida que la respuesta sea exitosa.
 * Si no lo es, intenta extraer el `message` del body para dar contexto.
 */
const assertOk = async (res: Response): Promise<void> => {
  if (res.ok) return;

  // Intentamos leer el mensaje de error del backend
  let serverMessage = "";
  try {
    const body = await res.json();
    serverMessage = body?.message ?? "";
  } catch {
    // El body no era JSON — usamos statusText como fallback
  }

  throw new Error(
    serverMessage || `HTTP ${res.status}: ${res.statusText}`,
  );
};

// ── Cliente público ──────────────────────────────────────────────────────────

export const httpClient = {
  /**
   * GET request.
   * @returns El body parseado como `T`, o `null` si la respuesta está vacía.
   */
  async get<T>(path: string, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: buildHeaders(token),
    });

    await assertOk(res);
    return (await safeJson<T>(res)) as T;
  },

  /**
   * POST request.
   * @param body — Objeto que se serializa como JSON.
   */
  async post<T>(path: string, body: unknown, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    await assertOk(res);
    return (await safeJson<T>(res)) as T;
  },

  /**
   * PUT request.
   * @param body — Objeto que se serializa como JSON.
   */
  async put<T>(path: string, body: unknown, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: buildHeaders(token),
      body: JSON.stringify(body),
    });

    await assertOk(res);
    return (await safeJson<T>(res)) as T;
  },

  /**
   * DELETE request.
   * Acepta un `body` opcional porque algunos endpoints del backend
   * (e.g. `/team-members/leaveteam`) esperan payload en DELETE.
   */
  async del<T>(path: string, token?: string, body?: unknown): Promise<T> {
    const options: RequestInit = {
      method: "DELETE",
      headers: buildHeaders(token),
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_URL}${path}`, options);

    await assertOk(res);
    return (await safeJson<T>(res)) as T;
  },
};
