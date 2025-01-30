import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, getAuth, sendPasswordResetEmail, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/integrations/firebase/firebase-config";
import { addBarber } from "@/integrations/firebase/firebase-db";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [unit, setUnit] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/barber-dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate("/barber-dashboard");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
          title: "Login efetuado com sucesso!",
          description: "Redirecionando para a página principal...",
        });
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast({
          title: "Conta registada com sucesso!",
          description: "Pode agora iniciar sessão com a sua nova conta.",
        });
        await addBarber({
          email: email,
          name: "New Barber",
          phone: isLogin ? "" : phone,
          unit: isLogin ? "" : unit,
          balance: 0,
        });
        setIsLogin(true); // Switch to login after registration
      }
      // After successful auth, navigate to access control page
      navigate("/access-control"); // Redirect to access control page
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: isLogin ? "Erro ao iniciar sessão" : "Erro ao registar conta",
        description: error.message,
      });
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao enviar email",
        description: error.message,
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Logout efetuado com sucesso!",
        description: "Sessão terminada.",
      });
      navigate("/"); // Redirect to home or login page after logout
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao fazer logout",
        description: error.message,
      });
    }
  };


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 overflow-y-auto overflow-x-hidden">
      <div className="fixed top-0 right-0 p-2 z-50 flex flex-col items-end">
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-2 pb-4">
          <CardTitle>{isLogin ? "Iniciar Sessão" : "Registar Conta"}</CardTitle>
          <CardDescription>Entre com as suas credenciais para aceder à plataforma</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 overflow-y-auto max-h-[400px]">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="text"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  key="email-input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  key="password-input"
                />
              </div>
              {!isLogin && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="text"
                      placeholder="Seu telefone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unit">Unidade</Label>
                    <select
                      id="unit"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="">Selecione uma unidade</option>
                      <option value="Alcântara">Alcântara</option>
                      <option value="Alegro Alfragide">Alegro Alfragide</option>
                      <option value="CascaiShopping">CascaiShopping</option>
                      <option value="Colombo">Colombo</option>
                      <option value="LoureShopping">LoureShopping</option>
                      <option value="Alegro Sintra">Alegro Sintra</option>
                      <option value="Braga Parque">Braga Parque</option>
                      <option value="Évora Plaza">Évora Plaza</option>
                      <option value="Forum Coimbra">Forum Coimbra</option>
                      <option value="LeiriaShopping">LeiriaShopping</option>
                    </select>
                  </div>
                </>
              )}
              <Button type="submit" className="mt-4">{isLogin ? "Iniciar Sessão" : "Registar"}</Button>
            </div>
          </form>
          <div className="flex justify-center text-sm">
            <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? "Criar uma conta" : "Já tenho conta"}
            </Button>
          </div>
          <div className="flex justify-center text-sm">
            <Button
              variant="link"
              onClick={() => {
                if (!email) {
                  toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Por favor, insira seu email primeiro.",
                  });
                  return;
                }
                handlePasswordReset(email);
              }}
            >
              Esqueceu sua senha?
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
