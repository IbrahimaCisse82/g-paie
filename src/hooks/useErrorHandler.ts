import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  hasError: boolean;
  error: string | null;
  isLoading: boolean;
}

interface UseErrorHandlerReturn {
  error: ErrorState;
  handleError: (error: unknown) => void;
  clearError: () => void;
  executeWithErrorHandling: <T>(fn: () => Promise<T>) => Promise<T | null>;
  setLoading: (loading: boolean) => void;
}

/**
 * Hook personnalisé pour la gestion des erreurs
 * Centralise la gestion des erreurs avec toast automatique
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    error: null,
    isLoading: false
  });

  const handleError = useCallback((error: unknown) => {
    console.error('Error caught by useErrorHandler:', error);
    
    let errorMessage = 'Une erreur inattendue est survenue';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    setError({
      hasError: true,
      error: errorMessage,
      isLoading: false
    });

    // Afficher le toast d'erreur
    toast.error(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setError({
      hasError: false,
      error: null,
      isLoading: false
    });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setError(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    fn: () => Promise<T>
  ): Promise<T | null> => {
    try {
      setLoading(true);
      clearError();
      const result = await fn();
      return result;
    } catch (error) {
      handleError(error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [handleError, clearError, setLoading]);

  return {
    error,
    handleError,
    clearError,
    executeWithErrorHandling,
    setLoading
  };
};
