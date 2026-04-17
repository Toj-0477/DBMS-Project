import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, requireVerified = false }) {
  const { isAuthenticated, isVerified, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireVerified && !isVerified) {
    return <Navigate to="/verify-id" replace />;
  }

  return children;
}

export default ProtectedRoute;
