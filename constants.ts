
import { UserRole, NGO, RescueStatus } from './types';

export const COLORS = {
  blue: '#2563eb', // text-blue-600
  orange: '#f97316', // text-orange-500
};

export const MOCK_NGOS: NGO[] = [
  {
    id: 'ngo1',
    name: 'Patas Amigas',
    email: 'contato@patasamigas.org',
    role: UserRole.NGO,
    distance: '2.5 km',
    avatar: 'https://picsum.photos/seed/ngo1/300/200',
    tags: ['Resgate', 'Adoção', 'Castração'],
    location: { lat: -23.5505, lng: -46.6333 },
    details: {
      bio: 'Dedicados ao resgate de animais de rua em São Paulo há 10 anos.',
      curiosity: 'Cachorros podem entender até 250 palavras!',
      openingHours: '08:00 - 18:00',
      responsibleName: 'Maria Silva'
    }
  },
  {
    id: 'ngo2',
    name: 'Gatinhos do Bem',
    email: 'ajuda@gatinhos.org',
    role: UserRole.NGO,
    distance: '5.1 km',
    avatar: 'https://picsum.photos/seed/ngo2/300/200',
    tags: ['Adoção', 'Doação'],
    location: { lat: -23.5555, lng: -46.6433 },
    details: {
      bio: 'Especializados em cuidados felinos e adoção responsável.',
      curiosity: 'O nariz de cada gato tem um padrão único, como uma digital humana.',
      openingHours: '09:00 - 17:00',
      responsibleName: 'João Pereira'
    }
  }
];

export const MOCK_VETS = [
  {
    id: 'vet1',
    name: 'Dr. Ricardo Pet',
    role: UserRole.VET,
    avatar: 'https://picsum.photos/seed/vet1/150/150',
    details: {
      bio: 'Veterinário 24h especializado em cirurgias.',
      services: ['Clínica', 'Emergência', 'Cirurgia'],
      openingHours: '24h'
    }
  }
];
