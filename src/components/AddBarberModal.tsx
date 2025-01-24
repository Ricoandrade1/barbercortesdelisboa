import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addBarber } from "@/integrations/firebase/firebase-db";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddBarberModalProps {
  onBarberAdded: () => void;
}

export const AddBarberModal: React.FC<AddBarberModalProps> = ({ onBarberAdded }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [unit, setUnit] = useState('');
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const units = [
    "Alcântara",
    "Alegro Alfragide",
    "CascaiShopping",
    "Colombo",
    "LoureShopping",
    "Alegro Sintra",
    "Braga Parque",
    "Évora Plaza",
    "Forum Coimbra",
    "LeiriaShopping"
  ];

  const handleAddBarber = async () => {
    setIsLoading(true);
    try {
      await addBarber({
        name,
        email,
        phone,
        unit,
      });
      toast({
        title: "Barbeiro adicionado!",
        description: "Barbeiro adicionado com sucesso.",
      });
      setName('');
      setEmail('');
      setPhone('');
      setUnit('');
      onBarberAdded();
      setOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar barbeiro:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar barbeiro",
        description: "Houve um erro ao adicionar o barbeiro. Por favor, tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Barbeiro</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Barbeiro</DialogTitle>
          <DialogDescription>
            Adicione um novo barbeiro à lista.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              placeholder="Nome do barbeiro"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="Email do barbeiro"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              placeholder="Telefone do barbeiro"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="unit">Unidade a trabalhar</Label>
            <Select onValueChange={setUnit}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a unidade" />
              </SelectTrigger>
              <SelectContent>
                {units.map((unitName) => (
                  <SelectItem key={unitName} value={unitName}>{unitName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={handleAddBarber} disabled={isLoading} >
            Adicionar Barbeiro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
Button.displayName = "Button";
