// hooks/auth-status.ts

import { useState, useEffect } from 'react';

interface AuthStatus {
  user: any | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuthStatus() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchAuthStatus() {
      try {
        const response = await fetch('/api/auth-status');
        if (!response.ok) {
          throw new Error('Failed to fetch auth status');
        }
        const data = await response.json();
        setAuthStatus({
          user: data.user,
          isAuthenticated: data.isAuthenticated,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setAuthStatus({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An unknown error occurred',
        });
      }
    }

    fetchAuthStatus();
  }, []);

  return authStatus;
}