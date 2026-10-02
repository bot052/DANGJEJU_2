import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';

function installTouchPawEffect() {
  if (typeof window === 'undefined' || !window.matchMedia('(pointer: coarse)').matches) return;

  const onPointerDown = (event: PointerEvent) => {
    if (event.pointerType === 'mouse') return;
    const paw = document.createElement('span');
    paw.className = 'dangjeju-touch-paw';
    paw.textContent = '🐾';
    paw.setAttribute('aria-hidden', 'true');
    paw.style.left = `${event.clientX}px`;
    paw.style.top = `${event.clientY}px`;
    document.body.appendChild(paw);
    paw.addEventListener('animationend', () => paw.remove(), { once: true });
  };

  window.addEventListener('pointerdown', onPointerDown, { passive: true });
}

installTouchPawEffect();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

