import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, ShieldAlert } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSignup = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = signup(name, email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="glass-panel auth-card animate-fade-in">
        <div className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem' }}>
          <UserPlus size={32} />
          Deployment App
        </div>
        
        <h2 style={{ textAlign: 'center', marginBottom: '0.5rem' }}>E.O. Registration</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Register as an Electoral Officer to manage deployments.
        </p>

        {error && (
          <div className="alert alert-error">
            <ShieldAlert size={20} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup}>
          <div className="input-group">
            <label className="input-label" htmlFor="name">Full Name</label>
            <input 
              className="input-field" 
              type="text" 
              id="name" 
              placeholder="e.g. John Doe" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              className="input-field" 
              type="email" 
              id="email" 
              placeholder="e.g. eo@inec.gov.ng" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              className="input-field" 
              type="password" 
              id="password" 
              placeholder="••••••••" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.875rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register as E.O.'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}
