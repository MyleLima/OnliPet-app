
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Home, Search, Calendar, User as UserIcon, PlusCircle, 
  Heart, MessageCircle, ChevronRight, Filter, Navigation, Camera, LogOut, 
  Bell, PawPrint, ArrowLeft, CheckCircle2, Clock, MapPin, ShieldCheck,
  History, Mail, Phone, Building, Briefcase, Tag, Trash2, Globe, Share2, 
  Award, Sparkles, ImageIcon, CreditCard, QrCode, FileText, Zap, Star, Crown,
  Check, AlertCircle, Copy, CheckCircle, Lock, Settings, ShoppingBag, Plus, Save
} from 'lucide-react';
import { User, UserRole, Pet, CatalogItem, BusinessDay } from './types';
import { MOCK_PROVIDERS, ANIMAL_MARKERS } from './constants';
import { getAnimalCuriosity } from './geminiService';
import { db } from './database';

// --- Utilities ---

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

function generatePixPayload(amount: number) {
  const amountStr = amount.toFixed(2);
  const amountPart = `54${String(amountStr.length).padStart(2, '0')}${amountStr}`;
  let payload = "00020126310014br.gov.bcb.pix011111981292013520400005303986" + amountPart + "5802BR5907ONLIPET6009SAO PAULO62070503***6304";
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) crc = (crc << 1) ^ 0x1021;
      else crc <<= 1;
    }
  }
  return payload + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, type = "button" }: any) => {
  const base = "px-6 py-4 rounded-[28px] font-black transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 text-[12px] uppercase tracking-[0.2em]";
  const variants: any = {
    primary: "bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:shadow-2xl shadow-md",
    secondary: "bg-orange-500 text-white hover:bg-orange-600 shadow-md",
    outline: "bg-white border-4 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "bg-gray-100 text-blue-600 hover:bg-gray-200",
    danger: "bg-red-500 text-white hover:bg-red-600 shadow-md",
    premium: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white shadow-2xl animate-pulse"
  };
  return <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const ImagePicker = ({ onImageSelected, currentImage, label }: { onImageSelected: (base64: string) => void, currentImage?: string, label: string }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState(currentImage);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await fileToBase64(file);
      setPreview(base64);
      onImageSelected(base64);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">{label}</p>
      <div 
        onClick={() => inputRef.current?.click()}
        className="w-full h-48 bg-gray-50 border-4 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-all overflow-hidden relative group"
      >
        {preview ? (
          <>
            <img src={preview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-12 h-12 text-blue-600" />
            </div>
          </>
        ) : (
          <>
            <ImageIcon className="w-12 h-12 text-gray-200 mb-2" />
            <span className="text-[10px] font-black text-gray-300 uppercase">Clique para selecionar</span>
          </>
        )}
        <input type="file" accept="image/*" className="hidden" ref={inputRef} onChange={handleChange} />
      </div>
    </div>
  );
};

const AuthView = ({ onAuth }: { onAuth: (user: User) => void }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [step, setStep] = useState(1);

  const roleLabels = {
    [UserRole.USER]: 'Tutor',
    [UserRole.NGO]: 'ONG',
    [UserRole.VET]: 'Veterinário',
    [UserRole.PETSHOP]: 'Pet Shop',
    [UserRole.FEED_STORE]: 'Casa de Ração'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as any;
    
    if (isRegister) {
      const result = db.register({
        id: '',
        name: form.name.value,
        email: form.email.value,
        password: form.password.value,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.email.value}`,
        city: form.city?.value || 'São Paulo',
        details: {
          bio: form.bio?.value || 'Membro dedicado da OnliPet.',
          openingHours: form.hours?.value || '08:00 - 18:00',
          specialty: form.specialty?.value || '',
          responsibleName: form.responsible?.value || ''
        },
        address: role !== UserRole.USER ? {
          street: form.address?.value || '',
          number: '',
          neighborhood: '',
          city: form.city?.value || 'São Paulo',
          state: 'SP',
          fullAddress: form.address?.value || ''
        } : undefined
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
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-orange-500 rounded-[32px] flex items-center justify-center mb-6 shadow-2xl">
          <PawPrint className="text-white w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter">OnliPet</h1>
        <p className="text-[11px] font-black text-orange-500 uppercase tracking-[0.6em] mt-3">Amethylast Cyber</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && step === 1 ? (
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <h2 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em] text-center mb-2">Selecione seu perfil</h2>
            <div className="grid grid-cols-2 gap-4">
              {[UserRole.USER, UserRole.NGO, UserRole.VET, UserRole.PETSHOP].map(r => (
                <button 
                  key={r} 
                  type="button" 
                  onClick={() => { setRole(r); setStep(2); }} 
                  className="p-8 rounded-[32px] border-4 border-gray-50 bg-gray-50 flex flex-col items-center gap-3 hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <span className="text-[12px] font-black uppercase tracking-widest text-gray-500 group-hover:text-orange-600 transition-colors">{roleLabels[r]}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {isRegister && (
              <button type="button" onClick={() => setStep(1)} className="text-[11px] font-black text-blue-600 uppercase flex items-center gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
            )}
            
            <input name="name" placeholder={role === UserRole.USER ? "Seu Nome Completo" : "Nome do Estabelecimento / ONG"} required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
            <input name="email" type="email" placeholder="Seu melhor E-mail" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
            <input name="password" type="password" placeholder="Crie uma Senha" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
            
            {isRegister && role !== UserRole.USER && (
              <div className="space-y-4 pt-2 border-t border-gray-100 mt-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Informações da Localidade</p>
                <input name="address" placeholder="Endereço Completo (Rua, Nº, Bairro)" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
                <input name="city" placeholder="Cidade" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
                <input name="hours" placeholder="Horário de Funcionamento (ex: 08:00 - 18:00)" required className="w-full p-6 bg-gray-50 rounded-[28px) outline-none font-bold" />
                {role === UserRole.VET && (
                  <input name="specialty" placeholder="Sua Especialidade (ex: Clínica Geral, Cirurgia)" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
                )}
                <input name="responsible" placeholder="Nome do Responsável" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold" />
              </div>
            )}

            <Button type="submit" variant="primary" className="w-full py-6 mt-6 shadow-xl">
              {isRegister ? 'Finalizar Cadastro' : 'Entrar na Conta'}
            </Button>
          </div>
        )}
      </form>
      
      <button onClick={() => { setIsRegister(!isRegister); setStep(1); }} className="mt-12 text-[11px] font-black text-gray-400 uppercase text-center w-full tracking-[0.2em]">
        {isRegister ? 'Já sou membro? Fazer Login' : 'Não tem conta? Cadastrar-se'}
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
  
  // States for dynamic uploads
  const [tempImage, setTempImage] = useState<string>('');

  useEffect(() => { getAnimalCuriosity().then(setCuriosity); }, []);

  const handleBack = () => { setSubView(null); setSelectedItem(null); setTempImage(''); };

  const handleUpdateBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const updatedUser = {
      ...user,
      name: form.bname.value,
      avatar: tempImage || user.avatar,
      details: {
        ...user.details,
        cnpj: form.bcnpj.value,
        responsibleName: form.bresp.value,
        bio: form.bbio.value,
        specialty: form.bspec?.value,
        openingHours: form.bhours?.value
      },
      city: form.bcity?.value || user.city,
      address: {
        ...user.address,
        fullAddress: form.baddr?.value || user.address?.fullAddress || '',
        city: form.bcity?.value || user.city || ''
      }
    };
    db.updateUser(updatedUser);
    setUser(updatedUser);
    handleBack();
  };

  const addCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const form = e.target as any;
    const newItem: CatalogItem = {
      id: Math.random().toString(36).substr(2, 5),
      name: form.iname.value,
      price: form.iprice.value,
      description: form.idesc.value,
      photo: tempImage
    };
    const updated = { ...user, catalog: [...(user.catalog || []), newItem] };
    db.updateUser(updated);
    setUser(updated);
    setSubView('manage_catalog');
    setTempImage('');
  };

  // Combine mock providers with any other pros from DB (for demo purposes)
  const providersToDisplay = useMemo(() => {
    const list = [...MOCK_PROVIDERS];
    return list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const renderHome = () => (
    <div className="space-y-6 pb-28">
      <div className="sticky top-0 bg-white/95 backdrop-blur-md pt-4 pb-3 px-6 z-40 border-b border-gray-100 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
          <input 
            type="text" placeholder="Buscar serviços ou ONGs..." 
            className="w-full pl-14 pr-6 py-5 bg-gray-50 rounded-[32px] text-[13px] font-bold outline-none"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {user?.role === UserRole.USER && (
          <div className="flex gap-2 p-1 bg-gray-100 rounded-[24px]">
            <button onClick={() => setViewMode('list')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-[18px] transition-all ${viewMode === 'list' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400'}`}>Lista</button>
            <button onClick={() => setViewMode('map')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-[18px] transition-all ${viewMode === 'map' ? 'bg-white shadow-lg text-blue-600' : 'text-gray-400'}`}>Mapa Amethylast</button>
          </div>
        )}
      </div>

      {viewMode === 'list' ? (
        <div className="px-6 space-y-8 animate-in fade-in">
          <div className="bg-gradient-to-br from-blue-700 to-orange-500 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-orange-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Dica do OnliPet</span>
            </div>
            <p className="text-[15px] font-bold italic leading-relaxed pr-10">{curiosity || 'Consultando a OnliPet...'}</p>
            <PawPrint className="absolute -bottom-10 -right-10 w-44 h-44 text-white/10 -rotate-12" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {providersToDisplay.map(p => (
              <div key={p.id} className="bg-white p-6 rounded-[56px] border-4 border-gray-50 shadow-sm flex flex-col gap-6 hover:border-orange-100 transition-all">
                <div className="flex gap-6">
                  <img src={p.avatar} className="w-28 h-28 rounded-[40px] object-cover shadow-md" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-[16px] italic">{p.name}</h3>
                      {p.isPremium && <Crown className="w-4 h-4 text-orange-500 fill-current" />}
                    </div>
                    <p className="text-[12px] text-gray-500 line-clamp-2">{p.details?.bio}</p>
                    <div className="flex items-center gap-1 pt-1">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.city}</span>
                    </div>
                  </div>
                </div>
                <Button variant="primary" className="w-full" onClick={() => { setSelectedItem(p); setSubView('details'); }}>Ver Detalhes</Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-6 pb-28 animate-in zoom-in h-[calc(100vh-280px)] relative overflow-hidden bg-gray-100 rounded-[56px] border-4 border-white shadow-2xl">
          {/* Mock Interactive Map Background */}
          <div className="absolute inset-0 grayscale-[0.2] opacity-40 bg-[url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/-46.6333,23.5505,12,0/1200x800?access_token=pk.eyJ1IjoiYmFyYmFyb3NhIiwiYSI6ImNraXFyeXJxejA1MjIycnBmcXJ6Z3R6Z3IifQ.X9X9X9X9X9X9X9X9X9X9X9')] bg-cover bg-center"></div>
          
          {/* Provider Markers on Map */}
          {providersToDisplay.map((p, idx) => {
             const marker = ANIMAL_MARKERS[idx % ANIMAL_MARKERS.length];
             return (
               <div 
                key={p.id} 
                className={`absolute cursor-pointer transition-transform hover:scale-125 z-10`}
                style={{ top: `${20 + (idx % 3) * 25}%`, left: `${15 + (idx % 2) * 60}%` }}
                onClick={() => setSelectedItem(p)}
               >
                 <div className={`relative flex flex-col items-center group`}>
                    <div className={`w-14 h-14 bg-white rounded-2xl shadow-2xl border-4 flex items-center justify-center text-2xl transition-all ${selectedItem?.id === p.id ? 'border-orange-500 scale-125' : 'border-blue-600'}`}>
                      {marker.emoji}
                    </div>
                    <div className="absolute -bottom-8 bg-white px-3 py-1 rounded-full shadow-lg border border-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                       <span className="text-[9px] font-black uppercase tracking-widest">{p.name}</span>
                    </div>
                 </div>
               </div>
             );
          })}

          {/* Map Info Card (Visible when provider is clicked) */}
          {selectedItem && (
            <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-2xl p-6 rounded-[44px] shadow-2xl border-4 border-white flex flex-col gap-4 animate-in slide-in-from-bottom duration-300 z-20">
              <div className="flex items-center gap-4">
                <img src={selectedItem.avatar} className="w-20 h-20 rounded-[28px] object-cover shadow-lg border-2 border-gray-50" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-lg italic tracking-tighter">{selectedItem.name}</h4>
                    {selectedItem.isPremium && <Crown className="w-4 h-4 text-orange-500 fill-current" />}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-blue-600" />
                      <span className="text-[9px] font-black uppercase text-gray-500 tracking-widest">{selectedItem.details?.openingHours || 'Consulte os horários'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-orange-500" />
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{selectedItem.address?.fullAddress || selectedItem.city}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                 <Button variant="primary" className="flex-1 py-4 text-[10px]" onClick={() => setSubView('details')}>Ver Catálogo Completo</Button>
                 <button onClick={() => setSelectedItem(null)} className="p-4 bg-gray-50 rounded-[24px] text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-6 h-6" /></button>
              </div>
            </div>
          )}

          {/* Map Overlay Badge */}
          <div className="absolute top-6 left-6 bg-blue-600 text-white px-5 py-2 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white/20">
             <Navigation className="w-4 h-4" />
             <span className="text-[10px] font-black uppercase tracking-widest">Radar OnliPet Ativo</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderBusinessPanel = () => (
    <div className="p-8 pb-32 space-y-10 animate-in slide-in-from-bottom">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Painel de Gestão</h2>
          <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mt-1">Amethylast Cyber Business</p>
        </div>
        <div className="bg-blue-600 text-white p-3 rounded-2xl"><Settings className="w-6 h-6" /></div>
      </div>
      
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-[24px] border-4 border-white/20 overflow-hidden">
            <img src={user?.avatar} className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tight">{user?.name}</h3>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{user?.role}</span>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          {user?.isPremium ? (
            <span className="bg-orange-500 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
              <Crown className="w-3 h-3 fill-current" /> Status Premium
            </span>
          ) : (
            <span className="bg-white/10 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">Perfil Básico</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => setSubView('edit_business_profile')} className="p-8 bg-blue-50 rounded-[44px] flex flex-col items-center gap-4 text-blue-600 hover:bg-blue-100 transition-all border-2 border-transparent hover:border-blue-200">
          <Building className="w-10 h-10" />
          <span className="text-[10px] font-black uppercase tracking-widest">Informações</span>
        </button>
        <button onClick={() => setSubView('manage_catalog')} className="p-8 bg-orange-50 rounded-[44px] flex flex-col items-center gap-4 text-orange-600 hover:bg-orange-100 transition-all border-2 border-transparent hover:border-orange-200">
          <ShoppingBag className="w-10 h-10" />
          <span className="text-[10px] font-black uppercase tracking-widest">Catálogo</span>
        </button>
        <button onClick={() => setSubView('manage_hours')} className="p-8 bg-green-50 rounded-[44px] flex flex-col items-center gap-4 text-green-600 hover:bg-green-100 transition-all border-2 border-transparent hover:border-green-200">
          <Clock className="w-10 h-10" />
          <span className="text-[10px] font-black uppercase tracking-widest">Minha Agenda</span>
        </button>
        <button onClick={() => setSubView('plans')} className="p-8 bg-purple-50 rounded-[44px] flex flex-col items-center gap-4 text-purple-600 hover:bg-purple-100 transition-all border-2 border-transparent hover:border-purple-200">
          <Crown className="w-10 h-10" />
          <span className="text-[10px] font-black uppercase tracking-widest">Assinaturas</span>
        </button>
      </div>
      
      <Button variant="ghost" className="w-full py-6 mt-10" onClick={() => { db.logout(); setUser(null); }}>
        <LogOut className="w-5 h-5" /> Sair da Plataforma
      </Button>
    </div>
  );

  const renderEditBusinessProfile = () => (
    <div className="p-8 space-y-8 bg-white min-h-screen pb-32">
      <div className="flex items-center gap-6">
        <button onClick={handleBack} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button>
        <h2 className="text-2xl font-black italic uppercase">Configurações Locais</h2>
      </div>
      <form onSubmit={handleUpdateBusiness} className="space-y-6">
        <ImagePicker label="Logo ou Foto de Fachada" currentImage={user?.avatar} onImageSelected={setTempImage} />
        
        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Informações Gerais</p>
          <input name="bname" defaultValue={user?.name} placeholder="Nome do Local" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <input name="bcnpj" defaultValue={user?.details?.cnpj} placeholder="CNPJ da Empresa" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <input name="bresp" defaultValue={user?.details?.responsibleName} placeholder="Nome do Gestor" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Localização e Funcionamento</p>
          <input name="baddr" defaultValue={user?.address?.fullAddress} placeholder="Endereço (Rua, Nº, Bairro)" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <input name="bcity" defaultValue={user?.city} placeholder="Cidade" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <input name="bhours" defaultValue={user?.details?.openingHours} placeholder="Horário (ex: Seg-Sex 08h-18h)" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          {user?.role === UserRole.VET && (
            <input name="bspec" defaultValue={user?.details?.specialty} placeholder="Especialidades Médicas" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          )}
        </div>

        <div className="space-y-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Biografia Pública</p>
          <textarea name="bbio" defaultValue={user?.details?.bio} placeholder="Conte um pouco sobre seu trabalho com os animais..." className="w-full p-8 bg-gray-50 rounded-[44px] h-44 outline-none font-medium shadow-inner resize-none" />
        </div>

        <Button type="submit" variant="primary" className="w-full py-8 text-sm italic shadow-2xl">
          <Save className="w-6 h-6" /> Atualizar Informações
        </Button>
      </form>
    </div>
  );

  const renderContent = () => {
    if (subView === 'manage_catalog') return renderManageCatalog();
    if (subView === 'edit_business_profile') return renderEditBusinessProfile();
    if (subView === 'add_catalog_item') return (
      <div className="p-8 space-y-8 bg-white min-h-screen">
        <div className="flex items-center gap-6"><button onClick={() => setSubView('manage_catalog')} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button><h2 className="text-2xl font-black italic uppercase">Novo Item</h2></div>
        <form onSubmit={addCatalogItem} className="space-y-6">
          <ImagePicker label="Foto do Produto/Serviço" onImageSelected={setTempImage} />
          <input name="iname" placeholder="Nome do Serviço ou Produto" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <input name="iprice" placeholder="Preço Sugerido (R$)" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <textarea name="idesc" placeholder="Breve descrição dos diferenciais..." className="w-full p-8 bg-gray-50 rounded-[44px] h-32 outline-none font-medium shadow-inner resize-none" />
          <Button type="submit" variant="primary" className="w-full py-8 text-sm italic shadow-2xl">Adicionar ao Catálogo</Button>
        </form>
      </div>
    );
    if (subView === 'add_pet') return (
      <div className="p-8 space-y-8 bg-white min-h-screen">
        <div className="flex items-center gap-6"><button onClick={handleBack} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button><h2 className="text-2xl font-black italic uppercase">Novo Amigo</h2></div>
        <form onSubmit={async (e) => {
          e.preventDefault();
          const f = e.target as any;
          db.addPetToUser(user!.id, { id: '', name: f.pname.value, breed: f.pbreed.value, type: f.ptype.value, age: f.page.value, photo: tempImage, observations: f.pobs.value });
          setUser(db.getCurrentUser()); handleBack();
        }} className="space-y-6">
          <ImagePicker label="Foto do Pet" onImageSelected={setTempImage} />
          <input name="pname" placeholder="Nome do Pet" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <div className="grid grid-cols-2 gap-4">
             <input name="ptype" placeholder="Espécie (Cão, Gato...)" required className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
             <input name="pbreed" placeholder="Raça" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          </div>
          <input name="page" placeholder="Idade Aproximada" className="w-full p-6 bg-gray-50 rounded-[28px] outline-none font-bold shadow-inner" />
          <textarea name="pobs" placeholder="Observações importantes (Saúde, Temperamento...)" className="w-full p-8 bg-gray-50 rounded-[44px] h-32 outline-none font-medium shadow-inner resize-none" />
          <Button type="submit" variant="primary" className="w-full py-8 text-sm italic shadow-2xl">Cadastrar Amiguinho</Button>
        </form>
      </div>
    );

    if (subView === 'plans') return (
      <div className="p-10 text-center space-y-10 min-h-screen flex flex-col justify-center animate-in zoom-in bg-white">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Crown className="w-24 h-24 text-orange-500 drop-shadow-2xl" />
        </div>
        <div className="space-y-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Planos Amethylast Elite</h2>
          <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Aumente sua visibilidade e ajude mais animais</p>
        </div>
        <div className="grid grid-cols-1 gap-6 max-w-sm mx-auto w-full">
          {[{id:'PRO', price: 'R$ 49,90', name: 'Plano Profissional'}].map(p => (
            <button 
              key={p.id} 
              onClick={() => { setSelectedPlan({id: p.id, priceValue: 49.9, price: p.price}); setSubView('checkout_pix'); }} 
              className="p-10 bg-gradient-to-br from-orange-50 to-white rounded-[56px] border-4 border-orange-500 text-orange-900 font-black italic text-2xl shadow-xl hover:scale-105 transition-transform"
            >
              {p.name} <br/> <span className="text-orange-500">{p.price}</span>
            </button>
          ))}
        </div>
        <Button variant="ghost" onClick={handleBack}>Decidir depois</Button>
      </div>
    );

    if (subView === 'checkout_pix') return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen text-center animate-in slide-in-from-right bg-white">
        <button onClick={() => setSubView('plans')} className="absolute top-10 left-8 p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button>
        <div className="bg-white p-10 rounded-[56px] shadow-2xl border-4 border-gray-100 space-y-8 w-full max-w-sm">
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Pagamento Seguro PIX</h3>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Amethylast Cyber Payments</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-[40px] border-4 border-white shadow-inner">
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(generatePixPayload(selectedPlan.priceValue))}`} className="w-full rounded-[32px]" />
          </div>
          <div className="p-6 bg-blue-50 text-blue-600 rounded-[28px] font-black italic text-xl border-2 border-blue-100">{selectedPlan.price}</div>
          <div className="space-y-4">
            <Button variant="primary" className="w-full py-7" onClick={() => {
              const updated = { ...user!, isPremium: true };
              db.updateUser(updated); setUser(updated); setSubView('payment_success');
            }}>JÁ REALIZEI O PAGAMENTO</Button>
            <p className="text-[9px] font-black text-gray-400 uppercase leading-relaxed">A liberação ocorre em até 5 minutos após a compensação bancária.</p>
          </div>
        </div>
      </div>
    );

    if (subView === 'payment_success') return (
      <div className="p-12 text-center flex flex-col items-center justify-center min-h-screen animate-in zoom-in bg-white">
        <div className="w-32 h-32 bg-green-500 text-white rounded-full flex items-center justify-center shadow-2xl mb-8 animate-bounce"><CheckCircle className="w-20 h-20" /></div>
        <h2 className="text-5xl font-black italic mb-2 uppercase tracking-tighter">Premium Ativado!</h2>
        <p className="text-gray-500 font-bold mb-10">Sua conta foi elevada ao status Elite Amethylast.</p>
        <Button variant="primary" className="w-full max-w-sm py-7" onClick={handleBack}>Acessar Recursos Elite</Button>
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
              <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em]">Sobre o Local</h3>
              <p className="text-gray-600 text-lg leading-relaxed font-medium">{selectedItem.details?.bio}</p>
              <div className="flex items-center gap-2 text-gray-400 mt-2">
                 <MapPin className="w-4 h-4" />
                 <span className="text-sm font-bold uppercase tracking-widest">{selectedItem.address?.fullAddress || selectedItem.city}</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-6">
              <div className="p-8 bg-gray-100 rounded-[44px] flex flex-col items-center gap-4 text-center">
                 <Clock className="w-10 h-10 text-blue-600" />
                 <p className="text-[14px] font-black text-gray-900 uppercase">{selectedItem.details?.openingHours || 'Consulte-nos'}</p>
              </div>
              <div className="p-8 bg-gray-100 rounded-[44px] flex flex-col items-center gap-4 text-center">
                 <ShoppingBag className="w-10 h-10 text-orange-500" />
                 <p className="text-[14px] font-black text-gray-900 uppercase">Ver Catálogo</p>
              </div>
           </div>
           
           {/* Catalog items display if available */}
           {selectedItem.catalog && selectedItem.catalog.length > 0 && (
             <div className="space-y-6">
                <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-[0.4em]">Destaques do Catálogo</h3>
                <div className="grid grid-cols-1 gap-4">
                   {selectedItem.catalog.map((cat: any) => (
                      <div key={cat.id} className="bg-white p-5 rounded-[44px] border-2 border-gray-50 flex items-center gap-4 shadow-sm">
                         <img src={cat.photo || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7'} className="w-20 h-20 rounded-[28px] object-cover" />
                         <div className="flex-1">
                            <h4 className="font-black italic text-gray-800">{cat.name}</h4>
                            <span className="text-blue-600 font-black text-xs uppercase">{cat.price}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           <Button 
            variant="primary" 
            className="w-full py-8 text-sm italic shadow-2xl" 
            onClick={() => window.open(`https://wa.me/5511999999999`)}
           >
             Falar com {selectedItem.name}
           </Button>
        </div>
      </div>
    );

    if (currentTab === 'profile') {
      if (user.role !== UserRole.USER) return renderBusinessPanel();
      return (
        <div className="p-8 pb-32 space-y-10 animate-in fade-in">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-[40px] border-4 border-white shadow-2xl overflow-hidden bg-gray-100">
               <img src={user.avatar} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-3xl font-black italic tracking-tighter">{user.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-full">{user.role === UserRole.USER ? 'Tutor de Pets' : user.role}</span>
                 {user.isPremium && <Crown className="w-4 h-4 text-orange-500 fill-current" />}
              </div>
            </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-black text-gray-400 uppercase tracking-widest italic">Meus Companheiros</h3>
                <button onClick={() => setSubView('add_pet')} className="p-4 bg-blue-50 text-blue-600 rounded-2xl active:scale-90 hover:bg-blue-600 hover:text-white transition-all">
                  <PlusCircle className="w-6 h-6" />
                </button>
             </div>
             {(!user.pets || user.pets.length === 0) ? (
               <div className="p-12 border-4 border-dashed border-gray-100 rounded-[56px] text-center space-y-4 opacity-50">
                  <PawPrint className="w-12 h-12 text-gray-200 mx-auto" />
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Nenhum pet cadastrado ainda</p>
               </div>
             ) : (
               <div className="grid grid-cols-2 gap-4">
                  {(user.pets || []).map(pet => (
                    <div key={pet.id} className="bg-white p-5 rounded-[44px] shadow-sm border border-gray-100 flex flex-col items-center hover:shadow-xl transition-all group">
                      <div className="w-24 h-24 rounded-[32px] overflow-hidden mb-3 border-4 border-gray-50 shadow-md">
                        <img src={pet.photo || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${pet.name}`} className="w-full h-full object-cover" />
                      </div>
                      <span className="font-black italic text-sm text-gray-800">{pet.name}</span>
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-1">{pet.breed || pet.type}</span>
                    </div>
                  ))}
               </div>
             )}
          </div>

          <div className="pt-10 border-t border-gray-100">
             <Button variant="danger" className="w-full py-6 rounded-[28px] opacity-80 hover:opacity-100" onClick={() => { db.logout(); setUser(null); }}>
               <LogOut className="w-5 h-5" /> Encerrar Sessão
             </Button>
          </div>
        </div>
      );
    }

    return renderHome();
  };

  const renderManageCatalog = () => (
    <div className="p-8 space-y-8 animate-in slide-in-from-right bg-white min-h-screen pb-32">
      <div className="flex items-center justify-between">
        <button onClick={() => setSubView(null)} className="p-5 bg-gray-50 rounded-3xl"><ArrowLeft className="w-8 h-8" /></button>
        <div className="text-center">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Meu Catálogo</h2>
          <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Produtos e Serviços</p>
        </div>
        <button onClick={() => setSubView('add_catalog_item')} className="p-5 bg-blue-600 text-white rounded-3xl active:scale-90 shadow-lg"><Plus className="w-8 h-8" /></button>
      </div>
      
      {(!user?.catalog || user.catalog.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-40 opacity-20 grayscale">
          <ShoppingBag className="w-24 h-24 mb-4" />
          <p className="text-[12px] font-black uppercase tracking-[0.4em]">Catálogo Vazio</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(user?.catalog || []).map(item => (
            <div key={item.id} className="bg-gray-50 p-6 rounded-[44px] flex items-center gap-6 relative group border-2 border-transparent hover:border-orange-100 transition-all">
              <div className="w-24 h-24 rounded-[28px] overflow-hidden shadow-md border-4 border-white">
                <img src={item.photo || 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-black italic text-gray-800 text-lg">{item.name}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[12px] text-blue-600 font-black uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-lg">{item.price}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  const updated = { ...user!, catalog: user!.catalog?.filter(i => i.id !== item.id) };
                  db.updateUser(updated); setUser(updated);
                }} 
                className="p-4 bg-red-50 text-red-500 rounded-2xl active:scale-90 hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (!user) return <AuthView onAuth={setUser} />;

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col overflow-x-hidden">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl relative flex flex-col min-h-screen overflow-hidden">
        {!subView && (
          <header className="fixed top-0 left-0 right-0 max-w-4xl mx-auto h-20 bg-white/95 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-10 z-50">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentTab('home')}>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <PawPrint className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter leading-none">OnliPet</h1>
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Amethylast Cyber</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-4 bg-gray-50 rounded-2xl relative active:scale-90"><Bell className="w-6 h-6 text-gray-400" /><span className="absolute top-4 right-4 w-3 h-3 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span></button>
            </div>
          </header>
        )}
        <main className={`flex-1 ${!subView ? 'mt-20' : ''} overflow-y-auto hide-scrollbar`}>
          {renderContent()}
        </main>
        {!subView && (
          <nav className="fixed bottom-0 left-0 right-0 max-w-4xl mx-auto h-24 bg-white/95 backdrop-blur-2xl border-t border-gray-50 flex items-center justify-around z-50 shadow-2xl">
            {[
              { id: 'home', icon: Home, label: 'Início' },
              { id: 'profile', icon: UserIcon, label: user.role === UserRole.USER ? 'Meu Pet' : 'Meu App' },
            ].map(item => (
              <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`flex flex-col items-center gap-1 transition-all w-24 py-2 rounded-2xl ${currentTab === item.id ? 'text-blue-600 bg-blue-50/50' : 'text-gray-300'}`}>
                <item.icon className={`w-7 h-7 ${currentTab === item.id ? 'stroke-[3px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
