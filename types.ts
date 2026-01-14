
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
  country?: string;
  city?: string;
  location?: {
    lat: number;
    lng: number;
  };
  pets?: Pet[];
  details?: {
    bio?: string;
    services?: string[];
    openingHours?: string;
    responsibleName?: string;
    curiosity?: string;
    specialty?: string;
    region?: string;
    cnpj?: string;
    actingType?: string;
    adoptionPets?: Pet[]; 
  };
}

export interface VolunteerApplication {
  id: string;
  ngoId: string;
  userId: string;
  userName: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
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

export interface Appointment {
  id: string;
  userId: string;
  petId: string;
  petName: string;
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  service: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
