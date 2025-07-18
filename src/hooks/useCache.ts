import { useState, useCallback, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxEntries?: number;
  onExpire?: (key: string) => void;
}

interface UseCacheReturn<T> {
  get: (key: string) => T | null;
  set: (key: string, data: T, ttl?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  has: (key: string) => boolean;
  isExpired: (key: string) => boolean;
  getStats: () => {
    size: number;
    hitRate: number;
    missRate: number;
    totalRequests: number;
  };
}

/**
 * Hook personnalisé pour la gestion du cache avec TTL et LRU
 * Optimise les performances en évitant les appels répétés
 */
export const useCache = <T>(
  options: CacheOptions = {}
): UseCacheReturn<T> => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes par défaut
    maxEntries = 100,
    onExpire
  } = options;

  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const statsRef = useRef({
    hits: 0,
    misses: 0,
    totalRequests: 0
  });

  // Nettoyage automatique des entrées expirées
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        
        for (const [key, entry] of newCache.entries()) {
          if (now > entry.expiry) {
            newCache.delete(key);
            onExpire?.(key);
          }
        }
        
        return newCache;
      });
    }, 60000); // Nettoyage toutes les minutes

    return () => clearInterval(interval);
  }, [onExpire]);

  const get = useCallback((key: string): T | null => {
    statsRef.current.totalRequests++;
    
    const entry = cache.get(key);
    const now = Date.now();
    
    if (!entry) {
      statsRef.current.misses++;
      return null;
    }
    
    if (now > entry.expiry) {
      setCache(prevCache => {
        const newCache = new Map(prevCache);
        newCache.delete(key);
        return newCache;
      });
      onExpire?.(key);
      statsRef.current.misses++;
      return null;
    }
    
    statsRef.current.hits++;
    return entry.data;
  }, [cache, onExpire]);

  const set = useCallback((key: string, data: T, customTtl?: number) => {
    const now = Date.now();
    const entryTtl = customTtl || ttl;
    
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      
      // Supprimer l'entrée la plus ancienne si on atteint la limite
      if (newCache.size >= maxEntries && !newCache.has(key)) {
        const oldestKey = newCache.keys().next().value;
        if (oldestKey) {
          newCache.delete(oldestKey);
        }
      }
      
      newCache.set(key, {
        data,
        timestamp: now,
        expiry: now + entryTtl
      });
      
      return newCache;
    });
  }, [ttl, maxEntries]);

  const remove = useCallback((key: string) => {
    setCache(prevCache => {
      const newCache = new Map(prevCache);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache(new Map());
    statsRef.current = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    return now <= entry.expiry;
  }, [cache]);

  const isExpired = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    if (!entry) return true;
    
    const now = Date.now();
    return now > entry.expiry;
  }, [cache]);

  const getStats = useCallback(() => {
    const { hits, misses, totalRequests } = statsRef.current;
    return {
      size: cache.size,
      hitRate: totalRequests > 0 ? hits / totalRequests : 0,
      missRate: totalRequests > 0 ? misses / totalRequests : 0,
      totalRequests
    };
  }, [cache.size]);

  return {
    get,
    set,
    remove,
    clear,
    has,
    isExpired,
    getStats
  };
};
