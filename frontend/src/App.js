import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./components/ThemeToggle";
import { ToastProvider } from "./components/Toast";
import Catalogo from "./components/Catalogo";
import AdminPanel from "./components/AdminPanel";
import Login from "./components/Login";

// Componente de ruta protegida
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F0E8] via-[#EDE6DB] to-[#E5DED3] dark:from-[#0f172a] dark:via-[#1e293b] dark:to-[#0f172a]">
        <div className="w-10 h-10 border-4 border-[#C9A96E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Catálogo público - Ruta principal */}
      <Route path="/" element={<Catalogo />} />
      
      {/* Panel de administración - Requiere autenticación */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        }
      />

      {/* Ruta de respaldo para cliente */}
      <Route path="/cliente" element={<Navigate to="/" replace />} />
      
      {/* Cualquier otra ruta redirige al catálogo */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
