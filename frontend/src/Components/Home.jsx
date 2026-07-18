import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { fetchRegistrations, deleteRegistration } from '../api';

export const categories = [
  { id: 1, name: "Education Events", image: "https://images.pexels.com/photos/1206101/pexels-photo-1206101.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Conferences", "Seminars", "Workshops", "Guest Lectures"] },
  { id: 2, name: "Office & Company Events", image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Meetings", "Product Launches", "Training Programs", "Team Activities"] },
  { id: 3, name: "Music & Arts Events", image: "https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Music Concerts", "Dance Shows", "Drama / Plays", "Art Exhibitions"] },
  { id: 4, name: "Sports & Games Events", image: "https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Sports Tournaments", "Matches", "Marathons", "Fitness Camps"] },
  { id: 5, name: "Family & Social Events", image: "https://images.pexels.com/photos/3184191/pexels-photo-3184191.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Birthday Parties", "Weddings", "Anniversary Celebrations", "Reunions"] },
  { id: 6, name: "Technology Events", image: "https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Hackathons", "Coding Contests", "Tech Talks", "Bootcamps"] },
  { id: 7, name: "Online Events", image: "https://images.pexels.com/photos/4050312/pexels-photo-4050312.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Webinars", "Online Workshops", "Virtual Meetings", "Live Streams"] },
  { id: 8, name: "College Events", image: "https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Freshers’ Day", "Farewell Party", "Annual Day", "Cultural Fest"] },
  { id: 9, name: "Community Service Events", image: "https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Charity Programs", "Blood Donation Camps", "Awareness Drives", "Clean-up Programs"] },
  { id: 10, name: "Public & Government Events", image: "https://images.pexels.com/photos/2833072/pexels-photo-2833072.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Public Meetings", "Government Programs", "Awareness Campaigns", "Training Sessions"] },
  { id: 11, name: "Religious & Spiritual Events", image: "https://images.pexels.com/photos/2351722/pexels-photo-2351722.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Prayer Meetings", "Festival Celebrations", "Spiritual Talks", "Poojas"] },
  { id: 12, name: "Business & Startup Events", image: "https://images.pexels.com/photos/7063778/pexels-photo-7063778.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Startup Pitch Events", "Business Meetups", "Investor Meetings", "Networking Events"] },
  { id: 13, name: "Health & Fitness Events", image: "https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Yoga Sessions", "Health Check-up Camps", "Fitness Workshops", "Meditation Programs"] },
  { id: 14, name: "Entertainment & Fun Events", image: "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Movie Shows", "Talent Shows", "Comedy Shows", "DJ Nights"] },
  { id: 15, name: "Personal & Family Functions", image: "https://images.pexels.com/photos/580489/pexels-photo-580489.jpeg?auto=compress&cs=tinysrgb&w=600", sub: ["Baby Showers", "Naming Ceremonies", "Housewarming Functions", "Retirement Parties"] }
];

const Home = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [myBookings, setMyBookings] = useState([]);
  
  const user = JSON.parse(localStorage.getItem('currentUser')) || { fullname: 'Guest User', email: 'guest@example.com' };

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const allBookings = await fetchRegistrations(user.email);
        setMyBookings(allBookings);
      } catch (error) {
        console.error(error);
      }
    };
    loadBookings();
  }, [activeTab, user.email]);

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel and delete this event registration from your history?')) return;
    try {
      await deleteRegistration(id);
      setMyBookings(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      alert(error.response?.message || 'Failed to delete booking.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const downloadReceipt = (b) => {
    const doc = new jsPDF();
    doc.setFillColor(0, 0, 139); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("EVENTHUB OFFICIAL RECEIPT", 105, 25, { align: 'center' });
    
    doc.autoTable({
      startY: 50,
      head: [['Field', 'Details']],
      body: [
        ['Booking ID', b.id],
        ['User Name', b.userName],
        ['Category', b.category],
        ['Event Type', b.event],
        ['Event Date', b.bookingDate],
        ['Total Bill', b.totalBill || b.amount],
        ['Amount Paid', b.amount],
        ['Payment Method', b.paymentMethod || 'N/A'],
        ['Status', b.status]
      ],
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 139] }
    });
    doc.save(`Receipt_${b.id}.pdf`);
  };

  const downloadItems = (b) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Selected Food Items List", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Event: ${b.category} - ${b.event}`, 14, 30);
    doc.text(`Date: ${b.bookingDate}`, 14, 37);

    const items = b.items || [];
    const rows = items.map(item => [item.category || 'Food', item.name]);

    doc.autoTable({
      startY: 45,
      head: [['Category', 'Item Name']],
      body: rows.length > 0 ? rows : [['-', 'No specific items selected']],
      theme: 'striped'
    });
    doc.save(`Food_Items_${b.id}.pdf`);
  };

  return (
    <div style={layout}>
      <div style={sidebar}>
        <div style={logoContainer}><h2 style={logoText}>EVENTHUB</h2></div>
        <div onClick={() => setActiveTab('home')} style={activeTab === 'home' ? activeTabStyle : tab}>🏠 Home</div>
        <div onClick={() => setActiveTab('history')} style={activeTab === 'history' ? activeTabStyle : tab}>📜 My History</div>
        
        {/* Logout button placed precisely under side navigation menu options */}
        <div onClick={handleLogout} style={sidebarLogoutTab}>🚪 Logout</div>
      </div>

      <div style={content}>
        <div style={topBar}>
          <h3 style={{ color: '#add8e6', fontWeight: '700' }}>{activeTab === 'home' ? 'Dashboard' : 'My Bookings'}</h3>
          <div style={{ position: 'relative' }}>
            <div style={profileBtn} onClick={() => setShowProfile(!showProfile)}>
              <span>{user.fullname}</span>
              <div style={avatar}>{user.fullname[0]}</div>
            </div>
            {showProfile && (
              <div style={profileDropdown}>
                <div style={largeAvatar}>{user.fullname[0]}</div>
                <h4 style={{textAlign:'center', color: '#fff', margin: '10px 0 5px'}}>{user.fullname}</h4>
                <p style={{textAlign:'center', fontSize: '12px', color: '#888', margin: '0 0 5px'}}>{user.email}</p>
              </div>
            )}
          </div>
        </div>

        <div style={scrollArea}>
          {activeTab === 'home' ? (
            <div style={grid}>
              {categories.map(cat => (
                <div key={cat.id} onClick={() => navigate(`/event/${cat.id}`)} style={card}>
                  <img src={cat.image} alt={cat.name} style={img} />
                  <div style={cardOverlay}><div style={cardTitle}>{cat.name}</div></div>
                </div>
              ))}
            </div>
          ) : (
            <div style={historyCard}>
              <h2 style={{ color: '#add8e6', marginBottom: '25px', fontWeight: '700' }}>Your Booking History</h2>
              {myBookings.length > 0 ? (
                <div style={{overflowX: 'auto'}}>
                  <table style={table}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #00008B', color: '#add8e6' }}>
                        <th style={th}>Event Category</th>
                        <th style={th}>Date</th>
                        <th style={th}>Amount Paid</th>
                        <th style={th}>Status</th>
                        <th style={th}>Downloads</th>
                        <th style={th}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBookings.map((b, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={td}>{b.category}</td>
                          <td style={td}>{b.bookingDate}</td>
                          <td style={td}>{b.amount}</td>
                          <td style={td}>
                            <span style={{
                              color: b.status === 'Accepted' ? '#2ecc71' : b.status === 'Pending' ? '#f1c40f' : '#e74c3c', 
                              fontWeight: 'bold',
                              background: b.status === 'Accepted' ? 'rgba(46,204,113,0.1)' : b.status === 'Pending' ? 'rgba(241,196,15,0.1)' : 'rgba(231,76,60,0.1)',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              border: `1px solid ${b.status === 'Accepted' ? '#2ecc71' : b.status === 'Pending' ? '#f1c40f' : '#e74c3c'}`
                            }}>
                              {b.status}
                            </span>
                          </td>
                          <td style={td}>
                            <button onClick={() => downloadReceipt(b)} style={pdfBtn}>Receipt 📄</button>
                            <button onClick={() => downloadItems(b)} style={itemPdfBtn}>Items 🍱</button>
                          </td>
                          <td style={td}>
                            <button onClick={() => handleDeleteBooking(b.id)} style={deleteEventBtnStyle}>Delete 🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p style={{textAlign:'center', color:'#666', marginTop: '50px'}}>You haven't booked any events yet.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const layout = { display: 'flex', height: '100vh', background: '#000', color: '#fff', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" };
const sidebar = { width: '260px', background: '#04040c', padding: '25px 20px', borderRight: '1px solid rgba(0,0,139,0.5)', display: 'flex', flexDirection: 'column' };
const logoContainer = { borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '30px', paddingBottom: '20px' };
const logoText = { color: '#add8e6', textAlign: 'center', letterSpacing: '4px', fontWeight: '900', margin: 0 };
const tab = { padding: '14px 18px', cursor: 'pointer', borderRadius: '12px', marginBottom: '10px', color: '#999', transition: '0.3s', fontWeight: '500' };
const activeTabStyle = { ...tab, background: 'rgba(0,0,139,0.3)', color: '#fff', borderLeft: '4px solid #add8e6' };

// Clean sidebar styling option matching original view styles for logout
const sidebarLogoutTab = { ...tab, color: '#e74c3c', marginTop: '10px' };

const content = { flex: 1, display: 'flex', flexDirection: 'column', backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url("https://images.pexels.com/photos/2263436/pexels-photo-2263436.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', backgroundSize: 'cover', backgroundAttachment: 'fixed' };
const topBar = { padding: '0 40px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(5, 5, 5, 0.6)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.05)' };
const profileBtn = { display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '8px 18px', borderRadius: '30px', transition: '0.3s' };
const avatar = { width: '32px', height: '32px', borderRadius: '50%', background: '#00008B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff' };
const profileDropdown = { position: 'absolute', right: 0, top: '55px', background: '#0a0a10', padding: '25px', borderRadius: '15px', border: '1px solid rgba(0,0,139,0.6)', zIndex: 9999, width: '220px', boxShadow: '0 15px 35px rgba(0,0,0,0.8)' };
const largeAvatar = { width: '60px', height: '60px', borderRadius: '50%', background: '#00008B', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' };
const scrollArea = { padding: '40px', overflowY: 'auto', flex: 1 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' };
const card = { position: 'relative', borderRadius: '20px', overflow: 'hidden', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 20px rgba(0,0,0,0.3)', transition: 'transform 0.3s' };
const img = { width: '100%', height: '200px', objectFit: 'cover' };
const cardOverlay = { position: 'absolute', bottom: 0, width: '100%', padding: '20px 15px', background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)' };
const cardTitle = { color: '#add8e6', fontWeight: 'bold', fontSize: '1.1rem' };
const historyCard = { background: 'rgba(10, 10, 20, 0.7)', backdropFilter: 'blur(15px)', padding: '35px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' };
const table = { width: '100%', borderCollapse: 'collapse' };
const th = { textAlign: 'left', padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', fontSize: '0.95rem' };
const td = { padding: '15px', fontSize: '0.9rem', color: '#ddd' };
const pdfBtn = { padding: '8px 14px', background: '#fff', color: '#000', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginRight: '8px', fontSize: '0.8rem' };
const itemPdfBtn = { ...pdfBtn, background: '#add8e6', marginRight: 0 };
const deleteEventBtnStyle = { padding: '8px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' };

export default Home;