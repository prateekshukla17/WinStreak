import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
  signIn: async (email, password) => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting to sign in...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful:', data);
      set({ user: data.user, error: null });
    } catch (err: any) {
      console.error('Sign in error:', err);
      set({ error: err.message || 'Failed to sign in' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email, password) => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting to sign up...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }

      console.log('Sign up successful:', data);
      set({ user: data.user, error: null });
    } catch (err: any) {
      console.error('Sign up error:', err);
      set({ error: err.message || 'Failed to sign up' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Attempting to sign out...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }

      console.log('Sign out successful');
      set({ user: null, error: null });
    } catch (err: any) {
      console.error('Sign out error:', err);
      set({ error: err.message || 'Failed to sign out' });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
