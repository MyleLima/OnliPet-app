
import { UserRole, User } from './types';

export const COLORS = {
  blue: '#2563eb', 
  orange: '#f97316', 
  gradient: 'linear-gradient(135deg, #2563eb 0%, #f97316 100%)',
  green: '#10b981',
  purple: '#8b5cf6',
  red: '#ef4444'
};

export const ANIMAL_MARKERS = [
  { role: UserRole.NGO, emoji: '🐶', color: '#f97316' },
  { role: UserRole.VET, emoji: '🐱', color: '#2563eb' },
  { role: UserRole.PETSHOP, emoji: '🐼', color: '#f97316' },
  { role: UserRole.FEED_STORE, emoji: '🐨', color: '#2563eb' }
];

export const MOCK_PROVIDERS: User[] = [
  {
    id: 'ngo1',
    name: 'Patas Amigas',
    email: 'contato@patasamigas.org',
    role: UserRole.NGO,
    avatar: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
    city: 'São Paulo',
    details: {
      bio: 'Focados em resgate e reabilitação de cães idosos em SP.',
      curiosity: 'Cachorros sonham assim como os humanos!',
      openingHours: '08:00 - 18:00',
      actingType: 'Resgate/Adoção'
    }
  },
  {
    id: 'vet1',
    name: 'Clinica VetCare 24h',
    role: UserRole.VET,
    email: 'emergencia@vetcare.com',
    avatar: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=300&q=80',
    city: 'Curitiba',
    details: {
      bio: 'Especialistas em emergências críticas e cirurgias complexas.',
      specialty: 'Emergência 24h',
      openingHours: '24 Horas'
    }
  },
  {
    id: 'ps1',
    name: 'Royal Pet SPA',
    role: UserRole.PETSHOP,
    email: 'royal@pet.com',
    avatar: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    city: 'Rio de Janeiro',
    details: {
      bio: 'O melhor tratamento estético para seu pet com produtos orgânicos.',
      openingHours: '09:00 - 19:00'
    }
  },
  {
    id: 'cr1',
    name: 'Ração Forte ABC',
    role: UserRole.FEED_STORE,
    email: 'vendas@racaoforte.com',
    avatar: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
    city: 'Santo André',
    details: {
      bio: 'Tudo em nutrição animal com entrega grátis em todo o ABC.',
      openingHours: '08:00 - 20:00'
    }
  }
];
