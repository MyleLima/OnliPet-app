
export enum UserRole {
  USER = 'USER',
  NGO = 'NGO',
  VET = 'VET',
  PETSHOP = 'PETSHOP',
  FEED_STORE = 'FEED_STORE'
}

export enum RescueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Pet {
  id: string;
  name: string;
  breed: string;
  photo: string;
  type: string;
  age: string;
  observations: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  city?: string;
  isPremium?: boolean;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode?: string;
    fullAddress: string;
  };
  location?: {
    lat: number;
    lng: number;
  };
  pets?: Pet[];
  plan?: {
    type: 'BASIC' | 'PRO' | 'ELITE';
    name: string;
    price: number;
    expiresAt: string;
    paymentId?: string;
    transactionDate?: string;
  };
  details?: {
    bio?: string;
    services?: string[];
    openingHours?: string;
    responsibleName?: string;
    curiosity?: string;
    specialty?: string;
    cnpj?: string;
    // Fix: Added missing actingType property to details interface
    actingType?: string;
  };
}

export interface RescueCall {
  id: string;
  userId: string;
  userName: string;
  description: string;
  photo?: string;
  status: RescueStatus;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: string;
}
