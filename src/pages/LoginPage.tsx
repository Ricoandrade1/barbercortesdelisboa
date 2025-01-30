import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/integrations/firebase/firebase-config";
import { toast } from "@/hooks/use-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const emailInputRef = useRef(null);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/access-control");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login efetuado com sucesso!",
        description: "Redirecionando para a página principal...",
      });
      navigate("/barber");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao iniciar sessão",
        description: error.message,
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 overflow-y-auto overflow-x-hidden">
      <div className="w-full max-w-md p-6 bg-white rounded-md shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar Sessão</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              ref={emailInputRef}
              type="email"
              id="email"
              placeholder="seuemail@exemplo.com"
              value={email}
              onChange={(e) => {
                console.log("Email input changed:", e.target.value);
                setEmail(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                console.log("Password input changed:", e.target.value);
                setPassword(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-light">
            Iniciar Sessão
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
