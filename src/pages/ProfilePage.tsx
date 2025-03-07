import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getAuth } from 'firebase/auth';
import { getBarberByEmail, updateBarber, getServicesCountByBarberEmail, getProductsCountByBarberEmail, getClientsCountByBarberEmail, getTotalRevenueByBarberEmail, getBarberAchievements, updateBarberAchievements, getTotalRevenueByBarberEmailThisMonth, getMonthlyRevenueByBarberEmail } from '@/integrations/firebase/firebase-db';
import { ChangeEvent } from 'react';
import { Link } from 'react-router-dom';

const calcularTempoMedioServicos = () => {
  // Simulação do cálculo do tempo médio dos serviços
  return "30 minutos";
};

const calcularAvaliacao = (totalRevenue: number) => {
  const avaliacao = totalRevenue / 1000;
  return avaliacao.toFixed(1);
};

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [barberData, setBarberData] = useState<any>(null);
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ [month: string]: number }>({});
  const [highestRevenueMonth, setHighestRevenueMonth] = useState<string | null>(null);

  const auth = getAuth();
  const user = auth.currentUser;
  const [servicesCount, setServicesCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalRevenueThisMonth, setTotalRevenueThisMonth] = useState(0);
  const [ranking, setRanking] = useState({ name: 'Iniciante', icon: '🌱' });

  const achievementLevels = [
    { threshold: 0, name: 'Iniciante', icon: '🌱' },
    { threshold: 1000, name: 'Aprendiz', icon: '🔧' },
    { threshold: 3000, name: 'Profissional', icon: '✂️' },
    { threshold: 5000, name: 'Mestre', icon: '🏆' },
    { threshold: 8000, name: 'Lendário', icon: '🔥' },
    { threshold: 10000, name: 'Elite', icon: '👑' },
    { threshold: 15000, name: 'Imortal', icon: '🚀' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      if (user && user.email) {
        const data = await getBarberByEmail(user.email);
        setBarberData(data);
        setName(data?.name || '');
        setUnit(data?.unit || '');
        setEmail(data?.email || '');
        setPhone(data?.phone || '');
        setProfilePicture(data?.profilePicture || '');

        const servicesCountValue = await getServicesCountByBarberEmail(user.email);
        setServicesCount(servicesCountValue);
        console.log('servicesCountValue:', servicesCountValue);

        const productsCount = await getProductsCountByBarberEmail(user.email);
        setProductsCount(productsCount);

        const clientsCount = await getClientsCountByBarberEmail(user.email);
        setClientsCount(clientsCount);

        const totalRevenueValue = await getTotalRevenueByBarberEmail(user.email);
        setTotalRevenue(totalRevenueValue);
        console.log('totalRevenueValue:', totalRevenueValue);
        console.log('totalRevenue para avaliação:', totalRevenueValue);

        const totalRevenueThisMonthValue = await getTotalRevenueByBarberEmailThisMonth(user.email);
        setTotalRevenueThisMonth(totalRevenueThisMonthValue);

        const fetchedAchievements = await getBarberAchievements(user.email);
        setAchievements(fetchedAchievements);

        const monthlyRevenueData = await getMonthlyRevenueByBarberEmail(user.email);
        setMonthlyRevenue(monthlyRevenueData);

        // Determine the month with the highest revenue
        let maxRevenue = 0;
        let maxRevenueMonth: string | null = null;
        for (const month in monthlyRevenueData) {
          if (monthlyRevenueData[month] > maxRevenue) {
            maxRevenue = monthlyRevenueData[month];
            maxRevenueMonth = month;
          }
        }
        setHighestRevenueMonth(maxRevenueMonth);
        setHighestRevenueMonth(maxRevenueMonth);
        console.log('Faturamento do mês de maior faturamento:', maxRevenue);
        console.log('Histórico de faturamento mensal:', monthlyRevenue);

        let maxRevenueForRanking = 0;
        if (highestRevenueMonth && monthlyRevenue[highestRevenueMonth]) {
          maxRevenueForRanking = monthlyRevenue[highestRevenueMonth];
        }
        console.log('maxRevenueForRanking:', maxRevenueForRanking);
        const rankingInfo = getRanking(maxRevenueForRanking);
        console.log('Insígnia do usuário:', rankingInfo.name);

        setRanking(getRanking(totalRevenueThisMonthValue));
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const updateAchievements = async () => {
      if (user && user.email && highestRevenueMonth) {
        let maxRevenue = 0
        if (monthlyRevenue[highestRevenueMonth]) {
          maxRevenue = monthlyRevenue[highestRevenueMonth]
        }
        const newAchievements: string[] = [];
        for (const level of achievementLevels) {
          if (maxRevenue >= level.threshold) {
            newAchievements.push(level.name);
          }
        }

        await updateBarberAchievements(user.email, newAchievements);
        setAchievements(newAchievements);
      }
    };

    updateAchievements();
  }, [highestRevenueMonth, user, monthlyRevenue]);

  const getRanking = (totalRevenue: number) => {
    if (totalRevenue >= 15000) {
      return { name: 'Imortal', icon: '🚀' };
    } else if (totalRevenue >= 10000) {
      return { name: 'Elite', icon: '👑' };
    } else if (totalRevenue >= 8000) {
      return { name: 'Lendário', icon: '🔥' };
    } else if (totalRevenue >= 5000) {
      return { name: 'Mestre', icon: '🏆' };
    } else if (totalRevenue >= 3000) {
      return { name: 'Profissional', icon: '✂️' };
    } else if (totalRevenue >= 1000) {
      return { name: 'Aprendiz', icon: '🔧' };
    } else {
      return { name: 'Iniciante', icon: '🌱' };
    }
  };

  const handleSave = async () => {
    if (user && user.email) {
      let imageUrl = profilePicture;

      if (selectedImage) {
        imageUrl = 'URL_DA_IMAGEM_NO_FIREBASE_STORAGE';
      }

      await updateBarber(user.email, {
        name,
        unit,
        email,
        phone,
        profilePicture: imageUrl,
      });
      setIsEditing(false);
      const data = await getBarberByEmail(user.email);
      setBarberData(data);
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
      setProfilePicture(URL.createObjectURL(event.target.files[0]));
    }
  };

  const RankingTable = () => (
    <Card className="p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Insígnias Recolhidas</h2>
        <div className="flex flex-row gap-2 items-center justify-center">
          {achievementLevels.map((level) => {
            let isAchieved = false;
            if (highestRevenueMonth && monthlyRevenue[highestRevenueMonth] >= level.threshold) {
              isAchieved = true;
            }
            return (
              <div
                key={level.name}
                className={`relative ${isAchieved ? '' : 'opacity-10'}`}
              >
                <span className="text-2xl" style={{ color: isAchieved ? 'inherit' : '#888' }}>{level.icon}</span>
              </div>
            );
          })}
        </div>
      </div>

      <table className="table-auto w-full text-sm">
        <thead>
          <tr>
            <th className="px-2 py-1">Faixa de Pontuação</th>
            <th className="px-2 py-1">Nome do Ranking</th>
            <th className="px-2 py-1">Ícone</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border px-2 py-1">0 a 1000</td>
            <td className="border px-2 py-1">Iniciante</td>
            <td className="border px-2 py-1">🌱 Semente</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">1000 a 3000</td>
            <td className="border px-2 py-1">Aprendiz</td>
            <td className="border px-2 py-1">🔧 Ferramenta</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">3000 a 5000</td>
            <td className="border px-2 py-1">Profissional</td>
            <td className="border px-2 py-1">✂️ Tesoura Pro</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">5000 a 8000</td>
            <td className="border px-2 py-1">Mestre</td>
            <td className="border px-2 py-1">🏆 Troféu de Ouro</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">8000 a 10000</td>
            <td className="border px-2 py-1">Lendário</td>
            <td className="border px-2 py-1">🔥 Chama Ardente</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">10000 a 15000</td>
            <td className="border px-2 py-1">Elite</td>
            <td className="border px-2 py-1">👑 Coroa de Elite</td>
          </tr>
          <tr>
            <td className="border px-2 py-1">15000 a 20000</td>
            <td className="border px-2 py-1">Imortal</td>
            <td className="border px-2 py-1">🚀 Foguete Supremo</td>
          </tr>
        </tbody>
      </table>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full mx-auto text-center space-y-8 animate-fade-in">
        <Link to="/">
          <button className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mb-4">
            Voltar
          </button>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-primary text-center">
          Perfil e Métricas
        </h1>
        <p className="text-lg text-muted-foreground text-center">
          Informações do seu perfil e métricas de desempenho
        </p>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="w-full md:w-1/3">
            <Card className="p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
              <Avatar className="w-32 h-32 mx-auto">
                <AvatarImage src={profilePicture || "https://github.com/shadcn.png"}></AvatarImage>
                <AvatarFallback>{barberData?.name?.charAt(0).toUpperCase() || 'CN'}</AvatarFallback>
              </Avatar>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    placeholder="Nome do Barbeiro"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="text"
                    placeholder="Loja do Barbeiro"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="tel"
                    placeholder="Telefone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 border rounded mb-2"
                  />
                  <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={handleSave}>
                    Salvar
                  </button>
                </div>
              ) : (
                <div>
                  <h2 className="text-2xl font-semibold mt-4 text-center">{barberData?.name || 'Nome do Barbeiro'}</h2>
                  <p className="text-muted-foreground text-center">{barberData?.shopName || barberData?.unit || 'Loja do Barbeiro'}</p>
                  <p className="text-muted-foreground text-center">{barberData?.email || 'Email não disponível'}</p>
                  <p className="text-muted-foreground text-center">{barberData?.phone || 'Telefone não disponível'}</p>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={() => setIsEditing(true)}>
                    Editar
                  </button>
                </div>
              )}
              
            </Card>
          </div>
          <div className="w-full md:w-2/3">
            <Card className="p-6 rounded-lg shadow-md hover:shadow-xl transition duration-300">
              <h3 className="text-xl font-semibold mb-4">Métricas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <p className="text-lg font-semibold">Serviços realizados:</p>
                  <p className="text-2xl">{servicesCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-lg font-semibold">Produtos vendidos:</p>
                  <p className="text-2xl">{productsCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-lg font-semibold">Clientes atendidos:</p>
                  <p className="text-2xl">{clientsCount}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-lg font-semibold">Total faturado:</p>
                  <p className="text-2xl">{totalRevenue.toFixed(2)}</p>
                </Card>
                <Card className="p-4 mb-4">
                  <p className="text-lg font-semibold">Tempo médio dos serviços:</p>
                  <p className="text-2xl">{calcularTempoMedioServicos()}</p>
                </Card>
              </div>
              <Card className="p-4">
                <p className="text-2xl">{ranking.name} {ranking.icon}</p>
                <p className="text-sm">
                  {ranking.name === 'Iniciante' && "Toda grande jornada começa com um primeiro passo! Continue evoluindo!"}
                  {ranking.name === 'Aprendiz' && "Os primeiros resultados estão aparecendo! Continue firme!"}
                  {ranking.name === 'Profissional' && "Agora sim, já és um profissional! Vamos crescer ainda mais?"}
                  {ranking.name === 'Mestre' && "Você atingiu um novo patamar! O sucesso já está ao teu alcance!"}
                  {ranking.name === 'Lendário' && "O teu nome já está marcado na história do salão! Quem consegue te parar?"}
                  {ranking.name === 'Elite' && "Só os melhores chegam aqui! És referência no ramo!"}
                  {ranking.name === 'Imortal' && "Acima de ti, só as estrelas! Um verdadeiro mestre do ofício!"}
                </p>
                  {ranking.name !== 'Imortal' && (
                    <div className="w-full">
                      <div className="bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" style={{ width: `${(Math.min(totalRevenueThisMonth, achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold || achievementLevels.find(level => level.name === 'Imortal')?.threshold) / (achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold || achievementLevels.find(level => level.name === 'Imortal')?.threshold)) * 100}%` }}></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0</span>
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 1000 && <span>500</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 3000 && <span>500</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 3000 && <span>1000</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 3000 && <span>1500</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 3000 && <span>2000</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 3000 && <span>2500</span>}
                        {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 5000 && <span>500</span>}
                        {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 8000 && <span>500</span>}
                         {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 10000 && <span>500</span>}
                          {achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold === 15000 && <span>500</span>}
                        <span>{achievementLevels[achievementLevels.findIndex(level => level.name === ranking.name) + 1]?.threshold || achievementLevels.find(level => level.name === 'Imortal')?.threshold}</span>
                      </div>
                    </div>
                  )}
                </Card>
            </Card>
          </div>
        </div>
        <RankingTable />
      </div>
    </div>
  );
};

export default ProfilePage;
