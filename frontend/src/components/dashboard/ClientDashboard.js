import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { notificationService } from '../../services';

// Animated counter component
const AnimatedCounter = ({ value, duration = 1 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, value, { duration });
    return controls.stop;
  }, [value]);

  return <motion.span>{rounded}</motion.span>;
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    loadNotifications();
  }, [user]);

  const loadNotifications = async () => {
    try {
      const unreadCount = await notificationService.getUnreadCount(user.id);
      setUnreadNotifications(unreadCount.data.count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

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
    return (
      <motion.div
        className="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        Loading dashboard...
      </motion.div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="dashboard-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <h1 className="dashboard-title">Welcome back, {user.first_name}!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Here's your fitness overview</p>
      </motion.div>

      <motion.div
        className="stats-grid"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="stat-card stat-card-blue" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-label">Total Workouts</div>
          <div className="stat-value">
            <AnimatedCounter value={analytics?.total_workouts || 0} />
          </div>
        </motion.div>
        <motion.div className="stat-card stat-card-green" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-label">Total Minutes</div>
          <div className="stat-value">
            <AnimatedCounter value={analytics?.total_workout_minutes || 0} />
          </div>
        </motion.div>
        <motion.div className="stat-card stat-card-purple" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
          <div className="stat-label">Achievements</div>
          <div className="stat-value">
            <AnimatedCounter value={analytics?.total_achievements || 0} />
          </div>
        </motion.div>
        {metrics && (
          <motion.div className="stat-card stat-card-orange" variants={itemVariants} whileHover={{ scale: 1.05, y: -5 }}>
            <div className="stat-label">Current Weight</div>
            <div className="stat-value">
              <AnimatedCounter value={metrics.weight_kg} /> kg
            </div>
          </motion.div>
        )}
      </motion.div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
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
      </motion.div>

      <motion.div
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        whileHover={{ y: -4 }}
      >
        <div className="card-header">
          <h2 className="card-title">Active Programs</h2>
        </div>
        {programs.length > 0 ? (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {programs.map((program) => (
              <div key={program.id} style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '0.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>Program #{program.id.slice(0, 8)}</span>
                  <span className={`badge badge-${program.status === 'active' ? 'success' : 'warning'}`}>
                    {program.status}
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
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
      </motion.div>
    </motion.div>
  );
};

export default ClientDashboard;
