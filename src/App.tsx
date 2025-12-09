import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import AssessmentPage from '@/pages/AssessmentPage';
import ResultsPage from '@/pages/ResultsPage';
import NotFoundPage from '@/pages/NotFoundPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment/:id" element={<AssessmentPage />} />
        <Route path="/results/:id" element={<ResultsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
