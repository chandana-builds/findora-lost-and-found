import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { db } from '../services/db';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, pass: string) => Promise<UserProfile>;
  signUp: (email: string, pass: string, fullName: string, role?: 'user' | 'admin') => Promise<UserProfile>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  switchDemoUser: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await db.getCurrentSessionUser();
        // Default to Alex if nobody is logged in so the user immediately experiences authenticated features
        if (!currentUser) {
          const alex = await db.signIn('alex.rivera@campus.edu', 'password123');
          setUser(alex);
        } else {
          setUser(currentUser);
        }
      } catch (e) {
        console.warn('Initial auth load error', e);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const signIn = async (email: string, pass: string) => {
    const signedIn = await db.signIn(email, pass);
    setUser(signedIn);
    return signedIn;
  };

  const signUp = async (email: string, pass: string, fullName: string, role?: 'user' | 'admin') => {
    const newUser = await db.signUp(email, pass, fullName, role);
    setUser(newUser);
    return newUser;
  };

  const signOut = async () => {
    await db.signOut();
    setUser(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('Not authenticated');
    const updated = await db.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const switchDemoUser = async (email: string) => {
    setLoading(true);
    try {
      const switched = await db.signIn(email, 'password123');
      setUser(switched);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin: user?.role === 'admin',
        signIn,
        signUp,
        signOut,
        updateProfile,
        switchDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
