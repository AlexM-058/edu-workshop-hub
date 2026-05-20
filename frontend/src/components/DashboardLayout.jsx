import { useNavigate } from 'react-router-dom';

export default function DashboardLayout({ children, role, userName }) {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo">EW</div>
          <span className="brand-text">EduWorkshop</span>
        </div>
        
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span>
            Overview
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">🎓</span>
            Workshops
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">⚙️</span>
            Settings
          </a>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={() => navigate('/')}>
            <span className="nav-icon">🚪</span>
            Log out
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-title">
            <h1>Welcome back, {userName}!</h1>
            <p className="header-subtitle">
              You are connected as a <strong>{role}</strong>. Here's your overview for today.
            </p>
          </div>
          <div className="header-profile">
            <div className="profile-avatar">{userName.charAt(0)}</div>
          </div>
        </header>
        
        <div className="dashboard-content">
          {children}
        </div>
      </main>
    </div>
  );
}
