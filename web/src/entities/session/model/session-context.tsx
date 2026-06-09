"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { CurrentSessionUser } from "./current-session-user";

type CurrentSessionContextValue = {
  currentUser: CurrentSessionUser | null;
};

const CurrentSessionContext = createContext<CurrentSessionContextValue | null>(
  null,
);

type CurrentSessionProviderProps = {
  currentUser: CurrentSessionUser | null;
  children: ReactNode;
};

export function CurrentSessionProvider({
  currentUser,
  children,
}: CurrentSessionProviderProps) {
  return (
    <CurrentSessionContext.Provider value={{ currentUser }}>
      {children}
    </CurrentSessionContext.Provider>
  );
}

export function useCurrentSession() {
  const context = useContext(CurrentSessionContext);

  if (!context) {
    throw new Error(
      "useCurrentSession must be used within CurrentSessionProvider",
    );
  }

  return context;
}
