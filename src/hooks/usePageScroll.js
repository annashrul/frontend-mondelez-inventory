import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageMemory } from '@/lib/pageMemory';

export default function usePageScroll() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const key = `scroll:${pathname}`;
    const position = pageMemory.read(key, { x: 0, y: 0 });
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ left: position.x, top: position.y, behavior: 'instant' });
    const remember = () => pageMemory.write(key, { x: window.scrollX, y: window.scrollY });
    window.addEventListener('scroll', remember, { passive: true });
    return () => {
      window.removeEventListener('scroll', remember);
      window.history.scrollRestoration = previous;
    };
  }, [pathname]);
}
