import { Navigate, Routes, Route, useParams } from 'react-router-dom';
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
import WorkshopParticipantsPage from './pages/WorkshopParticipantsPage';
import SignInPage from './pages/SignInPage';
import SsoCallbackPage from './pages/SsoCallbackPage';
import ProtectedRoute from './auth/ProtectedRoute';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminAuditPage from './pages/AdminAuditPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminWorkshopsPage from './pages/AdminWorkshopsPage';
import CertificatesPage from './pages/CertificatesPage';
import ProfilePage from './pages/ProfilePage';
import HistoryPage from './pages/HistoryPage';
import ResourcesPage from './pages/ResourcesPage';
import './App.css';

function WorkshopParticipantsRedirect() {
  const { id } = useParams();

  return <Navigate replace to={`/demo/dashboard/teacher/workshops/${id}/participants`} />;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<Navigate replace to="/sign-in" />} />
      <Route path="/sso-callback" element={<SsoCallbackPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />

      {/* TODO: Remove the /demo prefix once production role-based routes replace the prototype paths. */}
      <Route path="/demo/dashboard/attender" element={<ProtectedRoute roles={['attender', 'professor']}><ProfessorDashboard /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><ReferentDashboard /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher/workshops" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><InstructorWorkshopsPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher/workshops/:id/participants" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><WorkshopParticipantsPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher/workshops/new" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><CreateWorkshopPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher/workshops/preview" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><WorkshopPreviewPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/teacher/analytics" element={<ProtectedRoute roles={['teacher', 'referent', 'admin']}><AnalyticsPage /></ProtectedRoute>} />
      <Route path="/demo/certificates" element={<ProtectedRoute roles={['attender', 'professor', 'teacher', 'referent', 'admin']}><CertificatesPage /></ProtectedRoute>} />
      <Route path="/demo/history" element={<ProtectedRoute roles={['attender', 'professor']}><HistoryPage /></ProtectedRoute>} />
      <Route path="/demo/profile" element={<ProtectedRoute roles={['attender', 'professor', 'teacher', 'referent', 'admin']}><ProfilePage /></ProtectedRoute>} />
      <Route path="/demo/resources" element={<ProtectedRoute roles={['attender', 'professor', 'teacher', 'referent', 'admin']}><ResourcesPage /></ProtectedRoute>} />
      <Route path="/demo/dashboard/professor" element={<Navigate replace to="/demo/dashboard/attender" />} />
      <Route path="/demo/dashboard/referent" element={<Navigate replace to="/demo/dashboard/teacher" />} />
      <Route path="/demo/dashboard/referent/workshops" element={<Navigate replace to="/demo/dashboard/teacher/workshops" />} />
      <Route path="/demo/dashboard/referent/workshops/:id/participants" element={<WorkshopParticipantsRedirect />} />
      <Route path="/demo/dashboard/referent/workshops/new" element={<Navigate replace to="/demo/dashboard/teacher/workshops/new" />} />
      <Route path="/demo/dashboard/referent/workshops/preview" element={<Navigate replace to="/demo/dashboard/teacher/workshops/preview" />} />
      <Route path="/demo/dashboard/referent/analytics" element={<Navigate replace to="/demo/dashboard/teacher/analytics" />} />
      <Route path="/demo/admin" element={<ProtectedRoute roles={['admin']}><Navigate replace to="/demo/admin/dashboard" /></ProtectedRoute>} />
      <Route path="/demo/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/demo/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
      <Route path="/demo/admin/workshops" element={<ProtectedRoute roles={['admin']}><AdminWorkshopsPage /></ProtectedRoute>} />
      <Route path="/demo/admin/settings" element={<ProtectedRoute roles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
      <Route path="/demo/admin/audit" element={<ProtectedRoute roles={['admin']}><AdminAuditPage /></ProtectedRoute>} />

      {/* Legacy /dashboard/* redirects */}
      <Route path="/dashboard/attender" element={<Navigate replace to="/demo/dashboard/attender" />} />
      <Route path="/dashboard/teacher" element={<Navigate replace to="/demo/dashboard/teacher" />} />
      <Route path="/dashboard/teacher/workshops" element={<Navigate replace to="/demo/dashboard/teacher/workshops" />} />
      <Route path="/dashboard/teacher/workshops/:id/participants" element={<WorkshopParticipantsRedirect />} />
      <Route path="/dashboard/teacher/workshops/new" element={<Navigate replace to="/demo/dashboard/teacher/workshops/new" />} />
      <Route path="/dashboard/teacher/workshops/preview" element={<Navigate replace to="/demo/dashboard/teacher/workshops/preview" />} />
      <Route path="/dashboard/teacher/analytics" element={<Navigate replace to="/demo/dashboard/teacher/analytics" />} />
      <Route path="/dashboard/professor" element={<Navigate replace to="/demo/dashboard/attender" />} />
      <Route path="/dashboard/referent" element={<Navigate replace to="/demo/dashboard/teacher" />} />
      <Route path="/dashboard/referent/workshops" element={<Navigate replace to="/demo/dashboard/teacher/workshops" />} />
      <Route path="/dashboard/referent/workshops/:id/participants" element={<WorkshopParticipantsRedirect />} />
      <Route path="/dashboard/referent/workshops/new" element={<Navigate replace to="/demo/dashboard/teacher/workshops/new" />} />
      <Route path="/dashboard/referent/workshops/preview" element={<Navigate replace to="/demo/dashboard/teacher/workshops/preview" />} />
      <Route path="/dashboard/referent/analytics" element={<Navigate replace to="/demo/dashboard/teacher/analytics" />} />
      <Route path="/certificates" element={<Navigate replace to="/demo/certificates" />} />
      <Route path="/history" element={<Navigate replace to="/demo/history" />} />
      <Route path="/profile" element={<Navigate replace to="/demo/profile" />} />
      <Route path="/resources" element={<Navigate replace to="/demo/resources" />} />
      <Route path="/register/attender" element={<Navigate replace to="/demo/profile" />} />
      <Route path="/admin" element={<Navigate replace to="/demo/admin/dashboard" />} />
      <Route path="/admin/dashboard" element={<Navigate replace to="/demo/admin/dashboard" />} />
      <Route path="/admin/users" element={<Navigate replace to="/demo/admin/users" />} />
      <Route path="/admin/workshops" element={<Navigate replace to="/demo/admin/workshops" />} />
      <Route path="/admin/settings" element={<Navigate replace to="/demo/admin/settings" />} />
      <Route path="/admin/audit" element={<Navigate replace to="/demo/admin/audit" />} />
    </Routes>
  );
}

export default App;
