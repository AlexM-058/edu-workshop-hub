import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ReferentDashboard from './pages/ReferentDashboard';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard/professor" element={<ProfessorDashboard />} />
      <Route path="/dashboard/referent" element={<ReferentDashboard />} />
    </Routes>
  );
}

export default App;
