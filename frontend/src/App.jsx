import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ReferentDashboard from './pages/ReferentDashboard';
import RequireAuth from './components/RequireAuth';
import './App.css';

function App() {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<LandingPage />} />

      {/* Professor-only routes */}
      <Route element={<RequireAuth allowedRoles={['professor']} />}>
        <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
      </Route>

      {/* Referent-only routes */}
      <Route element={<RequireAuth allowedRoles={['referent']} />}>
        <Route path="/dashboard/referent" element={<ReferentDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;

