import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminShell } from './components/AdminShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { MyAccountPage } from './pages/MyAccountPage';
import { UsersPage } from './pages/users/UsersPage';
import { CreateUserPage } from './pages/users/CreateUserPage';
import { ProjectsPage } from './pages/projects/ProjectsPage';
import { CreateProjectPage } from './pages/projects/CreateProjectPage';
import { EditProjectPage } from './pages/projects/EditProjectPage';
import { EmployeesPage } from './pages/employees/EmployeesPage';
import { CreateEmployeePage } from './pages/employees/CreateEmployeePage';
import { FeedbackPage } from './pages/feedback/FeedbackPage';

/**
 * Page title map — keyed by route pattern
 * AdminShell reads this via a small helper below.
 */
function ShellWithTitle({ title }) {
  return <AdminShell pageTitle={title} />;
}

export function AdminApp() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="login" element={<LoginPage />} />

          {/* Protected shell — all nested routes render inside AdminShell */}
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <ShellWithTitle title="Dashboard" />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
          </Route>

          <Route
            path="account"
            element={
              <ProtectedRoute>
                <ShellWithTitle title="My Account" />
              </ProtectedRoute>
            }
          >
            <Route index element={<MyAccountPage />} />
          </Route>

          {/* Users — SUPERADMIN only */}
          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN']}>
                <ShellWithTitle title="Users" />
              </ProtectedRoute>
            }
          >
            <Route index element={<UsersPage />} />
            <Route path="create" element={<CreateUserPage />} />
          </Route>

          {/* Projects */}
          <Route
            path="projects"
            element={
              <ProtectedRoute>
                <ShellWithTitle title="Projects" />
              </ProtectedRoute>
            }
          >
            <Route index element={<ProjectsPage />} />
            <Route
              path="create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ENGINEER']}>
                  <CreateProjectPage />
                </ProtectedRoute>
              }
            />
            <Route
              path=":projectId/edit"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'ENGINEER']}>
                  <EditProjectPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Employees */}
          <Route
            path="employees"
            element={
              <ProtectedRoute>
                <ShellWithTitle title="Employees" />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmployeesPage />} />
            <Route
              path="create"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'RECRUITER']}>
                  <CreateEmployeePage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Feedback / Enquiries */}
          <Route
            path="feedback"
            element={
              <ProtectedRoute allowedRoles={['SUPERADMIN', 'ADMIN', 'ENGINEER']}>
                <ShellWithTitle title="Feedback & Enquiries" />
              </ProtectedRoute>
            }
          >
            <Route index element={<FeedbackPage />} />
          </Route>

          {/* Default: redirect /admin → /osi-console/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </ToastProvider>
  );
}
