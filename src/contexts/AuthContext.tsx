import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/config";
import { logOut as firebaseLogOut } from "@/firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Verify user still exists by getting their ID token
          // If user was deleted, this will fail or throw an error
          await currentUser.getIdToken(true);
          setUser(currentUser);
        } catch (error) {
          console.warn("User verification failed - logging out:", error);
          // User was deleted or has invalid token
          setUser(null);
          try {
            await firebaseLogOut();
          } catch {
            // Already logged out
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // No periodic verification needed - Firebase handles token refresh automatically

  return (
    <AuthContext.Provider value={{ user, loading, logout: firebaseLogOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
