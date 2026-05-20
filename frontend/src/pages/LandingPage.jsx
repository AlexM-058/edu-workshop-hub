import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHealth } from '../lib/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const [healthState, setHealthState] = useState({
    status: 'loading',
    message: 'Checking backend connection...',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getHealth()
      .then((payload) => {
        if (!isMounted) return;
        setHealthState({
          status: 'online',
          message: `${payload.service} is ${payload.status}`,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        setHealthState({
          status: 'offline',
          message: error.message,
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRoleSelect = (role) => {
    setIsModalOpen(false);
    navigate(`/dashboard/${role}`);
  };

  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="workspace-title">
        <p className="eyebrow">Edu Workshop Hub</p>
        <h1 id="workspace-title">Learning operations workspace</h1>
        <p className="summary">
          Laravel API and React Vite run as separate Docker services inside one
          repository.
        </p>
        <div className="status-actions">
          <div className={`status-pill status-pill--${healthState.status}`}>
            <span aria-hidden="true" />
            {healthState.message}
          </div>
          <button 
            className="btn-primary" 
            onClick={() => setIsModalOpen(true)}
          >
            Login to Dashboard
          </button>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Select your role</h2>
            <p>How would you like to connect to the platform?</p>
            <div className="role-buttons">
              <button 
                className="btn-role btn-role--professor" 
                onClick={() => handleRoleSelect('professor')}
              >
                <div className="role-icon">👩‍🏫</div>
                <div className="role-text">
                  <strong>Professor</strong>
                  <span>Browse and enroll in workshops</span>
                </div>
              </button>
              <button 
                className="btn-role btn-role--referent" 
                onClick={() => handleRoleSelect('referent')}
              >
                <div className="role-icon">📋</div>
                <div className="role-text">
                  <strong>Referent</strong>
                  <span>Organize and manage workshops</span>
                </div>
              </button>
            </div>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
