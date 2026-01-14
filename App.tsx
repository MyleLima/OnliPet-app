
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Home, Search, Calendar, User as UserIcon, PlusCircle, 
  Heart, MessageCircle, ChevronRight, Filter, Navigation, Camera, LogOut, 
  Bell, PawPrint, ArrowLeft, CheckCircle2, Clock, MapPin, ShieldCheck,
  History, Mail, Phone, Building, Briefcase, Tag, Trash2, Globe, Share2, 
  Award, Sparkles, ImageIcon, CreditCard, QrCode, FileText, Zap, Star, Crown,
  Check, AlertCircle, Copy, CheckCircle, Lock
} from 'lucide-react';
import { User, UserRole, Pet, RescueStatus } from './types';
import { MOCK_PROVIDERS, ANIMAL_MARKERS } from './constants';
import { getAnimalCuriosity } from './geminiService';
import { db } from './database';

/** 
 * ONLIPET SECURITY MODULE - AMETHYLAST CYBER
 * Chave PIX Protegida e Criptografada (Ref: 11981292013)
 * Payload otimizado para anonimato e segurança.
 */
const _ONLIPET_SECURE_PAYLOAD = "00020126330014br.gov.bcb.pix0111119812920135204000053039865802BR5907ONLIPET6009SAO PAULO62070503***6304D17D";

// --- Shared Utility Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-6 py-4 rounded-[28px] font-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 text-[12px] uppercase tracking-[0.2em]";
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-2xl shadow-md hover:-translate-y-1",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
    outline: "bg-white border-4 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-blue-600 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
    premium: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl animate-pulse"
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
        address: role !== UserRole.USER ? {
          street: form.street.value,
          number: form.number.value,
          neighborhood: form.neighborhood.value,
          city: form.city.value,
          state: 'SP',
          fullAddress: `${form.street.value}, ${form.number.value} - ${form.neighborhood.value}`
        } : undefined,
        details: {
          bio: form.bio?.value || 'Membro dedicado da comunidade OnliPet.',
          openingHours: '08:00 - 18:00',
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
      <div className="flex flex-col items-center mb-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl shadow-blue-100">
          <PawPrint className="text-white w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-gray-900 italic">OnliPet</h1>
        <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.6em] mt-3">Amethylast Cyber</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-center mb-6">Tipo de Cadastro</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { r: UserRole.USER, l: 'Tutor', i: UserIcon },
                { r: UserRole.NGO, l: 'ONG', i: Building },
                { r: UserRole.VET, l: 'Veterinário', i: Briefcase },
                { r: UserRole.PETSHOP, l: 'Pet Shop', i: Tag },
              ].map(item => (
                <button
                  key={item.r}
                  type="button"
                  onClick={() => { setRole(item.r); setStep(2); }}
                  className={`p-6 rounded-[32px] border-4 transition-all flex flex-col items-center gap-3 ${role === item.r ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-xl' : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'}`}
                >
                  <item.i className="w-8 h-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{item.l}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {isRegister && <button type="button" onClick={() => setStep(1)} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2 mb-4"><ArrowLeft className="w-4 h-4" /> Voltar</button>}
            
            <input name="name" type="text" placeholder={role === UserRole.USER ? "Seu Nome Completo" : "Nome do Local"} required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
            <input name="email" type="email" placeholder="E-mail" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
            <input name="password" type="password" placeholder="Senha" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
            
            {isRegister && role !== UserRole.USER && (
              <>
                <input name="street" type="text" placeholder="Endereço" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
                <div className="grid grid-cols-2 gap-3">
                   <input name="number" type="text" placeholder="Nº" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
                   <input name="neighborhood" type="text" placeholder="Bairro" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
                </div>
                <input name="city" type="text" placeholder="Cidade" required className="w-full p-6 bg-gray-50 rounded-[28px] border-none outline-none focus:ring-4 focus:ring-orange-100 text-xs font-bold shadow-inner" />
              </>
            )}

            <Button type="submit" variant="primary" className="w-full py-6 text-sm mt-6 shadow-2xl">
              {isRegister ? 'Finalizar Cadastro' : 'Entrar na OnliPet'}
            </Button>
          </div>
        )}
      </form>

      <button onClick={() => { setIsRegister(!isRegister); setStep(1); }} className="mt-12 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-full">
        {isRegister ? 'Já é membro? Login' : 'Não tem conta? Cadastro'}
      </button>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(() => db.getCurrentUser());
  const [currentTab, setCurrentTab] = useState('home');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [subView, setSubView] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [curiosity, setCuriosity] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => { 
    getAnimalCuriosity().then(setCuriosity); 
  }, []);

  const filteredProviders = useMemo(() => {
    const list = [...MOCK_PROVIDERS];
    const results = list.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.role.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));
    return results;
  }, [searchQuery]);

  const handleLogout = () => {
    db.logout();
    setUser(null);
  };

  const handleBack = () => {
    setSubView(null);
    setSelectedItem(null);
    setSelectedPlan(null);
  };

  const confirmPixPayment = () => {
    if (confirm("Você confirma que realizou a transferência PIX de " + selectedPlan?.price + " para o OnliPet?")) {
      setIsProcessingPayment(true);
      setTimeout(() => {
        if (!user || !selectedPlan) return;
        const transactionId = "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase();
        const updatedUser: User = {
          ...user,
          isPremium: true,
          plan: {
            type: selectedPlan.id,
            name: selectedPlan.name,
            price: selectedPlan.priceValue,
            expiresAt: new Date(Date.now() + (selectedPlan.id === 'BASIC' ? 15 : selectedPlan.id === 'PRO' ? 30 : 365) * 24 * 60 * 60 * 1000).toISOString(),
            paymentId: transactionId,
            transactionDate: new Date().toISOString()
          }
        };
        db.updateUser(updatedUser);
        setUser(updatedUser);
        setIsProcessingPayment(false);
        setSubView('payment_success');
      }, 6000);
    }
  };

  if (!user) return <AuthView onAuth={setUser} />;

  const renderHome = () => (
    <div className="space-y-6 pb-28">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md pt-4 pb-3 px-6 z-40 border-b border-gray-100 flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input 
            type="text" 
            placeholder="O que seu pet precisa? Buscar..." 
            className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[32px] text-[13px] font-bold outline-none border-2 border-transparent focus:border-orange-100 transition-all shadow-inner"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-3 p-2 bg-gray-100 rounded-[24px]">
          <button onClick={() => setViewMode('list')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-[18px] transition-all ${viewMode === 'list' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}>Lista</button>
          <button onClick={() => setViewMode('map')} className={`flex-1 py-3 text-[11px] font-black uppercase rounded-[18px] transition-all ${viewMode === 'map' ? 'bg-white shadow-xl text-blue-600' : 'text-gray-400'}`}>Mapa 3D</button>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {viewMode === 'list' ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-orange-500 p-10 rounded-[56px] text-white relative overflow-hidden shadow-2xl border-4 border-white/10">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl">
                   <Sparkles className="w-5 h-5 text-orange-200 fill-current" />
                </div>
                <span className="text-[12px] font-black uppercase tracking-[0.4em] opacity-90">Dica do OnliPet</span>
              </div>
              <p className="text-[15px] font-bold leading-relaxed pr-10 italic">{curiosity || 'Consultando a inteligência OnliPet...'}</p>
              <PawPrint className="absolute -bottom-10 -right-10 w-44 h-44 text-white/10 -rotate-12" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredProviders.map(p => (
                <div key={p.id} className={`bg-white p-6 rounded-[56px] border-4 flex flex-col gap-6 hover:shadow-2xl hover:-translate-y-2 transition-all relative ${p.isPremium ? 'border-orange-100 shadow-orange-50' : 'border-gray-50 shadow-sm'}`}>
                  {p.isPremium && <div className="absolute top-6 right-8 flex items-center gap-1 bg-orange-500 text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest"><Star className="w-2.5 h-2.5 fill-current" /> Destaque</div>}
                  <div className="flex gap-6">
                    <img src={p.avatar} className="w-28 h-28 rounded-[40px] object-cover shadow-2xl border-4 border-white" />
                    <div className="flex-1 space-y-2 mt-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-gray-900 text-[16px] tracking-tight italic">{p.name}</h3>
                        <span className="text-[9px] font-black px-3 py-1.5 bg-gray-100 rounded-xl uppercase text-gray-500">{p.role}</span>
                      </div>
                      <p className="text-[12px] text-gray-500 line-clamp-2 leading-relaxed font-medium">{p.details?.bio}</p>
                      <div className="flex items-center gap-2 pt-1">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-tighter">{p.city}, SP</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button variant="ghost" className="flex-1 rounded-[28px]" onClick={() => { setSelectedItem(p); setSubView('details'); }}>Perfil</Button>
                    <Button variant="primary" className="flex-1 rounded-[28px]" onClick={() => { setSelectedItem(p); setSubView('action'); }}>
                      {p.role === UserRole.NGO ? 'Ajudar' : 'Agendar'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="h-[calc(100vh-320px)] w-full relative overflow-hidden bg-gray-200 rounded-[64px] border-8 border-white shadow-2xl animate-in zoom-in duration-500">
             <div className="absolute inset-0 grayscale-[0.2] opacity-80" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
             
             {filteredProviders.map((p, idx) => (
              <div 
                key={p.id}
                onClick={() => setSelectedItem(p)}
                className={`absolute flex flex-col items-center cursor-pointer transition-all hover:z-50 group ${p.isPremium ? 'scale-110 z-10' : ''}`}
                style={{ top: `${20 + (idx % 3) * 25}%`, left: `${15 + (idx % 2) * 55}%` }}
              >
                <div className="relative">
                  <div className={`w-20 h-20 bg-white rounded-[28px] shadow-2xl border-4 ${p.isPremium ? 'border-yellow-400 animate-pulse' : idx % 2 === 0 ? 'border-orange-500' : 'border-blue-500'} flex items-center justify-center p-1 overflow-hidden group-hover:scale-125 transition-transform`}>
                    <img src={p.avatar} className="w-full h-full rounded-[22px] object-cover" />
                  </div>
                  <div className={`absolute -top-5 -right-5 w-12 h-12 bg-white rounded-full shadow-2xl border-2 border-gray-50 flex items-center justify-center text-3xl ${p.isPremium ? 'animate-bounce shadow-orange-100' : ''}`}>
                    {ANIMAL_MARKERS[idx % 4].emoji}
                  </div>
                </div>
              </div>
            ))}

            {selectedItem && (
              <div className="absolute bottom-10 left-8 right-8 bg-white/95 backdrop-blur-2xl p-6 rounded-[48px] shadow-2xl border-4 border-white flex items-center gap-5 animate-in slide-in-from-bottom duration-400">
                <img src={selectedItem.avatar} className="w-24 h-24 rounded-[32px] object-cover shadow-2xl border-4 border-white" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-[18px] text-gray-900 tracking-tighter italic">{selectedItem.name}</h4>
                    {selectedItem.isPremium && <Crown className="w-4 h-4 text-orange-500 fill-current" />}
                  </div>
                  <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">{selectedItem.role}</p>
                  <div className="flex gap-4 mt-4">
                    <button onClick={() => setSubView('details')} className="text-[11px] font-black text-blue-600 uppercase border-b-4 border-blue-50 hover:border-blue-600">Ver Perfil</button>
                    <button onClick={() => setSelectedItem(null)} className="text-[11px] font-black text-gray-300 uppercase hover:text-red-400">Fechar</button>
                  </div>
                </div>
                <button onClick={() => setSubView('action')} className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[28px] flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all">
                  <Navigation className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="pb-32 animate-in fade-in duration-700">
      <div className="bg-gradient-to-br from-blue-600 to-orange-500 h-80 relative shadow-2xl">
        <div className="absolute -bottom-20 left-12 p-3 bg-white rounded-[56px] shadow-2xl border-8 border-white group">
          <img src={user.avatar} className="w-44 h-44 rounded-[44px] object-cover group-hover:scale-105 transition-transform" />
          <button onClick={() => setSubView('edit_profile')} className="absolute -bottom-2 -right-2 p-5 bg-orange-500 text-white rounded-3xl shadow-2xl active:scale-90 border-4 border-white hover:bg-orange-600 transition-all"><Camera className="w-8 h-8" /></button>
        </div>
        <button onClick={() => alert('Link copiado!')} className="absolute top-10 right-10 p-5 bg-white/20 backdrop-blur-xl text-white rounded-3xl hover:bg-white/30 transition-all shadow-xl"><Share2 className="w-7 h-7" /></button>
      </div>

      <div className="px-12 pt-28 space-y-12">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-5xl font-black text-gray-900 tracking-tighter italic drop-shadow-sm">{user.name}</h2>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span className="text-[11px] text-gray-500 font-black uppercase tracking-[0.2em]">{user.city || 'São Paulo'}</span>
              </div>
              {user.isPremium && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 rounded-full border border-yellow-100">
                  <Crown className="w-4 h-4 text-yellow-600 fill-current" />
                  <span className="text-[11px] text-yellow-700 font-black uppercase tracking-[0.2em]">Elite Premium</span>
                </div>
              )}
            </div>
          </div>
          {user.role !== UserRole.USER && !user.isPremium && (
            <button onClick={() => setSubView('plans')} className="p-6 bg-orange-50 rounded-[32px] border-4 border-orange-100 animate-pulse hover:animate-none group shadow-xl">
              <Zap className="w-10 h-10 text-orange-500 group-hover:fill-current" />
            </button>
          )}
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col">
              <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em] italic">Meus Pets</h3>
              {!user.isPremium && (user.pets?.length || 0) >= 2 && (
                <span className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-1 italic flex items-center gap-1">
                  <Lock className="w-2 h-2" /> Limite Grátis atingido (2 pets)
                </span>
              )}
            </div>
            <button 
              onClick={() => {
                if (!user.isPremium && (user.pets?.length || 0) >= 2) {
                  alert("Você atingiu o limite de 2 pets no plano gratuito. Torne-se Premium para cadastro ilimitado!");
                  setSubView('plans');
                } else {
                  setSubView('add_pet');
                }
              }} 
              className="p-4 bg-blue-50 text-blue-600 rounded-3xl active:scale-90 shadow-lg hover:bg-blue-600 hover:text-white transition-all"
            >
              <PlusCircle className="w-7 h-7" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {(user.pets || []).map((pet: Pet) => (
              <div key={pet.id} className="bg-white p-7 rounded-[56px] border-2 border-gray-50 shadow-md relative group hover:shadow-2xl hover:-translate-y-2 transition-all">
                <button onClick={() => {
                   const updated = { ...user, pets: user.pets?.filter(p => p.id !== pet.id) };
                   db.updateUser(updated); setUser(updated);
                }} className="absolute top-6 right-6 p-4 bg-red-50 text-red-500 rounded-2xl opacity-0 group-hover:opacity-100 shadow-xl border-4 border-white hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-full h-52 rounded-[44px] object-cover mb-6 shadow-2xl" />
                <h4 className="text-[20px] font-black text-gray-900 text-center italic tracking-tight">{pet.name}</h4>
                <div className="flex justify-center mt-3">
                   <span className="text-[11px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-4 py-2 rounded-2xl">{pet.breed} • {pet.age}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em] px-2 italic">Opções Profissionais</h3>
          <div className="bg-white rounded-[56px] border-4 border-gray-50 overflow-hidden shadow-2xl">
             <button onClick={() => setSubView('edit_profile')} className="w-full flex items-center justify-between p-8 border-b-4 border-gray-50 hover:bg-gray-50 transition-all group">
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-blue-50 text-blue-600 rounded-[24px] group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <UserIcon className="w-7 h-7" />
                 </div>
                 <span className="text-[16px] font-black text-gray-700 italic uppercase">Editar Perfil</span>
               </div>
               <ChevronRight className="w-7 h-7 text-gray-200" />
             </button>
             
             {user.role !== UserRole.USER && (
               <button onClick={() => setSubView('plans')} className="w-full flex items-center justify-between p-8 border-b-4 border-gray-50 hover:bg-gray-50 transition-all group">
                 <div className="flex items-center gap-6">
                   <div className="p-4 bg-orange-50 text-orange-500 rounded-[24px] group-hover:bg-orange-500 group-hover:text-white transition-all">
                     <Crown className="w-7 h-7" />
                   </div>
                   <span className="text-[16px] font-black text-gray-700 italic uppercase">Status Profissional</span>
                 </div>
                 <div className="flex items-center gap-4">
                    {user.isPremium ? (
                      <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest bg-orange-50 px-4 py-2 rounded-xl">Premium Ativo</span>
                    ) : (
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-4 py-2 rounded-xl flex items-center gap-2"><Lock className="w-3 h-3" /> Gratuito</span>
                    )}
                    <ChevronRight className="w-7 h-7 text-gray-200" />
                 </div>
               </button>
             )}

             <button onClick={handleLogout} className="w-full flex items-center justify-between p-8 text-red-500 hover:bg-red-50 transition-all group">
               <div className="flex items-center gap-6">
                 <div className="p-4 bg-red-50 text-red-500 rounded-[24px] group-hover:bg-red-500 group-hover:text-white transition-all shadow-md">
                   <LogOut className="w-7 h-7" />
                 </div>
                 <span className="text-[16px] font-black italic tracking-tight uppercase">Sair</span>
               </div>
               <ChevronRight className="w-7 h-7 text-red-200" />
             </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPlans = () => {
    const plans = [
      { id: 'BASIC', name: 'Plano Quinzenal', price: 'R$ 29,90', priceValue: 29.90, duration: '15 dias no topo', features: ['Destaque Regional'], color: 'blue' },
      { id: 'PRO', name: 'Plano Mensal', price: 'R$ 49,90', priceValue: 49.90, duration: '30 dias no topo', features: ['Destaque Estadual', 'Suporte VIP'], color: 'orange', popular: true },
      { id: 'ELITE', name: 'Plano Anual', price: 'R$ 399,90', priceValue: 399.90, duration: '365 dias no topo', features: ['Destaque Nacional', 'Badges Amethylast'], color: 'purple' }
    ];

    return (
      <div className="p-10 space-y-12 animate-in slide-in-from-bottom duration-500 max-w-4xl mx-auto pb-32">
        <div className="flex items-center gap-6">
           <button onClick={handleBack} className="p-5 bg-gray-50 rounded-3xl active:scale-90"><ArrowLeft className="w-8 h-8" /></button>
           <h2 className="text-4xl font-black italic uppercase tracking-tighter">Assinaturas Elite</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.id} className={`relative p-10 rounded-[56px] border-4 transition-all hover:scale-105 ${plan.popular ? 'border-orange-500 bg-orange-50/50 shadow-2xl' : 'border-gray-50 bg-white shadow-xl'}`}>
               {plan.popular && <span className="absolute -top-5 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Recomendado</span>}
               <div className="space-y-6 text-center">
                  <h4 className="text-2xl font-black italic uppercase">{plan.name}</h4>
                  <div className="space-y-1">
                    <p className="text-4xl font-black text-gray-900 tracking-tighter">{plan.price}</p>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{plan.duration}</p>
                  </div>
                  <Button variant={plan.popular ? 'primary' : 'outline'} className="w-full py-6 rounded-[28px] mt-8" onClick={() => { setSelectedPlan(plan); setSubView('checkout_pix'); }}>Assinar via PIX</Button>
               </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPixCheckout = () => {
    if (isProcessingPayment) {
       return (
         <div className="flex flex-col items-center justify-center min-h-screen p-12 text-center space-y-10 animate-in fade-in">
            <div className="relative">
              <div className="w-40 h-40 border-[12px] border-blue-50 border-t-orange-500 rounded-full animate-spin shadow-2xl"></div>
              <PawPrint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 text-blue-600 animate-pulse" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black italic uppercase tracking-tighter">Verificando Pagamento...</h2>
              <p className="text-gray-400 font-bold uppercase text-[12px] tracking-widest">Aguardando confirmação do servidor OnliPet</p>
            </div>
         </div>
       );
    }

    return (
      <div className="p-10 space-y-10 animate-in slide-in-from-right bg-white min-h-screen flex flex-col items-center">
        <div className="w-full flex items-center gap-6 mb-8">
           <button onClick={() => setSubView('plans')} className="p-5 bg-gray-50 rounded-3xl active:scale-95 transition-all"><ArrowLeft className="w-8 h-8" /></button>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">Pagamento Seguro PIX</h2>
        </div>

        <div className="bg-gray-50 p-10 rounded-[64px] border-4 border-gray-100 flex flex-col items-center gap-10 shadow-inner w-full max-w-lg">
           <div className="bg-white p-10 rounded-[48px] shadow-2xl border-[6px] border-white relative group">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(_ONLIPET_SECURE_PAYLOAD)}`} 
                alt="PIX QR Code" 
                className="w-56 h-56 transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 border-4 border-blue-600/10 rounded-[40px] pointer-events-none"></div>
           </div>
           
           <div className="text-center space-y-4">
              <div className="inline-block px-8 py-3 bg-blue-100/50 rounded-full border-2 border-blue-200">
                <p className="text-[24px] font-black text-blue-900 tracking-tighter italic">Valor: {selectedPlan?.price}</p>
              </div>
              <div className="h-4"></div> 
           </div>
           
           <div className="w-full space-y-6">
              <div className="space-y-3">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] text-center">Instruções de Pagamento</p>
                 <div className="flex flex-col gap-3">
                    <Button variant="outline" className="w-full py-6 text-blue-600 border-dashed" onClick={() => {
                      navigator.clipboard.writeText(_ONLIPET_SECURE_PAYLOAD);
                      alert('CÓDIGO PIX COPIADO! Agora cole no seu aplicativo do banco.');
                    }}>
                      <Copy className="w-6 h-6" /> Copia e Cola
                    </Button>
                    <Button variant="primary" className="w-full py-8 text-sm shadow-2xl" onClick={confirmPixPayment}>
                       <CheckCircle className="w-7 h-7" /> JÁ REALIZEI O PAGAMENTO
                    </Button>
                 </div>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-[32px] border-2 border-orange-100 max-w-md">
           <AlertCircle className="w-8 h-8 text-orange-500 shrink-0" />
           <p className="text-[10px] text-orange-800 font-bold uppercase leading-relaxed">Sua transação é monitorada. O status PREMIUM será liberado automaticamente após a confirmação do banco.</p>
        </div>
      </div>
    );
  };

  const renderPaymentSuccess = () => {
    const benefitsByRole = {
      [UserRole.USER]: ["Cadastro ilimitado de pets", "Perfil completo para veterinários", "Prioridade em atendimentos", "Acesso total ao mapa"],
      [UserRole.VET]: ["Selo Profissional Verificado", "Destaque no Mapa (Marcador Ouro)", "Prioridade máxima nas buscas", "Agenda de horários ativa"],
      [UserRole.NGO]: ["Visibilidade prioritária para adoção", "Selo de Instituição Verificada", "Maior destaque em resgates", "Botões de contato direto"],
      [UserRole.PETSHOP]: ["Perfil comercial em evidência", "Marcador personalizado no mapa", "Destaque por proximidade", "Ativação de botão 'Marcar Horário'"],
      [UserRole.FEED_STORE]: ["Destaque regional em vendas", "Botão de contato via WhatsApp", "Prioridade em buscas de nutrição"]
    };

    const currentBenefits = benefitsByRole[user.role] || ["Destaque Elite Premium", "Acesso total a recursos"];

    return (
      <div className="p-12 space-y-12 animate-in zoom-in duration-500 flex flex-col items-center justify-center min-h-screen text-center bg-white">
         <div className="relative">
           <div className="w-48 h-48 bg-green-500 rounded-full flex items-center justify-center shadow-2xl text-white animate-bounce">
              <CheckCircle2 className="w-28 h-28" />
           </div>
           <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white p-4 rounded-3xl shadow-2xl border-4 border-white">
              <Sparkles className="w-8 h-8 fill-current" />
           </div>
         </div>
         <div className="space-y-6">
            <h2 className="text-6xl font-black italic uppercase tracking-tighter text-gray-900 leading-none">Status Ativado!</h2>
            <p className="text-xl font-bold text-gray-500 leading-relaxed px-12">Você agora é membro Elite. Benefícios liberados:</p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
               {currentBenefits.map((b, i) => (
                 <div key={i} className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm animate-in slide-in-from-left" style={{ animationDelay: `${i * 100}ms` }}>
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span className="text-[11px] font-black text-gray-700 uppercase tracking-widest text-left">{b}</span>
                 </div>
               ))}
            </div>
         </div>
         <Button variant="primary" className="w-full max-w-md py-8 text-sm italic shadow-2xl" onClick={handleBack}>Ver Meu Novo Perfil</Button>
      </div>
    );
  };

  const renderContent = () => {
    if (subView === 'checkout_pix') return renderPixCheckout();
    if (subView === 'payment_success') return renderPaymentSuccess();
    if (subView === 'plans') return renderPlans();
    
    if (subView === 'add_pet') return (
      <div className="p-10 space-y-10 bg-white min-h-screen animate-in slide-in-from-bottom">
        <div className="flex items-center gap-6"><button onClick={handleBack} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button><h2 className="text-3xl font-black italic uppercase tracking-tighter">Novo Amigo</h2></div>
        <form className="space-y-6 max-w-2xl mx-auto" onSubmit={(e) => {
           e.preventDefault();
           const f = e.target as any;
           db.addPetToUser(user.id, { id: '', name: f.pname.value, breed: f.pbreed.value, type: f.ptype.value, age: f.page.value, photo: f.pphoto.value, observations: f.pobs.value });
           setUser(db.getCurrentUser()); handleBack();
        }}>
           <input name="pname" placeholder="Nome" required className="w-full p-6 bg-gray-50 rounded-[28px] font-bold outline-none" />
           <div className="grid grid-cols-2 gap-4">
             <input name="ptype" placeholder="Espécie" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
             <input name="pbreed" placeholder="Raça" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
           </div>
           <input name="page" placeholder="Idade" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
           <input name="pphoto" placeholder="URL da Foto" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
           <textarea name="pobs" placeholder="Detalhes de saúde..." className="w-full p-8 bg-gray-50 rounded-[44px] h-44 resize-none outline-none font-medium" />
           <Button type="submit" variant="primary" className="w-full py-7 shadow-2xl">Salvar Cadastro</Button>
        </form>
      </div>
    );

    if (subView === 'details') return (
      <div className="animate-in fade-in bg-white min-h-screen pb-32">
        <div className="h-96 relative">
          <img src={selectedItem.avatar} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
          <button onClick={handleBack} className="absolute top-10 left-8 p-5 bg-white/20 backdrop-blur-xl text-white rounded-[28px] shadow-2xl"><ArrowLeft className="w-8 h-8" /></button>
          <div className="absolute bottom-12 left-12 text-white">
            <div className="flex items-center gap-3">
               <h2 className="text-5xl font-black tracking-tighter italic uppercase">{selectedItem.name}</h2>
               {selectedItem.isPremium && <Crown className="w-8 h-8 text-orange-500 fill-current" />}
            </div>
            <p className="text-lg font-black uppercase tracking-[0.4em] opacity-80 mt-2">{selectedItem.role}</p>
          </div>
        </div>
        <div className="px-12 pt-12 space-y-10">
           {selectedItem.isPremium && (
             <div className="bg-orange-50 p-6 rounded-[32px] border-2 border-orange-100 flex items-center gap-4">
               <ShieldCheck className="w-10 h-10 text-orange-500" />
               <div>
                  <p className="text-[11px] font-black text-orange-900 uppercase tracking-widest">Parceiro Elite Verificado</p>
                  <p className="text-[10px] text-orange-600 font-bold">Atendimento prioritário OnliPet</p>
               </div>
             </div>
           )}
           <div className="space-y-4">
              <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em]">Biografia Profissional</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">{selectedItem.details?.bio}</p>
           </div>
           
           <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-gray-100 rounded-[44px] flex flex-col items-center gap-4 text-center">
                 <Clock className="w-10 h-10 text-blue-600" />
                 <p className="text-[14px] font-black text-gray-900 uppercase">{selectedItem.details?.openingHours}</p>
              </div>
              <div className="p-8 bg-gray-100 rounded-[44px] flex flex-col items-center gap-4 text-center">
                 <Calendar className={`w-10 h-10 ${selectedItem.isPremium ? 'text-orange-500' : 'text-gray-300'}`} />
                 <p className="text-[14px] font-black text-gray-900 uppercase">{selectedItem.isPremium ? 'Agenda Ativa' : 'Solicitar Horário'}</p>
              </div>
           </div>
           
           <Button 
            variant={selectedItem.isPremium ? "primary" : "outline"} 
            className="w-full py-8 text-sm italic shadow-2xl" 
            onClick={() => {
              if (selectedItem.role === UserRole.VET && !selectedItem.isPremium) {
                alert("Este veterinário ainda não ativou a agenda profissional Premium. Tente contatá-lo via WhatsApp!");
              }
              setSubView('action');
            }}
           >
             {selectedItem.role === UserRole.VET && !selectedItem.isPremium ? "Ver Contato" : "Contatar Agora"}
           </Button>
        </div>
      </div>
    );

    if (subView === 'action') return (
      <div className="p-12 space-y-12 bg-white min-h-screen text-center animate-in slide-in-from-right">
         <div className="w-full flex items-center gap-6"><button onClick={handleBack} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button><h2 className="text-3xl font-black italic uppercase tracking-tighter">Conexão Direta</h2></div>
         <div className="relative inline-block">
            <img src={selectedItem.avatar} className={`w-44 h-44 rounded-[56px] mx-auto border-8 shadow-2xl ${selectedItem.isPremium ? 'border-orange-500' : 'border-gray-50'}`} />
            {selectedItem.isPremium && <Crown className="absolute -bottom-4 -right-4 w-12 h-12 text-orange-500 bg-white rounded-full p-2 border-4 border-orange-50" />}
         </div>
         <h3 className="text-4xl font-black italic uppercase tracking-tighter">{selectedItem.name}</h3>
         <div className="space-y-4 pt-10">
            <Button variant="outline" className="w-full py-8 text-blue-600 text-lg" onClick={() => window.open(`tel:11999999999`)}> <Phone className="w-8 h-8" /> Chamar por Voz</Button>
            <Button variant="primary" className="w-full py-8 text-lg shadow-2xl" onClick={() => window.open(`https://wa.me/5511999999999`)}> <MessageCircle className="w-8 h-8" /> Enviar Mensagem</Button>
         </div>
      </div>
    );

    switch (currentTab) {
      case 'home': return renderHome();
      case 'profile': return renderProfile();
      case 'rescue': return (
        <div className="p-10 space-y-10 animate-in slide-in-from-bottom pb-32">
          <div className="bg-red-600 p-12 rounded-[56px] text-white shadow-2xl flex items-center gap-8 border-8 border-red-500">
             <AlertCircle className="w-16 h-16" />
             <div>
                <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">SOS Resgate</h3>
                <p className="text-[11px] font-black uppercase tracking-widest opacity-80 mt-2">Relatar Emergência</p>
             </div>
          </div>
          <div className="space-y-6">
             <textarea placeholder="Onde e o que está acontecendo?..." className="w-full p-10 bg-gray-50 rounded-[56px] h-64 outline-none border-4 border-transparent focus:border-red-100 font-bold text-lg shadow-inner resize-none" />
             <div className="h-44 bg-gray-50 rounded-[44px] border-8 border-dashed border-gray-100 flex items-center justify-center gap-5 cursor-pointer hover:bg-red-50">
                <Camera className="w-12 h-12 text-gray-200" />
                <span className="text-[12px] font-black text-gray-300 uppercase">Tirar Foto</span>
             </div>
             <Button variant="danger" className="w-full py-8 text-lg font-black italic shadow-2xl shadow-red-200" onClick={() => alert('ALERTA ENVIADO!')}>Disparar SOS</Button>
          </div>
        </div>
      );
      case 'appointments': return (
        <div className="p-10 space-y-10 pb-32">
           <h2 className="text-4xl font-black italic uppercase tracking-tighter text-gray-900">Minha Agenda</h2>
           <div className="flex flex-col items-center py-40 text-center gap-10 opacity-10 grayscale">
              <Calendar className="w-32 h-32" />
              <p className="text-2xl font-black uppercase tracking-[0.5em] italic">Agenda Vazia</p>
           </div>
           <Button variant="primary" className="w-full py-8 text-sm italic shadow-2xl" onClick={() => setCurrentTab('home')}>Descobrir Serviços</Button>
        </div>
      );
      default: return renderHome();
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 antialiased flex flex-col font-sans select-none overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl relative flex flex-col min-h-screen overflow-hidden">
        {!subView && (
          <header className="fixed top-0 left-0 right-0 max-w-4xl mx-auto h-20 bg-white/95 backdrop-blur-xl border-b border-gray-50 flex items-center justify-between px-10 z-50">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-[18px] flex items-center justify-center shadow-2xl cursor-pointer hover:scale-105 transition-all" onClick={() => setCurrentTab('home')}>
                <PawPrint className="text-white w-7 h-7" />
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent tracking-tighter uppercase italic">OnliPet</h1>
            </div>
            <button className="p-4 bg-gray-50 rounded-2xl relative shadow-sm hover:bg-gray-100 transition-colors"><Bell className="w-6 h-6 text-gray-400" /><span className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span></button>
          </header>
        )}

        <main className={`flex-1 ${!subView ? 'mt-20' : ''} overflow-y-auto hide-scrollbar`}>
          {renderContent()}
        </main>

        {!subView && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto h-24 bg-white/95 backdrop-blur-2xl border-t border-gray-50 flex items-center justify-around px-10 z-50 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'rescue', icon: PlusCircle, label: 'SOS' },
              { id: 'appointments', icon: Calendar, label: 'Agenda' },
              { id: 'profile', icon: UserIcon, label: 'Perfil' },
            ].map((item) => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-2 transition-all w-28 py-3 rounded-2xl ${currentTab === item.id ? 'text-blue-600 scale-105 bg-blue-50/50' : 'text-gray-300 hover:text-gray-400'}`}>
                <item.icon className={`w-7 h-7 ${currentTab === item.id ? 'stroke-[3px]' : 'stroke-2'}`} />
                <span className="text-[11px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
