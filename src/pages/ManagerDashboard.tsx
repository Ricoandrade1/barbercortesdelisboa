import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AddProductModal } from "@/components/AddProductModal";
import { EditProductModal } from "@/components/EditProductModal"; // Import EditProductModal
import { AddBarberModal } from "@/components/AddBarberModal";
import { AddServiceModal } from "@/components/AddServiceModal"; // Import AddServiceModal
import { ReportPDF } from "@/components/ReportPDF";
import { pdf } from "@react-pdf/renderer";
import { toast } from "@/hooks/use-toast";
import { getProducts, getBarbers, getServices, getProductionResults, deleteProduct, deleteService } from "@/integrations/firebase/firebase-db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const getMonday = (date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when date is sunday
  return new Date(date.setDate(diff));
};

const sortProductionResults = (results) => {
  const today = new Date();
  const monday = getMonday(today);

  const dailyProduction = {};

  results.forEach((result) => {
    const date = new Date(result.date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const dayOfWeek = new Date(date.setDate(diff)).toLocaleDateString('pt-PT', { weekday: 'short' });

    if (!dailyProduction[dayOfWeek]) {
      dailyProduction[dayOfWeek] = 0;
    }
    dailyProduction[dayOfWeek] += (result.totalPrice || result.price || 0);
  });

  const daysOfWeek = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
  return [...results].sort((a, b) => {
    const today = new Date();
    const monday = getMonday(today);
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    const diffA = dateA.getTime() - monday.getTime();
    const diffB = dateB.getTime() - monday.getTime();

    return diffA - diffB;
  });
};

const ManagerDashboard = () => {
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [productionResults, setProductionResults] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [filterBarber, setFilterBarber] = useState<string | null>(null);
  const [productCommissionPercentage, setProductCommissionPercentage] = useState(20);
  const [serviceCommissionPercentage, setServiceCommissionPercentage] = useState(40);
  const totalBalance = barbers.reduce((sum, barber) => sum + (Number(barber.balance) || 0), 0);
  const auth = getAuth();
  const navigate = useNavigate();
    const calculateCommission = (result) => {
    // Uses productCommissionPercentage and serviceCommissionPercentage state variables
    if (result.serviceName === 'Product Sale') {
      return ((result.totalPrice || 0) / 1.23) * (productCommissionPercentage / 100);
    } else {
      // Always use serviceCommissionPercentage for services
      return (result.price || 0) * (serviceCommissionPercentage / 100);
    }
  };
  const totalCommission = React.useMemo(() => {
    return productionResults
      .reduce((sum, result) => sum + calculateCommission(result), 0);
  }, [productionResults, productCommissionPercentage, serviceCommissionPercentage]);

  const fetchData = async () => {
    console.log("fetchData called..."); // ADDED console.log
    setLoading(true);
    try {
      const productsData = await getProducts();
      setProducts(productsData);
      const servicesData = await getServices();
      setServices(servicesData);
      const productionResultsData = await getProductionResults(); // Fetch production results
      setProductionResults(productionResultsData); // Set production results state
      const barbersData = await getBarbers();
      setBarbers(barbersData);
      console.log("fetchData finished, products:", productsData); // ADDED console.log
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Houve um erro ao carregar os dados do Firebase.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchBarbers = async () => {
    try {
      const barbersData = await getBarbers();
      setBarbers(barbersData);
    } catch (error) {
      console.error("Error fetching barbers from Firebase:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar barbeiros",
        description: "Houve um erro ao carregar os barbeiros do Firebase.",
      });
    }
  };

  const handleAddProduct = (newProduct) => {
    const productToAdd = {
      id: products.length + 1,
      ...newProduct,
    };
    setProducts([...products, productToAdd]);
    fetchData();
  };

  const handleAddBarber = () => {
    fetchBarbers();
  };

  const handleExportReport = async () => {
    try {
      console.log("Products:", products);
      console.log("Barbers:", barbers);
    let filteredBarbers = barbers;
    let filteredProducts = products;
    let filteredProductionResults = productionResults;
    let filteredServices = services;
    
    switch (filterBarber) {
      case "barbers":
         filteredProductionResults = filterBarber
        ? productionResults.filter((result) => result.barberName === barbers.find(barber => barber.id === filterBarber)?.name)
        : productionResults;
        filteredProducts = [];
        filteredServices = [];
        break;
      case "products":
        filteredBarbers = [];
        filteredProductionResults = [];
        filteredServices = [];
        break;
      case "services":
         filteredBarbers = [];
         filteredProducts = [];
         filteredProductionResults = [];
        break;
      case "production":
        filteredBarbers = [];
        filteredProducts = [];
        filteredServices = [];
        break;
      default:
        break;
    }
    
      const blob = await pdf(
        <ReportPDF products={filterBarber === 'products' ? filteredProducts : []} barbers={filteredBarbers} productionResults={filteredProductionResults} services={filterBarber === 'services' ? filteredServices : []} totalCommission={totalCommission} filterBarber={filterBarber} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `relatorio-barbearia-${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Relatório exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao gerar o relatório.",
      });
    }
  };

  const onDeleteProduct = async (productId: string) => {
    console.log("onDeleteProduct called for productId:", productId); // ADDED console.log
    try {
      await deleteProduct(productId);
      console.log("deleteProduct finished for productId:", productId); // ADDED console.log
      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso.",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir produto",
        description: "Houve um erro ao excluir o produto.",
      });
    }
  };

  const onDeleteService = async (serviceId: string) => {
    try {
      await deleteService(serviceId);
      toast({
        title: "Serviço excluído",
        description: "Serviço removido com sucesso.",
      });
      fetchData();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir serviço",
        description: "Houve um erro ao excluir o serviço.",
      });
    }
  };


  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Gerente</h1>
            <p className="text-muted-foreground">Gestão e Controle</p>
          </div>
          <div className="flex gap-4">
            <Select onValueChange={setFilterBarber}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={null}>Todos</SelectItem>
                <SelectItem value="barbers">Barbeiros</SelectItem>
                <SelectItem value="products">Produtos</SelectItem>
                 <SelectItem value="services">Serviços</SelectItem>
                <SelectItem value="production">Produção</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleExportReport}>
              Exportar Relatório
            </Button>
            <AddProductModal />
            <AddBarberModal onBarberAdded={handleAddBarber} />
            <AddServiceModal fetchData={fetchData} /> {/* Add AddServiceModal button */}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                navigate('/index', { replace: true });
              }}>
                Voltar
              </Button>
              <Button variant="outline" onClick={() => {
                signOut(auth);
                navigate('/login');
              }}>
                Sair
              </Button>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-medium">Faturamento Hoje</h3>
            <p className="text-3xl font-bold mt-2">
              €{productionResults
                .filter(result => new Date(result.date).toDateString() === new Date().toDateString())
                .reduce((sum, result) => sum + (result.totalPrice || result.price || 0), 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">+0% vs. ontem</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Produtos Cadastrados</h3>
            <p className="text-3xl font-bold mt-2">{products.length}</p>
            <p className="text-sm text-muted-foreground mt-1">
              {products.filter((p) => p.stock < 10).length} precisam reposição
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Barbeiros Ativos</h3>
            <p className="text-3xl font-bold mt-2">{
              new Set(productionResults.map(result => result.barberName)).size
            }</p>
            <p className="text-sm text-muted-foreground mt-1">2 em serviço agora</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-medium">Total a Pagar</h3>
            <p className="text-3xl font-bold mt-2">
              €{productionResults
                .reduce((sum, result) => sum + calculateCommission(result), 0)
                .toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground mt-1">Comissões pendentes</p>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="services">Serviços</TabsTrigger>
            <TabsTrigger value="barbers">Barbeiros</TabsTrigger>
            <TabsTrigger value="production">Produção</TabsTrigger> {/* New tab for Production */}
          </TabsList>

          <TabsContent value="products">
            <div className="flex items-center gap-4 mb-4">
              <label htmlFor="serviceCommissionPercentage" className="text-sm font-medium">
                Comissão (%):
              </label>
              <input
                type="number"
                id="serviceCommissionPercentage"
                className="border p-2 rounded text-black w-20"
                value={serviceCommissionPercentage}
                onChange={(e) => setServiceCommissionPercentage(Number(e.target.value))}
              />
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell className="text-right">€{product.basePrice}</TableCell>
                      <TableCell className="text-right">
                        <EditProductModal product={product} onProductUpdated={fetchData} />
                        <Button variant="destructive" size="sm" className="ml-2" onClick={() => onDeleteProduct(product.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="services">
             <div className="flex items-center gap-4 mb-4">
              <label htmlFor="serviceCommissionPercentage" className="text-sm font-medium">
                Comissão (%):
              </label>
              <input
                type="number"
                id="serviceCommissionPercentage"
                className="border p-2 rounded text-black w-20"
                value={serviceCommissionPercentage}
                onChange={(e) => setServiceCommissionPercentage(Number(e.target.value))}
              />
            </div>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>{service.name}</TableCell>
                      <TableCell className="text-right">€{service.price}</TableCell>
                      <TableCell className="text-right">
                         <Button variant="destructive" size="sm" className="ml-2" onClick={() => onDeleteService(service.id)}>
                          Excluir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="barbers">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {barbers.map((barber) => (
                    <TableRow key={barber.id}>
                      <TableCell>{barber.name}</TableCell>
                      <TableCell>{barber.email}</TableCell>
                      <TableCell>{barber.phone}</TableCell>
                      <TableCell>{barber.unit}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedBarber(barber)}>Detalhes</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Detalhes do Barbeiro</DialogTitle>
                              <DialogDescription>
                                Informações detalhadas sobre o barbeiro selecionado.
                              </DialogDescription>
                            </DialogHeader>
                            {selectedBarber && (
                              <div>
                                <p>Nome: {selectedBarber.name}</p>
                                <p>Email: {selectedBarber.email}</p>
                                <p>Telefone: {selectedBarber.phone}</p>
                                <p>Unidade: {selectedBarber.unit}</p>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="production"> {/* Production TabContent */}
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Barbeiro</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Comissão</TableHead>
                    <TableHead className="text-right">Data</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortProductionResults(productionResults).map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.barberName}</TableCell>
                      <TableCell>{result.serviceName === 'Product Sale' ? `${result.productName}` : result.serviceName}</TableCell>
                      <TableCell className="text-right">€{result.totalPrice?.toFixed(2) || (result.serviceName === 'Product Sale' ? result.totalPrice?.toFixed(2) : result.price?.toFixed(2)) || 0}</TableCell>
                      <TableCell className="text-right">€{calculateCommission(result)?.toFixed(2) || 0}</TableCell>
                      <TableCell className="text-right">{result.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagerDashboard;
