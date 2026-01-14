
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

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  details?: {
    bio?: string;
    services?: string[];
    openingHours?: string;
    responsibleName?: string;
    curiosity?: string;
  };
}

export interface NGO extends User {
  role: UserRole.NGO;
  distance?: string;
  tags: string[];
}

export interface RescueCall {
  id: string;
  userId: string;
  userName: string;
  description: string;
  photo: string;
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
  providerId: string;
  providerName: string;
  date: string;
  time: string;
  service: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}
