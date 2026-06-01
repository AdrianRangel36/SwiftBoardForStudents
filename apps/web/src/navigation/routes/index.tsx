import { Dashboard } from "@/pages/Dashboard";
import { Home } from "@/pages/Landing/Home";
import { Login } from "@/pages/auth/Login";
import { SignUp } from "@/pages/auth/SignUp";
import { Routes, Route } from "react-router-dom";

export const AppRouter = (): React.ReactElement => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/SignUp" element={<SignUp />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Dashboard" element={<Dashboard />} />
      <Route
        path="*"
        element={
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="mb-4 text-4xl font-bold text-gray-800">404</h1>
              <p className="text-xl text-gray-600">Página no encontrada</p>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
