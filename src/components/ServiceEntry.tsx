import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServices, getProducts, addProductionResult, getExtraServices } from "@/integrations/firebase/firebase-db";
import { ServiceType, Product } from "@/integrations/firebase/types";
import { getAuth } from "firebase/auth";

interface ServiceEntryProps {
  onServiceComplete?: (service: any) => void
  fetchData: () => void
}

const VAT_RATE = 0.23 // 23% VAT
const COMMISSION_RATE = 0.20 // 20% commission

export function ServiceEntry({ onServiceComplete, fetchData }: ServiceEntryProps) {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [extraServices, setExtraServices] = useState<ServiceType[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [clientName, setClientName] = useState("");
  const [extraService, setExtraService] = useState("");
  const [extraService2, setExtraService2] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [fetchData]);

  useEffect(() => {
    const fetchServices = async () => {
      const servicesFromFirebase = await getServices();
      if (servicesFromFirebase) {
        setServices(servicesFromFirebase);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const fetchExtraServices = async () => {
      const extraServicesFromFirebase = await getExtraServices();
      if (extraServicesFromFirebase) {
        setExtraServices(extraServicesFromFirebase);
      }
    };
    fetchExtraServices();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const productsFromFirebase = await getProducts();
      if (productsFromFirebase) {
        setProducts(productsFromFirebase);
      }
      console.log("Products array after fetch:", productsFromFirebase); // ADDED CONSOLE LOG
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    console.log("Products array:", products);
  }, [products]);

  const calculateProductPrices = (basePrice: number) => {
    if (isNaN(basePrice)) {
      console.error("Invalid basePrice:", basePrice);
      return { vatAmount: 0, totalPrice: 0, commission: 0 };
    }
    const basePriceWithoutVat = basePrice / (1 + VAT_RATE);
    const vatAmount = basePrice - basePriceWithoutVat;
    const totalPrice = basePrice;
    const commission = basePriceWithoutVat * COMMISSION_RATE;
    return { vatAmount, totalPrice, commission };
  };

    const handleServiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService && !extraService && !extraService2) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor selecione um serviço ou serviço extra.",
      });
      return;
    }
    
    let clientNameToUse = clientName;
    if (!clientName) {
      clientNameToUse = "Sem Nome";
    }

    const auth = getAuth();
    const user = auth.currentUser;
    
    let selectedServiceData;
    let extraServicePrice = 0;
    let extraServiceName = "";
    let extraService2Price = 0;
    let extraService2Name = "";

    if (selectedService) {
      selectedServiceData = services.find(s => s.id === selectedService);
      if (!selectedServiceData) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Serviço não encontrado.",
        });
        return;
      }
    }

    if (extraService) {
      const selectedExtraServiceData = extraServices.find(s => s.id === extraService);
      extraServicePrice = selectedExtraServiceData?.price || 0;
      extraServiceName = selectedExtraServiceData?.name || "";
    }

    if (extraService2) {
      const selectedExtraServiceData2 = extraServices.find(s => s.id === extraService2);
      extraService2Price = selectedExtraServiceData2?.price || 0;
      extraService2Name = selectedExtraServiceData2?.name || "";
    }

    if (!user || !user.email) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível obter o email do usuário.",
      });
      return;
    }
    
    let serviceDetails;
    if (selectedService) {
      
      const selectedServiceData = services.find(s => s.id === selectedService);
      serviceDetails = {
        barberName: user.email,
        serviceName: selectedServiceData?.name || 'Unknown Service',
        clientName,
        extraService:  extraService ? extraServiceName : null,
        extraService2: extraService2Name || null,
        date: new Date().toISOString(),
        price: (selectedServiceData?.price || 0) + extraServicePrice + extraService2Price,
        commission: ((selectedServiceData?.price || 0) + extraServicePrice + extraService2Price) * 0.4,
      };
    } else {
      
      serviceDetails = {
        barberName: user.email,
        serviceName: 'Unknown Service',
        clientName,
        extraService: extraService ? extraServiceName : null,
        extraService2: extraService2Name || null,
        date: new Date().toISOString(),
        price: extraServicePrice + extraService2Price,
        commission: (extraServicePrice + extraService2Price) * 0.4,
      };
    }

    try {
      await addProductionResult(serviceDetails);
      console.log("Service recorded:", serviceDetails);
      
      toast({
        title: "Serviço registrado com sucesso!",
        description: `${selectedServiceData?.name} para ${clientName}`,
      });

      setSelectedService("");
      setClientName("");
      setExtraService("");
      setExtraService2("");

      if (onServiceComplete) {
        onServiceComplete(serviceDetails);
      }
      toast({
        title: "Serviço registrado com sucesso!",
        description: `${selectedServiceData?.name} para ${clientName}`,
      });
      window.location.reload();
    }  catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao registrar serviço",
        description: "Por favor tente novamente.",
      });
    }
  };
  

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedProduct || !quantity) {
      return toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor selecione um produto e quantidade.",
      });
    }

      const product = products.find(p => p.id === selectedProduct);
      if (!product) {
        console.log("Product not found:", selectedProduct, products); // ADDED CONSOLE LOG
        return toast({
          variant: "destructive",
          title: "Erro",
          description: "Produto não encontrado.",
        });
      }
      if (product.basePrice === undefined) {
        console.log("Product missing basePrice:", product);
        return toast({
          variant: "destructive",
          title: "Erro",
          description: "Produto sem preço base.",
        });
      }
      console.log("Selected product:", product);

      const { vatAmount, totalPrice, commission } = calculateProductPrices(product.basePrice);
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !user.email) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível obter o email do usuário.",
        });
        return;
      }

      const productSale = {
        barberName: user.email,
        productId: selectedProduct,
        productName: product.name,
        quantity: Number(quantity),
        basePrice: product.basePrice,
        vatAmount: vatAmount,
        totalPrice: totalPrice,
        commission: vatAmount,
        date: new Date().toISOString(),
        serviceName: 'Product Sale'
      };

    try {
      await addProductionResult(productSale);
      console.log("Product sale recorded:", productSale);
      
      toast({
        title: "Venda realizada com sucesso!",
        description: `${product.name} x${quantity}`,
        className: "bg-green-500 text-white",
      });

      setSelectedProduct("");
      setQuantity("1");
      fetchData();
    } catch (error) {
      console.error("Error in handleProductSubmit:", error);
      toast({
        variant: "destructive",
        title: "Erro ao registrar venda",
        description: "Por favor tente novamente.",
      });
    }
  };

  return (
    <Tabs defaultValue="services" className="w-full" onValueChange={(value) => {
      if (value !== "products") {
        setSelectedService("");
        setClientName("");
        setExtraService("");
        setExtraService2("");
      }
      setSelectedProduct("");
      setQuantity("1");
    }}>
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="services">Serviços</TabsTrigger>
        <TabsTrigger value="products">Produtos</TabsTrigger>
      </TabsList>

      <TabsContent value="services">
        <Card className="p-6">
          <form onSubmit={handleServiceSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service-type">Tipo de Serviço</Label>
              <Select key={selectedService} value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger id="service-type">
                  <SelectValue placeholder="Selecione o serviço" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-name">Nome do Cliente</Label>
              <Input
                id="client-name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="extra-service">Serviço Extra</Label>
              <Select key={extraService} value={extraService} onValueChange={setExtraService}>
                <SelectTrigger id="extra-service">
                  <SelectValue placeholder="Selecione o serviço extra (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {extraServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="extra-service2">Serviço Extra 2</Label>
              <Select key={extraService2} value={extraService2} onValueChange={setExtraService2}>
                <SelectTrigger id="extra-service2">
                  <SelectValue placeholder="Selecione o serviço extra (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {extraServices.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} - €{service.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Registrar Serviço
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="products">
        <Card className="p-6">
          <form onSubmit={handleProductSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product-type">Produto</Label>
              <Select key={`${selectedProduct}-${key}`} value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Selecione o produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => {
                    const { totalPrice, commission } = calculateProductPrices(product.basePrice)
                    return (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - €{totalPrice.toFixed(2)} (Comissão: €{commission.toFixed(2)})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="1"
              />
            </div>

            {selectedProduct && (
              <div className="space-y-2 bg-muted p-4 rounded-md">
                <h3 className="font-medium">Detalhes do Produto</h3>
                {(() => {
                  const product = products.find(p => p.id === selectedProduct)
                  if (!product) return null
                  
                  const { vatAmount, totalPrice, commission } = calculateProductPrices(product?.basePrice || 0)
                  return (
                    <div className="space-y-1 text-sm">
                      <p>Preço base: €{product?.basePrice?.toFixed(2)}</p>
                      <p>Preço base sem IVA: €{(product?.basePrice / (1 + VAT_RATE))?.toFixed(2)}</p>
                      <p>IVA (23%): €{vatAmount.toFixed(2)}</p>
  
                      <p>Comissão (20%): €{commission.toFixed(2)}</p>
                      <p>Stock disponível: {product?.stock}</p>
                    </div>
                  )
                })()}
              </div>
            )}

            <Button type="submit" className="w-full">
              Registrar Venda
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
