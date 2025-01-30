import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Import Navigate
import Index from "./pages/Index";
import BarberDashboard from "./pages/BarberDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import LoginPage from "./pages/LoginPage";
import AccessControlPage from "./pages/AccessControlPage"; // Import AccessControlPage
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const auth = getAuth();

  useEffect(() => {
    const checkUserAuth = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          console.log("User auth state changed:", user);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setIsAuthenticated(false);
      }
    };

    checkUserAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log("User auth state changed:", user);
        setIsAuthenticated(!!user);
    }, (error) => {
        console.error("Error in onAuthStateChanged:", error);
    });

    return () => unsubscribe();
  }, [auth]);

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
        <BrowserRouter>
          <div style={{ paddingTop: '40px' }}>
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/barber"
                element={
                  isAuthenticated ? <BarberDashboard /> : <Navigate to="/login" />
                }
              />
              <Route
                path="/manager"
                element={
                  isAuthenticated ? <ManagerDashboard /> : <Navigate to="/login" />
                }
              />
               <Route
                path="/access-control"
                element={
                  isAuthenticated ? <AccessControlPage /> : <Navigate to="/login" />
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
