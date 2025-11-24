import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const TrainerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [bookingsRes, programsRes, workoutsRes] = await Promise.all([
        api.get('/bookings?limit=10'),
        api.get('/programs?limit=5'),
        api.get('/workouts?limit=5')
      ]);

      setBookings(bookingsRes.data || []);
      setPrograms(programsRes.data || []);
      setWorkouts(workoutsRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const todaysBookings = bookings.filter(b => {
    const today = new Date().toISOString().split('T')[0];
    return b.booking_date === today && b.status === 'scheduled';
  });

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Trainer Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Manage your clients and sessions</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Today's Sessions</div>
          <div className="stat-value">{todaysBookings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{bookings.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Programs</div>
          <div className="stat-value">{programs.filter(p => p.status === 'active').length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Workout Plans</div>
          <div className="stat-value">{workouts.length}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Today's Schedule</h2>
        </div>
        {todaysBookings.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Client</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {todaysBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.start_time} - {booking.end_time}</td>
                  <td>Client #{booking.client_id.slice(0, 8)}</td>
                  <td style={{ textTransform: 'capitalize' }}>{booking.type.replace('_', ' ')}</td>
                  <td>
                    <button className="btn-success" style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
                      Complete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>No sessions scheduled for today</p>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Programs</h2>
            <button className="btn-primary" style={{ width: 'auto' }}>Create Program</button>
          </div>
          {programs.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {programs.slice(0, 3).map((program) => (
                <div key={program.id} style={{
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    Program for Client #{program.client_id.slice(0, 8)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    <span className={`badge badge-${program.status === 'active' ? 'success' : 'warning'}`}>
                      {program.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>No programs yet</div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Workout Plans</h2>
            <button className="btn-primary" style={{ width: 'auto' }}>Create Workout</button>
          </div>
          {workouts.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {workouts.slice(0, 3).map((workout) => (
                <div key={workout.id} style={{
                  padding: '0.75rem',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem'
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {workout.name}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {workout.goal} • {workout.difficulty_level}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>No workout plans yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
