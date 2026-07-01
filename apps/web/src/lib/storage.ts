import type { UserData } from "@/types";

const TOKEN_KEY = "token" as const;
const USER_KEY  = "user"  as const;

export const storage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): UserData | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserData;
    } catch {
      // Si el JSON está corrupto (modificación manual del storage, etc.),
      // limpiamos la sesión en vez de crashear la app.
      localStorage.removeItem(USER_KEY);
      return null;
    }
  },

  setSession: (token: string, user: UserData): void => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearSession: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
} as const;

