import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Fontes locais (evita CORS e timing issues no html2canvas)
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'

import './index.css'
import './theme/avamax.css'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { TenantProvider } from './contexts/TenantContext.tsx'
import { ErrorBoundary } from './components/ErrorBoundary.tsx'

// Log da versão do app no console
declare const __APP_VERSION__: string;
const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
console.log(`[AvaMax] Versão: ${APP_VERSION}`);

// Sistema de versionamento para forçar atualização
const STORED_VERSION_KEY = 'avamax_app_version';
const storedVersion = localStorage.getItem(STORED_VERSION_KEY);

if (storedVersion && storedVersion !== APP_VERSION) {
  // Versão mudou - limpar tudo e recarregar
  console.log(`[AvaMax] Atualizando de ${storedVersion} para ${APP_VERSION}`);
  localStorage.setItem(STORED_VERSION_KEY, APP_VERSION);
  
  // Limpar todos os caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => caches.delete(name));
    });
  }
  
  // Desregistrar TODOS os Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
  
  window.location.reload();
} else if (!storedVersion) {
  localStorage.setItem(STORED_VERSION_KEY, APP_VERSION);
}

// Limpeza única de Service Workers antigos (para usuários que nunca atualizaram)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(success => {
        if (success) console.log('[Cleanup] Service Worker removido');
      });
    });
  });
}

// Limpar caches antigos
if ('caches' in window) {
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName).then(success => {
        if (success) console.log('[Cleanup] Cache removido:', cacheName);
      });
    });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <TenantProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </TenantProvider>
    </ErrorBoundary>
  </StrictMode>,
)
