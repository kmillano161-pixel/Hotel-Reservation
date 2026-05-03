import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';

const Registration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await register(name, email, password, phone);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '80vh',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0
          }}>
            Register
          </h1>
          <p style={{ color: '#64748b', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>
            Create your account
          </p>
        </div>

        {success ? (
          <div style={{
            padding: '1rem',
            backgroundColor: '#ecfdf5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            color: '#059669',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            Registration successful! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fafbff',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fafbff',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+63 912 345 6789"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fafbff',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fafbff',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
                minLength={6}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: '600',
                color: '#374151',
                fontSize: '0.95rem'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  transition: 'border-color 0.2s',
                  backgroundColor: '#fafbff',
                  color: 'black'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                required
              />
            </div>

            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#dc2626',
                textAlign: 'center',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1.25rem',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1.15rem',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 20px 0 rgba(16, 185, 129, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 14px 0 rgba(16, 185, 129, 0.4)';
                }
              }}
            >
              {loading ? 'Creating Account...' : 'Register'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p style={{ color: '#64748b', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#10b981', fontWeight: '600', textDecoration: 'none' }}>
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
