import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AssessmentProvider } from '@/context';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AssessmentProvider>
        <App />
      </AssessmentProvider>
    </BrowserRouter>
  </StrictMode>
);
