import { Navigate, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ReferentDashboard from './pages/ReferentDashboard';
import RegisterProfessor from './pages/RegisterProfessor';
import CatalogPage from './pages/CatalogPage';
import WorkshopDetailPage from './pages/WorkshopDetailPage';
import InstructorWorkshopsPage from './pages/InstructorWorkshopsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import CreateWorkshopPage from './pages/CreateWorkshopPage';
import WorkshopPreviewPage from './pages/WorkshopPreviewPage';
import SignInPage from './pages/SignInPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditPage from './pages/AdminAuditPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
      {/* TODO: Remove the /demo prefix once authenticated role-based routes replace the public prototype paths. */}
      <Route path="/demo/dashboard/professor" element={<ProtectedRoute><ProfessorDashboard /></ProtectedRoute>} />
      <Route path="/demo/dashboard/referent" element={<ProtectedRoute roles={['teacher', 'admin']}><ReferentDashboard /></ProtectedRoute>} />
      <Route path="/demo/dashboard/referent/workshops" element={<ProtectedRoute roles={['teacher', 'admin']}><InstructorWorkshopsPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/referent/workshops/new" element={<ProtectedRoute roles={['teacher', 'admin']}><CreateWorkshopPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/referent/workshops/preview" element={<ProtectedRoute roles={['teacher', 'admin']}><WorkshopPreviewPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/referent/analytics" element={<ProtectedRoute roles={['teacher', 'admin']}><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/demo/admin" element={<ProtectedRoute roles={['admin']}><Navigate replace to="/demo/admin/users" /></ProtectedRoute>} />
      <Route path="/demo/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/demo/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
      <Route path="/demo/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAuditPage /></ProtectedRoute>} />
      <Route path="/dashboard/professor" element={<Navigate replace to="/demo/dashboard/professor" />} />
      <Route path="/dashboard/referent" element={<Navigate replace to="/demo/dashboard/referent" />} />
      <Route path="/dashboard/referent/workshops" element={<Navigate replace to="/demo/dashboard/referent/workshops" />} />
      <Route path="/dashboard/referent/workshops/new" element={<Navigate replace to="/demo/dashboard/referent/workshops/new" />} />
      <Route path="/dashboard/referent/workshops/preview" element={<Navigate replace to="/demo/dashboard/referent/workshops/preview" />} />
      <Route path="/dashboard/referent/analytics" element={<Navigate replace to="/demo/dashboard/referent/analytics" />} />
      <Route path="/admin" element={<Navigate replace to="/demo/admin/users" />} />
      <Route path="/admin/users" element={<Navigate replace to="/demo/admin/users" />} />
      <Route path="/admin/settings" element={<Navigate replace to="/demo/admin/settings" />} />
      <Route path="/admin/audit" element={<Navigate replace to="/demo/admin/audit" />} />
    </Routes>
  );
}

export default App;
