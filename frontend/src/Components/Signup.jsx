import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { signupUser } from '../api';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullname: '', email: '', phone: '', pass: '', confirmPass: '' });
  const [captchaText, setCaptchaText] = useState('');
  const [userInputCaptcha, setUserInputCaptcha] = useState('');

  useEffect(() => { 
    emailjs.init('YOUR_PUBLIC_KEY'); // <--- REPLACE THIS
    generateCaptcha(); 
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) { result += chars.charAt(Math.floor(Math.random() * chars.length)); }
    setCaptchaText(result);
  };

  const getStrength = (password) => {
    let s = 0;
    if (password.length > 5) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.pass !== formData.confirmPass) { alert('Passwords do not match!'); return; }
    if (userInputCaptcha !== captchaText) { alert('Invalid Captcha!'); generateCaptcha(); return; }

    try {
      await signupUser(formData.fullname, formData.email, formData.phone, formData.pass);

      const templateParams = {
        to_name: formData.fullname,
        user_email: formData.email,
        message: 'Welcome to Eventhub! Your account has been successfully created.',
        from_name: 'Eventhub Team'
      };

      emailjs.send('YOUR_SERVICE_ID', 'YOUR_WELCOME_TEMPLATE_ID', templateParams)
        .then(() => console.log('Welcome email sent successfully!'))
        .catch((err) => console.log('FAILED to send email:', err));

      alert('Registration Successful! Now please login.');
      navigate('/login');
    } catch (error) {
      alert(error.response?.message || 'Registration failed. Please try again.');
    }
  };

  const strength = getStrength(formData.pass);
  const colors = ['#333', '#ff4d4d', '#ffd700', '#2ecc71', '#00ff00'];

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSignup} style={formStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#add8e6' }}>Create Account</h2>
        <input style={inputStyle} type="text" placeholder="Full Name" required onChange={(e) => setFormData({...formData, fullname: e.target.value})} />
        <input style={inputStyle} type="email" placeholder="Email Address" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input style={inputStyle} type="tel" placeholder="Phone (10 digits)" required onChange={(e) => setFormData({...formData, phone: e.target.value})} />
        <input style={inputStyle} type="password" placeholder="Password" required onChange={(e) => setFormData({...formData, pass: e.target.value})} />
        <div style={{ height: '8px', width: '100%', background: '#333', borderRadius: '10px', overflow: 'hidden', marginTop: '-5px' }}>
          <div style={{ height: '100%', width: `${(strength / 4) * 100}%`, background: colors[strength], transition: 'width 0.4s' }}></div>
        </div>
        <input style={inputStyle} type="password" placeholder="Confirm Password" required onChange={(e) => setFormData({...formData, confirmPass: e.target.value})} />
        <div style={{ marginTop: '15px' }}>
          <div style={{ background: '#ddd', color: '#00008B', padding: '10px', textAlign: 'center', fontWeight: 'bold', letterSpacing: '8px', borderRadius: '5px' }}>{captchaText}</div>
          <input style={inputStyle} type="text" placeholder="Type Captcha" required onChange={(e) => setUserInputCaptcha(e.target.value.toUpperCase())} />
        </div>
        <button type="submit" style={{ width: '100%', padding: '12px', background: '#00008B', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' }}>Register Now</button>
        <p style={{ textAlign: 'center', marginTop: '15px' }}>Already have an account? <span onClick={() => navigate('/login')} style={{ color: '#add8e6', cursor: 'pointer' }}>Login</span></p>
      </form>
    </div>
  );
};

const containerStyle = { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to bottom, #000033, #000000)', color: 'white', padding: '20px' };
const formStyle = { width: '100%', maxWidth: '450px', padding: '30px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '15px', border: '1px solid #00008B' };
const inputStyle = { width: '100%', padding: '12px', margin: '10px 0', borderRadius: '5px', border: 'none' };

export default Signup;