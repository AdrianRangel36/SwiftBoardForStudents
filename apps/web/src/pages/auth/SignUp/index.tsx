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

const API_BASE_URL = import.meta.env.VITE_API_URL;
export const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    paternalSurname: "",
    maternalSurname: "",
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

    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      setIsLoading(false);
      return;
    }

    if (!formData.paternalSurname.trim()) {
      setError("El apellido paterno es requerido");
      setIsLoading(false);
      return;
    }

    if (!formData.maternalSurname.trim()) {
      setError("El apellido materno es requerido");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("El correo electrónico es requerido");
      setIsLoading(false);
      return;
    }

    if (!formData.password || formData.password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          paternalSurname: formData.paternalSurname.trim(),
          maternalSurname: formData.maternalSurname.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("¡Cuenta creada exitosamente! Redirigiendo...");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        setError(
          data.message || "Error al crear la cuenta. Intenta nuevamente."
        );
      }
    } catch (error) {
      console.error("Error en signup:", error);
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
          <CardTitle className="text-2xl">Crear una cuenta</CardTitle>
          <CardDescription>
            Ingresa tus datos para empezar a organizar tus proyectos.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                {error}
              </div>
            )}
            {/* Campo: Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                type="text"
                placeholder="Ej. Carlos"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Grid para los apellidos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paternalSurname">Apellido Paterno</Label>
                <Input
                  id="paternalSurname"
                  type="text"
                  placeholder="Ej. López"
                  value={formData.paternalSurname}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maternalSurname">Apellido Materno</Label>
                <Input
                  id="maternalSurname"
                  type="text"
                  placeholder="Ej. García"
                  value={formData.maternalSurname}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

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
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={handleInputChange}
                required
                minLength={8}
              />
            </div>

            {/* Botón de Submit */}
            <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
              {isLoading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          {/* Enlace al Login */}
          <div className="mt-6 text-center text-sm text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 underline-offset-4 hover:text-indigo-500 hover:underline"
            >
              Inicia sesión
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
