import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Wraps a route so only users with role="admin" can access it.
 * - Not logged in → /login
 * - Logged in, not admin → /main
 * - Admin → renders children
 */
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-dvh bg-yellow-300 flex items-center justify-center">
        <div className="border-4 border-black bg-white px-8 py-6 text-center space-y-2">
          <p className="text-xl font-black text-black">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (role !== "admin") return <Navigate to="/main" replace />;

  return <>{children}</>;
};

export default AdminRoute;
