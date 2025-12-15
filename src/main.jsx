import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { LanguageProvider } from './context/LanguageContext.jsx';
import 'leaflet/dist/leaflet.css';


import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="643597547472-1q257uje3e9uhcnohok6kvrq6q9kenac.apps.googleusercontent.com">
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
