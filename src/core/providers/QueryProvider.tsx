import React from 'react';

type QueryContextValue = {
  refresh: () => void;
};

const QueryContext = React.createContext<QueryContextValue | undefined>(undefined);

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const value = React.useMemo<QueryContextValue>(
    () => ({
      refresh: () => undefined,
    }),
    [],
  );

  return <QueryContext.Provider value={value}>{children}</QueryContext.Provider>;
}

export function useQueryState() {
  const context = React.useContext(QueryContext);

  if (!context) {
    throw new Error('useQueryState must be used within a QueryProvider');
  }

  return context;
}
