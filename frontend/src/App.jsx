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
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditPage from './pages/AdminAuditPage';
// TODO: Re-enable RequireAuth and wrap the real role-based routes (not /demo/*)
// once backend Google OAuth + Laravel session are implemented.
// See: frontend/src/components/RequireAuth.jsx and frontend/src/lib/auth.js
// import RequireAuth from './components/RequireAuth';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />

      {/* TODO: Remove the /demo prefix once authenticated role-based routes replace the public prototype paths. */}
      <Route path="/demo/dashboard/professor" element={<ProfessorDashboard />} />
      <Route path="/demo/dashboard/referent" element={<ReferentDashboard />} />
      <Route path="/demo/dashboard/referent/workshops" element={<InstructorWorkshopsPage />} />
      <Route path="/demo/dashboard/referent/workshops/new" element={<CreateWorkshopPage />} />
      <Route path="/demo/dashboard/referent/workshops/preview" element={<WorkshopPreviewPage />} />
      <Route path="/demo/dashboard/referent/analytics" element={<AnalyticsPage />} />
      <Route path="/demo/admin" element={<Navigate replace to="/demo/admin/users" />} />
      <Route path="/demo/admin/users" element={<AdminUsersPage />} />
      <Route path="/demo/admin/settings" element={<AdminSettingsPage />} />
      <Route path="/demo/admin/audit" element={<AdminAuditPage />} />

      {/* Redirects from old /dashboard/* paths */}
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
