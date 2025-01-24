import React, { useState, useEffect } from "react";
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
import { updateProduct } from "@/integrations/firebase/firebase-db";

interface EditProductModalProps {
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
  };
  onProductUpdated: () => void;
}

export function EditProductModal({ product, onProductUpdated }: EditProductModalProps) {
  const [productName, setProductName] = useState(product.name || "");
  const [productPrice, setProductPrice] = useState(product.price?.toString() || "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setProductName(product.name || "");
      setProductPrice(product.price?.toString() || "");
    }
  }, [product]);

  const handleEditProduct = async () => {
    if (!productName || !productPrice) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
      });
      return;
    }

    try {
      await updateProduct(product.id, {
        name: productName,
        basePrice: Number(productPrice),
      });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso.",
      });
      onProductUpdated(); // Notify parent component to refresh product list
      setOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar produto.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">Editar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome
            </Label>
            <Input
              id="name"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="basePrice" className="text-right">
                  Preço Base
                </Label>
                <Input
                  type="number"
                  id="basePrice"
                  value={productPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*\.?\d*$/.test(value)) {
                      setProductPrice(value);
                    }
                  }}
                  className="col-span-3"
                />
          </div>
        </div>
        <Button onClick={handleEditProduct} disabled={isNaN(Number(productPrice))}>
          Salvar Alterações
        </Button>
      </DialogContent>
    </Dialog>
  );
}
