import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import { useCache } from './useCache';

interface DataFetcherOptions<T> {
  initialData?: T;
  enabled?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  refetchInterval?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  retry?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

interface DataFetcherReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  mutate: (newData: T) => void;
  isStale: boolean;
  lastFetch: Date | null;
}

/**
 * Hook personnalisé pour la récupération de données avec cache, retry et gestion d'erreurs
 * Combine les fonctionnalités de cache, gestion d'erreurs et états de chargement
 */
export const useDataFetcher = <T>(
  fetcher: () => Promise<T>,
  options: DataFetcherOptions<T> = {}
): DataFetcherReturn<T> => {
  const {
    initialData = null,
    enabled = true,
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes
    refetchInterval,
    onSuccess,
    onError,
    retry = true,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const { error, handleError, clearError, setLoading: setErrorLoading } = useErrorHandler();
  const cache = useCache<T>({ ttl: cacheTTL });
  
  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (forceRefetch = false) => {
    if (!enabled) return;

    // Vérifier le cache d'abord
    if (cacheKey && !forceRefetch) {
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setIsStale(false);
        return;
      }
    }

    // Annuler la requête précédente
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setErrorLoading(true);
    clearError();

    try {
      const result = await fetcher();
      
      setData(result);
      setLastFetch(new Date());
      setIsStale(false);
      retryCountRef.current = 0;
      
      // Mettre en cache si une clé est fournie
      if (cacheKey) {
        cache.set(cacheKey, result, cacheTTL);
      }
      
      onSuccess?.(result);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore les erreurs d'annulation
      }

      if (retry && retryCountRef.current < retryCount) {
        retryCountRef.current++;
        setTimeout(() => fetchData(forceRefetch), retryDelay * retryCountRef.current);
        return;
      }

      handleError(err);
      onError?.(err);
    } finally {
      setLoading(false);
      setErrorLoading(false);
    }
  }, [
    enabled,
    cacheKey,
    cache,
    cacheTTL,
    fetcher,
    onSuccess,
    onError,
    retry,
    retryCount,
    retryDelay,
    handleError,
    clearError,
    setErrorLoading
  ]);

  const refetch = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  const mutate = useCallback((newData: T) => {
    setData(newData);
    setLastFetch(new Date());
    setIsStale(false);
    
    // Mettre à jour le cache
    if (cacheKey) {
      cache.set(cacheKey, newData, cacheTTL);
    }
  }, [cacheKey, cache, cacheTTL]);

  // Fetch initial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch automatique
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        setIsStale(true);
        fetchData(true);
      }, refetchInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetchInterval, enabled, fetchData]);

  // Nettoyage à la désinstallation
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    loading,
    error: error.error,
    refetch,
    mutate,
    isStale,
    lastFetch
  };
};
