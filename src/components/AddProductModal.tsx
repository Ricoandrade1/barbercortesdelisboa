import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { addProduct } from "@/integrations/firebase/firebase-db";

interface AddProductModalProps {}

export function AddProductModal({}: AddProductModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor preencha todos os campos obrigatórios.",
      });
      return;
    }

    const productData = {
      name: formData.name,
      basePrice: Number(formData.price), // Changed price to basePrice to match firebase-db.ts
      stock: Number(formData.stock),
      description: formData.description,
    };

    try {
      await addProduct(productData);
      toast({
        title: "Produto adicionado",
        description: "O produto foi adicionado com sucesso no Firebase.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar produto",
        description: "Houve um erro ao adicionar o produto no Firebase.",
      });
      console.error("Firebase error:", error);
    }

    setFormData({
      name: "",
      price: "",
      stock: "",
      description: "",
    });

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Adicionar Produto</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Produto</DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para adicionar um novo produto ao estoque.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Produto*</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Ex: Pomada Modeladora"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preço (€)*</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, price: e.target.value }))
              }
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Quantidade em Estoque*</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stock: e.target.value }))
              }
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Descrição do produto"
            />
          </div>

          <DialogFooter>
            <Button type="submit">Adicionar Produto</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
