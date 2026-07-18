import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { changePassword } from '../api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const email = query.get('email') || '';
  const token = query.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return alert('Enter both password fields.');
    if (newPassword !== confirmPassword) return alert('Passwords do not match.');

    setIsLoading(true);
    try {
      const response = await changePassword(email, newPassword, token);
      setIsLoading(false);
      alert(response.message || 'Password updated successfully.');
      navigate('/login');
    } catch (error) {
      setIsLoading(false);
      alert(error.response?.message || 'Unable to reset password.');
    }
  };

  if (!email || !token) {
    return (
      <div style={containerStyle}>
        <div style={formStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff6b6b' }}>Invalid reset link</h2>
          <p style={{ color: '#ccc' }}>The reset link is missing email or token data. Please use the password reset email link again.</p>
          <button onClick={() => navigate('/login')} style={btnStyle}>Return to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={formStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#add8e6' }}>Reset Password</h2>
        <p style={{ marginBottom: '20px', color: '#ccc' }}>Enter a new password for <strong>{email}</strong>.</p>

        <div style={inputGroup}>
          <label style={labelStyle}>New Password</label>
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={inputStyle} />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={inputStyle} />
        </div>

        <button type="submit" disabled={isLoading} style={{ ...btnStyle, background: isLoading ? '#444' : '#00008B' }}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p style={{ marginTop: '20px', textAlign: 'center', color: '#aaa' }}>
          Back to <span onClick={() => navigate('/login')} style={{ color: '#00ff00', cursor: 'pointer' }}>Login</span>
        </p>
      </form>
    </div>
  );
};

const containerStyle = { height: '100vh', background: 'linear-gradient(to bottom, #000033, #000000)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' };
const formStyle = { padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 0 25px rgba(0,0,255,0.4)', width: '380px' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', color: '#add8e6', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: '#000', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default ResetPassword;
