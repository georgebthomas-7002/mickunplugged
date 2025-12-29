// Auth Callback Page
// Handles the redirect from magic link email
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import './AuthCallback.css';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Verifying your email...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the code from URL params (Supabase PKCE flow)
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for error in URL
        if (errorParam) {
          setError(errorDescription || 'Authentication failed');
          return;
        }

        if (!code) {
          // No code - might be hash-based auth (older flow)
          // Let Supabase handle it via onAuthStateChange
          const { data: { session } } = await supabase.auth.getSession();

          if (!session) {
            setError('No authentication code found. Please try signing in again.');
            return;
          }
        } else {
          // Exchange code for session
          setStatus('Completing sign in...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Auth exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }
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
