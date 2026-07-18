import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, recoverPassword } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const inputEmail = email.trim().toLowerCase();
    const inputPass = password.trim();

    try {
      const response = await loginUser(inputEmail, inputPass);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setIsLoading(false);

      if (response.user.role === 'admin') {
        navigate('/admin-home');
      } else {
        navigate('/home');
      }
    } catch (error) {
      setIsLoading(false);
      alert(error.response?.message || 'Invalid Email or Password. Please try again.');
    }
  };

  const forgotPassword = async () => {
    const enteredEmail = prompt('Enter your registered email:');
    if (!enteredEmail) return;

    try {
      const response = await recoverPassword(enteredEmail);
      alert(response.message || 'Password reset email sent. Please check your inbox.');
    } catch (error) {
      alert(error.response?.message || 'Unable to send password reset email.');
    }
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#add8e6', letterSpacing: '2px' }}>LOGIN</h2>
        
        <div style={inputGroup}>
          <label style={labelStyle}>Email Address</label>
          <input type="email" placeholder="admin@gmail.com" required style={inputStyle} onChange={(e)=>setEmail(e.target.value)} />
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Password</label>
          <input type="password" placeholder="••••••••" required style={inputStyle} onChange={(e)=>setPassword(e.target.value)} />
        </div>

        <button type="submit" disabled={isLoading} style={{ ...btnStyle, background: isLoading ? '#444' : '#00008B' }}>
          {isLoading ? 'Verifying...' : 'Login'}
        </button>

        <div style={{ marginTop: '20px', fontSize: '13px', textAlign: 'center' }}>
          <span onClick={forgotPassword} style={{ cursor: 'pointer', color: '#add8e6', textDecoration: 'underline' }}>Forgot Password?</span>
          <p>New here? <span onClick={() => navigate('/signup')} style={{ color: '#00ff00', fontWeight: 'bold', cursor: 'pointer' }}>Create Account</span></p>
        </div>
      </form>
    </div>
  );
};

// --- STYLES (NO CHANGES) ---
const containerStyle = { height: '100vh', background: 'linear-gradient(to bottom, #000033, #000000)', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white' };
const formStyle = { padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '15px', boxShadow: '0 0 25px rgba(0,0,255,0.4)', width: '380px' };
const inputGroup = { marginBottom: '15px' };
const labelStyle = { fontSize: '12px', color: '#add8e6', display: 'block', marginBottom: '5px' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: '#000', boxSizing: 'border-box' };
const btnStyle = { width: '100%', padding: '12px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' };

export default Login;