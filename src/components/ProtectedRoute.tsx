// Protected Route Component
// Redirects unauthenticated users to login page
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean; // Require complete profile (first/last name)
}

export function ProtectedRoute({
  children,
  requireProfile = false,
}: ProtectedRouteProps) {
  const { user, profile, loading, isConfigured } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-pulse text-gold text-xl mb-2">Loading...</div>
          <div className="text-gray-500 text-sm">Checking authentication</div>
        </div>
      </div>
    );
  }

  // If Supabase isn't configured, show warning (dev mode)
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="card p-8 max-w-md text-center">
          <h1 className="text-xl font-bold text-gold mb-4">
            Configuration Required
          </h1>
          <p className="text-gray-400 mb-4">
            Supabase environment variables are not configured. Please add
            VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local
            file.
          </p>
          <a href="/" className="btn btn-outline">
            Return Home
          </a>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Store the intended destination for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optionally require complete profile
  if (requireProfile && profile && (!profile.first_name || !profile.last_name)) {
    return <Navigate to="/complete-profile" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
