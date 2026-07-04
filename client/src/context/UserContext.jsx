import { createContext, useContext } from 'react';

// Extended user context for global data beyond auth
const UserContext = createContext(null);

export function UserProvider({ children }) {
  // Extend as needed for global non-auth user data (notifications, preferences, etc.)
  return <UserContext.Provider value={{}}>{children}</UserContext.Provider>;
}

export const useUser = () => useContext(UserContext);
