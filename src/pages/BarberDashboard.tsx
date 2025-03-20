import React, { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { getBarberByEmail, db, updateBarber, getBarbers } from '@/integrations/firebase/firebase-db';
import ShareButton from '@/components/ShareButton';
import { deleteDoc, doc } from 'firebase/firestore';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ServiceEntry } from "@/components/ServiceEntry";
import { getProductionResults } from "@/integrations/firebase/firebase-db";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, toDate } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { uploadProfilePicture } from "@/integrations/firebase/firebase-db";
import DatePickerCard from "@/components/DatePickerCard";
import WeekSelector from "@/components/WeekSelector";
import MonthSelector from "@/components/MonthSelector";
import TotalReceberValue from "@/components/TotalReceberValue";
import TotalProduzidoValue from "@/components/TotalProduzidoValue";

const BarberDashboard = () => {
  const [barberData, setBarberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productionResults, setProductionResults] = useState([]);
  const [dateRange, setDateRange] = useState<any>(undefined);
  const [open, setOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [ganhosHojeVisible, setGanhosHojeVisible] = useState(false);
  const [ganhosSemanaVisible, setGanhosSemanaVisible] = useState(false);
  const [produzidoMesVisible, setProduzidoMesVisible] = useState(false);
  const [totalReceberVisible, setTotalReceberVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
  const [ganhosHojeDate, setGanhosHojeDate] = useState<Date | undefined>(undefined);
  const [ganhosSemanaDate, setGanhosSemanaDate] = useState<Date | undefined>(undefined);
  const [selectedWeek, setSelectedWeek] = useState('');
  const [totalProduzido, setTotalProduzido] = useState(0);
  const [produzidoMesDate, setProduzidoMesDate] = useState<Date | undefined>(undefined);
  const [totalReceberDate, setTotalReceberDate] = useState<Date | undefined>(undefined);
  const [barberShops, setBarberShops] = useState([]);
  const [selectedBarberShop, setSelectedBarberShop] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  };

    const filterProductionResultsByMonth = useCallback((results: any[], month: number, year: number) => {
        return results.filter(result => {
            const resultDate = new Date(result.date);
            return resultDate.getMonth() === month && resultDate.getFullYear() === year;
        });
    }, []);

    const calculateTotalEarnings = (results: any[]) => {
        return results.reduce((sum, result) => {
            if (result.serviceName === 'Product Sale') {
                return sum + ((Number(result.totalPrice) || 0) / 1.23) * 0.20;
            } else {
                return sum + (Number(result.commission) || (Number(result.price) || 0) * 0.4);
            }
        }, 0);
    };
  const auth = getAuth();
  const user = auth.currentUser;
  const navigate = useNavigate();

  const fetchData = async () => {
    if (user && user.email) {
      const results = await getProductionResults();
      const filteredResults = results.filter(result => result.barberName === user.email);
      setProductionResults(filteredResults);
    }
  };

  useEffect(() => {
    const fetchBarberData = async () => {
      if (user && user.email) {
        const data = await getBarberByEmail(user.email);
        setBarberData(data);
        if (data?.profilePicture) {
          setProfilePictureUrl(data.profilePicture);
        }
        if (data?.unit) {
          setSelectedBarberShop(data.unit);
        }
        await fetchData();
      }
      setLoading(false);
    };

    const fetchBarberShops = async () => {
        const barbers = await getBarbers();
        const shops = barbers.map(barber => barber.unit).filter(unit => unit);
        setBarberShops([...new Set(shops)]);
    };

    fetchBarberData();
    fetchBarberShops();
  }, [user]);

  if (loading) {
    return <div>Loading barber data...</div>;
  }

  if (!barberData) {
    return <div>
      <h1>Barber Dashboard</h1>
      <p>New Barber - No data found for your email.</p>
      {/* ... display "new barber" UI ... */}
    </div>;
  }

  return (
    <div className="bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Dashboard do Barbeiro</h1>
            <p className="text-muted-foreground">Bem-vindo de volta, {barberData.name || 'Barbeiro'}</p>
          </div>
          <div className="flex gap-2 items-center">
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
            <ShareButton />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="space-y-6">
            <ServiceEntry
              onServiceComplete={(service) => {
                console.log("Service completed:", service)
                // Here we'll update the UI with the new service
              }}
              fetchData={fetchData}
            />
          </div>

          <div className="space-y-6">
            <div className="flex flex-col gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium flex items-center justify-between">
                  Ganhos Hoje
<Button variant="ghost" size="icon" onClick={() => setGanhosHojeVisible(!ganhosHojeVisible)}>
                    {ganhosHojeVisible ? <Eye className="lucide-eye" /> : <EyeOff className="lucide-eye-off" />}
                  </Button>
                </h3>
                <DatePickerCard onDateChange={(date) => setGanhosHojeDate(date)} defaultDate={ganhosHojeDate} />
                <p className="text-3xl font-bold mt-2">
                  {ganhosHojeVisible ? `€${productionResults
                    .filter(result => {
                      const resultDate = new Date(result.date);
                      const selectedDate = ganhosHojeDate || new Date();
                      const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
                      const selectedDateEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
                      return resultDate >= selectedDateStart && resultDate <= selectedDateEnd;
                    })
                    .reduce((sum, result) => sum + (Number(result.price) || 0) + (Number(result.totalPrice) || 0), 0)
                    .toFixed(2)}` : '******'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comissão: {ganhosHojeVisible ? `€${productionResults
                    .filter(result => {
                      const resultDate = new Date(result.date);
                      const today = new Date();
                      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                      return resultDate >= todayStart && resultDate <= todayEnd;
                    })
                    .reduce((sum, result) => {
                      if (result.serviceName === 'Product Sale') {
                        return sum + ((Number(result.totalPrice) || 0) / 1.23) * 0.20;
                      } else {
                        return sum + (Number(result.commission) || (Number(result.price) || 0) * 0.4);
                      }
                    }, 0)
                    .toFixed(2)}` : '******'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium flex items-center justify-between">
                  Ganhos esta Semana
                  <Button variant="ghost" size="icon" onClick={() => setGanhosSemanaVisible(!ganhosSemanaVisible)}>
                    {ganhosSemanaVisible ? <Eye className="lucide-eye" /> : <EyeOff className="lucide-eye-off" />}
                  </Button>
                </h3>
                <WeekSelector onWeekChange={(week) => {
                  const now = new Date();
                  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                  const firstWeekDay = firstDayOfMonth.getDay();
                  const firstWeekStartDate = new Date(now.getFullYear(), now.getMonth(), 1 - firstWeekDay + (firstWeekDay === 0 ? -6 : 1));
                  const weekStartDate = new Date(firstWeekStartDate.getFullYear(), firstWeekStartDate.getMonth(), firstWeekStartDate.getDate() + (week - 1) * 7);
                  setGanhosSemanaDate(weekStartDate);
                  setSelectedWeek(week.toString());
                }} />
                <p className="text-3xl font-bold mt-2">
                  {ganhosSemanaVisible ? `€${productionResults
                    .filter(result => {
                      const selectedDate = ganhosHojeDate || new Date();
                      const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
                      const firstWeekDay = firstDayOfMonth.getDay();
                      const firstWeekStartDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1 - firstWeekDay + (firstWeekDay === 0 ? -6 : 1));
                      const week = parseInt(selectedWeek);
                      const weekStartDate = new Date(firstWeekStartDate.getFullYear(), firstWeekStartDate.getMonth(), firstWeekStartDate.getDate() + (week - 1) * 7);
                      const weekEndDate = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate() + 6);
                      const resultDate = new Date(result.date);
                      return resultDate >= weekStartDate && resultDate <= weekEndDate;
                    })
                    .reduce((sum, result) => sum + (Number(result.price) || 0) + (Number(result.totalPrice) || 0), 0)
                    .toFixed(2)}` : '******'}
                </p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium flex items-center justify-between">
                  Total a Receber
                  <Button variant="ghost" size="icon" onClick={() => setTotalReceberVisible(!totalReceberVisible)}>
                    {totalReceberVisible ? <Eye className="lucide-eye" /> : <EyeOff className="lucide-eye-off" />}
                  </Button>
                </h3>
                <MonthSelector onMonthChange={(month) => {
                  const now = new Date();
                  const selectedMonth = new Date(now.getFullYear(), month, 1);
                  setTotalReceberDate(selectedMonth);
                  setSelectedMonth(month.toString());
                }} />
                <>
                  <TotalReceberValue
                    totalReceberVisible={totalReceberVisible}
                    totalReceberDate={totalReceberDate}
                    productionResults={productionResults}
                    filterProductionResultsByMonth={filterProductionResultsByMonth}
                  />
                </>
                <p className="text-sm text-muted-foreground mt-1">Comissões pendentes</p>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium flex items-center justify-between">
                  Total Produzido
                  <Button variant="ghost" size="icon" onClick={() => setProduzidoMesVisible(!produzidoMesVisible)}>
                    {produzidoMesVisible ? <Eye className="lucide lucide-eye" /> : <EyeOff className="lucide lucide-eye-off"/>}
                  </Button>
                </h3>
                <MonthSelector onMonthChange={(month) => {
                  const now = new Date();
                  const selectedMonth = new Date(now.getFullYear(), month, 1);
                  setProduzidoMesDate(selectedMonth);
                  setSelectedMonth(month.toString());
                }} />
                <>
                  <TotalProduzidoValue
                    produzidoMesVisible={produzidoMesVisible}
                    produzidoMesDate={produzidoMesDate}
                    productionResults={productionResults}
                    filterProductionResultsByMonth={filterProductionResultsByMonth}
                  />
                </>
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-medium">Serviços Hoje</h3>
                <DatePickerCard onDateChange={(date) => setGanhosHojeDate(date)} defaultDate={ganhosHojeDate} />
                <p className="text-3xl font-bold mt-2">
                  {productionResults.filter(result => {
                      const resultDate = new Date(result.date);
                      const selectedDate = ganhosHojeDate || new Date();
                      const selectedDateStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
                      const selectedDateEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59);
                      return resultDate >= selectedDateStart && resultDate <= selectedDateEnd;
                    }).length}
                </p>
                <p className="text-sm text-muted-foreground mt-1">+0 agendados</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Desempenho Semanal</h3>
              <div className="flex items-center justify-end mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant={"outline"} >
                    {/* @ts-ignore */}
                    {format(dateRange?.from || new Date(), 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange?.to || new Date(), 'dd/MM/yyyy', { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    locale={ptBR}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(
                    productionResults
                    .filter(result => {
                      const resultDate = new Date(result.date);
                      const fromDate = dateRange?.from || new Date(new Date().setDate(new Date().getDate() - 7));
                      const toDate = dateRange?.to || new Date();
                      return resultDate >= fromDate && resultDate <= toDate;
                    })
                    .reduce((acc, result) => {
                      const day = format(new Date(result.date), 'EEE', { locale: ptBR });
                      const dayIndex = (new Date(result.date).getDay() - 1 + 7) % 7;
                      const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                      const adjustedDay = daysOfWeek[dayIndex];
                      acc[adjustedDay] = (acc[adjustedDay] || 0) + (result.price || 0);
                      return acc;
                    }, {})
                  )
                  .map(([name, value]) => ({ name, value }))
                  .sort((a, b) => {
                    const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
                    return daysOfWeek.indexOf(a.name) - daysOfWeek.indexOf(b.name);
                  })
                }>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1a2b4b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Últimos Serviços</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Serviço</th>
                      <th className="text-left py-3 px-4">Cliente</th>
                      <th className="text-left py-3 px-4">Data/Hora</th>
                      <th className="text-right py-3 px-4">Valor</th>
                      <th className="text-right py-3 px-4">Comissão</th>
                      <th className="text-right py-3 px-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productionResults.sort((a, b) => {
                      const dateA = new Date(a.date);
                      const dateB = new Date(b.date);
                      return dateB.getTime() - dateA.getTime();
                    }).map((result) => {
                      const formattedDate = format(new Date(result.date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
                      if (result.serviceName === 'Product Sale') {
                        return (
                          <tr key={result.id} className="border-b">
                            <td className="py-3 px-4">{result.productName}</td>
                            <td className="py-3 px-4">{result.barberName}</td>
                            <td className="py-3 px-4">{formattedDate}</td>
                            <td className="text-right py-3 px-4">€{result.totalPrice?.toFixed(2) || 0}</td>
                            <td className="text-right py-3 px-4">€{((result.totalPrice || 0) / 1.23 * 0.20).toFixed(2)}</td>
                             <td className="text-right py-3 px-4">
                              <Button variant="destructive" size="sm" onClick={async () => {
                                  if (result.id) {
                                    await deleteDoc(doc(db, 'productionResults', result.id));
                                    await fetchData();
                                  }
                                }}>
                                Excluir
                              </Button>
                            </td>
                          </tr>
                        )
                      }
                      return (
                        <tr key={result.id} className="border-b">
                          <td className="py-3 px-4">
                            {result.serviceName === 'Product Sale' ? result.productName : (result.serviceName !== 'Unknown Service' ? result.serviceName : '')}
                            {result.extraService && ` ${result.extraService}`}
                             {result.extraService2 && ` ${result.extraService2}`}
                          </td>
                          <td className="py-3 px-4">{result.clientName}</td>
                          <td className="py-3 px-4">{formattedDate}</td>
                          <td className="text-right py-3 px-4">€{Number(result.price)?.toFixed(2) || 0}</td>
                          <td className="text-right py-3 px-4">€{(Number(result.price) * 0.4)?.toFixed(2) || 0}</td>
                             <td className="text-right py-3 px-4">
                              <Button variant="destructive" size="sm" onClick={async () => {
                                  if (result.id) {
                                    await deleteDoc(doc(db, 'productionResults', result.id));
                                    fetchData();
                                    toast({
                                      title: "Serviço excluído com sucesso!",
                                      description: `${result.serviceName || 'Serviço'} para ${result.clientName || 'Cliente'}`,
                                    });
                                  }
                                }}>
                                Excluir
                              </Button>
                            </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} className="text-right font-medium py-2 px-4">Total</td>
                      <td className="text-right font-medium py-2 px-4">
                        €{productionResults.reduce((sum, result) => {
                          if (result.serviceName === 'Product Sale') {
                            return sum + ((result.totalPrice || 0) / 1.23) * 0.20;
                          } else {
                            return sum + (result.commission || (result.price || 0) * 0.4);
                          }
                        }, 0).toFixed(2)}
                      </td>
                       <td className="text-right font-medium py-2 px-4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
