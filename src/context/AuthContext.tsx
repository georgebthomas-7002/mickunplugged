// Authentication Context using Supabase Auth
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Profile } from '@/types/database';

// ============================================
// TYPES
// ============================================

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    if (!isConfigured) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return;
    }

    setProfile(data);
  }, [isConfigured]);

  // Refresh profile data
  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_IN' && session?.user) {
        await fetchProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured, fetchProfile]);

  // Sign in with magic link (passwordless)
  const signInWithMagicLink = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      if (!isConfigured) {
        return { error: new Error('Supabase is not configured') };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      return { error: error ? new Error(error.message) : null };
    },
    [isConfigured]
  );

  // Sign in with OTP code (sends 6-digit code instead of magic link)
  // This is more reliable as email scanners can't "use up" the code
  const signInWithOtp = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      if (!isConfigured) {
        return { error: new Error('Supabase is not configured') };
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          // Don't include emailRedirectTo - this tells Supabase to send OTP code
          shouldCreateUser: true,
        },
      });

      return { error: error ? new Error(error.message) : null };
    },
    [isConfigured]
  );

  // Verify OTP code
  const verifyOtp = useCallback(
    async (email: string, token: string): Promise<{ error: Error | null }> => {
      if (!isConfigured) {
        return { error: new Error('Supabase is not configured') };
      }

      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      return { error: error ? new Error(error.message) : null };
    },
    [isConfigured]
  );

  // Sign out
  const signOut = useCallback(async () => {
    if (!isConfigured) return;

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }

    // Clear any pending invite tokens
    localStorage.removeItem('pending_invite_token');
    localStorage.removeItem('assessment_org_id');
    localStorage.removeItem('assessment_member_type');
  }, [isConfigured]);

  // Update user profile
  const updateProfile = useCallback(
    async (updates: Partial<Profile>): Promise<{ error: Error | null }> => {
      if (!isConfigured || !user) {
        return { error: new Error('Not authenticated') };
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: updates.first_name,
          last_name: updates.last_name,
          company: updates.company,
          role: updates.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refresh profile after update
      await fetchProfile(user.id);
      return { error: null };
    },
    [isConfigured, user, fetchProfile]
  );

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    isConfigured,
    signInWithMagicLink,
    signInWithOtp,
    verifyOtp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
