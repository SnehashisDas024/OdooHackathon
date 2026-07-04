import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BufferAnimation from '../components/common/BufferAnimation';

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <BufferAnimation variant="walking-doc" size="lg" caption="Verifying your session…" />
    </div>
  );
  return user ? <Outlet /> : <Navigate to="/sign-in" replace />;
}
