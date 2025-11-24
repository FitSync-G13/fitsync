import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const ProgressTracking = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics');
  const [showMetricModal, setShowMetricModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [metricForm, setMetricForm] = useState({
    recorded_date: new Date().toISOString().split('T')[0],
    weight_kg: '',
    height_cm: '',
    body_fat_percentage: '',
    measurements: {},
    notes: ''
  });
  const [workoutForm, setWorkoutForm] = useState({
    workout_date: new Date().toISOString().split('T')[0],
    exercises_completed: [],
    total_duration_minutes: '',
    calories_burned: '',
    client_notes: '',
    mood_rating: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, workoutsRes, analyticsRes] = await Promise.all([
        api.get(`/metrics/client/${user.id}`),
        api.get(`/workout-logs/client/${user.id}`),
        api.get(`/analytics/client/${user.id}`)
      ]);

      setMetrics(metricsRes.data || []);
      setWorkoutLogs(workoutsRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error('Failed to load progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMetricSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/metrics', metricForm);
      setShowMetricModal(false);
      setMetricForm({
        recorded_date: new Date().toISOString().split('T')[0],
        weight_kg: '',
        height_cm: '',
        body_fat_percentage: '',
        measurements: {},
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Failed to save metric:', error);
      alert('Failed to save body metric');
    }
  };

  const handleWorkoutSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/workout-logs', {
        ...workoutForm,
        exercises_completed: [{ exercise: 'General Workout', duration: workoutForm.total_duration_minutes }]
      });
      setShowWorkoutModal(false);
      setWorkoutForm({
        workout_date: new Date().toISOString().split('T')[0],
        exercises_completed: [],
        total_duration_minutes: '',
        calories_burned: '',
        client_notes: '',
        mood_rating: 5
      });
      loadData();
    } catch (error) {
      console.error('Failed to save workout:', error);
      alert('Failed to save workout log');
    }
  };

  if (loading) {
    return <div className="loading">Loading progress data...</div>;
  }

  return (
    <div className="progress-tracking">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Progress</h1>
          <p className="page-subtitle">Track your fitness journey</p>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          <div className="stat-card">
            <div className="stat-label">Total Workouts</div>
            <div className="stat-value">{analytics.total_workouts || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Minutes</div>
            <div className="stat-value">{analytics.total_workout_minutes || 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Achievements</div>
            <div className="stat-value">{analytics.total_achievements || 0}</div>
          </div>
          {analytics.latest_metrics && (
            <div className="stat-card">
              <div className="stat-label">Current Weight</div>
              <div className="stat-value">{analytics.latest_metrics.weight_kg} kg</div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'metrics' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('metrics')}
        >
          Body Metrics
        </button>
        <button
          className={`tab ${activeTab === 'workouts' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('workouts')}
        >
          Workout Logs
        </button>
      </div>

      {/* Body Metrics Tab */}
      {activeTab === 'metrics' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Body Metrics History</h2>
            <button
              className="btn-primary"
              style={{ width: 'auto' }}
              onClick={() => setShowMetricModal(true)}
            >
              + Add Metric
            </button>
          </div>
          {metrics.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Weight (kg)</th>
                  <th>Height (cm)</th>
                  <th>BMI</th>
                  <th>Body Fat %</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr key={metric.id}>
                    <td>{new Date(metric.recorded_date).toLocaleDateString()}</td>
                    <td>{metric.weight_kg || '-'}</td>
                    <td>{metric.height_cm || '-'}</td>
                    <td>{metric.bmi || '-'}</td>
                    <td>{metric.body_fat_percentage || '-'}</td>
                    <td>{metric.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No body metrics recorded yet</p>
              <button
                className="btn-primary"
                style={{ marginTop: '1rem', width: 'auto' }}
                onClick={() => setShowMetricModal(true)}
              >
                Record Your First Metric
              </button>
            </div>
          )}
        </div>
      )}

      {/* Workout Logs Tab */}
      {activeTab === 'workouts' && (
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Workout History</h2>
            <button
              className="btn-primary"
              style={{ width: 'auto' }}
              onClick={() => setShowWorkoutModal(true)}
            >
              + Log Workout
            </button>
          </div>
          {workoutLogs.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Duration (min)</th>
                  <th>Calories</th>
                  <th>Mood</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {workoutLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.workout_date).toLocaleDateString()}</td>
                    <td>{log.total_duration_minutes}</td>
                    <td>{log.calories_burned || '-'}</td>
                    <td>
                      {log.mood_rating && '⭐'.repeat(log.mood_rating)}
                    </td>
                    <td>{log.client_notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <p>No workouts logged yet</p>
              <button
                className="btn-primary"
                style={{ marginTop: '1rem', width: 'auto' }}
                onClick={() => setShowWorkoutModal(true)}
              >
                Log Your First Workout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Metric Modal */}
      {showMetricModal && (
        <div className="modal-overlay" onClick={() => setShowMetricModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Record Body Metrics</h2>
              <button className="btn-close" onClick={() => setShowMetricModal(false)}>×</button>
            </div>
            <form onSubmit={handleMetricSubmit}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={metricForm.recorded_date}
                  onChange={(e) => setMetricForm({...metricForm, recorded_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Weight (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={metricForm.weight_kg}
                  onChange={(e) => setMetricForm({...metricForm, weight_kg: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Height (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={metricForm.height_cm}
                  onChange={(e) => setMetricForm({...metricForm, height_cm: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Body Fat %</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={metricForm.body_fat_percentage}
                  onChange={(e) => setMetricForm({...metricForm, body_fat_percentage: parseFloat(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={metricForm.notes}
                  onChange={(e) => setMetricForm({...metricForm, notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary">Save Metrics</button>
                <button type="button" className="btn-secondary" onClick={() => setShowMetricModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Modal */}
      {showWorkoutModal && (
        <div className="modal-overlay" onClick={() => setShowWorkoutModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Log Workout</h2>
              <button className="btn-close" onClick={() => setShowWorkoutModal(false)}>×</button>
            </div>
            <form onSubmit={handleWorkoutSubmit}>
              <div className="form-group">
                <label className="form-label">Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={workoutForm.workout_date}
                  onChange={(e) => setWorkoutForm({...workoutForm, workout_date: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (minutes) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={workoutForm.total_duration_minutes}
                  onChange={(e) => setWorkoutForm({...workoutForm, total_duration_minutes: parseInt(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Calories Burned</label>
                <input
                  type="number"
                  className="form-input"
                  value={workoutForm.calories_burned}
                  onChange={(e) => setWorkoutForm({...workoutForm, calories_burned: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Mood Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  className="form-input"
                  value={workoutForm.mood_rating}
                  onChange={(e) => setWorkoutForm({...workoutForm, mood_rating: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-input"
                  value={workoutForm.client_notes}
                  onChange={(e) => setWorkoutForm({...workoutForm, client_notes: e.target.value})}
                  rows="3"
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary">Log Workout</button>
                <button type="button" className="btn-secondary" onClick={() => setShowWorkoutModal(false)}>
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

export default ProgressTracking;
