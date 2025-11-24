import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGyms: 0,
    totalBookings: 0,
    totalRevenue: 0
  });
  const [users, setUsers] = useState([]);
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [usersRes, gymsRes] = await Promise.all([
        api.get('/users?limit=50'),
        api.get('/users/gyms')
      ]);

      setUsers(usersRes.data || []);
      setGyms(gymsRes.data || []);

      // Calculate stats
      setStats({
        totalUsers: usersRes.data?.length || 0,
        totalGyms: gymsRes.data?.length || 0,
        totalBookings: 0, // Would come from analytics endpoint
        totalRevenue: 0
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Dashboard</h1>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>System overview and management</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-blue">
          <div className="stat-icon">👥</div>
          <div>
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>
        <div className="stat-card stat-card-green">
          <div className="stat-icon">🏢</div>
          <div>
            <div className="stat-label">Total Gyms</div>
            <div className="stat-value">{stats.totalGyms}</div>
          </div>
        </div>
        <div className="stat-card stat-card-purple">
          <div className="stat-icon">📅</div>
          <div>
            <div className="stat-label">Total Bookings</div>
            <div className="stat-value">{stats.totalBookings}</div>
          </div>
        </div>
        <div className="stat-card stat-card-orange">
          <div className="stat-icon">💰</div>
          <div>
            <div className="stat-label">Revenue</div>
            <div className="stat-value">${stats.totalRevenue}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab ${activeTab === 'gyms' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('gyms')}
        >
          Gyms
        </button>
      </div>

      {/* Content Based on Active Tab */}
      {activeTab === 'overview' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">System Overview</h2>
          </div>
          <div className="overview-grid">
            <div className="overview-item">
              <h3>User Distribution</h3>
              <div className="user-distribution">
                {['admin', 'gym_owner', 'trainer', 'client'].map(role => {
                  const count = users.filter(u => u.role === role).length;
                  return (
                    <div key={role} className="distribution-item">
                      <span className="distribution-label">{role.replace('_', ' ')}</span>
                      <span className="distribution-value">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="overview-item">
              <h3>Recent Activity</h3>
              <p style={{color: '#6b7280'}}>Activity monitoring coming soon</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">User Management</h2>
            <button className="btn-primary" style={{width: 'auto'}}>
              Add User
            </button>
          </div>
          {users.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.first_name} {user.last_name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`badge badge-${
                        user.role === 'admin' ? 'danger' :
                        user.role === 'trainer' ? 'info' :
                        user.role === 'gym_owner' ? 'warning' :
                        'success'
                      }`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-success">Active</span>
                    </td>
                    <td>
                      <button className="btn-secondary" style={{fontSize: '0.75rem', padding: '0.25rem 0.75rem'}}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">No users found</div>
          )}
        </div>
      )}

      {activeTab === 'gyms' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Gym Management</h2>
            <button className="btn-primary" style={{width: 'auto'}}>
              Add Gym
            </button>
          </div>
          {gyms.length > 0 ? (
            <div className="gym-grid">
              {gyms.map((gym) => (
                <div key={gym.id} className="gym-card">
                  <h3>{gym.name}</h3>
                  <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
                    {gym.address?.city}, {gym.address?.state}
                  </p>
                  <div style={{marginTop: '0.5rem'}}>
                    <span className="badge badge-success">Active</span>
                  </div>
                  <button className="btn-secondary" style={{marginTop: '1rem', width: '100%'}}>
                    Manage
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No gyms found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
