import { useEffect, useRef } from 'react';

/**
 * Hook para mantener el input del lector de código de barras/QR SIEMPRE enfocado.
 * 
 * Estrategia indestructible:
 * 1. Auto-enfoque al montar el componente.
 * 2. Event listener global de 'click' y 'keydown' que redirige el foco al input si no se hizo clic en un botón interactivo.
 * 3. Event listener 'blur' en el propio input para reenfocar inmediatamente.
 * 4. Intervalo de seguridad que verifica el foco cada 1200ms.
 */
export const useAutoFocus = (enabled = true) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const focusInput = () => {
      if (inputRef.current) {
        // Solo reenfocar si el foco actual no es un botón o input explícito
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        const isInteractive = activeTag === 'button' || activeTag === 'a' || (activeTag === 'input' && document.activeElement !== inputRef.current);
        
        if (!isInteractive) {
          inputRef.current.focus({ preventScroll: true });
        }
      }
    };

    // 1. Enfoque inicial
    focusInput();
    const timer = setTimeout(focusInput, 100);

    // 2. Click global
    const handleDocumentClick = (e) => {
      const isButton = e.target.closest('button, a, select, textarea, [data-interactive="true"]');
      if (!isButton) {
        focusInput();
      }
    };

    // 3. Tecla presionada en cualquier parte
    const handleDocumentKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag !== 'input' && activeTag !== 'textarea') {
        focusInput();
      }
    };

    // 4. Intervalo de seguridad
    const interval = setInterval(() => {
      if (document.activeElement !== inputRef.current) {
        focusInput();
      }
    }, 1200);

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleDocumentKeyDown);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      document.removeEventListener('click', handleDocumentClick);
      document.removeEventListener('keydown', handleDocumentKeyDown);
    };
  }, [enabled]);

  return inputRef;
};
