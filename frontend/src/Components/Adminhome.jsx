import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { fetchRegistrations, updateRegistration, deleteRegistration } from '../api';

const categories = [
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

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('manage');
  const [view, setView] = useState('grid');
  const [registrations, setRegistrations] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [bookingDetails, setBookingDetails] = useState({
    customerName: '', customerEmail: '', eventDate: '', 
    paymentMethod: 'Cash on Delivery'
  });

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('currentUser'));
    if (!session || session.role !== 'admin') {
      window.location.replace('/login');
      return;
    }
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchRegistrations();
      setRegistrations([...data].reverse());
    } catch (error) {
      console.error(error);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateRegistration(id, { status });
      setRegistrations(prev => prev.map(r => (r.id === id ? { ...r, status } : r)).reverse());
      if (status === 'Completed') {
        alert(`Event ${id} updated to Completed. Redirecting to History Cell...`);
        setActiveTab('history');
      }
    } catch (error) {
      alert(error.response?.message || 'Failed to update status.');
    }
  };

  const deletePermanently = async (id) => {
    if (!window.confirm('Do you want to completely delete this historical record item permanently?')) return;
    try {
      await deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id).reverse());
    } catch (error) {
      alert(error.response?.message || 'Failed to delete record.');
    }
  };

  // --- UPDATED RETRIEVAL FOR SELECTED FOOD ITEMS IN PDF FORMAT ---
  const handleDownloadItemsPDF = (reg) => {
    const doc = new jsPDF();
    
    // Top Brand Banner Accent Block
    doc.setFillColor(39, 174, 96); 
    doc.rect(0, 0, 210, 42, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("KITCHEN ORDER LIST", 15, 26);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order Reference: ${reg.id}`, 145, 18);
    doc.text(`Booking Target Date: ${reg.bookingDate || 'N/A'}`, 145, 28);

    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Production Mapping Meta Details:", 15, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Client Owner Account: ${reg.userName}`, 15, 65);
    doc.text(`Registered Event Operation: ${reg.event}`, 15, 73);

    // Dynamic Safe Array Mapping for any schema setup passed down from the Menu
    const items = reg.selectedFoodItems || reg.selectedFood || reg.selectedItems || [];
    
    let tableData = [];
    if (items && items.length > 0) {
        tableData = items.map((item, idx) => {
            // Checks if item is structured object { name, category } or a plain text fallback string
            const itemName = typeof item === 'object' && item !== null ? (item.name || item.itemName || 'Unnamed Item') : item;
            const itemCategory = typeof item === 'object' && item !== null ? (item.category || item.subName || 'General Menu') : 'General Menu';
            
            return [
                idx + 1, 
                itemName, 
                itemCategory,
                "Standard Batch Serving"
            ];
        });
    } else {
        tableData = [["1", "No specific items selected (Using Base Package Plan)", "Default Plan", "Default serving count"]];
    }

    doc.autoTable({
      startY: 82,
      head: [['Index Reference', 'Food Item Label Name', 'Category Group', 'Portion Directives']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 },
      columnStyles: {
        0: { width: 35 },
        1: { fontStyle: 'bold' }
      }
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Auto Multi-page bounds confirmation handling
    if (finalY < 270) {
        doc.setFontSize(9);
        doc.setTextColor(130);
        doc.text("Operational System Notice: Re-verify standard production capacity criteria before execution parameters commence.", 15, finalY);
    }

    doc.save(`Kitchen_Items_Report_${reg.id}.pdf`);
  };

  const handlePrintDetailedReceipt = (reg) => {
    const doc = new jsPDF();
    doc.setFillColor(0, 0, 139);
    doc.rect(0, 0, 210, 42, 'F');
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("EVENT TRANSACTION RECEIPT", 15, 26);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`System Receipt #: ${reg.id}`, 145, 18);
    doc.text(`Timestamp Issued: ${new Date().toLocaleDateString()}`, 145, 28);

    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOMER ACCOUNT ALLOCATION DETAILS:", 15, 56);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Client Owner Name: ${reg.userName}`, 15, 65);
    doc.text(`Communication Routing: ${reg.userEmail}`, 15, 73);
    doc.text(`Event Execution Timeline Date: ${reg.bookingDate}`, 135, 65);

    const breakdown = [
        ["Assigned Event Domain Category", reg.event],
        ["Current Workflow Assignment Status", reg.status],
        ["Selected Transaction Payment Gateway", reg.paymentMethod || "Online Stripe Processing Gateway"],
        ["Base Log Operational Charges", reg.amount],
        ["Unified GST and Event Tax Setup", "Inclusive on aggregate pricing configuration structure"],
        ["Net Final Settlement Amount Paid", reg.amount]
    ];

    doc.autoTable({
        startY: 84,
        head: [['System Allocation Key Metrics', 'Value Entry References']],
        body: breakdown,
        theme: 'striped',
        styles: { fontSize: 11, cellPadding: 6 },
        headStyles: { fillColor: [0, 0, 139], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: { 0: { fontStyle: 'bold', width: 95 } }
    });

    const finalY = doc.lastAutoTable.finalY + 18;
    doc.setFontSize(10);
    doc.setTextColor(46, 204, 113);
    doc.setFont("helvetica", "bold");
    doc.text("FINANCIAL SETTLEMENT STATUS: TRANSACTION CONFIRMED / BALANCE FULLY RESOLVED", 15, finalY);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("This electronic documentation serves as automated platform evidence of completed financial transaction clearance parameters.", 15, finalY + 9);

    doc.save(`Invoice_${reg.id}.pdf`);
  };

  const handleWalkInSubmit = () => {
    if (!bookingDetails.customerName || !bookingDetails.eventDate) return alert("Fill all fields");
    const newEntry = {
      id: "WALK-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
      event: pendingEvent.event,
      userEmail: bookingDetails.customerEmail || "walkin@system.com",
      userName: bookingDetails.customerName,
      amount: "₹3000", 
      bookingDate: bookingDetails.eventDate,
      selectedFood: [],
      paymentMethod: "Counter Cash",
      status: 'Accepted'
    };
    const existing = JSON.parse(localStorage.getItem('registrations') || '[]');
    localStorage.setItem('registrations', JSON.stringify([...existing, newEntry]));
    loadData();
    alert("Walk-in Booking Registered!");
    setActiveTab('manage');
    setView('grid');
  };

  const groupDataByMonth = (dataList) => {
    const groups = {};
    dataList.forEach(item => {
      let monthLabel = "Unscheduled Date Portfolio";
      if (item.bookingDate) {
        const parsedDate = new Date(item.bookingDate);
        if (!isNaN(parsedDate.getTime())) {
          monthLabel = parsedDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
        }
      }
      if (!groups[monthLabel]) groups[monthLabel] = [];
      groups[monthLabel].push(item);
    });
    return groups;
  };

  const renderSingleTableBody = (data, isHistory) => {
    if (data.length === 0) {
      return <tr><td colSpan="7" style={{textAlign: 'center', padding: '30px', color: '#666'}}>No records found.</td></tr>;
    }
    return data.map(reg => (
      <tr key={reg.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <td style={tdStyle}>
          <div style={{fontWeight: 'bold', color: '#fff'}}>{reg.userName}</div>
          <div style={{fontSize: '0.75rem', color: '#888', marginTop: '2px'}}>{reg.userEmail}</div>
        </td>
        <td style={tdStyle}>
            <div style={{fontWeight: '500'}}>{reg.event}</div>
            <div style={{fontSize: '0.75rem', color: '#666', marginTop: '2px'}}>{reg.bookingDate}</div>
        </td>
        <td style={tdStyle}>
            <div style={{color: '#27ae60', fontWeight: 'bold'}}>{reg.amount}</div>
            <div style={{fontSize: '0.7rem', color: '#aaa', marginTop: '2px'}}>{reg.paymentMethod || "Online"}</div>
        </td>
        <td style={tdStyle}>
            <span style={statusBadge(reg.status === 'Accepted' ? '#2ecc71' : reg.status === 'Pending' ? '#f39c12' : reg.status === 'Completed' ? '#3498db' : '#e74c3c')}>
                {reg.status}
            </span>
        </td>
        {!isHistory && (
          <td style={tdStyle}>
            {reg.status === 'Pending' ? (
                <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={() => updateStatus(reg.id, 'Accepted')} style={accBtn}>Approve</button>
                    <button onClick={() => updateStatus(reg.id, 'Rejected')} style={rejBtn}>Deny</button>
                </div>
            ) : (
              <span style={{color: '#555', fontSize: '0.8rem'}}>Approved</span>
            )}
          </td>
        )}
        
        <td style={tdStyle}>
            {!isHistory ? (
                <button onClick={() => updateStatus(reg.id, 'Completed')} style={completeColumnBtn}>Completed</button>
            ) : (
                <button onClick={() => deletePermanently(reg.id)} style={deleteRecordBtn}>Delete Completely</button>
            )}
        </td>

        <td style={tdStyle}>
            <div style={{display: 'flex', gap: '6px'}}>
                <button onClick={() => handlePrintDetailedReceipt(reg)} style={miniBtn}>Receipt</button>
                <button onClick={() => handleDownloadItemsPDF(reg)} style={miniBtn}>Items</button>
            </div>
        </td>
      </tr>
    ));
  };

  const renderTable = (data, isHistory) => {
    if (!isHistory) {
      return (
        <div style={tableContainer}>
          <h2 style={{ color: '#add8e6', marginBottom: '25px', fontWeight: '800' }}>📋 Live Dashboard</h2>
          <div style={{overflowX: 'auto'}}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #00008B', textAlign: 'left' }}>
                  <th style={thStyle}>Client</th>
                  <th style={thStyle}>Event Info</th>
                  <th style={thStyle}>Payment</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Manage</th>
                  <th style={thStyle}>Completed Event</th>
                  <th style={thStyle}>Detailed PDFs</th>
                </tr>
              </thead>
              <tbody>
                {renderSingleTableBody(data, false)}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    const groupedData = groupDataByMonth(data);
    return (
      <div style={tableContainer}>
        <h2 style={{ color: '#add8e6', marginBottom: '25px', fontWeight: '800' }}>📜 Archived History Cells (Month-Wise View)</h2>
        {Object.keys(groupedData).length === 0 ? (
          <p style={{color: '#666', padding: '20px 0'}}>No matching logs found.</p>
        ) : (
          Object.keys(groupedData).map(monthSection => (
            <div key={monthSection} style={{ marginBottom: '40px', background: 'rgba(255,255,255,0.02)', padding: '25px 20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <h3 style={{ color: '#3498db', marginBottom: '15px', fontSize: '1.25rem', borderBottom: '1px dashed rgba(52,152,219,0.3)', paddingBottom: '8px', fontWeight: '700' }}>
                📅 {monthSection} <span style={{fontSize: '0.9rem', color: '#888', fontWeight: 'normal'}}>({groupedData[monthSection].length} Records)</span>
              </h3>
              <div style={{overflowX: 'auto'}}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #00008B', textAlign: 'left' }}>
                      <th style={thStyle}>Client</th>
                      <th style={thStyle}>Event Info</th>
                      <th style={thStyle}>Payment</th>
                      <th style={thStyle}>Status</th>
                      <th style={thStyle}>History Modification</th>
                      <th style={thStyle}>Detailed PDFs</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderSingleTableBody(groupedData[monthSection], true)}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#000', color: '#fff', fontFamily: "'Poppins', sans-serif" }}>
      <div style={sidebarStyle}>
        <h2 style={{color: '#add8e6', textAlign: 'center', marginBottom: '40px', fontWeight: '900', letterSpacing: '2px'}}>ADMIN</h2>
        <div onClick={() => setActiveTab('manage')} style={{...navLink, background: activeTab === 'manage' ? '#00008B' : 'transparent', fontWeight: activeTab === 'manage' ? 'bold' : 'normal'}}>Live Dashboard</div>
        <div onClick={() => { setActiveTab('register'); setView('grid'); }} style={{...navLink, background: activeTab === 'register' ? '#00008B' : 'transparent', fontWeight: activeTab === 'register' ? 'bold' : 'normal'}}>New Walk-in</div>
        <div onClick={() => setActiveTab('history')} style={{...navLink, background: activeTab === 'history' ? '#00008B' : 'transparent', fontWeight: activeTab === 'history' ? 'bold' : 'normal'}}>History Logs</div>
        <button onClick={() => { localStorage.removeItem('currentUser'); window.location.replace('/login'); }} style={logoutBtnSide}>Sign Out</button>
      </div>

      <div style={{ flex: 1, padding: '40px 30px', overflowY: 'auto', backgroundImage: 'linear-gradient(rgba(0,0,0,0.85), rgba(0,0,0,0.95)), url("https://images.pexels.com/photos/373543/pexels-photo-373543.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1")', backgroundSize: 'cover', backgroundAttachment: 'fixed' }}>
        {activeTab === 'manage' && renderTable(registrations.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled' && r.status !== 'Rejected'), false)}
        {activeTab === 'history' && renderTable(registrations.filter(r => r.status === 'Completed' || r.status === 'Cancelled' || r.status === 'Rejected'), true)}

        {activeTab === 'register' && (
          <div style={{maxWidth: '900px', margin: 'auto'}}>
            {view === 'grid' && (
              <div style={gridStyle}>
                {categories.map(cat => (
                  <div key={cat.id} style={cardStyle} onClick={() => { setSelectedCat(cat); setView('details'); }}>
                    <img src={cat.image} style={imgStyle} alt="" />
                    <div style={{ padding: '15px', fontWeight: '600', textAlign: 'center', color: '#add8e6' }}>{cat.name}</div>
                  </div>
                ))}
              </div>
            )}

            {view === 'details' && (
              <div style={subEventList}>
                <button onClick={() => setView('grid')} style={backBtn}>← Back</button>
                <h3 style={{color: '#add8e6', marginBottom: '20px', fontWeight: '700'}}>{selectedCat.name}</h3>
                <div style={{display: 'grid', gap: '12px'}}>
                    {selectedCat.sub.map(s => (
                        <div key={s} style={subItemRow}>
                            <span style={{fontWeight: '500'}}>{s}</span>
                            <button onClick={() => { setPendingEvent({event: s}); setView('form'); }} style={regBtn}>Select</button>
                        </div>
                    ))}
                </div>
              </div>
            )}

            {view === 'form' && (
              <div style={paymentCard}>
                <button onClick={() => setView('details')} style={backBtn}>← Back</button>
                <h3 style={{color: '#add8e6', marginBottom: '25px', fontWeight: '700'}}>Book Walk-in: {pendingEvent.event}</h3>
                <input placeholder="Name" style={formInput} onChange={e => setBookingDetails({...bookingDetails, customerName: e.target.value})} />
                <input placeholder="Email" style={formInput} onChange={e => setBookingDetails({...bookingDetails, customerEmail: e.target.value})} />
                <input type="date" style={formInput} onChange={e => setBookingDetails({...bookingDetails, eventDate: e.target.value})} />
                <button onClick={handleWalkInSubmit} style={proceedBtn}>Finalize Booking</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const sidebarStyle = { width: '240px', background: '#04040c', padding: '30px 20px', borderRight: '1px solid rgba(26,26,68,0.6)', display: 'flex', flexDirection: 'column' };
const navLink = { padding: '14px 18px', cursor: 'pointer', borderRadius: '10px', marginBottom: '8px', color: '#aaa', transition: '0.3s' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '25px' };
const cardStyle = { background: 'rgba(10,10,26,0.6)', backdropFilter: 'blur(10px)', borderRadius: '15px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' };
const imgStyle = { width: '100%', height: '120px', objectFit: 'cover' };
const tableContainer = { background: 'rgba(5,5,15,0.75)', backdropFilter: 'blur(15px)', padding: '35px 30px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 12px 30px rgba(0,0,0,0.4)' };
const thStyle = { padding: '15px 12px', color: '#add8e6', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' };
const tdStyle = { padding: '15px 12px', fontSize: '0.9rem' };
const statusBadge = (color) => ({ color, padding: '4px 10px', borderRadius: '20px', background: `${color}15`, border: `1px solid ${color}`, fontSize: '0.75rem', fontWeight: 'bold' });
const accBtn = { background: '#2ecc71', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' };
const rejBtn = { background: '#e74c3c', border: 'none', color: '#fff', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '0.8rem' };
const miniBtn = { background: 'rgba(26,26,68,0.4)', color: '#add8e6', border: '1px solid #add8e6', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '500' };

const completeColumnBtn = { background: '#00008B', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600', boxShadow: '0 4px 10px rgba(0,0,139,0.3)' };
const deleteRecordBtn = { background: '#c0392b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' };

const logoutBtnSide = { width: '100%', background: '#c0392b', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', cursor: 'pointer', marginTop: 'auto', fontWeight: 'bold' };
const subEventList = { background: 'rgba(10,10,26,0.7)', backdropFilter: 'blur(15px)', padding: '35px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' };
const subItemRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', marginBottom: '8px' };
const paymentCard = { background: 'rgba(10,10,26,0.7)', backdropFilter: 'blur(15px)', padding: '35px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' };
const formInput = { width: '100%', padding: '14px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', marginBottom: '15px', boxSizing: 'border-box', outline: 'none' };
const proceedBtn = { width: '100%', padding: '16px', background: 'linear-gradient(45deg, #00008B, #0000cd)', border: 'none', borderRadius: '10px', color: '#fff', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0,0,139,0.4)' };
const regBtn = { background: '#27ae60', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem' };
const backBtn = { background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 18px', borderRadius: '6px', cursor: 'pointer', marginBottom: '20px', fontSize: '0.85rem' };

export default AdminHome;