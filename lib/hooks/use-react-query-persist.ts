/**
 * React Query persistence with AsyncStorage
 */

import { useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const CACHE_KEY = 'react-query-cache';

/**
 * Hook to persist React Query cache to AsyncStorage
 * Call this in your root component after QueryClientProvider
 */
export function useReactQueryPersist() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Load cache from AsyncStorage on mount
    AsyncStorage.getItem(CACHE_KEY)
      .then((cached) => {
        if (cached) {
          try {
            const cache = JSON.parse(cached);
            queryClient.setQueryData(['persisted'], cache);
          } catch (error) {
            console.error('Failed to restore React Query cache:', error);
          }
        }
      })
      .catch((error) => {
        console.error('Failed to load React Query cache:', error);
      });

    // Save cache to AsyncStorage on changes
    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      const cache = queryClient.getQueryCache().getAll();
      const serialized = JSON.stringify(cache);
      AsyncStorage.setItem(CACHE_KEY, serialized).catch((error) => {
        console.error('Failed to persist React Query cache:', error);
      });
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}

