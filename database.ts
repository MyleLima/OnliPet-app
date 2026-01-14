
import { User, Pet } from './types';

const USERS_KEY = 'onlipet_v3_users';
const SESSION_KEY = 'onlipet_v3_session';

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: (user: User & { password?: string }): { success: boolean; message: string; user?: User } => {
    const users = db.getUsers();
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'Este e-mail já está sendo usado.' };
    }
    const newUser = { 
      ...user, 
      id: Math.random().toString(36).substr(2, 9), 
      pets: [],
      isPremium: false 
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    return { success: true, message: 'Cadastro realizado!', user: newUser };
  },

  login: (email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = db.getUsers() as (User & { password?: string })[];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...cleanUser } = user;
      localStorage.setItem(SESSION_KEY, JSON.stringify(cleanUser));
      return { success: true, message: 'Bem-vindo!', user: cleanUser };
    }
    return { success: false, message: 'Credenciais inválidas.' };
  },

  updateUser: (updatedUser: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    }
  },

  addPetToUser: (userId: string, pet: Pet): void => {
    const user = db.getCurrentUser();
    if (user && user.id === userId) {
      const newPet = { ...pet, id: Math.random().toString(36).substr(2, 5) };
      user.pets = [...(user.pets || []), newPet];
      db.updateUser(user);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_KEY);
  }
};
