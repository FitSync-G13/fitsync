import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const WorkoutPlans = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    goal: '',
    difficulty_level: 'beginner',
    duration_weeks: 4,
    description: '',
    exercises: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workoutsRes, exercisesRes] = await Promise.all([
        api.get('/workouts?limit=50'),
        api.get('/exercises?limit=100')
      ]);

      setWorkouts(workoutsRes.data || []);
      setExercises(exercisesRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedWorkout) {
        await api.put(`/workouts/${selectedWorkout.id}`, formData);
      } else {
        await api.post('/workouts', formData);
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save workout plan:', error);
      alert('Failed to save workout plan');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workout plan?')) {
      try {
        await api.delete(`/workouts/${id}`);
        loadData();
      } catch (error) {
        console.error('Failed to delete workout:', error);
        alert('Failed to delete workout plan');
      }
    }
  };

  const handleEdit = (workout) => {
    setSelectedWorkout(workout);
    setFormData({
      name: workout.name || '',
      goal: workout.goal || '',
      difficulty_level: workout.difficulty_level || 'beginner',
      duration_weeks: workout.duration_weeks || 4,
      description: workout.description || '',
      exercises: workout.exercises || []
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      goal: '',
      difficulty_level: 'beginner',
      duration_weeks: 4,
      description: '',
      exercises: []
    });
    setSelectedWorkout(null);
  };

  const addExerciseToWorkout = (exerciseId) => {
    if (!formData.exercises.find(e => e.exercise_id === exerciseId)) {
      setFormData({
        ...formData,
        exercises: [...formData.exercises, {
          exercise_id: exerciseId,
          sets: 3,
          reps: 10,
          rest_seconds: 60,
          order: formData.exercises.length + 1
        }]
      });
    }
  };

  const removeExerciseFromWorkout = (exerciseId) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.filter(e => e.exercise_id !== exerciseId)
    });
  };

  const updateExerciseDetails = (exerciseId, field, value) => {
    setFormData({
      ...formData,
      exercises: formData.exercises.map(e =>
        e.exercise_id === exerciseId ? { ...e, [field]: parseInt(value) } : e
      )
    });
  };

  if (loading) {
    return <div className="loading">Loading workout plans...</div>;
  }

  return (
    <div className="workout-plans">
      <div className="page-header">
        <div>
          <h1 className="page-title">Workout Plans</h1>
          <p className="page-subtitle">Create and manage workout programs</p>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          + Create Workout Plan
        </button>
      </div>

      {workouts.length > 0 ? (
        <div className="workout-grid">
          {workouts.map((workout) => (
            <div key={workout.id} className="workout-card">
              <div className="workout-header">
                <h3 className="workout-name">{workout.name}</h3>
                <span className={`badge badge-${
                  workout.difficulty_level === 'beginner' ? 'success' :
                  workout.difficulty_level === 'intermediate' ? 'warning' :
                  'danger'
                }`}>
                  {workout.difficulty_level}
                </span>
              </div>
              <p className="workout-description">{workout.description}</p>
              <div className="workout-details">
                <div className="workout-detail-item">
                  <strong>Goal:</strong> {workout.goal}
                </div>
                <div className="workout-detail-item">
                  <strong>Duration:</strong> {workout.duration_weeks} weeks
                </div>
                <div className="workout-detail-item">
                  <strong>Exercises:</strong> {workout.exercises?.length || 0}
                </div>
              </div>
              <div className="workout-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleEdit(workout)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(workout.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p>No workout plans created yet</p>
            <button
              className="btn-primary"
              style={{ marginTop: '1rem', width: 'auto' }}
              onClick={() => setShowModal(true)}
            >
              Create Your First Workout Plan
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedWorkout ? 'Edit Workout Plan' : 'Create New Workout Plan'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Workout Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Goal *</label>
                <select
                  className="form-select"
                  value={formData.goal}
                  onChange={(e) => setFormData({...formData, goal: e.target.value})}
                  required
                >
                  <option value="">Select a goal</option>
                  <option value="muscle_gain">Muscle Gain</option>
                  <option value="weight_loss">Weight Loss</option>
                  <option value="strength">Strength</option>
                  <option value="endurance">Endurance</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="general_fitness">General Fitness</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={formData.difficulty_level}
                  onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Duration (weeks)</label>
                <input
                  type="number"
                  min="1"
                  max="52"
                  className="form-input"
                  value={formData.duration_weeks}
                  onChange={(e) => setFormData({...formData, duration_weeks: parseInt(e.target.value)})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows="3"
                />
              </div>

              {/* Exercise Selection */}
              <div className="form-group">
                <label className="form-label">Add Exercises</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    if (e.target.value) {
                      addExerciseToWorkout(e.target.value);
                      e.target.value = '';
                    }
                  }}
                >
                  <option value="">Select an exercise to add</option>
                  {exercises.map(exercise => (
                    <option key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Exercises */}
              {formData.exercises.length > 0 && (
                <div className="form-group">
                  <label className="form-label">Selected Exercises</label>
                  <div className="selected-exercises">
                    {formData.exercises.map((ex, idx) => {
                      const exercise = exercises.find(e => e.id === ex.exercise_id);
                      return (
                        <div key={idx} className="selected-exercise">
                          <div className="exercise-info">
                            <strong>{exercise?.name || 'Unknown'}</strong>
                            <button
                              type="button"
                              className="btn-remove"
                              onClick={() => removeExerciseFromWorkout(ex.exercise_id)}
                            >
                              ×
                            </button>
                          </div>
                          <div className="exercise-params">
                            <div>
                              <label>Sets</label>
                              <input
                                type="number"
                                min="1"
                                value={ex.sets}
                                onChange={(e) => updateExerciseDetails(ex.exercise_id, 'sets', e.target.value)}
                                className="form-input-sm"
                              />
                            </div>
                            <div>
                              <label>Reps</label>
                              <input
                                type="number"
                                min="1"
                                value={ex.reps}
                                onChange={(e) => updateExerciseDetails(ex.exercise_id, 'reps', e.target.value)}
                                className="form-input-sm"
                              />
                            </div>
                            <div>
                              <label>Rest (sec)</label>
                              <input
                                type="number"
                                min="0"
                                value={ex.rest_seconds}
                                onChange={(e) => updateExerciseDetails(ex.exercise_id, 'rest_seconds', e.target.value)}
                                className="form-input-sm"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary">
                  {selectedWorkout ? 'Update' : 'Create'} Workout Plan
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
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

export default WorkoutPlans;
