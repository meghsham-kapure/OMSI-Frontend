import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from './ui/Spinner';
import { useEffect, useRef } from 'react';

/**
 * Wraps admin routes. Redirects to /osi-console/login if not authenticated.
 * Optionally restricts to specific roles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string[]} [props.allowedRoles] - if provided, redirects if role not in list
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, isLoading } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const hasShownToast = useRef(false);

  const isRoleDenied = user && allowedRoles && !allowedRoles.includes(role);

  useEffect(() => {
    if (isRoleDenied && !hasShownToast.current) {
      hasShownToast.current = true;
      toast.error('Access denied — you do not have permission to view this page.');
    }
  }, [isRoleDenied, toast]);

  if (isLoading) {
    return (
      <div className="admin-page-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/osi-console/login" state={{ from: location }} replace />;
  }

  if (isRoleDenied) {
    return <Navigate to="/osi-console/dashboard" replace />;
  }

  return children;
}
