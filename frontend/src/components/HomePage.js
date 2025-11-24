import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="homepage">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Transform Your Fitness Journey with <span className="gradient-text">FitSync</span>
          </h1>
          <p className="hero-subtitle">
            Professional personal training management platform for trainers, clients, and gym owners
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn-hero-primary">
              Get Started
            </Link>
            <a href="#features" className="btn-hero-secondary">
              Learn More
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="feature-card-float">
            <div className="stat-mini">
              <div className="stat-icon">💪</div>
              <div>
                <div className="stat-number">1000+</div>
                <div className="stat-label">Active Users</div>
              </div>
            </div>
          </div>
          <div className="feature-card-float" style={{animationDelay: '0.2s'}}>
            <div className="stat-mini">
              <div className="stat-icon">🎯</div>
              <div>
                <div className="stat-number">5000+</div>
                <div className="stat-label">Workouts Completed</div>
              </div>
            </div>
          </div>
          <div className="feature-card-float" style={{animationDelay: '0.4s'}}>
            <div className="stat-mini">
              <div className="stat-icon">⭐</div>
              <div>
                <div className="stat-number">4.9/5</div>
                <div className="stat-label">Client Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="section-header">
          <h2 className="section-title">Everything You Need</h2>
          <p className="section-subtitle">Powerful features for fitness professionals and enthusiasts</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3 className="feature-title">Smart Scheduling</h3>
            <p className="feature-description">
              Book sessions, manage availability, and never miss an appointment with our intelligent scheduling system.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Progress Tracking</h3>
            <p className="feature-description">
              Monitor body metrics, workout logs, and achievements with comprehensive analytics and visualizations.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏋️</div>
            <h3 className="feature-title">Workout Library</h3>
            <p className="feature-description">
              Access hundreds of exercises with detailed instructions, create custom workout plans, and track performance.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3 className="feature-title">Client Management</h3>
            <p className="feature-description">
              Trainers can manage multiple clients, create personalized programs, and track client progress in real-time.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔔</div>
            <h3 className="feature-title">Notifications</h3>
            <p className="feature-description">
              Stay informed with real-time notifications for bookings, achievements, and important updates.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📈</div>
            <h3 className="feature-title">Analytics Dashboard</h3>
            <p className="feature-description">
              Gain insights with detailed analytics, performance metrics, and data-driven recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="roles">
        <div className="section-header">
          <h2 className="section-title">Built for Everyone</h2>
          <p className="section-subtitle">Different tools for different roles</p>
        </div>
        <div className="roles-grid">
          <div className="role-card">
            <div className="role-icon">👨‍🏫</div>
            <h3 className="role-title">For Trainers</h3>
            <ul className="role-features">
              <li>Manage client schedules</li>
              <li>Create custom workout plans</li>
              <li>Track client progress</li>
              <li>Exercise library management</li>
              <li>Session notes and feedback</li>
            </ul>
          </div>
          <div className="role-card">
            <div className="role-icon">🏃</div>
            <h3 className="role-title">For Clients</h3>
            <ul className="role-features">
              <li>Book training sessions</li>
              <li>Track workouts and metrics</li>
              <li>View personalized programs</li>
              <li>Monitor achievements</li>
              <li>Communicate with trainers</li>
            </ul>
          </div>
          <div className="role-card">
            <div className="role-icon">🏢</div>
            <h3 className="role-title">For Gym Owners</h3>
            <ul className="role-features">
              <li>Manage gym operations</li>
              <li>Oversee trainer performance</li>
              <li>Track revenue and analytics</li>
              <li>Client retention insights</li>
              <li>Facility management</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Fitness Business?</h2>
          <p className="cta-subtitle">Join thousands of fitness professionals using FitSync</p>
          <Link to="/login" className="btn-cta">
            Start Your Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">FitSync</h3>
            <p className="footer-text">
              Your complete fitness management solution
            </p>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Product</h4>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="#pricing">Pricing</a></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#careers">Careers</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#help">Help Center</a></li>
              <li><a href="#docs">Documentation</a></li>
              <li><a href="#api">API</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 FitSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
