import React, { useState, useEffect } from 'react';
import api from '../services/api';

const ExerciseLibrary = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    muscle_group: [],
    equipment_needed: [],
    difficulty_level: 'beginner',
    instructions: ''
  });

  useEffect(() => {
    loadExercises();
  }, []);

  useEffect(() => {
    filterExercises();
  }, [searchTerm, selectedMuscle, selectedDifficulty, exercises]);

  const loadExercises = async () => {
    try {
      const response = await api.get('/exercises?limit=100');
      setExercises(response.data || []);
    } catch (error) {
      console.error('Failed to load exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ex.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedMuscle !== 'all') {
      filtered = filtered.filter(ex =>
        ex.muscle_group?.includes(selectedMuscle)
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(ex =>
        ex.difficulty_level === selectedDifficulty
      );
    }

    setFilteredExercises(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedExercise) {
        await api.put(`/exercises/${selectedExercise.id}`, formData);
      } else {
        await api.post('/exercises', formData);
      }
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        muscle_group: [],
        equipment_needed: [],
        difficulty_level: 'beginner',
        instructions: ''
      });
      setSelectedExercise(null);
      loadExercises();
    } catch (error) {
      console.error('Failed to save exercise:', error);
      alert('Failed to save exercise');
    }
  };

  const handleEdit = (exercise) => {
    setSelectedExercise(exercise);
    setFormData({
      name: exercise.name || '',
      description: exercise.description || '',
      muscle_group: exercise.muscle_group || [],
      equipment_needed: exercise.equipment_needed || [],
      difficulty_level: exercise.difficulty_level || 'beginner',
      instructions: exercise.instructions || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await api.delete(`/exercises/${id}`);
        loadExercises();
      } catch (error) {
        console.error('Failed to delete exercise:', error);
        alert('Failed to delete exercise');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading exercises...</div>;
  }

  return (
    <div className="exercise-library">
      <div className="page-header">
        <div>
          <h1 className="page-title">Exercise Library</h1>
          <p className="page-subtitle">Manage your exercise database</p>
        </div>
        <button
          className="btn-primary"
          style={{ width: 'auto' }}
          onClick={() => {
            setSelectedExercise(null);
            setFormData({
              name: '',
              description: '',
              muscle_group: [],
              equipment_needed: [],
              difficulty_level: 'beginner',
              instructions: ''
            });
            setShowModal(true);
          }}
        >
          + Add Exercise
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="filters">
          <input
            type="text"
            className="form-input"
            placeholder="Search exercises..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: '300px' }}
          />
          <select
            className="form-select"
            value={selectedMuscle}
            onChange={(e) => setSelectedMuscle(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Muscle Groups</option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="legs">Legs</option>
            <option value="shoulders">Shoulders</option>
            <option value="arms">Arms</option>
            <option value="core">Core</option>
          </select>
          <select
            className="form-select"
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Exercise Grid */}
      {filteredExercises.length > 0 ? (
        <div className="exercise-grid">
          {filteredExercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              <div className="exercise-header">
                <h3 className="exercise-name">{exercise.name}</h3>
                <span className={`badge badge-${
                  exercise.difficulty_level === 'beginner' ? 'success' :
                  exercise.difficulty_level === 'intermediate' ? 'warning' :
                  'danger'
                }`}>
                  {exercise.difficulty_level}
                </span>
              </div>
              <p className="exercise-description">{exercise.description}</p>
              <div className="exercise-tags">
                {exercise.muscle_group?.map((muscle, idx) => (
                  <span key={idx} className="tag">{muscle}</span>
                ))}
              </div>
              <div className="exercise-equipment">
                <strong>Equipment:</strong> {exercise.equipment_needed?.join(', ') || 'None'}
              </div>
              <div className="exercise-actions">
                <button
                  className="btn-secondary"
                  onClick={() => handleEdit(exercise)}
                >
                  Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(exercise.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <p>No exercises found</p>
          <button
            className="btn-primary"
            style={{ marginTop: '1rem', width: 'auto' }}
            onClick={() => setShowModal(true)}
          >
            Create Your First Exercise
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {selectedExercise ? 'Edit Exercise' : 'Add New Exercise'}
              </h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Exercise Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
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
              <div className="form-group">
                <label className="form-label">Muscle Groups (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.muscle_group.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    muscle_group: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., chest, triceps"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Equipment (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.equipment_needed.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    equipment_needed: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g., barbell, bench"
                />
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
                <label className="form-label">Instructions</label>
                <textarea
                  className="form-input"
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  rows="4"
                  placeholder="Step-by-step instructions..."
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn-primary">
                  {selectedExercise ? 'Update' : 'Create'} Exercise
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

export default ExerciseLibrary;
