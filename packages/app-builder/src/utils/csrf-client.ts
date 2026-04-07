import { createContext, useContext } from 'react';

export const CsrfContext = createContext('');

export function useCsrfToken(): string {
  return useContext(CsrfContext);
}
