import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const navigate = useNavigate();
  const [managerPassword, setManagerPassword] = useState("");

  const handleManagerAccess = (event: React.FormEvent) => {
    event.preventDefault();
    if (managerPassword === "Naoseisenha.1") {
      navigate("/manager");
    } else if (managerPassword === "Gerente2025") {
      navigate("/manager");
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Senha incorreta.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto text-center space-y-8 animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold text-primary">
          Boss Wallet
        </h1>
        <p className="text-lg text-muted-foreground">
          Selecione seu portal de acesso
        </p>
        
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/barber")}>
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 20L11 4L13 4L17 20" />
                  <path d="M7 13L17 13" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Portal do Barbeiro</h2>
              <p className="text-muted-foreground">
                Acesse suas métricas de produção e histórico de serviços
              </p>
              <Button className="w-full" variant="outline">
                Entrar como Barbeiro
              </Button>
            </div>
          </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 4L12 20" />
                  <path d="M4 12L20 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold">Portal do Gerente</h2>
              <p className="text-muted-foreground">
                Gerencie produtos, serviços e equipe
              </p>
              <form onSubmit={handleManagerAccess} className="flex flex-col">
                <Input
                  type="password"
                  placeholder="Senha Master"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full text-center"
                />
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
