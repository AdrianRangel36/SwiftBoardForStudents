// ─────────────────────────────────────────────────────────────────────────────
// auth.service.ts
// Consolida los fetch de: Login/index.tsx, SignUp/index.tsx, ProtectedRoute.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { httpClient } from "./http.client";
import type { LoginDto, SignUpDto, AuthResponse } from "@/types";

export const authService = {
  /**
   * Autentica al usuario y devuelve el token + datos del usuario.
   *
   * Reemplaza el fetch inline de `Login/index.tsx` L58-67.
   * El componente sigue siendo responsable de guardar en localStorage
   * y de la navegación — el servicio solo se encarga de la comunicación.
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    return httpClient.post<AuthResponse>("/auth/login", dto);
  },

  /**
   * Registra un nuevo usuario.
   *
   * Reemplaza el fetch inline de `SignUp/index.tsx` L70-82.
   * No retorna body (el backend responde 201 sin payload útil).
   */
  async signup(dto: SignUpDto): Promise<void> {
    await httpClient.post<void>("/auth/signup", dto);
  },

  /**
   * Verifica si un JWT sigue siendo válido.
   *
   * Reemplaza el fetch de `ProtectedRoute.tsx` L18-24.
   * Retorna `boolean` en vez de lanzar — la semántica es
   * "¿es válido?" y no "hazlo o falla". Esto simplifica
   * el consumidor, que no necesita try/catch para la respuesta.
   *
   * @param token — JWT almacenado en localStorage.
   * @returns `true` si el token es válido, `false` si expiró o es inválido.
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await httpClient.get<void>("/auth/verify", token);
      return true;
    } catch {
      return false;
    }
  },
};
