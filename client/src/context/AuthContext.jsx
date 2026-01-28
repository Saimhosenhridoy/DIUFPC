 import { createContext, useMemo } from "react";
import { useClerk, useUser } from "@clerk/react-router";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const value = useMemo(() => {
    const role = user?.publicMetadata?.role || "USER";

    return {
      loading: !isLoaded,
      user: isSignedIn
        ? {
            id: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            role, // "ADMIN" হলে admin
          }
        : null,
      // login UI Clerk component থেকে হবে, তাই এখানে login() দরকার নেই
      login: null,
      logout: () => signOut(),
    };
  }, [isLoaded, isSignedIn, user, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
