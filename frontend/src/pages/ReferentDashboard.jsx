import DashboardLayout from '../components/DashboardLayout';

export default function ReferentDashboard() {
  const mockCreatedWorkshops = [
    {
      id: 101,
      title: 'Inclusive Teaching Strategies',
      date: 'Oct 25, 2026',
      enrolled: 24,
      capacity: 30,
      waitlist: 0,
    },
    {
      id: 102,
      title: 'AI in the Modern Classroom',
      date: 'Nov 10, 2026',
      enrolled: 40,
      capacity: 40,
      waitlist: 15,
    }
  ];

  return (
    <DashboardLayout role="Referent" userName="Sarah">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Workshops</div>
          <div className="stat-value">2</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Participants</div>
          <div className="stat-value">64</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Attendances</div>
          <div className="stat-value">0</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Workshops You Manage</h2>
          <button className="btn-primary btn-small">+ Create Workshop</button>
        </div>
        <div className="workshop-grid">
          {mockCreatedWorkshops.map(ws => (
            <div key={ws.id} className="workshop-card">
              <div className="workshop-header">
                <span className="status-badge status-active">Active</span>
                <span className="workshop-date">{ws.date}</span>
              </div>
              <h3 className="workshop-title">{ws.title}</h3>
              <div className="workshop-progress">
                <div className="progress-labels">
                  <span>Enrolled: {ws.enrolled}/{ws.capacity}</span>
                  {ws.waitlist > 0 && <span className="waitlist-text">{ws.waitlist} on waitlist</span>}
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{width: `${(ws.enrolled / ws.capacity) * 100}%`}}
                  ></div>
                </div>
              </div>
              <div className="workshop-actions">
                <button className="btn-secondary">Manage</button>
                <button className="btn-outline">Attendance</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
