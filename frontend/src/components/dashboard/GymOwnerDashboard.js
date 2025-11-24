import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GymOwnerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTrainers: 0,
    totalClients: 0,
    totalBookings: 0,
    revenue: 0
  });
  const [trainers, setTrainers] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, bookingsRes] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/bookings?limit=20')
      ]);

      const allUsers = usersRes.data || [];
      const trainersData = allUsers.filter(u => u.role === 'trainer' && u.gym_id === user.gym_id);
      const clientsData = allUsers.filter(u => u.role === 'client' && u.gym_id === user.gym_id);

      setTrainers(trainersData);
      setClients(clientsData);
      setBookings(bookingsRes.data || []);

      setStats({
        totalTrainers: trainersData.length,
        totalClients: clientsData.length,
        totalBookings: bookingsRes.data?.length || 0,
        revenue: 0 // Calculate based on bookings
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading gym owner dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Gym Owner Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>Manage your gym operations</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Active Trainers</div>
          <div className="stat-value">{stats.totalTrainers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.totalClients}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{stats.totalBookings}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Monthly Revenue</div>
          <div className="stat-value">${stats.revenue}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Trainers</h2>
        </div>
        {trainers.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {trainers.map((trainer) => (
                <tr key={trainer.id}>
                  <td>{trainer.first_name} {trainer.last_name}</td>
                  <td>{trainer.email}</td>
                  <td>{trainer.phone}</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No trainers found</div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Recent Clients</h2>
        </div>
        {clients.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.slice(0, 10).map((client) => (
                <tr key={client.id}>
                  <td>{client.first_name} {client.last_name}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td><span className="badge badge-success">Active</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No clients found</div>
        )}
      </div>
    </div>
  );
};

export default GymOwnerDashboard;
