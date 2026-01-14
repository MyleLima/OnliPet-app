
import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Map as MapIcon, 
  Search, 
  Calendar, 
  User as UserIcon, 
  PlusCircle, 
  Heart, 
  MessageCircle, 
  ChevronRight,
  Filter,
  Navigation,
  Camera,
  LogOut,
  Bell,
  PawPrint
} from 'lucide-react';
import { User, UserRole, NGO, RescueCall, RescueStatus, Appointment } from './types';
import { MOCK_NGOS, MOCK_VETS } from './constants';
import { getAnimalCuriosity } from './geminiService';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '' }: any) => {
  const base = "px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2";
  const variants: any = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md shadow-orange-200",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "text-gray-600 hover:bg-gray-100",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  return <button onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Header = ({ title, onNotify }: { title: string, onNotify: () => void }) => (
  <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-100 z-50 h-16 flex items-center justify-between px-4">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <PawPrint className="text-white w-5 h-5" />
      </div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
        OnliPet
      </h1>
    </div>
    <div className="flex items-center gap-3">
      <button onClick={onNotify} className="p-2 text-gray-400 hover:text-blue-600 relative">
        <Bell className="w-6 h-6" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
        <img src="https://picsum.photos/seed/me/100/100" alt="Profile" />
      </div>
    </div>
  </header>
);

const Navbar = ({ active, onChange }: { active: string, onChange: (v: string) => void }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 h-16 flex items-center justify-around px-2">
    {[
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'rescue', icon: PlusCircle, label: 'Resgate' },
      { id: 'appointments', icon: Calendar, label: 'Agenda' },
      { id: 'profile', icon: UserIcon, label: 'Perfil' },
    ].map((item) => (
      <button
        key={item.id}
        onClick={() => onChange(item.id)}
        className={`flex flex-col items-center gap-1 transition-colors ${
          active === item.id ? 'text-blue-600' : 'text-gray-400'
        }`}
      >
        <item.icon className="w-6 h-6" />
        <span className="text-[10px] font-medium">{item.label}</span>
      </button>
    ))}
  </nav>
);

// Define props interface to handle the 'key' prop issue correctly in TS
interface NGOCardProps {
  ngo: NGO;
  onDetails: () => void;
  onDonate: () => void;
  key?: React.Key;
}

const NGOCard = ({ ngo, onDetails, onDonate }: NGOCardProps) => (
  <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
    <div className="flex gap-4">
      <img src={ngo.avatar} alt={ngo.name} className="w-24 h-24 rounded-xl object-cover" />
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900">{ngo.name}</h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{ngo.distance}</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">{ngo.details?.bio?.substring(0, 60)}...</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {ngo.tags.map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-medium">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
    <div className="flex gap-2 mt-4">
      <Button variant="outline" className="flex-1 py-1.5 text-sm" onClick={onDonate}>Doar</Button>
      <Button variant="primary" className="flex-1 py-1.5 text-sm" onClick={onDetails}>Ver Detalhes</Button>
      <Button variant="ghost" className="p-2 border border-gray-100 rounded-xl">
        <Heart className="w-5 h-5 text-red-400" />
      </Button>
    </div>
  </div>
);

// --- Main Views ---

export default function App() {
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'u1',
    name: 'Lucas Silva',
    email: 'lucas@gmail.com',
    role: UserRole.USER
  });
  const [rescueCalls, setRescueCalls] = useState<RescueCall[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [curiosity, setCuriosity] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    getAnimalCuriosity().then(setCuriosity);
  }, []);

  const handleRescueSubmit = (e: any) => {
    e.preventDefault();
    const form = e.target;
    const newCall: RescueCall = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser?.id || '',
      userName: currentUser?.name || '',
      description: form.description.value,
      photo: 'https://picsum.photos/400/300',
      status: RescueStatus.OPEN,
      location: { lat: -23, lng: -46, address: 'Rua das Flores, 123' },
      createdAt: new Date().toISOString()
    };
    setRescueCalls([newCall, ...rescueCalls]);
    alert('Chamado de resgate enviado com sucesso! ONGs próximas foram notificadas.');
    setCurrentTab('home');
  };

  const handleDonation = (ngoName: string) => {
    alert(`Redirecionando para o PIX da ${ngoName}. O OnliPet não intermedia valores.`);
  };

  const renderHome = () => (
    <div className="space-y-4 pb-20">
      {/* Search & Filters */}
      <div className="sticky top-16 bg-white pt-2 pb-4 z-40 px-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou cidade" 
            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-600/20 outline-none"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="flex bg-gray-100 p-1 rounded-xl flex-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Lista
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              Mapa
            </button>
          </div>
          <button className="p-2 bg-gray-100 rounded-xl text-gray-500">
            <Filter className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-4 px-4">
          {['Perto de mim', 'Adoção', 'Doação', 'Resgate', 'Voluntariado'].map(f => (
            <button key={f} className="whitespace-nowrap px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-semibold border border-blue-100">
              {f}
            </button>
          ))}
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="px-4">
          {/* Curiosity Banner */}
          <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-3xl p-4 text-white mb-6 relative overflow-hidden shadow-lg shadow-orange-100">
            <div className="relative z-10">
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-80">Curiosidade do Dia</span>
              <p className="font-medium mt-1 leading-relaxed">
                {curiosity || 'Carregando fato animal incrível...'}
              </p>
            </div>
            <PawPrint className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
          </div>

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">ONGs Parceiras</h2>
            <button className="text-blue-600 text-sm font-semibold">Ver todas</button>
          </div>

          {MOCK_NGOS.map(ngo => (
            <NGOCard key={ngo.id} ngo={ngo} onDetails={() => {}} onDonate={() => handleDonation(ngo.name)} />
          ))}

          {/* Banner Cadastro */}
          <div className="bg-blue-600 rounded-2xl p-6 text-white text-center mt-8 mb-4">
            <h3 className="text-lg font-bold">Faça parte da nossa rede!</h3>
            <p className="text-blue-100 text-sm mt-2 mb-4">Cadastre sua ONG e receba chamados de resgate direto no seu celular.</p>
            <Button variant="secondary" className="w-full">Cadastrar ONG</Button>
          </div>
        </div>
      ) : (
        <div className="h-[calc(100vh-280px)] w-full relative overflow-hidden bg-gray-200">
          {/* Simulated Map View */}
          <div className="absolute inset-0 bg-blue-50 flex items-center justify-center">
            <div className="text-center p-8">
              <MapIcon className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <p className="text-blue-500 font-medium">Google Maps API Integrada</p>
              <p className="text-xs text-gray-400 mt-1">Carregando marcadores 3D personalizados...</p>
            </div>
            {/* Custom Markers Simulation */}
            {MOCK_NGOS.map((ngo, idx) => (
              <div 
                key={ngo.id}
                className="absolute flex flex-col items-center animate-bounce"
                style={{ top: `${30 + idx * 20}%`, left: `${20 + idx * 40}%` }}
              >
                <div className="bg-white p-2 rounded-2xl shadow-xl border-2 border-orange-500 relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img src={ngo.avatar} alt="ngo" />
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-orange-500 rotate-45 border-r border-b border-orange-500"></div>
                </div>
                <span className="bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm mt-3 border border-gray-100">
                  {ngo.name}
                </span>
              </div>
            ))}
          </div>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-white rounded-2xl p-4 shadow-2xl flex items-center gap-4">
            <img src={MOCK_NGOS[0].avatar} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">{MOCK_NGOS[0].name}</h4>
              <p className="text-[10px] text-gray-500">A 2.5 km de você • Aberto agora</p>
            </div>
            <Button variant="primary" className="px-4 py-2 text-xs">Acessar</Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderRescue = () => (
    <div className="px-4 pt-4 pb-20 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-red-100 rounded-2xl">
          <PlusCircle className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Solicitar Resgate</h2>
          <p className="text-sm text-gray-500">Ajude um animal em perigo</p>
        </div>
      </div>

      <form onSubmit={handleRescueSubmit} className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Localização</label>
          <div className="relative">
            <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 w-5 h-5" />
            <input 
              required
              type="text" 
              placeholder="Detectando GPS ou digite endereço..." 
              className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-600/10"
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição da Situação</label>
          <textarea 
            required
            name="description"
            rows={4} 
            placeholder="Ex: Cachorro ferido na perna, parece assustado. Cor caramelo..." 
            className="w-full p-4 bg-gray-50 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-blue-600/10 resize-none"
          ></textarea>
        </div>

        <div className="flex gap-3">
          <button type="button" className="flex-1 bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 border-2 border-dashed border-gray-200">
            <Camera className="w-8 h-8 text-gray-400" />
            <span className="text-xs font-medium text-gray-500">Tirar Foto</span>
          </button>
          <button type="button" className="flex-1 bg-gray-100 rounded-2xl flex flex-col items-center justify-center p-6 gap-2 border-2 border-dashed border-gray-200">
            <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xl font-bold">+</div>
            <span className="text-xs font-medium text-gray-500">Galeria</span>
          </button>
        </div>

        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 flex gap-3">
          <div className="bg-orange-100 p-2 rounded-xl h-fit">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <p className="text-xs text-orange-800 leading-tight">
            Seu chamado será enviado para <strong>8 ONGs próximas</strong>. Fique atento às notificações para atualizações.
          </p>
        </div>

        <Button variant="danger" className="w-full py-4 text-lg">Enviar Chamado</Button>
      </form>
    </div>
  );

  const renderAppointments = () => (
    <div className="px-4 pt-4 pb-20 space-y-4">
      <h2 className="text-xl font-bold">Agendamentos</h2>
      <div className="flex gap-2">
        <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">Próximos</button>
        <button className="flex-1 py-2 bg-gray-100 text-gray-500 rounded-xl text-sm font-semibold">Histórico</button>
      </div>

      <div className="space-y-4 mt-4">
        {MOCK_VETS.map(vet => (
          <div key={vet.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <img src={vet.avatar} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{vet.name}</h4>
              <p className="text-xs text-gray-500">Veterinário • Clínica</p>
              <div className="flex gap-2 mt-2">
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Disponível Amanhã</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-2xl p-8 border-2 border-dashed border-gray-200 text-center mt-4">
        <p className="text-sm text-gray-500">Nenhum agendamento ativo.</p>
        <Button variant="outline" className="mt-4 mx-auto">Agendar com Profissional</Button>
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="pb-20">
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 h-40 relative">
        <div className="absolute -bottom-12 left-6 p-1 bg-white rounded-3xl shadow-lg">
          <img src="https://picsum.photos/seed/me/200/200" className="w-24 h-24 rounded-2xl object-cover" />
        </div>
      </div>
      
      <div className="px-6 pt-16 space-y-6">
        <div>
          <h2 className="text-2xl font-bold">{currentUser?.name}</h2>
          <p className="text-gray-500">Amante de animais e voluntário</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold text-blue-600">12</span>
            <span className="text-xs text-gray-500 font-medium">Doações</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl text-center">
            <span className="block text-2xl font-bold text-orange-500">3</span>
            <span className="text-xs text-gray-500 font-medium">Resgates</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Configurações</h3>
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {[
              { icon: UserIcon, label: 'Editar Perfil', color: 'text-blue-500' },
              { icon: MapIcon, label: 'Endereços Salvos', color: 'text-orange-500' },
              { icon: Bell, label: 'Notificações', color: 'text-purple-500' },
              { icon: MessageCircle, label: 'Ajuda e Suporte', color: 'text-green-500' },
              { icon: LogOut, label: 'Sair', color: 'text-red-500', action: () => alert('Saindo...') },
            ].map((item, idx) => (
              <button 
                key={idx} 
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-[10px] text-gray-400">OnliPet v1.0.0 • Amethylast Cyber</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col">
      <Header title="OnliPet" onNotify={() => alert('Sem novas notificações')} />
      
      <main className="flex-1 mt-16 overflow-y-auto hide-scrollbar">
        {currentTab === 'home' && renderHome()}
        {currentTab === 'rescue' && renderRescue()}
        {currentTab === 'appointments' && renderAppointments()}
        {currentTab === 'profile' && renderProfile()}
      </main>

      <Navbar active={currentTab} onChange={setCurrentTab} />
    </div>
  );
}
