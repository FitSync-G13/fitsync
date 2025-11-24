import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/auth/LoginForm';
import ClientDashboard from './components/dashboard/ClientDashboard';
import TrainerDashboard from './components/dashboard/TrainerDashboard';
import './index.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Main Layout Component
const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  if (!user) {
    return children;
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            FitSync
          </Link>
          <div className="navbar-user">
            <span style={{ marginRight: '1rem' }}>
              {user.first_name} {user.last_name} ({user.role})
            </span>
            <button onClick={logout} className="btn-logout">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="main-layout">
        <aside className="sidebar">
          <ul className="sidebar-nav">
            <li>
              <Link to="/dashboard" className="active">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </Link>
            </li>

            {(user.role === 'trainer' || user.role === 'admin') && (
              <>
                <li>
                  <Link to="/exercises">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Exercises
                  </Link>
                </li>
                <li>
                  <Link to="/workouts">
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    Workouts
                  </Link>
                </li>
              </>
            )}

            <li>
              <Link to="/bookings">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Bookings
              </Link>
            </li>

            {user.role === 'client' && (
              <li>
                <Link to="/progress">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                  </svg>
                  Progress
                </Link>
              </li>
            )}
          </ul>
        </aside>

        <main className="content">{children}</main>
      </div>
    </div>
  );
};

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (user.role === 'client') {
    return <ClientDashboard />;
  } else if (user.role === 'trainer') {
    return <TrainerDashboard />;
  } else if (user.role === 'admin') {
    return <TrainerDashboard />; // Admin sees trainer dashboard for now
  } else if (user.role === 'gym_owner') {
    return <TrainerDashboard />; // Gym owner sees trainer dashboard
  }

  return <div>Invalid user role</div>;
};

// Simple pages for routes
const ExercisesPage = () => (
  <div className="card">
    <h1 className="card-title">Exercise Library</h1>
    <p>Exercise management coming soon. Use API directly for now.</p>
  </div>
);

const WorkoutsPage = () => (
  <div className="card">
    <h1 className="card-title">Workout Plans</h1>
    <p>Workout management coming soon. Use API directly for now.</p>
  </div>
);

const BookingsPage = () => (
  <div className="card">
    <h1 className="card-title">Bookings</h1>
    <p>Booking management coming soon. Use API directly for now.</p>
  </div>
);

const ProgressPage = () => (
  <div className="card">
    <h1 className="card-title">My Progress</h1>
    <p>Progress tracking coming soon. Use API directly for now.</p>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginForm />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exercises"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <ExercisesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/workouts"
              element={
                <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                  <WorkoutsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <BookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ProgressPage />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
