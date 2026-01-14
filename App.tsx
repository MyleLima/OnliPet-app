
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Map as MapIcon, Search, Calendar, User as UserIcon, PlusCircle, 
  Heart, MessageCircle, ChevronRight, Filter, Navigation, Camera, LogOut, 
  Bell, PawPrint, ArrowLeft, Info, CheckCircle2, Clock, MapPin, ShieldCheck,
  Settings, History, Mail, Lock, Phone, Building, Briefcase, Tag, MoreHorizontal,
  X, Trash2, Save, Globe, Share2, Award, Sparkles, Send
} from 'lucide-react';
import { User, UserRole, Pet, RescueCall, RescueStatus, Appointment, VolunteerApplication } from './types';
import { MOCK_PROVIDERS, ANIMAL_MARKERS } from './constants';
import { getAnimalCuriosity } from './geminiService';
import { db } from './database';

// --- Shared Utility Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-4 py-2.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-[10px] uppercase tracking-widest";
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-lg shadow-md",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
    outline: "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-blue-600 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md"
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

// --- View Components ---

const AuthView = ({ onAuth }: { onAuth: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    
    if (isRegister) {
      const result = db.register({
        id: '',
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role: role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.email.value}`,
        city: form.city?.value || 'São Paulo',
        country: 'Brasil',
        details: {
          bio: form.bio?.value || '',
          cnpj: form.cnpj?.value || '',
          actingType: form.actingType?.value || '',
          openingHours: form.hours?.value || '08:00 - 18:00',
          curiosity: 'Toda vida importa!'
        }
      } as any);

      if (result.success) onAuth(result.user!);
      else alert(result.message);
    } else {
      const result = db.login(form.email.value, form.password.value);
      if (result.success) onAuth(result.user!);
      else alert(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center animate-in fade-in duration-700">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[24px] flex items-center justify-center mb-6 shadow-2xl shadow-blue-100/50">
          <PawPrint className="text-white w-12 h-12" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-gray-900 italic">OnliPet</h1>
        <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] mt-3">Amethylast Cyber</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && step === 1 ? (
          <div className="space-y-4 animate-in slide-in-from-right duration-500">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.2em] text-center mb-6">Qual seu objetivo?</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { r: UserRole.USER, l: 'Cuidar de Pet', i: UserIcon },
                { r: UserRole.NGO, l: 'Gerenciar ONG', i: Building },
                { r: UserRole.VET, l: 'Veterinário', i: Briefcase },
                { r: UserRole.PETSHOP, l: 'Pet Shop', i: Tag },
              ].map(item => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => { setRole(item.r); setStep(2); }}
                  className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${role === item.r ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-xl' : 'border-gray-50 bg-gray-50 text-gray-400'}`}
                >
                  <item.i className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.l}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {isRegister && <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mb-2"><ArrowLeft className="w-3 h-3" /> Voltar</button>}
            <input name="name" type="text" placeholder={role === UserRole.USER ? "Seu Nome" : "Nome do Local"} required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
            <input name="email" type="email" placeholder="E-mail de acesso" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
            <input name="password" type="password" placeholder="Sua senha secreta" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
            <Button type="submit" variant="primary" className="w-full py-5 text-sm mt-4">
              {isRegister ? 'Criar minha conta' : 'Entrar no OnliPet'}
            </Button>
          </div>
        )}
      </form>

      <button onClick={() => { setIsRegister(!isRegister); setStep(1); }} className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-full">
        {isRegister ? 'Já é membro? Login' : 'Ainda não tem conta? Cadastro'}
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [subView, setSubView] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [curiosity, setCuriosity] = useState('');

  useEffect(() => { 
    getAnimalCuriosity().then(setCuriosity); 
  }, []);

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (!user) return <AuthView onAuth={setUser} />;

  const handleBack = () => { setSubView(null); setSelectedItem(null); };

  const renderHome = () => (
    <div className="space-y-4 pb-24">
      {/* Header Estilo App Mobile */}
      <div className="sticky top-0 bg-white pt-4 pb-3 px-4 z-40 border-b border-gray-100 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
          <input 
            type="text" 
            placeholder="O que seu pet precisa hoje?" 
            className="w-full pl-12 pr-5 py-4 bg-gray-50 rounded-[24px] text-[11px] font-medium outline-none border border-transparent focus:border-orange-100 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {/* Toggle LISTA / MAPA igual à imagem */}
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[18px]">
          <button onClick={() => setViewMode('list')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>Lista</button>
          <button onClick={() => setViewMode('map')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>Mapa</button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {viewMode === 'list' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Insight Card Blue/Orange Gradient */}
            <div className="bg-gradient-to-br from-blue-600 to-orange-500 p-6 rounded-[32px] text-white relative overflow-hidden shadow-2xl shadow-blue-100/30">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-90">Insight OnliPet</span>
                <Sparkles className="w-4 h-4 text-orange-200 fill-current" />
              </div>
              <p className="text-xs font-bold leading-relaxed pr-10">{curiosity || 'Carregando uma curiosidade incrível para você...'}</p>
              <PawPrint className="absolute -bottom-6 -right-6 w-28 h-28 text-white/10 -rotate-12" />
            </div>

            <div className="flex items-center justify-between pt-1 px-1">
              <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] italic">Recomendados</h2>
              <button className="p-2 bg-gray-100 rounded-xl"><Filter className="w-4 h-4 text-gray-400" /></button>
            </div>

            {/* Service Cards - Layout da Imagem */}
            {filteredProviders.map(p => (
              <div key={p.id} className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-lg transition-all active:scale-[0.98]">
                <div className="flex gap-5">
                  <img src={p.avatar} className="w-24 h-24 rounded-[32px] object-cover shadow-inner bg-gray-50 border-4 border-white" />
                  <div className="flex-1 space-y-1 mt-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-gray-900 text-[13px] tracking-tight">{p.name}</h3>
                      <span className="text-[8px] font-black px-2 py-1 bg-gray-100 rounded-lg uppercase text-gray-400">{p.role}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed font-medium">{p.details?.bio}</p>
                    <div className="flex items-center gap-1.5 pt-1">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">São Paulo, SP</span>
                    </div>
                  </div>
                </div>
                {/* Botões do Card idênticos à imagem */}
                <div className="flex gap-3 mt-1">
                  <Button variant="ghost" className="flex-1 py-3.5 rounded-[20px]" onClick={() => { setSelectedItem(p); setSubView('details'); }}>Detalhes</Button>
                  <Button variant="primary" className="flex-1 py-3.5 rounded-[20px]" onClick={() => { setSelectedItem(p); setSubView('action'); }}>
                    {p.role === UserRole.NGO ? 'Apoiar' : 'Agendar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Map View */
          <div className="h-[calc(100vh-280px)] w-full relative overflow-hidden bg-gray-50 rounded-[48px] border-4 border-white shadow-2xl animate-in zoom-in duration-500">
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
               <Globe className="w-64 h-64 text-blue-600" />
             </div>
             {filteredProviders.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => setSelectedItem(p)}
                className="absolute flex flex-col items-center cursor-pointer transition-all hover:z-50 active:scale-90 group"
                style={{ top: `${20 + (idx % 3) * 20}%`, left: `${15 + (idx % 2) * 50}%` }}
              >
                <div className="relative">
                  <div className={`w-16 h-16 bg-white rounded-[22px] shadow-2xl border-4 ${idx % 2 === 0 ? 'border-orange-500' : 'border-blue-500'} flex items-center justify-center p-0.5 overflow-hidden transition-all group-hover:scale-110`}>
                    <img src={p.avatar} className="w-full h-full rounded-[18px] object-cover" />
                  </div>
                  <div className="absolute -top-4 -right-4 w-10 h-10 bg-white rounded-full shadow-lg border border-gray-50 flex items-center justify-center text-xl">
                    {ANIMAL_MARKERS[idx % 4].emoji}
                  </div>
                </div>
              </div>
            ))}
            {/* Map Mini-Card Contextual */}
            {selectedItem && (
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-[40px] shadow-2xl border border-white flex items-center gap-4 animate-in slide-in-from-bottom duration-300">
                <img src={selectedItem.avatar} className="w-16 h-16 rounded-[24px] object-cover shadow-lg border-2 border-white" />
                <div className="flex-1">
                  <h4 className="font-black text-[14px] text-gray-900 tracking-tight">{selectedItem.name}</h4>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Aberto agora</p>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setSubView('details')} className="text-[10px] font-black text-blue-600 uppercase border-b-2 border-blue-100">Ver Perfil</button>
                    <button onClick={() => setSelectedItem(null)} className="text-[10px] font-black text-gray-300 uppercase">Fechar</button>
                  </div>
                </div>
                <button onClick={() => setSubView('action')} className="w-14 h-14 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-blue-200 active:scale-90 transition-all">
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="pb-24 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-blue-600 to-orange-500 h-56 relative shadow-lg">
        <div className="absolute -bottom-12 left-10 p-2 bg-white rounded-[40px] shadow-2xl border-4 border-white group">
          <img src={user.avatar} className="w-28 h-28 rounded-[32px] object-cover group-hover:scale-105 transition-transform" />
          <button onClick={() => setSubView('edit_profile')} className="absolute -bottom-2 -right-2 p-3 bg-orange-500 text-white rounded-2xl shadow-xl active:scale-90 border-4 border-white"><Settings className="w-5 h-5" /></button>
        </div>
        <button onClick={() => alert('Compartilhar')} className="absolute top-8 right-8 p-3 bg-white/20 backdrop-blur-md text-white rounded-2xl"><Share2 className="w-5 h-5" /></button>
      </div>

      <div className="px-10 pt-20 space-y-10">
        <div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic">{user.name}</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[11px] text-gray-400 font-black uppercase tracking-widest">{user.city}, {user.country}</span>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
            <span className="text-[11px] text-blue-600 font-black uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Conta Verificada</span>
          </div>
        </div>

        {user.role === UserRole.USER ? (
          <PetListView pets={user.pets || []} onAdd={() => setSubView('add_pet')} onRemove={(id) => {
            const updated = { ...user, pets: user.pets?.filter(p => p.id !== id) };
            db.updateUser(updated); setUser(updated);
          }} />
        ) : (
          <div className="space-y-4">
             <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Seu Desempenho</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-blue-50/50 p-8 rounded-[40px] text-center border border-blue-100 shadow-inner"><span className="block text-4xl font-black text-blue-600">128</span><p className="text-[10px] text-blue-400 font-black uppercase mt-2">Visitas</p></div>
               <div className="bg-orange-50/50 p-8 rounded-[40px] text-center border border-orange-100 shadow-inner"><span className="block text-4xl font-black text-orange-500">14</span><p className="text-[10px] text-orange-400 font-black uppercase mt-2">Chamados</p></div>
             </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Configurações Rápidas</h3>
          <div className="bg-white rounded-[40px] border border-gray-100 overflow-hidden shadow-sm">
             <button onClick={() => setSubView('edit_profile')} className="w-full flex items-center justify-between p-6 border-b border-gray-50 hover:bg-gray-50 transition-all"><div className="flex items-center gap-5"><UserIcon className="w-6 h-6 text-blue-500" /><span className="text-sm font-bold text-gray-700">Editar Meus Dados</span></div><ChevronRight className="w-5 h-5 text-gray-200" /></button>
             <button onClick={() => setSubView('donation')} className="w-full flex items-center justify-between p-6 border-b border-gray-50 hover:bg-gray-50 transition-all"><div className="flex items-center gap-5"><Heart className="w-6 h-6 text-orange-500" /><span className="text-sm font-bold text-gray-700">Minhas Doações</span></div><ChevronRight className="w-5 h-5 text-gray-200" /></button>
             <button onClick={db.logout} className="w-full flex items-center justify-between p-6 text-red-500 hover:bg-red-50 transition-all"><div className="flex items-center gap-5"><LogOut className="w-6 h-6" /><span className="text-sm font-bold">Desconectar</span></div><ChevronRight className="w-5 h-5 text-red-200" /></button>
          </div>
        </div>
        
        <p className="text-center text-[9px] text-gray-300 font-black tracking-[0.3em] uppercase pb-10">OnliPet • v1.2.0 • Amethylast Cyber</p>
      </div>
    </div>
  );

  const renderContent = () => {
    if (subView === 'add_pet') return <AddPetView onBack={handleBack} onSave={(pet) => { db.addPetToUser(user.id, pet); setUser(db.getCurrentUser()); handleBack(); }} />;
    if (subView === 'details') return <DetailsView item={selectedItem} onBack={handleBack} onAction={() => setSubView('action')} />;
    if (subView === 'action') return selectedItem.role === UserRole.NGO ? <NGOActionView ngo={selectedItem} onBack={handleBack} /> : <BookingView provider={selectedItem} pets={user.pets || []} onBack={handleBack} />;
    if (subView === 'edit_profile') return <EditProfileView user={user} onBack={handleBack} onSave={(data: any) => { db.updateUser(data); setUser(db.getCurrentUser()); handleBack(); }} />;
    if (subView === 'volunteer') return <VolunteerFormView ngo={selectedItem} onBack={handleBack} />;
    if (subView === 'animal_list') return <AnimalListView provider={selectedItem} onBack={handleBack} />;

    switch (currentTab) {
      case 'home': return renderHome();
      case 'rescue': return <RescueView onBack={() => setCurrentTab('home')} />;
      case 'appointments': return <AgendaView onBack={() => setCurrentTab('home')} />;
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white shadow-2xl relative overflow-hidden flex flex-col antialiased select-none">
      {!subView && (
        <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-[14px] flex items-center justify-center shadow-lg shadow-blue-100/40">
              <PawPrint className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent tracking-tighter uppercase italic">OnliPet</h1>
          </div>
          <button className="p-3 bg-gray-50 rounded-full relative active:scale-90 transition-all"><Bell className="w-5 h-5 text-gray-400" /><span className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span></button>
        </header>
      )}

      <main className={`flex-1 ${!subView ? 'mt-16' : ''} overflow-y-auto hide-scrollbar`}>
        {renderContent()}
      </main>

      {!subView && (
        <nav className="fixed bottom-0 left-0 right-0 h-22 bg-white/95 backdrop-blur-md border-t border-gray-100 flex items-center justify-around px-4 z-50 shadow-[0_-12px_32px_rgba(0,0,0,0.04)]">
          {[
            { id: 'home', icon: Home, label: 'Início' },
            { id: 'rescue', icon: PlusCircle, label: 'Resgate' },
            { id: 'appointments', icon: Calendar, label: 'Agenda' },
            { id: 'profile', icon: UserIcon, label: 'Perfil' },
          ].map((item) => (
            <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1.5 transition-all w-20 py-2 ${currentTab === item.id ? 'text-blue-600 scale-110' : 'text-gray-300'}`}>
              <item.icon className={`w-6 h-6 ${currentTab === item.id ? 'stroke-[3px]' : 'stroke-2'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}

// --- Specific Views ---

const DetailsView = ({ item, onBack, onAction }: any) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="pb-20 animate-in fade-in duration-500 bg-white min-h-screen">
      <div className="h-80 relative">
        <img src={item.avatar} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <button onClick={onBack} className="absolute top-10 left-8 p-3.5 bg-white/20 backdrop-blur-md text-white rounded-2xl active:scale-90 transition-all shadow-xl"><ArrowLeft className="w-6 h-6" /></button>
        <div className="absolute bottom-10 left-10 text-white pr-10">
          <h2 className="text-4xl font-black tracking-tighter leading-none mb-3 italic">{item.name}</h2>
          <div className="flex items-center gap-3">
             <span className="text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-orange-500 rounded-xl text-white shadow-lg">{item.role}</span>
             <span className="text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 opacity-90"><MapPin className="w-4 h-4 text-orange-400" /> {item.details?.city || 'São Paulo'}</span>
          </div>
        </div>
      </div>

      <div className="px-10 pt-12 -mt-12 bg-white rounded-t-[56px] space-y-10 relative">
         <div className="flex gap-4 p-1.5 bg-gray-50 rounded-[20px]">
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-[16px] ${activeTab === 'info' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>Sobre</button>
            <button onClick={() => setActiveTab('pets')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-[16px] ${activeTab === 'pets' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}>Pets</button>
         </div>

         {activeTab === 'info' ? (
           <div className="space-y-8 animate-in fade-in">
             <div className="space-y-4">
                <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Nossa História</h3>
                <p className="text-gray-600 text-[13px] leading-relaxed font-medium">{item.details?.bio || 'Dedicamos cada dia para garantir que nenhum animal sofra. Junte-se a nós nesta causa nobre.'}</p>
                {item.role === UserRole.NGO && (
                  <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 flex items-start gap-4">
                    <Award className="w-7 h-7 text-orange-500 shrink-0" />
                    <p className="text-[11px] font-black text-orange-800 leading-relaxed uppercase opacity-80 italic">"{item.details?.curiosity || 'Toda vida merece ser salva.'}"</p>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-5">
                <div className="p-6 bg-gray-50 rounded-[32px] space-y-3 border border-gray-100">
                   <Clock className="w-6 h-6 text-blue-600" />
                   <span className="block text-[10px] font-black uppercase text-gray-400">Aberto</span>
                   <p className="text-[11px] font-black text-gray-900">{item.details?.openingHours || '08:00 - 18:00'}</p>
                </div>
                <div className="p-6 bg-gray-50 rounded-[32px] space-y-3 border border-gray-100">
                   <MessageCircle className="w-6 h-6 text-orange-500" />
                   <span className="block text-[10px] font-black uppercase text-gray-400">Resposta</span>
                   <p className="text-[11px] font-black text-gray-900">Média 15min</p>
                </div>
             </div>
           </div>
         ) : (
           <div className="animate-in slide-in-from-right">
             <p className="text-center py-10 text-[11px] font-black text-gray-300 uppercase tracking-widest italic">Nenhum pet cadastrado para adoção no momento.</p>
           </div>
         )}

         <div className="flex gap-4 pt-4 pb-12">
            <Button variant="ghost" className="flex-1 py-5 rounded-[24px]" onClick={() => alert('Abrindo chat privado...')}>Mensagem</Button>
            <Button variant="primary" className="flex-1 py-5 rounded-[24px]" onClick={onAction}>{item.role === UserRole.NGO ? 'Apoiar Agora' : 'Agendar'}</Button>
         </div>
      </div>
    </div>
  );
};

const NGOActionView = ({ ngo, onBack }: any) => (
  <div className="p-10 space-y-10 animate-in slide-in-from-right duration-500 bg-white min-h-screen">
    <div className="text-center space-y-6">
       <div className="relative inline-block">
         <img src={ngo.avatar} className="w-32 h-32 rounded-[48px] mx-auto object-cover shadow-2xl border-4 border-white" />
         <div className="absolute -bottom-3 -right-3 bg-orange-500 text-white p-3 rounded-2xl shadow-xl animate-bounce"><Heart className="w-6 h-6 fill-current" /></div>
       </div>
       <h3 className="text-3xl font-black tracking-tighter italic">Transforme vidas com a {ngo.name}</h3>
    </div>
    <div className="grid grid-cols-3 gap-4">
       {['R$ 20', 'R$ 60', 'R$ 120'].map(v => <button key={v} onClick={() => alert('Valor selecionado!')} className="py-6 border-2 border-orange-50 rounded-[28px] text-orange-600 font-black text-xs hover:bg-orange-500 hover:text-white transition-all shadow-sm uppercase tracking-widest">{v}</button>)}
    </div>
    <div className="bg-blue-50/40 p-10 rounded-[48px] border border-blue-100 text-center space-y-5 shadow-inner">
       <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Chave PIX Oficial</span>
       <p className="font-mono font-black text-lg text-blue-900 tracking-tight break-all">doe@onlipet.org.br</p>
       <Button variant="outline" className="mx-auto px-12 py-4 uppercase text-[11px]" onClick={() => alert('PIX copiado!')}>Copiar para o banco</Button>
    </div>
    <div className="p-8 bg-gray-50 rounded-[40px] border border-gray-100 flex items-start gap-5">
      <Info className="w-8 h-8 text-blue-600 shrink-0" />
      <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase opacity-80">100% do valor vai direto para a ONG. Não cobramos taxas sobre doações.</p>
    </div>
    <Button variant="primary" className="w-full py-6 text-sm shadow-2xl shadow-blue-100 uppercase tracking-widest mt-4" onClick={() => { alert('Sua doação foi registrada. Obrigado por ser herói! ❤️'); onBack(); }}>Confirmar Apoio</Button>
  </div>
);

const BookingView = ({ provider, pets, onBack }: any) => {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);

  return (
    <div className="p-10 space-y-10 animate-in slide-in-from-right duration-500 bg-white min-h-screen">
      <div className="flex items-center gap-6">
         <img src={provider.avatar} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl border-4 border-white" />
         <div>
            <h4 className="text-2xl font-black tracking-tighter italic">{provider.name}</h4>
            <p className="text-[11px] text-orange-500 font-black uppercase tracking-widest">Atendimento Disponível</p>
         </div>
      </div>

      <div className="space-y-5">
         <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Selecione o Animal</h5>
         {pets.length > 0 ? (
           <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
             {pets.map((pet: Pet) => (
               <button 
                key={pet.id} 
                onClick={() => setSelectedPet(pet)}
                className={`flex flex-col items-center gap-2 p-4 rounded-[28px] border-2 transition-all min-w-[100px] ${selectedPet?.id === pet.id ? 'border-blue-600 bg-blue-50' : 'border-gray-50 bg-gray-50'}`}
               >
                 <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                 <span className="text-[10px] font-black uppercase tracking-tighter">{pet.name}</span>
               </button>
             ))}
           </div>
         ) : (
           <p className="text-[10px] text-red-500 font-black uppercase p-4 bg-red-50 rounded-2xl">Cadastre um pet no seu perfil para agendar.</p>
         )}
      </div>

      <div className="space-y-5">
         <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Horários de Hoje</h5>
         <div className="grid grid-cols-2 gap-4">
            {['14:00', '15:30', '17:00', '18:30'].map(h => <button key={h} className="p-6 bg-gray-50 border border-gray-100 rounded-[32px] text-[11px] font-black uppercase text-gray-800 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm">Atendimento {h}</button>)}
         </div>
      </div>

      <Button variant="primary" className="w-full py-6 text-sm shadow-2xl shadow-blue-100 uppercase tracking-widest" onClick={() => { alert('Solicitação enviada ao profissional!'); onBack(); }}>Confirmar Reserva</Button>
    </div>
  );
};

const RescueView = ({ onBack }: any) => (
  <div className="p-10 space-y-10 animate-in slide-in-from-bottom duration-500 pb-24 bg-white min-h-screen">
    <div className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex items-center gap-5">
       <div className="w-16 h-16 bg-red-600 rounded-[22px] flex items-center justify-center text-white shadow-xl shadow-red-200"><PlusCircle className="w-8 h-8" /></div>
       <div>
          <h3 className="text-base font-black text-red-900 uppercase tracking-tight italic">Alerta Vermelho</h3>
          <p className="text-[10px] text-red-700 font-bold opacity-80 uppercase">Notificação imediata para ONGs locais</p>
       </div>
    </div>

    <div className="space-y-6">
       <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Local Exato</label>
          <div className="relative">
             <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 w-6 h-6" />
             <input placeholder="Detectando sua posição..." className="w-full pl-16 pr-6 py-5 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner italic" disabled defaultValue="Rua dos Resgates, 777 - SP" />
          </div>
       </div>
       <div className="space-y-2">
          <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Situação Atual</label>
          <textarea placeholder="Ex: Animal abandonado, parece ferido, muito assustado..." className="w-full p-8 bg-gray-50 rounded-[40px] h-48 resize-none text-xs font-medium border-none outline-none shadow-inner" />
       </div>
       <button className="w-full h-48 bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-4 group hover:bg-orange-50/40 transition-all active:scale-[0.98]">
          <Camera className="w-12 h-12 text-gray-200 group-hover:text-orange-500 transition-colors" />
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover:text-orange-500">Adicionar Foto Evidência</span>
       </button>
    </div>
    <Button variant="danger" className="w-full py-7 text-sm shadow-2xl shadow-red-200 uppercase tracking-[0.2em] font-black" onClick={() => { alert('ALERTA ENVIADO! Equipes e voluntários próximos foram avisados.'); onBack(); }}>Disparar Resgate</Button>
  </div>
);

const AgendaView = ({ onBack }: any) => (
  <div className="p-10 space-y-10 bg-white min-h-screen">
     <div className="flex items-center justify-between px-2">
        <h2 className="text-3xl font-black text-gray-900 tracking-tighter italic uppercase">Agenda</h2>
        <div className="p-3 bg-blue-50 rounded-[20px] shadow-sm"><History className="w-6 h-6 text-blue-600" /></div>
     </div>
     <div className="flex flex-col items-center py-28 opacity-20 text-center gap-8">
        <div className="w-24 h-24 bg-gray-100 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl"><Calendar className="w-12 h-12 text-gray-300" /></div>
        <p className="text-[12px] font-black uppercase tracking-[0.4em] italic">Agenda vazia hoje</p>
     </div>
     <Button variant="primary" className="w-full py-6 rounded-[32px] text-xs" onClick={onBack}>Ver Serviços Disponíveis</Button>
  </div>
);

const PetListView = ({ pets, onAdd, onRemove }: any) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between px-1">
      <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest italic">Meus Companheiros</h3>
      <button onClick={onAdd} className="p-3 bg-orange-50 text-orange-600 rounded-full active:scale-90 transition-all shadow-md"><PlusCircle className="w-6 h-6" /></button>
    </div>
    <div className="grid grid-cols-2 gap-5">
      {pets.map((pet: Pet) => (
        <div key={pet.id} className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm relative group hover:shadow-md transition-all">
          <button onClick={() => onRemove(pet.id)} className="absolute -top-2 -right-2 p-2.5 bg-red-50 text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg border-2 border-white"><Trash2 className="w-4 h-4" /></button>
          <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-full h-32 rounded-[32px] object-cover mb-4 shadow-inner border-2 border-gray-50" />
          <h4 className="text-[14px] font-black text-gray-900 text-center italic tracking-tight">{pet.name}</h4>
          <p className="text-[10px] text-blue-500 text-center uppercase font-black mt-1 tracking-tighter">{pet.breed || 'SRD'} • {pet.age}</p>
        </div>
      ))}
    </div>
    {pets.length === 0 && (
      <div className="p-12 border-4 border-dashed border-gray-50 rounded-[48px] text-center space-y-3">
        <PawPrint className="w-10 h-10 text-gray-100 mx-auto" />
        <p className="text-[10px] font-black text-gray-300 uppercase italic">Cadastre seu primeiro pet</p>
      </div>
    )}
  </div>
);

const AddPetView = ({ onSave, onBack }: any) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Cachorro');
  const [breed, setBreed] = useState('');

  return (
    <div className="p-10 space-y-8 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen">
      <div className="flex items-center gap-5"><button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button><h3 className="text-2xl font-black tracking-tighter uppercase italic">Novo Amigo</h3></div>
      <div className="space-y-6">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Nome</label>
          <input placeholder="Como se chama?" className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Espécie</label>
          <select className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setType(e.target.value)}>
            <option>Cachorro</option>
            <option>Gato</option>
            <option>Pássaro</option>
            <option>Exótico</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Raça</label>
          <input placeholder="SRD, Golden, Persa..." className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner" onChange={e => setBreed(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Idade Estimada</label>
          <input placeholder="ex: 2 anos" className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-medium shadow-inner" id="age" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-3">Saúde e Notas</label>
          <textarea placeholder="Vacinas em dia? Alergias? Temperamento?" className="w-full p-8 bg-gray-50 rounded-[40px] h-44 resize-none text-xs font-medium border-none outline-none shadow-inner" id="obs" />
        </div>
        <Button variant="primary" className="w-full py-6 text-sm italic" onClick={() => {
          if (!name) return alert('Dê um nome ao seu pet!');
          onSave({ id: '', name, breed, type, photo: '', age: (document.getElementById('age') as any).value, observations: (document.getElementById('obs') as any).value });
        }}>Salvar no Perfil</Button>
      </div>
    </div>
  );
};

const EditProfileView = ({ user, onBack, onSave }: any) => {
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city || '');
  const [bio, setBio] = useState(user.details?.bio || '');

  return (
    <div className="p-10 space-y-8 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen">
       <div className="flex items-center gap-5"><button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button><h3 className="text-2xl font-black tracking-tighter uppercase italic">Editar Perfil</h3></div>
       <div className="space-y-6">
          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Seu Nome/Razão</label>
             <input value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner" />
          </div>
          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Cidade / Localização</label>
             <input value={city} onChange={e => setCity(e.target.value)} className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner" />
          </div>
          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Sobre você / Bio</label>
             <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-8 bg-gray-50 rounded-[40px] h-48 resize-none text-xs font-medium border-none outline-none shadow-inner" />
          </div>
          <Button variant="primary" className="w-full py-6 text-sm" onClick={() => onSave({ ...user, name, city, details: { ...user.details, bio } })}>Confirmar Alterações</Button>
       </div>
    </div>
  );
};

const VolunteerFormView = ({ ngo, onBack }: any) => (
  <div className="p-10 space-y-10 animate-in slide-in-from-right duration-500 bg-white min-h-screen">
    <div className="flex items-center gap-6">
       <img src={ngo.avatar} className="w-20 h-20 rounded-[28px] object-cover shadow-xl border-2 border-white" />
       <div>
          <h4 className="text-xl font-black tracking-tighter italic">Seja voluntário na {ngo.name}</h4>
       </div>
    </div>
    <div className="space-y-6">
       <div className="p-8 bg-blue-50/50 rounded-[40px] border border-blue-100 flex flex-col gap-4">
          <Award className="w-10 h-10 text-blue-600" />
          <p className="text-[11px] text-blue-900 font-bold leading-relaxed uppercase opacity-80">As ONGs precisam de ajuda com passeios, limpeza e divulgação. Conte-nos como você pode ajudar!</p>
       </div>
       <textarea placeholder="Escreva uma breve mensagem de interesse..." className="w-full p-8 bg-gray-50 rounded-[40px] h-56 resize-none text-xs font-medium border-none outline-none shadow-inner" />
       <Button variant="primary" className="w-full py-6 text-sm uppercase tracking-widest" onClick={() => { alert('Inscrição enviada! A ONG entrará em contato.'); onBack(); }}>Enviar Solicitação</Button>
    </div>
  </div>
);

const AnimalListView = ({ provider, onBack }: any) => (
  <div className="p-10 space-y-10 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen">
     <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">Pets da {provider.name}</h2>
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl"><X className="w-6 h-6" /></button>
     </div>
     <div className="flex flex-col items-center py-24 text-center gap-6 opacity-30">
        <Heart className="w-16 h-16 text-gray-300" />
        <p className="text-[11px] font-black uppercase tracking-[0.3em] italic">Lista de adoção em atualização</p>
     </div>
  </div>
);
