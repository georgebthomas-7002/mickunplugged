import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import StartPage from '@/pages/StartPage';
import AssessmentPage from '@/pages/AssessmentPage';
import ResultsPage from '@/pages/ResultsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import TeamDashboard from '@/pages/TeamDashboard';
import InviteAccept from '@/pages/InviteAccept';
import UpgradePage from '@/pages/UpgradePage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

function App() {
  return (
    <Layout>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/start" element={<StartPage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/assessment/:id" element={<AssessmentPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />

        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/team/:orgId" element={<ProtectedRoute><TeamDashboard /></ProtectedRoute>} />
        <Route path="/upgrade" element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />

        {/* Invitation acceptance (public - handles auth internally) */}
        <Route path="/invite/:token" element={<InviteAccept />} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
