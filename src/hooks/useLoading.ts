import { useState, useCallback } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

interface UseLoadingReturn {
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  startLoading: (key: string) => void;
  stopLoading: (key: string) => void;
  isAnyLoading: () => boolean;
  loadingStates: LoadingState;
}

/**
 * Hook personnalisé pour la gestion des états de chargement
 * Permet de gérer plusieurs états de chargement simultanément
 */
export const useLoading = (): UseLoadingReturn => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const isLoading = useCallback((key: string = 'default'): boolean => {
    return loadingStates[key] || false;
  }, [loadingStates]);

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  }, []);

  const startLoading = useCallback((key: string) => {
    setLoading(key, true);
  }, [setLoading]);

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false);
  }, [setLoading]);

  const isAnyLoading = useCallback((): boolean => {
    return Object.values(loadingStates).some(Boolean);
  }, [loadingStates]);

  return {
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    isAnyLoading,
    loadingStates
  };
};
