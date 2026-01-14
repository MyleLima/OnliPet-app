
import { User, UserRole, Pet } from './types';

const USERS_KEY = 'onlipet_db_users';
const CURRENT_USER_KEY = 'onlipet_db_session';

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: (user: User & { password?: string }): { success: boolean; message: string; user?: User } => {
    const users = db.getUsers();
    if (users.find(u => u.email === user.email)) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }
    const newUser = { ...user, id: Math.random().toString(36).substr(2, 9), pets: [] };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { success: true, message: 'Cadastro realizado!', user: newUser };
  },

  login: (email: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = db.getUsers() as (User & { password?: string })[];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
      return { success: true, message: 'Login realizado!', user: userWithoutPassword };
    }
    return { success: false, message: 'E-mail ou senha incorretos.' };
  },

  updateUser: (updatedUser: User): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...updatedUser };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
    }
  },

  addPetToUser: (userId: string, pet: Pet): void => {
    const users = db.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      const user = users[index];
      user.pets = [...(user.pets || []), { ...pet, id: Math.random().toString(36).substr(2, 5) }];
      db.updateUser(user);
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  },

  logout: (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
