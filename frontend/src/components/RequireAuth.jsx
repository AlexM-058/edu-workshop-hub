import { Navigate, useLocation } from 'react-router-dom';
import { getSession } from '../lib/auth';

/**
 * Route guard that redirects unauthenticated visitors to the landing page.
 *
 * Usage in App.jsx:
 *   <Route element={<RequireAuth allowedRoles={['professor']} />}>
 *     <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
 *   </Route>
 *
 * Props:
 *   allowedRoles  — optional array of roles permitted to access the child routes.
 *                   When omitted, any authenticated session is accepted.
 *   children      — used when wrapping a single element directly (not via Outlet).
 *
 * The `replace` flag on <Navigate> prevents the protected URL from being pushed
 * onto the browser history stack, so the back-button after login does not loop.
 */
import { Outlet } from 'react-router-dom';

export default function RequireAuth({ allowedRoles }) {
  const session = getSession();
  const location = useLocation();

  // No session at all — send to landing page, remembering where they tried to go.
  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Session exists but the role is not allowed for this route group.
  if (allowedRoles && !allowedRoles.includes(session.role)) {
    // Redirect to their own dashboard instead of the landing page.
    return <Navigate to={`/dashboard/${session.role}`} replace />;
  }

  return <Outlet />;
}
