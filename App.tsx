
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Map as MapIcon, Search, Calendar, User as UserIcon, PlusCircle, 
  Heart, MessageCircle, ChevronRight, Filter, Navigation, Camera, LogOut, 
  Bell, PawPrint, ArrowLeft, Info, CheckCircle2, Clock, MapPin, ShieldCheck,
  Settings, History, Mail, Lock, Phone, Building, Briefcase, Tag, MoreHorizontal,
  X, Trash2, Save, Globe, Share2, Award, Sparkles, Send, ImageIcon, CreditCard,
  QrCode, FileText, Zap, Star, Crown
} from 'lucide-react';
import { User, UserRole, Pet, RescueCall, RescueStatus, Appointment, VolunteerApplication } from './types';
import { MOCK_PROVIDERS, ANIMAL_MARKERS } from './constants';
import { getAnimalCuriosity } from './geminiService';
import { db } from './database';

// --- Shared Utility Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-4 py-3 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 text-[11px] uppercase tracking-widest";
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-lg shadow-md hover:-translate-y-0.5",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
    outline: "bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-blue-600 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
    premium: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-xl"
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
        address: {
          street: form.street?.value || '',
          number: form.number?.value || '',
          neighborhood: form.neighborhood?.value || '',
          fullAddress: `${form.street?.value || ''}, ${form.number?.value || ''} - ${form.neighborhood?.value || ''}, ${form.city?.value || 'São Paulo'}`
        },
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
    <div className="min-h-screen bg-white p-8 flex flex-col justify-center animate-in fade-in duration-700 max-w-lg mx-auto">
      <div className="flex flex-col items-center mb-12">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[28px] flex items-center justify-center mb-6 shadow-2xl shadow-blue-100/50">
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
                  className={`p-6 rounded-[32px] border-2 transition-all flex flex-col items-center gap-3 ${role === item.r ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-xl' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                  <item.i className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.l}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {isRegister && <button type="button" onClick={() => setStep(1)} className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 mb-2"><ArrowLeft className="w-3 h-3" /> Voltar para seleção</button>}
            
            <div className="space-y-3">
              <input name="name" type="text" placeholder={role === UserRole.USER ? "Seu Nome Completo" : "Nome do Lugar (Razão Social)"} required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
              <input name="email" type="email" placeholder="E-mail de acesso" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
              <input name="password" type="password" placeholder="Sua senha secreta" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
              
              {isRegister && (
                <>
                  <input name="street" type="text" placeholder="Rua / Logradouro" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="number" type="text" placeholder="Número" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
                    <input name="neighborhood" type="text" placeholder="Bairro" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
                  </div>
                  <input name="city" type="text" placeholder="Cidade" required className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none focus:ring-2 focus:ring-orange-100 text-xs font-bold" />
                </>
              )}
            </div>

            <Button type="submit" variant="primary" className="w-full py-5 text-sm mt-4 shadow-xl">
              {isRegister ? 'Criar minha conta OnliPet' : 'Entrar no OnliPet'}
            </Button>
          </div>
        )}
      </form>

      <button onClick={() => { setIsRegister(!isRegister); setStep(1); }} className="mt-12 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-full">
        {isRegister ? 'Já é membro? Clique aqui para Login' : 'Ainda não tem conta? Clique aqui para Cadastro'}
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
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => { 
    getAnimalCuriosity().then(setCuriosity); 
  }, []);

  const filteredProviders = useMemo(() => {
    return MOCK_PROVIDERS.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  if (!user) return <AuthView onAuth={setUser} />;

  const handleBack = () => { setSubView(null); setSelectedItem(null); };

  const renderHome = () => (
    <div className="space-y-4 pb-24">
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
        <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[18px]">
          <button onClick={() => setViewMode('list')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>Lista</button>
          <button onClick={() => setViewMode('map')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-[14px] transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400'}`}>Mapa</button>
        </div>
      </div>

      <div className="px-4 space-y-6">
        {viewMode === 'list' ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 p-8 rounded-[40px] text-white relative overflow-hidden shadow-2xl shadow-blue-200/50 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                   <Sparkles className="w-4 h-4 text-orange-200 fill-current" />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.25em] opacity-90 drop-shadow-sm">Insight OnliPet</span>
              </div>
              <p className="text-[13px] font-bold leading-relaxed pr-12 drop-shadow-sm">{curiosity || 'Descobrindo curiosidades fascinantes para você...'}</p>
              <PawPrint className="absolute -bottom-8 -right-8 w-32 h-32 text-white/10 -rotate-12" />
            </div>

            <div className="flex items-center justify-between pt-1 px-1">
              <h2 className="text-[12px] font-black text-gray-900 uppercase tracking-[0.2em] italic">Recomendados</h2>
              <button className="p-2.5 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"><Filter className="w-4 h-4 text-gray-400" /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProviders.map(p => (
                <div key={p.id} className="bg-white p-5 rounded-[40px] border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-xl hover:-translate-y-1 transition-all active:scale-[0.98]">
                  <div className="flex gap-5">
                    <img src={p.avatar} className="w-24 h-24 rounded-[32px] object-cover shadow-inner bg-gray-50 border-4 border-white" />
                    <div className="flex-1 space-y-1 mt-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-gray-900 text-[14px] tracking-tight">{p.name}</h3>
                        <span className="text-[9px] font-black px-2 py-1 bg-gray-100 rounded-lg uppercase text-gray-400">{p.role}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-medium">{p.details?.bio}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <MapPin className="w-3 h-3 text-orange-500" />
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">São Paulo, SP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-1">
                    <Button variant="ghost" className="flex-1 py-4 rounded-[22px]" onClick={() => { setSelectedItem(p); setSubView('details'); }}>Detalhes</Button>
                    <Button variant="primary" className="flex-1 py-4 rounded-[22px]" onClick={() => { setSelectedItem(p); setSubView('action'); }}>
                      {p.role === UserRole.NGO ? 'Apoiar' : 'Agendar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
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
      <div className="bg-gradient-to-br from-blue-600 to-orange-500 h-64 relative shadow-lg">
        <div className="absolute -bottom-14 left-10 p-2.5 bg-white rounded-[44px] shadow-2xl border-4 border-white group">
          <img src={user.avatar} className="w-32 h-32 rounded-[34px] object-cover group-hover:scale-105 transition-transform" />
          <button onClick={() => setSubView('edit_profile')} className="absolute -bottom-2 -right-2 p-3.5 bg-orange-500 text-white rounded-2xl shadow-xl active:scale-90 border-4 border-white hover:bg-orange-600 transition-colors"><Camera className="w-6 h-6" /></button>
        </div>
        <button onClick={() => alert('Compartilhar Perfil')} className="absolute top-8 right-8 p-3.5 bg-white/20 backdrop-blur-md text-white rounded-2xl hover:bg-white/30 transition-all"><Share2 className="w-6 h-6" /></button>
      </div>

      <div className="px-10 pt-24 space-y-12">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic drop-shadow-sm">{user.name}</h2>
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full">
                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{user.city || 'Cidade'}, {user.country || 'Brasil'}</span>
              </div>
              <div className="w-2 h-2 bg-orange-200 rounded-full"></div>
              <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5 bg-gray-100 px-3 py-1 rounded-full">
                {user.plan ? <Zap className="w-4 h-4 text-orange-500 fill-current" /> : <History className="w-4 h-4" />} 
                {user.plan ? `Plano ${user.plan.name}` : 'Membro Comum'}
              </span>
            </div>
          </div>
          {user.role !== UserRole.USER && (
            <button onClick={() => setSubView('plans')} className="p-4 bg-orange-50 rounded-[28px] border-2 border-orange-100 animate-pulse hover:animate-none group transition-all">
              <Star className="w-8 h-8 text-orange-500 group-hover:fill-current" />
            </button>
          )}
        </div>

        {user.role === UserRole.USER ? (
          <PetListView pets={user.pets || []} onAdd={() => setSubView('add_pet')} onRemove={(id) => {
            const updated = { ...user, pets: user.pets?.filter(p => p.id !== id) };
            db.updateUser(updated); setUser(updated);
          }} />
        ) : (
          <div className="space-y-4">
             <div className="flex items-center justify-between px-1">
               <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Estatísticas do Local</h3>
               {user.plan && (
                 <div className="flex items-center gap-2 bg-green-50 px-3 py-1 rounded-full border border-green-100">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-[9px] font-black text-green-600 uppercase">Destaque Ativo</span>
                 </div>
               )}
             </div>
             <div className="grid grid-cols-2 gap-5">
               <div className="bg-blue-50/60 p-10 rounded-[44px] text-center border border-blue-100 shadow-inner"><span className="block text-4xl font-black text-blue-600">{user.plan ? '842' : '128'}</span><p className="text-[10px] text-blue-400 font-black uppercase mt-2">Visitas {user.plan ? '(Impulsionado)' : ''}</p></div>
               <div className="bg-orange-50/60 p-10 rounded-[44px] text-center border border-orange-100 shadow-inner"><span className="block text-4xl font-black text-orange-500">{user.plan ? '54' : '14'}</span><p className="text-[10px] text-orange-400 font-black uppercase mt-2">Chamados {user.plan ? '(Impulsionado)' : ''}</p></div>
             </div>
             {user.role !== UserRole.USER && !user.plan && (
               <div className="p-8 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-[40px] border-2 border-orange-200 flex flex-col md:flex-row items-center gap-6 shadow-sm mt-4">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-md">
                    <Sparkles className="w-8 h-8 text-orange-500" />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-[13px] font-black text-orange-900 uppercase tracking-tight italic">Quer mais visibilidade?</h4>
                    <p className="text-[10px] text-orange-600/80 font-bold uppercase">Apareça no Top 10 e receba até 5x mais contatos diários.</p>
                  </div>
                  <Button variant="secondary" className="px-8 rounded-[24px]" onClick={() => setSubView('plans')}>Ver Planos</Button>
               </div>
             )}
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest px-1">Configurações da Conta</h3>
          <div className="bg-white rounded-[44px] border border-gray-100 overflow-hidden shadow-sm">
             <button onClick={() => setSubView('edit_profile')} className="w-full flex items-center justify-between p-7 border-b border-gray-50 hover:bg-gray-50 transition-all group">
               <div className="flex items-center gap-5">
                 <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <UserIcon className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-bold text-gray-700">Editar Meus Dados</span>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-blue-600 transition-colors" />
             </button>
             
             {user.role !== UserRole.USER && (
               <button onClick={() => setSubView('plans')} className="w-full flex items-center justify-between p-7 border-b border-gray-50 hover:bg-gray-50 transition-all group">
                 <div className="flex items-center gap-5">
                   <div className="p-3 bg-orange-50 text-orange-500 rounded-2xl group-hover:bg-orange-500 group-hover:text-white transition-all">
                     <Crown className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-bold text-gray-700">Gerenciar Plano de Destaque</span>
                 </div>
                 <div className="flex items-center gap-2">
                    {user.plan && <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">{user.plan.name} Ativo</span>}
                    <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-orange-500 transition-colors" />
                 </div>
               </button>
             )}

             <button onClick={() => setSubView('donations_history')} className="w-full flex items-center justify-between p-7 border-b border-gray-50 hover:bg-gray-50 transition-all group">
               <div className="flex items-center gap-5">
                 <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl group-hover:bg-purple-500 group-hover:text-white transition-all">
                   <Heart className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-bold text-gray-700">Minhas Doações</span>
               </div>
               <ChevronRight className="w-5 h-5 text-gray-200 group-hover:text-purple-500 transition-colors" />
             </button>
             
             <button onClick={handleLogout} className="w-full flex items-center justify-between p-7 text-red-500 hover:bg-red-50 transition-all group">
               <div className="flex items-center gap-5">
                 <div className="p-3 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-all">
                   <LogOut className="w-6 h-6" />
                 </div>
                 <span className="text-sm font-bold">Desconectar da Conta</span>
               </div>
               <ChevronRight className="w-5 h-5 text-red-200 group-hover:text-red-500 transition-colors" />
             </button>
          </div>
        </div>
        
        <div className="flex flex-col items-center gap-3 pb-12">
          <p className="text-[10px] text-gray-300 font-black tracking-[0.4em] uppercase italic">OnliPet • Amethylast Cyber</p>
          <div className="flex gap-4">
             <Globe className="w-4 h-4 text-gray-200" />
             <Mail className="w-4 h-4 text-gray-200" />
             <Phone className="w-4 h-4 text-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (subView === 'add_pet') return <AddPetView onBack={handleBack} onSave={(pet) => { db.addPetToUser(user.id, pet); setUser(db.getCurrentUser()); handleBack(); }} />;
    if (subView === 'details') return <DetailsView item={selectedItem} onBack={handleBack} onAction={() => setSubView('action')} />;
    if (subView === 'action') return selectedItem.role === UserRole.NGO ? <NGOActionView ngo={selectedItem} onBack={handleBack} /> : <BookingView provider={selectedItem} pets={user.pets || []} onBack={handleBack} />;
    if (subView === 'edit_profile') return <EditProfileView user={user} onBack={handleBack} onSave={(data: any) => { db.updateUser(data); setUser(db.getCurrentUser()); handleBack(); }} />;
    if (subView === 'donations_history') return <DonationsHistoryView onBack={handleBack} />;
    if (subView === 'plans') return <PlansView user={user} onBack={handleBack} onSelectPlan={(plan: any) => { setSelectedPlan(plan); setSubView('payment'); }} />;
    if (subView === 'payment') return <PaymentView user={user} plan={selectedPlan} onBack={() => setSubView('plans')} onConfirm={(updatedUser: User) => { setUser(updatedUser); setSubView(null); setSelectedPlan(null); }} />;

    switch (currentTab) {
      case 'home': return renderHome();
      case 'rescue': return <RescueView onBack={() => setCurrentTab('home')} />;
      case 'appointments': return <AgendaView onBack={() => setCurrentTab('home')} />;
      case 'profile': return renderProfile();
      default: return renderHome();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 antialiased flex flex-col font-sans select-none overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl relative flex flex-col min-h-screen overflow-hidden">
        {!subView && (
          <header className="fixed top-0 left-0 right-0 max-w-4xl mx-auto h-16 bg-white/95 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-8 z-50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-[16px] flex items-center justify-center shadow-xl shadow-blue-100/40 hover:scale-105 transition-transform cursor-pointer" onClick={() => setCurrentTab('home')}>
                <PawPrint className="text-white w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent tracking-tighter uppercase italic">OnliPet</h1>
            </div>
            <div className="flex items-center gap-3">
               <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full text-[10px] font-black uppercase text-gray-400 border border-gray-100 hover:bg-gray-100 transition-all"><MapPin className="w-3.5 h-3.5" /> São Paulo</button>
               <button className="p-3 bg-gray-50 rounded-full relative active:scale-90 transition-all hover:bg-gray-100"><Bell className="w-5 h-5 text-gray-400" /><span className="absolute top-3 right-3 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white shadow-sm animate-pulse"></span></button>
            </div>
          </header>
        )}

        <main className={`flex-1 ${!subView ? 'mt-16' : ''} overflow-y-auto hide-scrollbar pb-10`}>
          {renderContent()}
        </main>

        {!subView && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto h-22 bg-white/95 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around px-6 z-50 shadow-[0_-16px_40px_rgba(0,0,0,0.06)]">
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'rescue', icon: PlusCircle, label: 'Resgate' },
              { id: 'appointments', icon: Calendar, label: 'Agenda' },
              { id: 'profile', icon: UserIcon, label: 'Perfil' },
            ].map((item) => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1.5 transition-all w-24 py-2 rounded-2xl ${currentTab === item.id ? 'text-blue-600 scale-105 bg-blue-50/50' : 'text-gray-300 hover:text-gray-400'}`}>
                <item.icon className={`w-6 h-6 ${currentTab === item.id ? 'stroke-[3px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}

// --- Plan & Payment Views ---

const PlansView = ({ onBack, onSelectPlan, user }: any) => {
  const plans = [
    {
      id: 'BASIC',
      name: 'Impacto Curto',
      duration: '15 dias',
      price: 'R$ 29,90',
      description: 'Ideal para campanhas rápidas ou testes de visibilidade no topo regional.',
      features: ['Destaque no Top 10 regional', 'Ícone diferenciado no mapa', 'Relatórios de cliques básicos'],
      icon: Zap,
      color: 'blue'
    },
    {
      id: 'PRO',
      name: 'Destaque Mensal',
      duration: '30 dias',
      price: 'R$ 49,90',
      description: 'A escolha favorita para quem busca visibilidade constante e suporte.',
      features: ['Destaque no Top 10 estadual', 'Prioridade máxima no mapa', 'Suporte prioritário via WhatsApp', 'Relatórios avançados'],
      icon: Star,
      color: 'orange',
      popular: true
    },
    {
      id: 'ELITE',
      name: 'Elite Anual',
      duration: '365 dias',
      price: 'R$ 399,90',
      installment: 'ou 12x de R$ 33,33',
      description: 'O melhor custo-benefício para quem é referência no setor pet nacional.',
      features: ['Destaque nacional em buscas', 'Selo "Elite OnliPet" no perfil', 'Acesso antecipado a novas funções', 'Gerente de conta dedicado'],
      icon: Crown,
      color: 'purple'
    }
  ];

  return (
    <div className="p-8 space-y-10 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen max-w-3xl mx-auto">
      <div className="flex items-center gap-5">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>
        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Planos de Destaque</h3>
      </div>

      <div className="text-center space-y-4">
        <h2 className="text-3xl font-black text-gray-900 leading-none">Apareça no <span className="text-orange-500 italic">Top 10</span></h2>
        <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest px-8">Aumente sua visibilidade e conecte-se com mais tutores agora mesmo.</p>
      </div>

      <div className="space-y-6">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative p-8 rounded-[48px] border-4 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer group ${plan.popular ? 'border-orange-500 bg-orange-50/30 shadow-2xl shadow-orange-100' : 'border-gray-50 bg-gray-50'}`} onClick={() => onSelectPlan(plan)}>
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">Mais Popular</div>
            )}
            <div className="flex flex-col md:flex-row gap-6">
              <div className={`w-20 h-20 rounded-[28px] flex items-center justify-center shrink-0 shadow-lg ${plan.color === 'blue' ? 'bg-blue-600' : plan.color === 'orange' ? 'bg-orange-500' : 'bg-purple-600'} text-white`}>
                <plan.icon className="w-10 h-10" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 italic leading-none">{plan.name}</h4>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{plan.duration}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900 tracking-tighter">{plan.price}</p>
                    {plan.installment && <p className="text-[9px] font-black text-orange-500 uppercase">{plan.installment}</p>}
                  </div>
                </div>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{plan.description}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                   {plan.features.map((f, i) => (
                     <div key={i} className="flex items-center gap-2">
                       <CheckCircle2 className={`w-3.5 h-3.5 ${plan.popular ? 'text-orange-500' : 'text-blue-600'}`} />
                       <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tight">{f}</span>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="text-center text-[9px] font-bold text-gray-300 uppercase px-12 leading-relaxed">Cancelamento grátis a qualquer momento. Suas informações de faturamento estão seguras com criptografia Amethylast Cyber de 256 bits.</p>
    </div>
  );
};

const PaymentView = ({ user, plan, onBack, onConfirm }: any) => {
  const [method, setMethod] = useState<'CARD' | 'PIX' | 'BOLETO'>('CARD');
  const [loading, setLoading] = useState(false);

  const handlePayment = () => {
    setLoading(true);
    setTimeout(() => {
      const updatedUser = {
        ...user,
        plan: {
          type: plan.id,
          name: plan.name,
          expiresAt: new Date(Date.now() + (plan.id === 'BASIC' ? 15 : plan.id === 'PRO' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString()
        }
      };
      db.updateUser(updatedUser);
      setLoading(false);
      alert('PAGAMENTO CONFIRMADO! Seu estabelecimento agora está em destaque no OnliPet. 🚀');
      onConfirm(updatedUser);
    }, 2500);
  };

  return (
    <div className="p-8 space-y-10 animate-in slide-in-from-right duration-500 bg-white min-h-screen max-w-3xl mx-auto">
      <div className="flex items-center gap-5">
        <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>
        <h3 className="text-2xl font-black tracking-tighter uppercase italic">Pagamento</h3>
      </div>

      <div className="bg-gray-50 p-8 rounded-[40px] flex justify-between items-center border border-gray-100">
        <div>
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Plano Selecionado</span>
          <h4 className="text-xl font-black text-gray-900 italic">{plan.name} ({plan.duration})</h4>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-blue-600 tracking-tighter">{plan.price}</p>
        </div>
      </div>

      <div className="space-y-6">
        <h5 className="text-[12px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Forma de Pagamento</h5>
        <div className="grid grid-cols-3 gap-4">
          {[
            { id: 'CARD', label: 'Cartão', icon: CreditCard },
            { id: 'PIX', label: 'Pix', icon: QrCode },
            { id: 'BOLETO', label: 'Boleto', icon: FileText },
          ].map((m: any) => (
            <button 
              key={m.id} 
              onClick={() => setMethod(m.id)}
              className={`p-6 rounded-[32px] border-4 flex flex-col items-center gap-3 transition-all ${method === m.id ? 'border-blue-600 bg-blue-50/50 shadow-xl' : 'border-gray-50 bg-gray-50 text-gray-300'}`}
            >
              <m.icon className={`w-8 h-8 ${method === m.id ? 'text-blue-600' : ''}`} />
              <span className={`text-[10px] font-black uppercase tracking-widest ${method === m.id ? 'text-blue-600' : ''}`}>{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6 animate-in fade-in duration-500">
        {method === 'CARD' && (
          <div className="space-y-4">
             <div className="relative group">
               <input placeholder="Número do Cartão" className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" />
               <CreditCard className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-200" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <input placeholder="Validade (MM/AA)" className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" />
               <input placeholder="CVC" className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" />
             </div>
             <input placeholder="Nome impresso no cartão" className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" />
          </div>
        )}

        {method === 'PIX' && (
          <div className="p-10 bg-blue-50/50 rounded-[48px] border-4 border-dashed border-blue-100 text-center space-y-6">
             <div className="w-32 h-32 bg-white rounded-[32px] mx-auto shadow-xl flex items-center justify-center p-4 border border-blue-100">
               <QrCode className="w-full h-full text-blue-600" />
             </div>
             <div className="space-y-2">
               <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest italic">Aponte a câmera para o QR Code</p>
               <p className="text-[9px] text-blue-400 font-bold uppercase">Ou copie o código abaixo</p>
               <div className="bg-white p-4 rounded-2xl border border-blue-100 font-mono text-[9px] break-all">00020101021226870014br.gov.bcb.pix2565pix.onlipet.payment...</div>
             </div>
          </div>
        )}

        {method === 'BOLETO' && (
          <div className="p-10 bg-gray-50 rounded-[48px] border-4 border-dashed border-gray-100 text-center space-y-6">
             <FileText className="w-20 h-20 text-gray-200 mx-auto" />
             <div className="space-y-2">
                <p className="text-[11px] font-black text-gray-600 uppercase tracking-widest italic">O boleto será enviado por e-mail</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">Leva até 3 dias úteis para compensação.<br/>Para ativação imediata, utilize Pix ou Cartão.</p>
             </div>
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4">
        <Button 
          variant="primary" 
          disabled={loading} 
          className="w-full py-8 text-sm shadow-2xl shadow-blue-200 uppercase tracking-[0.4em] font-black" 
          onClick={handlePayment}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processando...</span>
            </div>
          ) : `Confirmar e Ativar Destaque`}
        </Button>
        <p className="text-[9px] text-center font-bold text-gray-300 uppercase italic">Ao clicar em confirmar, você aceita os termos de uso do programa de parceiros OnliPet.</p>
      </div>
    </div>
  );
};

// --- Subviews Components ---

const DonationsHistoryView = ({ onBack }: any) => (
  <div className="p-10 space-y-10 animate-in fade-in bg-white min-h-screen">
    <div className="flex items-center gap-5">
      <button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button>
      <h3 className="text-2xl font-black tracking-tighter uppercase italic">Histórico de Doações</h3>
    </div>
    <div className="flex flex-col items-center py-32 text-center opacity-20 gap-8">
       <div className="w-24 h-24 bg-orange-50 rounded-[40px] flex items-center justify-center border-4 border-white shadow-xl"><Heart className="w-12 h-12 text-orange-500" /></div>
       <p className="text-[12px] font-black uppercase tracking-[0.4em] italic">Você ainda não fez doações</p>
    </div>
    <Button variant="primary" className="w-full py-6 rounded-[32px] text-xs" onClick={onBack}>Apoiar uma causa hoje</Button>
  </div>
);

const EditProfileView = ({ user, onBack, onSave }: any) => {
  const [name, setName] = useState(user.name);
  const [city, setCity] = useState(user.city || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [bio, setBio] = useState(user.details?.bio || '');

  return (
    <div className="p-10 space-y-10 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen">
       <div className="flex items-center gap-5"><button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button><h3 className="text-2xl font-black tracking-tighter uppercase italic">Editar Perfil</h3></div>
       <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img src={avatar} className="w-32 h-32 rounded-[40px] object-cover border-4 border-orange-100 shadow-xl" />
              <button onClick={() => {
                const url = prompt('Cole o link da sua nova foto:', avatar);
                if (url) setAvatar(url);
              }} className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 transition-all"><ImageIcon className="w-5 h-5" /></button>
            </div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Toque no ícone para alterar a foto</p>
          </div>

          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Seu Nome / Razão Social</label>
             <input value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Nome Completo" />
          </div>
          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Localização (Cidade/Estado)</label>
             <input value={city} onChange={e => setCity(e.target.value)} className="w-full p-5 bg-gray-50 rounded-[28px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Ex: Curitiba, PR" />
          </div>
          <div className="space-y-1">
             <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-3">Breve Descrição / Bio</label>
             <textarea value={bio} onChange={e => setBio(e.target.value)} className="w-full p-8 bg-gray-50 rounded-[44px] h-48 resize-none text-xs font-medium border-none outline-none shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" placeholder="Conte um pouco sobre você..." />
          </div>
          <Button variant="primary" className="w-full py-6 text-sm italic" onClick={() => onSave({ ...user, name, city, avatar, details: { ...user.details, bio } })}>Salvar Dados Atualizados</Button>
       </div>
    </div>
  );
};

const PetListView = ({ pets, onAdd, onRemove }: any) => (
  <div className="space-y-8">
    <div className="flex items-center justify-between px-1">
      <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-widest italic">Meus Companheiros</h3>
      <button onClick={onAdd} className="p-3.5 bg-orange-50 text-orange-600 rounded-[18px] active:scale-90 transition-all shadow-md hover:bg-orange-500 hover:text-white group"><PlusCircle className="w-6 h-6" /></button>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {pets.map((pet: Pet) => (
        <div key={pet.id} className="bg-white p-6 rounded-[48px] border border-gray-100 shadow-sm relative group hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
          <button onClick={() => onRemove(pet.id)} className="absolute top-4 right-4 p-3 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 transition-all shadow-lg border-2 border-white hover:bg-red-500 hover:text-white"><Trash2 className="w-4 h-4" /></button>
          <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-full h-40 rounded-[36px] object-cover mb-5 shadow-inner border-4 border-gray-50/50" />
          <h4 className="text-[16px] font-black text-gray-900 text-center italic tracking-tight">{pet.name}</h4>
          <p className="text-[11px] text-blue-500 text-center uppercase font-black mt-1 tracking-tighter bg-blue-50 py-1.5 px-3 rounded-full inline-block mx-auto w-fit block">{pet.breed || 'SRD'} • {pet.age}</p>
        </div>
      ))}
      
      {pets.length === 0 && (
        <div className="col-span-full p-16 border-4 border-dashed border-gray-50 rounded-[56px] text-center space-y-4 bg-gray-50/20 group hover:border-orange-100 transition-colors">
          <div className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm">
            <PawPrint className="w-10 h-10 text-gray-200 group-hover:text-orange-300 transition-colors" />
          </div>
          <div>
            <p className="text-[12px] font-black text-gray-400 uppercase italic tracking-widest">Nenhum pet cadastrado ainda</p>
            <p className="text-[10px] text-gray-300 mt-1 uppercase font-bold">Toque no + para adicionar seu primeiro amigo</p>
          </div>
        </div>
      )}
    </div>
  </div>
);

const AddPetView = ({ onSave, onBack }: any) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('Cachorro');
  const [breed, setBreed] = useState('');
  const [photo, setPhoto] = useState('');

  return (
    <div className="p-10 space-y-10 animate-in slide-in-from-bottom duration-500 bg-white min-h-screen">
      <div className="flex items-center gap-5"><button onClick={onBack} className="p-3 bg-gray-50 rounded-2xl active:scale-90 transition-all"><ArrowLeft className="w-6 h-6" /></button><h3 className="text-2xl font-black tracking-tighter uppercase italic">Novo Amigo</h3></div>
      
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4">
           <div className="relative group cursor-pointer" onClick={() => {
             const url = prompt('Cole o link da foto do seu pet:');
             if (url) setPhoto(url);
           }}>
             <div className="w-32 h-32 bg-gray-50 rounded-[40px] border-4 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
               {photo ? <img src={photo} className="w-full h-full object-cover" /> : <Camera className="w-8 h-8 text-gray-200" />}
             </div>
             <div className="absolute -bottom-2 -right-2 p-2.5 bg-orange-500 text-white rounded-2xl shadow-lg"><ImageIcon className="w-4 h-4" /></div>
           </div>
           <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest italic">Foto do seu pet</p>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Nome do Pet</label>
          <input placeholder="Como se chama?" className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" onChange={e => setName(e.target.value)} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Espécie</label>
            <select className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" onChange={e => setType(e.target.value)}>
              <option>Cachorro</option>
              <option>Gato</option>
              <option>Pássaro</option>
              <option>Exótico</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Idade Estimada</label>
            <input placeholder="ex: 2 anos" className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-medium shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" id="age" />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Raça</label>
          <input placeholder="SRD, Golden Retriever, Persa..." className="w-full p-5 bg-gray-50 rounded-[24px] border-none outline-none text-xs font-bold shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" onChange={e => setBreed(e.target.value)} />
        </div>
        
        <div className="space-y-1">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">Notas de Saúde / Cuidados</label>
          <textarea placeholder="Vacinas em dia? Alergias? Temperamento especial?" className="w-full p-8 bg-gray-50 rounded-[44px] h-44 resize-none text-xs font-medium border-none outline-none shadow-inner focus:ring-2 focus:ring-blue-100 transition-all" id="obs" />
        </div>
        
        <Button variant="primary" className="w-full py-6 text-sm italic shadow-2xl shadow-blue-100" onClick={() => {
          if (!name) return alert('Por favor, dê um nome ao seu pet!');
          onSave({ id: '', name, breed, type, photo, age: (document.getElementById('age') as any).value, observations: (document.getElementById('obs') as any).value });
        }}>Cadastrar e Salvar Pet</Button>
      </div>
    </div>
  );
};

const DetailsView = ({ item, onBack, onAction }: any) => {
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="pb-24 animate-in fade-in duration-500 bg-white min-h-screen">
      <div className="h-96 relative">
        <img src={item.avatar} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
        <button onClick={onBack} className="absolute top-10 left-8 p-4 bg-white/20 backdrop-blur-md text-white rounded-[24px] active:scale-90 transition-all shadow-xl hover:bg-white/30"><ArrowLeft className="w-7 h-7" /></button>
        <div className="absolute bottom-12 left-12 text-white pr-12">
          <h2 className="text-5xl font-black tracking-tighter leading-none mb-4 italic drop-shadow-md">{item.name}</h2>
          <div className="flex items-center gap-4">
             <span className="text-[12px] font-black uppercase tracking-[0.25em] px-4 py-2 bg-orange-500 rounded-2xl text-white shadow-xl">{item.role}</span>
             <span className="text-[12px] font-black uppercase tracking-[0.25em] flex items-center gap-2 opacity-90 drop-shadow-sm"><MapPin className="w-4 h-4 text-orange-400" /> {item.details?.city || 'São Paulo'}</span>
          </div>
        </div>
      </div>

      <div className="px-12 pt-16 -mt-16 bg-white rounded-t-[64px] space-y-12 relative">
         <div className="flex gap-4 p-2 bg-gray-50 rounded-[28px] max-w-sm mx-auto">
            <button onClick={() => setActiveTab('info')} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[22px] transition-all ${activeTab === 'info' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}>Informações</button>
            <button onClick={() => setActiveTab('pets')} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[22px] transition-all ${activeTab === 'pets' ? 'bg-white shadow-md text-blue-600' : 'text-gray-400 hover:text-gray-500'}`}>Pets Disponíveis</button>
         </div>

         {activeTab === 'info' ? (
           <div className="space-y-10 animate-in fade-in max-w-3xl mx-auto">
             <div className="space-y-6">
                <h3 className="text-[13px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Sobre o Estabelecimento</h3>
                <p className="text-gray-600 text-[15px] leading-relaxed font-medium pl-2">{item.details?.bio || 'Serviço profissional dedicado ao cuidado e proteção de animais com anos de experiência no mercado.'}</p>
                {item.role === UserRole.NGO && (
                  <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-[48px] border border-orange-100 flex items-start gap-5 shadow-sm">
                    <div className="p-3 bg-white rounded-2xl shadow-sm"><Award className="w-8 h-8 text-orange-500 shrink-0" /></div>
                    <p className="text-[12px] font-black text-orange-800 leading-relaxed uppercase opacity-80 italic italic">"{item.details?.curiosity || 'Toda vida merece ser cuidada com amor e respeito.'}"</p>
                  </div>
                )}
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-gray-50 rounded-[44px] space-y-4 border border-gray-100 group hover:bg-blue-50/50 transition-colors">
                   <div className="p-3 bg-white w-fit rounded-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all"><Clock className="w-7 h-7 text-blue-600 group-hover:text-white" /></div>
                   <div>
                     <span className="block text-[11px] font-black uppercase text-gray-400 tracking-widest mb-1">Atendimento</span>
                     <p className="text-[12px] font-black text-gray-900 uppercase">{item.details?.openingHours || 'Segunda à Sexta • 08h - 18h'}</p>
                   </div>
                </div>
                <div className="p-8 bg-gray-50 rounded-[44px] space-y-4 border border-gray-100 group hover:bg-orange-50/50 transition-colors">
                   <div className="p-3 bg-white w-fit rounded-2xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-all"><MessageCircle className="w-7 h-7 text-orange-500 group-hover:text-white" /></div>
                   <div>
                     <span className="block text-[11px] font-black uppercase text-gray-400 tracking-widest mb-1">Resposta Médica</span>
                     <p className="text-[12px] font-black text-gray-900 uppercase">Média em tempo real</p>
                   </div>
                </div>
             </div>
           </div>
         ) : (
           <div className="animate-in slide-in-from-right max-w-3xl mx-auto py-16 text-center space-y-4">
             <PawPrint className="w-16 h-16 text-gray-100 mx-auto" />
             <p className="text-[12px] font-black text-gray-300 uppercase tracking-[0.3em] italic">Catálogo de animais sendo atualizado...</p>
           </div>
         )}

         <div className="flex flex-col sm:flex-row gap-6 pt-6 pb-16 max-w-3xl mx-auto">
            <Button variant="ghost" className="flex-1 py-6 rounded-[32px] text-xs shadow-sm" onClick={() => alert('Iniciando conversa privada...')}>Solicitar Informações</Button>
            <Button variant="primary" className="flex-1 py-6 rounded-[32px] text-xs shadow-2xl shadow-blue-100" onClick={onAction}>{item.role === UserRole.NGO ? 'Realizar Doação' : 'Reservar Horário'}</Button>
         </div>
      </div>
    </div>
  );
};

const NGOActionView = ({ ngo, onBack }: any) => (
  <div className="p-12 space-y-12 animate-in slide-in-from-right duration-500 bg-white min-h-screen max-w-3xl mx-auto">
    <div className="text-center space-y-8">
       <div className="relative inline-block">
         <img src={ngo.avatar} className="w-40 h-40 rounded-[56px] mx-auto object-cover shadow-2xl border-4 border-white hover:scale-105 transition-transform" />
         <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-4 rounded-[22px] shadow-2xl animate-bounce"><Heart className="w-8 h-8 fill-current" /></div>
       </div>
       <div className="space-y-3">
         <h3 className="text-4xl font-black tracking-tighter italic italic">Seja um herói para {ngo.name}</h3>
         <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Sua contribuição salva vidas diariamente</p>
       </div>
    </div>
    <div className="grid grid-cols-3 gap-6">
       {['R$ 25', 'R$ 75', 'R$ 150'].map(v => <button key={v} onClick={() => alert(`Você escolheu doar ${v}!`)} className="py-8 border-4 border-orange-50 rounded-[40px] text-orange-600 font-black text-sm hover:bg-orange-500 hover:text-white transition-all shadow-sm uppercase tracking-widest hover:border-orange-500 hover:shadow-xl hover:-translate-y-1">{v}</button>)}
    </div>
    <div className="bg-gradient-to-br from-blue-50/60 to-white p-12 rounded-[56px] border border-blue-100 text-center space-y-6 shadow-inner relative overflow-hidden">
       <div className="relative z-10">
         <span className="text-[12px] font-black text-blue-400 uppercase tracking-[0.4em] block mb-2">Código PIX Direto</span>
         <p className="font-mono font-black text-xl text-blue-900 tracking-tight break-all bg-white/60 p-6 rounded-[28px] border border-white">doe@onlipet.org.br</p>
         <Button variant="outline" className="mx-auto px-16 py-4 uppercase text-[12px] mt-6 shadow-sm" onClick={() => alert('PIX copiado com sucesso!')}>Copiar Chave</Button>
       </div>
       <PawPrint className="absolute -bottom-10 -left-10 w-48 h-48 text-blue-600/5 rotate-45" />
    </div>
    <Button variant="primary" className="w-full py-7 text-sm shadow-2xl shadow-blue-200 uppercase tracking-[0.3em] font-black mt-4" onClick={() => { alert('Incrível! Sua doação fará toda a diferença. ❤️'); onBack(); }}>Confirmar Meu Apoio</Button>
  </div>
);

const BookingView = ({ provider, pets, onBack }: any) => {
  const [selectedPet, setSelectedPet] = useState<Pet | null>(pets[0] || null);

  return (
    <div className="p-12 space-y-12 animate-in slide-in-from-right duration-500 bg-white min-h-screen max-w-3xl mx-auto">
      <div className="flex items-center gap-8">
         <img src={provider.avatar} className="w-32 h-32 rounded-[44px] object-cover shadow-2xl border-4 border-white" />
         <div>
            <h4 className="text-3xl font-black tracking-tighter italic italic">{provider.name}</h4>
            <div className="flex items-center gap-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
              <p className="text-[12px] text-orange-500 font-black uppercase tracking-widest italic">Horários Disponíveis Hoje</p>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <h5 className="text-[12px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Selecione o Animal para o Atendimento</h5>
         {pets.length > 0 ? (
           <div className="flex gap-6 overflow-x-auto pb-6 hide-scrollbar px-1">
             {pets.map((pet: Pet) => (
               <button 
                key={pet.id} 
                onClick={() => setSelectedPet(pet)}
                className={`flex flex-col items-center gap-3 p-6 rounded-[36px] border-4 transition-all min-w-[130px] shadow-sm hover:shadow-md ${selectedPet?.id === pet.id ? 'border-blue-600 bg-blue-50/50 scale-105' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
               >
                 <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-16 h-16 rounded-full border-4 border-white shadow-md object-cover" />
                 <span className="text-[11px] font-black uppercase tracking-tighter text-gray-800">{pet.name}</span>
               </button>
             ))}
           </div>
         ) : (
           <div className="p-8 bg-red-50 rounded-[36px] border-2 border-dashed border-red-100 text-center">
             <p className="text-[11px] text-red-600 font-black uppercase tracking-widest">Atenção: Cadastre um pet primeiro!</p>
             <p className="text-[10px] text-red-400 mt-1">Para agendar, precisamos saber quem é o paciente.</p>
           </div>
         )}
      </div>

      <div className="space-y-6">
         <h5 className="text-[12px] font-black text-gray-400 uppercase tracking-widest px-2 italic">Escolha o Melhor Horário</h5>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['14:00', '15:30', '17:00', '18:30'].map(h => <button key={h} className="p-6 bg-gray-50 border-2 border-gray-100 rounded-[32px] text-[12px] font-black uppercase text-gray-800 hover:bg-blue-600 hover:text-white transition-all active:scale-95 shadow-sm hover:shadow-lg hover:-translate-y-1">Atend. {h}</button>)}
         </div>
      </div>

      <Button variant="primary" className="w-full py-7 text-sm shadow-2xl shadow-blue-100 uppercase tracking-[0.3em] font-black" onClick={() => { 
        if (!selectedPet && pets.length > 0) return alert('Por favor, selecione um pet.');
        if (pets.length === 0) return alert('Você precisa cadastrar um pet no seu perfil primeiro.');
        alert('Reserva solicitada com sucesso! Aguarde a confirmação via app.'); 
        onBack(); 
      }}>Finalizar Agendamento</Button>
    </div>
  );
};

const RescueView = ({ onBack }: any) => (
  <div className="p-12 space-y-12 animate-in slide-in-from-bottom duration-500 pb-24 bg-white min-h-screen max-w-3xl mx-auto">
    <div className="bg-gradient-to-br from-red-600 to-red-500 p-10 rounded-[48px] border-4 border-white shadow-2xl flex items-center gap-6">
       <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[28px] flex items-center justify-center text-white shadow-xl"><PlusCircle className="w-10 h-10" /></div>
       <div>
          <h3 className="text-2xl font-black text-white uppercase tracking-tight italic italic">Alerta de Resgate</h3>
          <p className="text-[11px] text-red-100 font-bold uppercase tracking-[0.2em] opacity-90">Envio prioritário para equipes locais</p>
       </div>
    </div>

    <div className="space-y-8">
       <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-4">Localização da Emergência</label>
          <div className="relative group">
             <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-orange-500 w-7 h-7 group-hover:scale-110 transition-transform" />
             <input placeholder="Detectando sua posição GPS..." className="w-full pl-16 pr-8 py-6 bg-gray-50 rounded-[32px] border-none outline-none text-xs font-bold shadow-inner italic cursor-not-allowed" disabled defaultValue="Avenida dos Animais, 123 - Curitiba" />
          </div>
       </div>
       <div className="space-y-2">
          <label className="text-[12px] font-black text-gray-400 uppercase tracking-widest ml-4">Relato da Situação</label>
          <textarea placeholder="Descreva o estado do animal, perigos próximos e referências visuais do local..." className="w-full p-10 bg-gray-50 rounded-[48px] h-56 resize-none text-xs font-medium border-none outline-none shadow-inner focus:ring-4 focus:ring-red-50/50 transition-all" />
       </div>
       <button className="w-full h-56 bg-gray-50 rounded-[56px] border-4 border-dashed border-gray-100 flex flex-col items-center justify-center gap-5 group hover:bg-orange-50/40 hover:border-orange-200 transition-all active:scale-[0.98] shadow-sm">
          <div className="p-5 bg-white rounded-[28px] shadow-md group-hover:scale-110 transition-transform">
            <Camera className="w-10 h-10 text-gray-200 group-hover:text-orange-500 transition-colors" />
          </div>
          <span className="text-[11px] font-black text-gray-300 uppercase tracking-[0.3em] group-hover:text-orange-500">Adicionar Foto do Animal</span>
       </button>
    </div>
    <Button variant="danger" className="w-full py-8 text-sm shadow-2xl shadow-red-200 uppercase tracking-[0.4em] font-black hover:scale-[1.02]" onClick={() => { alert('ALERTA DISPARADO! Todas as ONGs e protetores em um raio de 10km foram notificados.'); onBack(); }}>Acionar Socorro Agora</Button>
  </div>
);

const AgendaView = ({ onBack }: any) => (
  <div className="p-12 space-y-12 bg-white min-h-screen max-w-3xl mx-auto">
     <div className="flex items-center justify-between px-2">
        <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic italic uppercase">Sua Agenda</h2>
        <div className="p-4 bg-blue-50 rounded-[28px] shadow-sm hover:scale-105 transition-all"><History className="w-8 h-8 text-blue-600" /></div>
     </div>
     <div className="flex flex-col items-center py-36 text-center gap-10 opacity-20">
        <div className="w-32 h-32 bg-gray-100 rounded-[56px] flex items-center justify-center border-8 border-white shadow-2xl"><Calendar className="w-16 h-16 text-gray-400" /></div>
        <div>
          <p className="text-[14px] font-black uppercase tracking-[0.5em] italic">Nenhum compromisso marcado</p>
          <p className="text-[10px] uppercase font-bold mt-2">Agende uma visita com um de nossos parceiros</p>
        </div>
     </div>
     <Button variant="primary" className="w-full py-7 rounded-[36px] text-xs shadow-2xl shadow-blue-50 italic" onClick={onBack}>Explorar Novos Serviços</Button>
  </div>
);
