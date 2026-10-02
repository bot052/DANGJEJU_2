import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';

function installPawInteractions() {
  if (typeof window === 'undefined') return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
  let lastTrailAt = 0;
  let trailSide = 1;
  let lastPointerX: number | null = null;
  let lastPointerY: number | null = null;

  const spawn = (x: number, y: number, kind: 'trail' | 'click' | 'touch', angle = 0) => {
    const paw = document.createElement('span');
    paw.className = `dangjeju-paw-fx dangjeju-paw-fx--${kind}`;
    paw.setAttribute('aria-hidden', 'true');
    paw.style.left = `${x}px`;
    paw.style.top = `${y}px`;
    if (kind === 'trail') {
      trailSide *= -1;
      paw.style.setProperty('--paw-x', `${trailSide * 7}px`);
      paw.style.setProperty('--paw-angle', `${angle + (trailSide * 9)}deg`);
      paw.innerHTML = '<span class="dangjeju-paw-fx__print dangjeju-paw-fx__print--trail">🐾</span>';
    } else {
      paw.innerHTML = '<span class="dangjeju-paw-fx__print">🐾</span><span class="dangjeju-paw-fx__heart">♥</span><span class="dangjeju-paw-fx__sparkle">✦</span>';
    }
    document.body.appendChild(paw);
    paw.addEventListener('animationend', () => paw.remove(), { once: true });
    window.setTimeout(() => paw.remove(), 900);
  };

  if (finePointer) {
    window.addEventListener('pointermove', (event) => {
      const now = performance.now();
      const x = event.clientX;
      const y = event.clientY;

      if (lastPointerX === null || lastPointerY === null) {
        lastPointerX = x;
        lastPointerY = y;
        return;
      }

      const dx = x - lastPointerX;
      const dy = y - lastPointerY;
      const distance = Math.hypot(dx, dy);
      if (distance < 10) return;

      const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      const backOffset = 25;
      const radians = Math.atan2(dy, dx);
      const trailX = x - Math.cos(radians) * backOffset;
      const trailY = y - Math.sin(radians) * backOffset;

      lastPointerX = x;
      lastPointerY = y;
      if (now - lastTrailAt < 95) return;
      lastTrailAt = now;
      spawn(trailX, trailY, 'trail', angle);
    }, { passive: true });

    window.addEventListener('pointerdown', (event) => {
      if (event.pointerType !== 'mouse') return;
      spawn(event.clientX, event.clientY, 'click');
    }, { passive: true });
  }

  if (coarsePointer) {
    window.addEventListener('pointerdown', (event) => {
      if (event.pointerType === 'mouse') return;
      spawn(event.clientX, event.clientY, 'touch');
    }, { passive: true });
  }
}

installPawInteractions();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

