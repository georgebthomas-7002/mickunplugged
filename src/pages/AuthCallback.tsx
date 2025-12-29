// Auth Callback Page
// Handles the redirect from magic link email
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import './AuthCallback.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Verifying your email...');
  const hasRun = useRef(false);

  useEffect(() => {
    // Prevent double-execution in React StrictMode
    if (hasRun.current) return;
    hasRun.current = true;

    const handleCallback = async () => {
      try {
        // Check if Supabase is configured
        if (!isSupabaseConfigured()) {
          setError('Authentication is not configured. Please contact support.');
          return;
        }

        // Get the code from URL params (Supabase PKCE flow)
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for error in query params
        if (errorParam) {
          console.error('Auth error in URL:', errorParam, errorDescription);
          setError(errorDescription || 'Authentication failed');
          return;
        }

        // Also check for error in hash fragment (Supabase sometimes returns errors this way)
        const hash = window.location.hash;
        if (hash && hash.includes('error=')) {
          console.error('Auth error in hash:', hash);
          const hashParams = new URLSearchParams(hash.substring(1));
          const hashError = hashParams.get('error');
          const hashErrorDesc = hashParams.get('error_description');

          if (hashError) {
            let errorMessage = hashErrorDesc || hashError;
            // Make error message user-friendly
            if (errorMessage.includes('expired')) {
              errorMessage = 'This magic link has expired. Please request a new one.';
            } else if (errorMessage.includes('invalid')) {
              errorMessage = 'This magic link is invalid or has already been used. Please request a new one.';
            }
            setError(errorMessage);
            return;
          }
        }

        if (!code) {
          // No code - check if we already have a session
          const { data: { session } } = await supabase.auth.getSession();

          if (session) {
            // Already authenticated, redirect to dashboard
            navigate('/dashboard', { replace: true });
            return;
          }

          setError('No authentication code found. Please try signing in again.');
          return;
        }

        // Check if PKCE code verifier exists (required for same-browser auth)
        // Supabase stores this when signInWithOtp is called
        const hasCodeVerifier = Object.keys(localStorage).some(key =>
          key.includes('code-verifier') || key.includes('pkce')
        );

        if (!hasCodeVerifier) {
          console.warn('No PKCE code verifier found in localStorage');
          // Try anyway - the verifier might be stored differently
        }

        // Exchange code for session with timeout
        setStatus('Completing sign in...');

        // Create a promise that rejects after timeout
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('TIMEOUT'));
          }, 20000); // 20 second timeout
        });

        // Race between the exchange and timeout
        try {
          const result = await Promise.race([
            supabase.auth.exchangeCodeForSession(code),
            timeoutPromise
          ]);

          const { data, error: exchangeError } = result as Awaited<ReturnType<typeof supabase.auth.exchangeCodeForSession>>;

          if (exchangeError) {
            console.error('Auth exchange error:', exchangeError);

            // Provide user-friendly error messages
            const errorMsg = exchangeError.message.toLowerCase();
            if (errorMsg.includes('expired') || errorMsg.includes('invalid') || errorMsg.includes('code')) {
              setError('This magic link has expired or already been used. Please request a new one.');
            } else if (errorMsg.includes('verifier') || errorMsg.includes('pkce')) {
              setError('Please open the magic link in the same browser where you requested it.');
            } else {
              setError(`Authentication failed: ${exchangeError.message}`);
            }
            return;
          }

          // If exchange succeeded but no session, handle that case
          if (!data?.session) {
            setError('Failed to create session. Please try signing in again.');
            return;
          }

        } catch (timeoutError) {
          if (timeoutError instanceof Error && timeoutError.message === 'TIMEOUT') {
            console.error('Auth exchange timed out');
            setError(
              'Sign in timed out. This can happen if you opened the link in a different browser. ' +
              'Please request a new magic link and open it in the same browser.'
            );
            return;
          }
          throw timeoutError;
        }

        // Get the session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
          setError('Failed to establish session. Please try again.');
          return;
        }

        // Check for pending profile data (from signup)
        const pendingProfileData = localStorage.getItem('pending_profile_data');
        if (pendingProfileData) {
          setStatus('Setting up your profile...');
          try {
            const profileData = JSON.parse(pendingProfileData);

            // Update the profile with the pending data
            const { error: updateError } = await supabase
              .from('profiles')
              .update({
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                company: profileData.company || null,
                role: profileData.role || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', session.user.id);

            if (updateError) {
              console.error('Profile update error:', updateError);
              // Don't fail the auth flow, just log the error
            }

            // Clear the pending data
            localStorage.removeItem('pending_profile_data');
          } catch (e) {
            console.error('Error parsing pending profile data:', e);
            localStorage.removeItem('pending_profile_data');
          }
        }

        // Check for pending assessment results (from anonymous assessment)
        const pendingResults = localStorage.getItem('pending_assessment_results');
        if (pendingResults) {
          setStatus('Saving your assessment results...');
          try {
            const results = JSON.parse(pendingResults);

            // Save to assessments table
            const { error: assessmentError } = await supabase
              .from('assessments')
              .insert({
                user_id: session.user.id,
                scores: results.scores,
                leadership_family: results.leadership_family,
                leadership_type: results.leadership_type,
                responses: results.responses,
              });

            if (assessmentError) {
              console.error('Assessment save error:', assessmentError);
            }

            localStorage.removeItem('pending_assessment_results');
          } catch (e) {
            console.error('Error saving pending assessment:', e);
            localStorage.removeItem('pending_assessment_results');
          }
        }

        // Determine where to redirect
        setStatus('Redirecting...');

        // Check for pending invite token first
        const inviteToken = localStorage.getItem('pending_invite_token');
        if (inviteToken) {
          localStorage.removeItem('pending_invite_token');
          navigate(`/invite/${inviteToken}`, { replace: true });
          return;
        }

        // Default: go to dashboard
        navigate('/dashboard', { replace: true });

      } catch (e) {
        console.error('Auth callback error:', e);
        setError('An unexpected error occurred. Please try signing in again.');
      }
    };

    handleCallback();
  }, [navigate, searchParams]);

  if (error) {
    return (
      <div className="auth-callback-page">
        <div className="auth-callback-container">
          <div className="auth-callback-card error">
            <div className="callback-icon">❌</div>
            <h1>Sign In Failed</h1>
            <p className="callback-message">{error}</p>
            <div className="callback-actions">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-outline"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback-page">
      <div className="auth-callback-container">
        <div className="auth-callback-card">
          <div className="callback-spinner"></div>
          <h1>{status}</h1>
          <p className="callback-message">Please wait while we complete your sign in.</p>
        </div>
      </div>
    </div>
  );
}
