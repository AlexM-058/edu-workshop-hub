import DashboardLayout from '../components/DashboardLayout';

export default function ProfessorDashboard() {
  const mockWorkshops = [
    {
      id: 1,
      title: 'Advanced React Patterns',
      date: 'Oct 15, 2026',
      location: 'Virtual',
      status: 'Confirmed',
    },
    {
      id: 2,
      title: 'Classroom Management 101',
      date: 'Nov 02, 2026',
      location: 'Room 304, Main Campus',
      status: 'Waitlisted',
    },
    {
      id: 3,
      title: 'Digital Tools for Educators',
      date: 'Nov 20, 2026',
      location: 'Virtual',
      status: 'Confirmed',
    }
  ];

  return (
    <DashboardLayout role="Professor" userName="Alex">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Enrolled Workshops</div>
          <div className="stat-value">2</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Waitlisted</div>
          <div className="stat-value">1</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Certificates Earned</div>
          <div className="stat-value">5</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Your Upcoming Workshops</h2>
        <div className="workshop-grid">
          {mockWorkshops.map(ws => (
            <div key={ws.id} className="workshop-card">
              <div className="workshop-header">
                <span className={`status-badge status-${ws.status.toLowerCase()}`}>
                  {ws.status}
                </span>
                <span className="workshop-date">{ws.date}</span>
              </div>
              <h3 className="workshop-title">{ws.title}</h3>
              <p className="workshop-location">📍 {ws.location}</p>
              <div className="workshop-actions">
                <button className="btn-secondary">View Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
