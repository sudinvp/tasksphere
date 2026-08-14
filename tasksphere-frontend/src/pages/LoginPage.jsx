import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, Button } from '../components/ui';
import './Auth.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Could not sign in. Check your email and password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <Card className="auth-card">
        <div className="auth-brand">
          <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="2" fill="currentColor" />
            <ellipse cx="9" cy="9" rx="7.5" ry="3.5" stroke="currentColor" strokeWidth="1.4" />
            <ellipse cx="9" cy="9" rx="3.5" ry="7.5" stroke="currentColor" strokeWidth="1.4" transform="rotate(45 9 9)" />
          </svg>
          <span>TaskSphere</span>
        </div>

        <h1>Welcome back</h1>
        <p className="auth-subtitle">Sign in to see what's moving across your projects.</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <Button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <div className="auth-hint">
          Default admin: admin@tasksphere.local / ChangeMe123!
        </div>

        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
