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
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
  }, [auth]);

  if (isAuthenticated === null) {
    return <div>Checking Authentication...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="body-with-padding">
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
