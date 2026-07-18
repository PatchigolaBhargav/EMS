import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate('/login'), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={containerStyle}>
      <div style={backgroundLayerStyle} />
      <div style={overlayStyle} />

      <div style={contentWrapperStyle}>
        <h1 style={titleStyle}>
          Welcome to 
          <div style={brandNameStyle}>
            All Event Management System
          </div>
        </h1>

        <div style={progressTrackStyle}>
          <div style={progressBarStyle} />
        </div>
        
        <p style={loadingTextStyle}>Initializing Dashboard...</p>
      </div>

      <style>
        {`
          @keyframes zoomBackground {
            from { transform: scale(1); }
            to { transform: scale(1.15); }
          }
          @keyframes fadeInDown { 
            from { opacity: 0; transform: translateY(-40px); } 
            to { opacity: 1; transform: translateY(0); } 
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          @keyframes glowText {
            from { text-shadow: 0 0 10px rgba(173, 216, 230, 0.4); }
            to { text-shadow: 0 0 30px rgba(173, 216, 230, 0.9), 0 0 50px rgba(0, 0, 139, 0.6); }
          }
          @keyframes loadingProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
          @keyframes pulseText {
            0% { opacity: 0.4; }
            50% { opacity: 1; }
            100% { opacity: 0.4; }
          }
        `}
      </style>
    </div>
  );
};

const containerStyle = {
  height: '100vh', 
  width: '100vw', 
  display: 'flex', 
  flexDirection: 'column',
  justifyContent: 'center', 
  alignItems: 'center', 
  position: 'relative',
  overflow: 'hidden', 
  fontFamily: "'Poppins', sans-serif", 
  color: 'white', 
  textAlign: 'center',
  backgroundColor: '#000'
};

const backgroundLayerStyle = {
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%',
  backgroundImage: 'url("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  animation: 'zoomBackground 15s infinite alternate ease-in-out',
  zIndex: -2
};

const overlayStyle = {
  position: 'absolute', 
  top: 0, 
  left: 0, 
  width: '100%', 
  height: '100%',
  background: 'radial-gradient(circle, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%)',
  zIndex: -1
};

const contentWrapperStyle = {
  zIndex: 1, 
  padding: '60px 80px', 
  borderRadius: '40px',
  background: 'rgba(5, 5, 15, 0.65)', 
  backdropFilter: 'blur(15px)',
  border: '1px solid rgba(255, 255, 255, 0.12)',
  boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,139,0.2)',
  animation: 'fadeInDown 1.5s ease-out, float 5s infinite ease-in-out'
};

const titleStyle = { 
  fontSize: '1.4rem', 
  fontWeight: '300', 
  margin: 0, 
  textTransform: 'uppercase', 
  letterSpacing: '8px',
  color: '#ffffff'
};

const brandNameStyle = {
  fontSize: '3.8rem', 
  fontWeight: '900', 
  color: '#add8e6', 
  marginTop: '15px', 
  animation: 'glowText 3s infinite alternate ease-in-out',
  lineHeight: '1.1',
  letterSpacing: '2px'
};

const progressTrackStyle = {
  width: '100%', 
  height: '8px', 
  background: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '20px', 
  marginTop: '45px', 
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.05)'
};

const progressBarStyle = {
  height: '100%', 
  background: 'linear-gradient(90deg, #00ff00, #b4ffd0)',
  boxShadow: '0 0 20px #00ff00', 
  width: '0%',
  animation: 'loadingProgress 5s linear forwards'
};

const loadingTextStyle = {
  marginTop: '25px', 
  fontSize: '0.85rem', 
  letterSpacing: '5px',
  textTransform: 'uppercase', 
  color: '#00ff00',
  fontWeight: 'bold',
  animation: 'pulseText 2s infinite ease-in-out'
};

export default Welcome;