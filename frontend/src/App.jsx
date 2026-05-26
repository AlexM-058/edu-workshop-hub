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
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register/professor" element={<RegisterProfessor />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/workshops/:id" element={<WorkshopDetailPage />} />
      <Route path="/demo/dashboard/professor" element={<ProfessorDashboard />} />
      <Route path="/demo/dashboard/referent" element={<ReferentDashboard />} />
      <Route path="/demo/dashboard/referent/workshops" element={<InstructorWorkshopsPage />} />
      <Route path="/demo/dashboard/referent/workshops/new" element={<CreateWorkshopPage />} />
      <Route path="/demo/dashboard/referent/workshops/preview" element={<WorkshopPreviewPage />} />
      <Route path="/demo/dashboard/referent/analytics" element={<AnalyticsPage />} />
      <Route path="/dashboard/professor" element={<Navigate replace to="/demo/dashboard/professor" />} />
      <Route path="/dashboard/referent" element={<Navigate replace to="/demo/dashboard/referent" />} />
      <Route path="/dashboard/referent/workshops" element={<Navigate replace to="/demo/dashboard/referent/workshops" />} />
      <Route path="/dashboard/referent/workshops/new" element={<Navigate replace to="/demo/dashboard/referent/workshops/new" />} />
      <Route path="/dashboard/referent/workshops/preview" element={<Navigate replace to="/demo/dashboard/referent/workshops/preview" />} />
      <Route path="/dashboard/referent/analytics" element={<Navigate replace to="/demo/dashboard/referent/analytics" />} />
    </Routes>
  );
}

export default App;
