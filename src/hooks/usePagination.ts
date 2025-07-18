import { useState, useCallback } from 'react';

interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface UsePaginationReturn extends PaginationState {
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  startIndex: number;
  endIndex: number;
}

/**
 * Hook personnalisé pour la gestion de la pagination
 */
export const usePagination = (
  initialPage: number = 1,
  initialPageSize: number = 10
): UsePaginationReturn => {
  const [paginationState, setPaginationState] = useState<PaginationState>({
    currentPage: initialPage,
    pageSize: initialPageSize,
    totalItems: 0,
    totalPages: 0
  });

  const goToPage = useCallback((page: number) => {
    setPaginationState(prev => ({
      ...prev,
      currentPage: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  const nextPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      currentPage: Math.min(prev.currentPage + 1, prev.totalPages)
    }));
  }, []);

  const prevPage = useCallback(() => {
    setPaginationState(prev => ({
      ...prev,
      currentPage: Math.max(prev.currentPage - 1, 1)
    }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPaginationState(prev => {
      const newTotalPages = Math.ceil(prev.totalItems / size);
      return {
        ...prev,
        pageSize: size,
        totalPages: newTotalPages,
        currentPage: Math.min(prev.currentPage, newTotalPages)
      };
    });
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setPaginationState(prev => {
      const newTotalPages = Math.ceil(total / prev.pageSize);
      return {
        ...prev,
        totalItems: total,
        totalPages: newTotalPages,
        currentPage: Math.min(prev.currentPage, newTotalPages || 1)
      };
    });
  }, []);

  const canGoNext = paginationState.currentPage < paginationState.totalPages;
  const canGoPrev = paginationState.currentPage > 1;
  const startIndex = (paginationState.currentPage - 1) * paginationState.pageSize;
  const endIndex = Math.min(startIndex + paginationState.pageSize - 1, paginationState.totalItems - 1);

  return {
    ...paginationState,
    goToPage,
    nextPage,
    prevPage,
    setPageSize,
    setTotalItems,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex
  };
};
