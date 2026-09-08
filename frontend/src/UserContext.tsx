import { createContext, useContext, useState, type ReactNode } from 'react';

export interface UserInfo {
  name: string;
  email: string;
  plan: 'free' | 'quarterly' | 'annual';
  trimestre: string | null;
  token: string;
}

interface UserCtx {
  user: UserInfo | null;
  login: (u: UserInfo) => void;
  logout: () => void;
}

const UserContext = createContext<UserCtx>({ user: null, login: () => {}, logout: () => {} });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(() => {
    try {
      const raw = localStorage.getItem('madrasti_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  function login(u: UserInfo) {
    setUser(u);
    localStorage.setItem('madrasti_user', JSON.stringify(u));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem('madrasti_user');
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
