import React from 'react';
import ReactDOM from 'react-dom/client';
import LandingPage from './components/LandingPage';
import '../../src/index.css'; // Usa o CSS do sistema principal
import './styles/landing.css'; // Estilos customizados da landing page

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LandingPage />
  </React.StrictMode>,
);
