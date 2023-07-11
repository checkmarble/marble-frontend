import React from 'react';

/**
 * Code heavilly inspired from https://github.com/kentcdodds/kentcdodds.com/blob/9583a3dec19b8f79a8e392d8d1f3d992b2ada2a3/app/utils/providers.tsx
 *
 * Credit to Kent C. Dodds
 */
export function createSimpleContext<ContextType>(name: string) {
  const defaultValue = Symbol(`Default ${name} context value`);
  const Context = React.createContext<ContextType | null | typeof defaultValue>(
    defaultValue
  );
  Context.displayName = name;

  function useValue() {
    const value = React.useContext(Context);
    if (value === defaultValue) {
      throw new Error(`use${name} must be used within ${name}Provider`);
    }
    if (!value) {
      throw new Error(
        `No value in ${name}Provider context. If the value is optional in this situation, try useOptional${name} instead of use${name}`
      );
    }
    return value;
  }

  function useOptionalValue() {
    const value = React.useContext(Context);
    if (value === defaultValue) {
      throw new Error(`useOptional${name} must be used within ${name}Provider`);
    }
    return value;
  }

  return { Provider: Context.Provider, useValue, useOptionalValue };
}
