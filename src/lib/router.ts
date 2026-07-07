import { useState, useEffect, useCallback } from 'react';

export function useRoute() {
  const [path, setPath] = useState(() => {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  });

  useEffect(() => {
    const onChange = () => {
      setPath(window.location.hash.slice(1) || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);

  return { path, navigate };
}

export function navigate(to: string) {
  window.location.hash = to;
}
