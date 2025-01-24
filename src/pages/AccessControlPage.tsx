import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const AccessControlPage = () => {
  const navigate = useNavigate();
  const [managerPassword, setManagerPassword] = useState("");

  const handleBarberPortal = () => {
    navigate("/barber");
  };

  const handleManagerLogin = async () => {
    try {
      if (managerPassword === "Gerente2025") {
        navigate("/manager");
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Senha incorreta",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary">Cortes de Lisboa</h1>
        <p className="text-muted-foreground">Selecione seu portal de acesso</p>
      </div>
      <div className="flex space-x-4">
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="rounded-full bg-blue-500 text-white w-12 h-12 flex items-center justify-center mb-4">
            A
          </div>
          <h2 className="text-lg font-semibold">Portal do Barbeiro</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Acesse suas métricas de produção e histórico de serviços
          </p>
          <Button onClick={handleBarberPortal}>Entrar como Barbeiro</Button>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <div className="rounded-full bg-yellow-500 text-white w-12 h-12 flex items-center justify-center mb-4">
            +
          </div>
          <h2 className="text-lg font-semibold">Portal do Gerente</h2>
          <p className="text-sm text-muted-foreground text-center mb-4">
            Gerencie produtos, serviços e equipe
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Senha do gerente"
              value={managerPassword}
              onChange={(e) => setManagerPassword(e.target.value)}
            />
            <Button onClick={handleManagerLogin} disabled={!managerPassword}>
              Entrar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AccessControlPage;
