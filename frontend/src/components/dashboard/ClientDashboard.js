import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, programsRes, analyticsRes] = await Promise.all([
        api.get('/bookings?limit=5'),
        api.get('/programs?limit=3'),
        api.get(`/analytics/client/${user.id}`)
      ]);

      setBookings(bookingsRes.data || []);
      setPrograms(programsRes.data || []);
      setAnalytics(analyticsRes.data || {});

      // Try to get latest metrics
      try {
        const metricsRes = await api.get(`/metrics/client/${user.id}/latest`);
        setMetrics(metricsRes.data);
      } catch (err) {
        console.log('No metrics found');
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome back, {user.first_name}!</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Here's your fitness overview</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Workouts</div>
          <div className="stat-value">{analytics?.total_workouts || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Minutes</div>
          <div className="stat-value">{analytics?.total_workout_minutes || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Achievements</div>
          <div className="stat-value">{analytics?.total_achievements || 0}</div>
        </div>
        {metrics && (
          <div className="stat-card">
            <div className="stat-label">Current Weight</div>
            <div className="stat-value">{metrics.weight_kg} kg</div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Sessions</h2>
        </div>
        {bookings.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td>{booking.start_time}</td>
                  <td style={{ textTransform: 'capitalize' }}>{booking.type.replace('_', ' ')}</td>
                  <td>
                    <span className={`badge badge-${
                      booking.status === 'scheduled' ? 'info' :
                      booking.status === 'completed' ? 'success' :
                      'danger'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No upcoming sessions</p>
            <button className="btn-primary" style={{ marginTop: '1rem', width: 'auto' }}>
              Book a Session
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Programs</h2>
        </div>
        {programs.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {programs.map((program) => (
              <div key={program.id} style={{
                padding: '1rem',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>Program #{program.id.slice(0, 8)}</span>
                  <span className={`badge badge-${program.status === 'active' ? 'success' : 'warning'}`}>
                    {program.status}
                  </span>
                </div>
                <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Start: {new Date(program.start_date).toLocaleDateString()}
                  {program.end_date && ` - End: ${new Date(program.end_date).toLocaleDateString()}`}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No active programs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientDashboard;
