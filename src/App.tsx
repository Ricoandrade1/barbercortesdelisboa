import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Index from "./pages/Index";
import BarberDashboard from "./pages/BarberDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import LoginPage from "./pages/LoginPage";
import AccessControlPage from "./pages/AccessControlPage";
import ProfilePage from "./pages/ProfilePage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const queryClient = new QueryClient();

const App = () => {
  const auth = getAuth();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Internet voltou! Sincronizando...');
      // Adicione aqui a lógica para sincronizar os dados com o Firebase
      // Por exemplo, você pode verificar se há dados locais que precisam ser enviados
      // para o Firebase e fazer a sincronização.
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (isAuthenticated === null) {
    return <div>Checking Authentication...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
          <div style={{ paddingTop: '40px' }}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/index" element={<Index />} />
              <Route
                path="/barber"
                element={
                  isAuthenticated ? <BarberDashboard /> : <Navigate to="/login" replace />
                }
              />
              <Route
                path="/manager"
                element={
                  isAuthenticated ? <ManagerDashboard /> : <Navigate to="/login" replace />
                }
              />
               <Route
                path="/access-control"
                element={
                  isAuthenticated ? <AccessControlPage /> : <Navigate to="/login" replace />
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? <ProfilePage /> : <Navigate to="/login" replace />
                }
              />
            </Routes>
          </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
