import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
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
          <Link to="/profile">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                    <path d="M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                    <path d="M6 18c0-2.21 4-4 6-4s6 1.79 6 4" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold">Perfil e Métricas</h2>
                <p className="text-muted-foreground">
                  Informações do perfil
                </p>
                <Button className="w-full" variant="outline">
                  Ver Perfil
                </Button>
              </div>
            </Card>
          </Link>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M17.66 4.58a5 5 0 0 1 0 7.07M6.34 4.58a5 5 0 0 0 0 7.07m11.32 9.92a5 5 0 0 0 0-7.07M6.34 19.42a5 5 0 0 1 0-7.07"/></svg>
              </div>
              <h2 className="text-2xl font-semibold">Mapa Mind</h2>
              <p className="text-muted-foreground">
                Organiza as tuas ideias de forma visual e estratégica
              </p>
                <Button className="w-full" variant="outline" onClick={() => navigate("/mindmap")}>
                  Acessar
                </Button>
              </div>
            </Card>
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
              </div>
              <h2 className="text-2xl font-semibold">Configuração de loja</h2>
              <p className="text-muted-foreground">
                Gerencie produtos, serviços e equipe
              </p>
              <form onSubmit={handleManagerAccess} className="flex flex-col">
                <Input
                  type="text"
                  style={{ display: 'none' }}
                  autoComplete="username"
                />
                <Input
                  type="password"
                  placeholder="Senha Master"
                  value={managerPassword}
                  onChange={(e) => setManagerPassword(e.target.value)}
                  className="w-full text-center"
                  autoComplete="new-password"
                />
                <Button className="w-full" type="submit" variant="outline">
                  Entrar
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
