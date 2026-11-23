'use client';
import { useEffect } from 'react';
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch((error) => console.error('MHA service worker:', error));
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);
  return null;
}