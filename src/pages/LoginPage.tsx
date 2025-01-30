import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/integrations/firebase/firebase-config";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { addBarber } from "@/integrations/firebase/firebase-db";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [openCreateAccountModal, setOpenCreateAccountModal] = useState(false);
  const [openForgotPasswordModal, setOpenForgotPasswordModal] = useState(false);
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
          <div className="flex justify-between mt-4">
            <button type="button" className="text-primary hover:underline focus:outline-none" onClick={() => setOpenCreateAccountModal(true)}>
              Criar conta
            </button>
            <button type="button" className="text-primary hover:underline focus:outline-none" onClick={() => setOpenForgotPasswordModal(true)}>
              Esqueci a senha
            </button>
          </div>
        </form>
        <AlertDialog open={openCreateAccountModal} onOpenChange={setOpenCreateAccountModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Criar Conta</AlertDialogTitle>
              <AlertDialogDescription>
                Preencha os campos abaixo para criar uma nova conta.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
                <div>
                  <label htmlFor="create-email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="create-email"
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="create-password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                  <input
                    type="password"
                    id="create-password"
                    className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="create-unidade" className="block text-gray-700 text-sm font-bold mb-2">Unidade</label>
                  <select
                    id="create-unidade"
                    className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="alcantara">Alcântara</option>
                    <option value="alegro-alfragide">Alegro Alfragide</option>
                    <option value="cascaishopping">CascaiShopping</option>
                    <option value="colombo">Colombo</option>
                    <option value="loureshopping">LoureShopping</option>
                    <option value="alegro-sintra">Alegro Sintra</option>
                    <option value="braga-parque">Braga Parque</option>
                    <option value="evora-plaza">Évora Plaza</option>
                    <option value="forum-coimbra">Forum Coimbra</option>
                    <option value="leiria-shopping">LeiriaShopping</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="create-telefone" className="block text-gray-700 text-sm font-bold mb-2">Telefone</label>
                  <input
                    type="tel"
                    id="create-telefone"
                    placeholder="912345678"
                    className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                const createEmail = (document.getElementById('create-email') as HTMLInputElement).value;
                const createPassword = (document.getElementById('create-password') as HTMLInputElement).value;
                const createUnidade = (document.getElementById('create-unidade') as HTMLSelectElement).value;
                const createTelefone = (document.getElementById('create-telefone') as HTMLInputElement).value;
                try {
                  const { user } = await createUserWithEmailAndPassword(auth, createEmail, createPassword);
                  await addBarber({
                    email: createEmail,
                    unit: createUnidade,
                    phone: createTelefone,
                    name: createEmail,
                    balance: 0,
                  });
                  toast({ title: "Conta criada com sucesso!" });
                  setOpenCreateAccountModal(false);
                } catch (error) {
                  console.error("Erro ao criar conta:", error);
                  toast({ variant: "destructive", title: "Erro ao criar conta", description: error.message });
                }
              }}>Criar Conta</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog open={openForgotPasswordModal} onOpenChange={setOpenForgotPasswordModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Esqueci a Senha</AlertDialogTitle>
              <AlertDialogDescription>
                Introduza o seu email para receber um link de recuperação de senha.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                  <input
                    type="email"
                    id="reset-email"
                    placeholder="seuemail@exemplo.com"
                    className="w-full px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                try {
                  await sendPasswordResetEmail(auth, (document.getElementById('reset-email') as HTMLInputElement).value);
                  console.log("Email de recuperação enviado com sucesso!");
                  toast({ title: "Email de recuperação enviado!" });
                  setOpenForgotPasswordModal(false);
                } catch (error) {
                  console.error("Erro ao enviar email de recuperação:", error);
                  toast({ variant: "destructive", title: "Erro ao enviar email", description: error.message });
                }
              }}>Enviar Email</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default LoginPage;
