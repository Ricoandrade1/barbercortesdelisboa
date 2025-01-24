import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { addService } from "@/integrations/firebase/firebase-db";

export function AddServiceModal({ fetchData }) {
  const [serviceName, setServiceName] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [open, setOpen] = useState(false);

  const handleAddService = async () => {
    if (!serviceName || !servicePrice) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    try {
      await addService({ name: serviceName, price: Number(servicePrice) });
      toast({
        title: "Serviço adicionado",
        description: "Serviço adicionado com sucesso no Firebase.",
      });
      setServiceName("");
      setServicePrice("");
      setOpen(false);
      fetchData();
    } catch (error) {
      console.error("Erro ao adicionar serviço:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar serviço",
        description: "Falha ao adicionar serviço no Firebase.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Serviço</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Serviço</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Preço
            </Label>
            <Input
              type="number"
              id="price"
              value={servicePrice}
              onChange={(e) => setServicePrice(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <Button onClick={handleAddService}>Adicionar Serviço</Button>
      </DialogContent>
    </Dialog>
  );
}
