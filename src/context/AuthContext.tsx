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
  sendOtpCode: (email: string) => Promise<{ error: Error | null }>;
  verifyOtpCode: (email: string, token: string) => Promise<{ error: Error | null; session: Session | null }>;
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

    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // Profile might not exist yet for new users - that's ok
        console.log('Profile fetch result:', error.code === 'PGRST116' ? 'No profile yet' : error.message);
        return;
      }

      console.log('Profile loaded:', data?.email || data?.first_name);
      setProfile(data);
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
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
      console.log('Auth state change:', event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);

      // Set loading false FIRST, then fetch profile in background
      // This prevents the UI from getting stuck
      setLoading(false);

      if (event === 'SIGNED_IN' && session?.user) {
        // Fetch profile in background - don't block the UI
        fetchProfile(session.user.id).catch((err) => {
          console.error('Error fetching profile after sign in:', err);
        });
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured, fetchProfile]);

  // Send OTP code to email (no magic link, just a code)
  const sendOtpCode = useCallback(
    async (email: string): Promise<{ error: Error | null }> => {
      if (!isConfigured) {
        return { error: new Error('Supabase is not configured') };
      }

      console.log('Sending OTP to:', email);

      // Call signInWithOtp WITHOUT emailRedirectTo to get OTP code instead of magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // NO emailRedirectTo - this is key for OTP mode
        },
      });

      if (error) {
        console.error('Error sending OTP:', error);
        return { error: new Error(error.message) };
      }

      console.log('OTP sent successfully');
      return { error: null };
    },
    [isConfigured]
  );

  // Verify OTP code - tries multiple token types for compatibility
  const verifyOtpCode = useCallback(
    async (email: string, token: string): Promise<{ error: Error | null; session: Session | null }> => {
      if (!isConfigured) {
        return { error: new Error('Supabase is not configured'), session: null };
      }

      console.log('Verifying OTP for:', email, 'token length:', token.length);

      // Clean the token - remove any spaces
      const cleanToken = token.replace(/\s/g, '');

      // Try verifying with different types - Supabase can be inconsistent
      const typesToTry: Array<'email' | 'magiclink' | 'signup'> = ['email', 'magiclink', 'signup'];

      for (const type of typesToTry) {
        console.log('Trying verification with type:', type);

        const { data, error } = await supabase.auth.verifyOtp({
          email,
          token: cleanToken,
          type,
        });

        if (!error && data.session) {
          console.log('Verification successful with type:', type);
          return { error: null, session: data.session };
        }

        if (error) {
          console.log('Verification failed with type:', type, error.message);
          // If it's not a "wrong type" error, the token itself is invalid
          if (!error.message.toLowerCase().includes('type')) {
            // This is a real error (expired, invalid, etc.)
            return {
              error: new Error(
                error.message.includes('expired') || error.message.includes('invalid')
                  ? 'This code has expired or is invalid. Please request a new one.'
                  : error.message
              ),
              session: null
            };
          }
        }
      }

      // If all types failed
      return {
        error: new Error('Verification failed. Please request a new code and try again.'),
        session: null
      };
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

    // Clear any pending data
    localStorage.removeItem('pending_invite_token');
    localStorage.removeItem('pending_profile_data');
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
    sendOtpCode,
    verifyOtpCode,
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
