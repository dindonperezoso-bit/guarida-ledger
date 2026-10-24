import { useRef, useEffect } from 'react';

interface UseFormLoginHandlerOptions {
  onSubmit: () => Promise<void>;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

/**
 * Hook para manejar eventos de formulario de login con prevención de envíos duplicados
 * Basado en: Banco Oficial de la Guarida Virgilio
 * 
 * Características:
 * - Previene solicitudes duplicadas
 * - Maneja estado de carga en el botón submit
 * - Integración con función de autenticación
 * - Limpieza automática de event listeners
 */
export function useFormLoginHandler(
  formRef: React.RefObject<HTMLFormElement>,
  options: UseFormLoginHandlerOptions
) {
  const processingRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      console.error('[useFormLoginHandler] No se encontró el formulario.');
      return;
    }

    const handleSubmit = async (event: SubmitEvent) => {
      event.preventDefault();

      // Evitar solicitudes duplicadas sin ignorar el primer clic
      if (processingRef.current) {
        console.warn('[useFormLoginHandler] Login ya está en progreso.');
        return;
      }
      processingRef.current = true;

      const button = form.querySelector(
        'button[type="submit"], input[type="submit"]'
      ) as HTMLButtonElement | HTMLInputElement | null;

      try {
        if (button) {
          button.disabled = true;
          button.setAttribute('aria-busy', 'true');
        }

        console.info('[LOGIN] Primer intento recibido.');

        await options.onSubmit();

        if (options.onSuccess) {
          options.onSuccess();
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[LOGIN] Error al iniciar sesión:', err);
        
        if (options.onError) {
          options.onError(err);
        }
      } finally {
        processingRef.current = false;

        if (button) {
          button.disabled = false;
          button.removeAttribute('aria-busy');
        }
      }
    };

    form.addEventListener('submit', handleSubmit as EventListener);

    // Guardar cleanup function
    cleanupRef.current = () => {
      form.removeEventListener('submit', handleSubmit as EventListener);
    };

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [formRef, options]);

  return {
    isProcessing: () => processingRef.current,
  };
}
