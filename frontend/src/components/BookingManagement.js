import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const BookingManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [trainers, setTrainers] = useState([]);
  const [formData, setFormData] = useState({
    trainer_id: '',
    booking_date: '',
    start_time: '',
    end_time: '',
    type: 'one_on_one',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsRes, usersRes] = await Promise.all([
        api.get('/bookings?limit=50'),
        api.get('/users?limit=100')
      ]);

      setBookings(bookingsRes.data || []);

      const allUsers = usersRes.data || [];
      const trainersList = allUsers.filter(u => u.role === 'trainer');
      setTrainers(trainersList);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', formData);
      setShowModal(false);
      setFormData({
        trainer_id: '',
        booking_date: '',
        start_time: '',
        end_time: '',
        type: 'one_on_one',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to create booking:', error);
      alert('Failed to create booking');
    }
  };

  const handleCancel = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await api.put(`/bookings/${bookingId}/cancel`, {
          cancellation_reason: 'Cancelled by user'
        });
        loadData();
      } catch (error) {
        console.error('Failed to cancel booking:', error);
        alert('Failed to cancel booking');
      }
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/complete`);
      loadData();
    } catch (error) {
      console.error('Failed to complete booking:', error);
      alert('Failed to complete booking');
    }
  };

  if (loading) {
    return <div className="loading">Loading bookings...</div>;
  }

  const upcomingBookings = bookings.filter(b => b.status === 'scheduled');
  const pastBookings = bookings.filter(b => b.status !== 'scheduled');

  return (
    <div className="booking-management">
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Management</h1>
          <p className="page-subtitle">Manage your training sessions</p>
        </div>
        {user.role === 'client' && (
          <button
            className="btn-primary"
            style={{ width: 'auto' }}
            onClick={() => setShowModal(true)}
          >
            + Book Session
          </button>
        )}
      </div>

      {/* Upcoming Bookings */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Upcoming Sessions</h2>
        </div>
        {upcomingBookings.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Type</th>
                {user.role !== 'client' && <th>Client</th>}
                {user.role === 'client' && <th>Trainer</th>}
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {upcomingBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td>{booking.start_time} - {booking.end_time}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {booking.type?.replace('_', ' ')}
                  </td>
                  {user.role !== 'client' && (
                    <td>Client #{booking.client_id?.slice(0, 8)}</td>
                  )}
                  {user.role === 'client' && (
                    <td>Trainer #{booking.trainer_id?.slice(0, 8)}</td>
                  )}
                  <td>{booking.notes || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {user.role === 'trainer' && (
                        <button
                          className="btn-success"
                          style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                          onClick={() => handleComplete(booking.id)}
                        >
                          Complete
                        </button>
                      )}
                      <button
                        className="btn-danger"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
                        onClick={() => handleCancel(booking.id)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No upcoming sessions</div>
        )}
      </div>

      {/* Past Bookings */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Past Sessions</h2>
        </div>
        {pastBookings.length > 0 ? (
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
              {pastBookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{new Date(booking.booking_date).toLocaleDateString()}</td>
                  <td>{booking.start_time}</td>
                  <td style={{ textTransform: 'capitalize' }}>
                    {booking.type?.replace('_', ' ')}
                  </td>
                  <td>
                    <span className={`badge badge-${
                      booking.status === 'completed' ? 'success' :
                      booking.status === 'cancelled' ? 'danger' :
                      'warning'
                    }`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">No past sessions</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Book a Session</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Trainer *</label>
                <select
                  className="form-select"
                  value={formData.trainer_id}
                  onChange={(e) => setFormData({...formData, trainer_id: e.target.value})}
                  required
                >
                  <option value="">Select a trainer</option>
                  {trainers.map(trainer => (
                    <option key={trainer.id} value={trainer.id}>
                      {trainer.first_name} {trainer.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.booking_date}
                  onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Start Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.start_time}
                  onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time *</label>
                <input
                  type="time"
                  className="form-input"
                  value={formData.end_time}
                  onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Session Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                >
                  <option value="one_on_one">One-on-One</option>
                  <option value="group_class">Group Class</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  rows="3"
                  placeholder="Any special requests or notes..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary">Book Session</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;
