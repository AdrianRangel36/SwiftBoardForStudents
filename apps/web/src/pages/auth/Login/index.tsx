import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const Login: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email.trim()) {
      setError("El correo electrónico es requerido");
      setIsLoading(false);
      return;
    }

    if (!formData.password) {
      setError("La contraseña es requerida");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        setTimeout(() => {
          navigate("/dashboard");
        }, 500);
      } else {
        setError(
          data.message || "Error al iniciar sesión. Intenta nuevamente."
        );
      }
    } catch (error) {
      console.error("Error en login:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error de conexión. Verifica tu conexión a internet."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 selection:bg-indigo-500 selection:text-white">
      <Card className="w-full max-w-md animate-in zoom-in-95 fade-in">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 shadow-sm shadow-indigo-500/30">
              <div className="h-2.5 w-2.5 rounded-full bg-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Inicia sesión</CardTitle>
          <CardDescription>
            Accede a tu cuenta para continuar organizando tus proyectos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Mensaje de error */}
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {/* Campo: Correo Electrónico */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Tu contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
            </div>

            {/* Enlace a recuperar contraseña */}
            <div className="text-right">
              <a
                href="/forgot-password"
                className="text-xs font-medium text-indigo-600 underline-offset-2 hover:text-indigo-500 hover:underline"
              >
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            {/* Botón de Submit */}
            <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>

          {/* Enlace a Sign Up */}
          <div className="mt-6 text-center text-sm text-slate-500">
            ¿No tienes una cuenta?{" "}
            <a
              href="/signup"
              className="font-medium text-indigo-600 underline-offset-4 hover:text-indigo-500 hover:underline"
            >
              Crear cuenta
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
