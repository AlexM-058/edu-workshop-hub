import { useEffect, useState } from 'react';
import './App.css';
import { getHealth } from './lib/api';

function App() {
  const [healthState, setHealthState] = useState({
    status: 'loading',
    message: 'Checking backend connection...',
  });

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

  return (
    <main className="app-shell">
      <section className="status-panel" aria-labelledby="workspace-title">
        <p className="eyebrow">Edu Workshop Hub</p>
        <h1 id="workspace-title">Learning operations workspace</h1>
        <p className="summary">
          Laravel API and React Vite run as separate Docker services inside one
          repository.
        </p>
        <div className={`status-pill status-pill--${healthState.status}`}>
          <span aria-hidden="true" />
          {healthState.message}
        </div>
      </section>
    </main>
  );
}

export default App;
