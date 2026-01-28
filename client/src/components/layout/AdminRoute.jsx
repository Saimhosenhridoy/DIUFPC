 import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useClerk } from "@clerk/react-router";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { signOut } = useClerk();

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <Navigate to="/admin-login" replace />;

  if (user.role !== "ADMIN") {
    // ✅ hard block: sign out and kick out
    signOut();
    return <Navigate to="/" replace />;
  }

  return children;
}
