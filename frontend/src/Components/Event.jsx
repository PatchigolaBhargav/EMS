import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { createRegistration } from '../api';

// COMPLETE 15-CATEGORY CONFIGURATION MATRIX
const APP_EVENT_CATEGORIES = [
  {
    id: 1,
    name: "Education Events",
    sub: ["Conferences", "Seminars", "Workshops", "Guest Lectures"]
  },
  {
    id: 2,
    name: "Office & Company Events",
    sub: ["Product Launches", "Corporate Meetings", "Team Outings", "Annual Galas"]
  },
  {
    id: 3,
    name: "Music & Arts Events",
    sub: ["Concerts", "Art Exhibitions", "Music Festivals", "Theater Plays"]
  },
  {
    id: 4,
    name: "Sports & Games Events",
    sub: ["Tournaments", "Marathons", "E-Sports Matches", "Club Meets"]
  },
  {
    id: 5,
    name: "Family & Social Events",
    sub: ["Weddings", "Birthday Parties", "Anniversaries", "Reunions", "Social Parties"]
  },
  {
    id: 6,
    name: "Technology Events",
    sub: ["Hackathons", "Tech Expos", "Coding Bootcamps", "AI Summits"]
  },
  {
    id: 7,
    name: "Online Events",
    sub: ["Webinars", "Virtual Summits", "Live Streams", "Online Classes"]
  },
  {
    id: 8,
    name: "College Events",
    sub: ["Cultural Fests", "Technical Symposiums", "Freshers Day", "Graduation Ceremonies"]
  },
  {
    id: 9,
    name: "Community Service Events",
    sub: ["Charity Drives", "Blood Donations", "Volunteer Camps", "Plantation Drives"]
  },
  {
    id: 10,
    name: "Public & Government Events",
    sub: ["Expositions", "Town Halls", "Rallies", "Awareness Campaigns"]
  },
  {
    id: 11,
    name: "Religious & Spiritual Events",
    sub: ["Festivals", "Sermons", "Meditation Retreats", "Prayer Meets"]
  },
  {
    id: 12,
    name: "Business & Startup Events",
    sub: ["Pitch Nights", "Networking Meets", "Investor Summits", "Expos"]
  },
  {
    id: 13,
    name: "Health & Fitness Events",
    sub: ["Yoga Sessions", "Gym Bootcamps", "Zumba Classes", "Health Seminars"]
  },
  {
    id: 14,
    name: "Entertainment & Fun Events",
    sub: ["Standup Comedy", "Magic Shows", "Movie Screenings", "Game Nights"]
  },
  {
    id: 15,
    name: "Personal & Family Functions",
    sub: ["Private Dinners", "Baby Showers", "Housewarming Parties", "Get-Togethers"]
  }
];

const Event = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();  
  
  // Normalizes target URL IDs or word slugs to find the correct active category template
  const category = APP_EVENT_CATEGORIES.find(c => {
    if (!id) return false;
    
    const targetId = String(id).toLowerCase().trim();
    const currentId = String(c.id);
    
    const currentSlugName = String(c.name)
      .toLowerCase()
      .replace(/&/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    return targetId === currentId || targetId === currentSlugName || currentSlugName.includes(targetId);
  }) || APP_EVENT_CATEGORIES[0];

  const [currentStep, setCurrentStep] = useState('details');
  const [payMethod, setPayMethod] = useState('');
  const [selectedFoodItems, setSelectedFoodItems] = useState([]);
  
  // STABLE ROUTE MEMORY CHECK: Initialize using the historical state context if returning from menu choice
  const [selectedSub, setSelectedSub] = useState(() => {
    if (location.state && location.state.savedSubEvent) {
      return location.state.savedSubEvent;
    }
    return category && category.sub && category.sub.length > 0 ? category.sub[0] : '';
  });

  const savedSubEvent = location.state?.savedSubEvent;
  const selectedFoodFromState = location.state?.selectedFood;

  // CRITICAL DASHBOARD CARD ROUTING FILTER: ONLY clear and override selection if the category itself 
  // has genuinely switched. If returning from the Menu view within the same category, preserve your choice.
  useEffect(() => {
    if (savedSubEvent) {
      // Relaxed array inclusion check to verify if the saved sub-event belongs to the current category structure
      if (category.sub.includes(savedSubEvent)) {
        setSelectedSub(savedSubEvent);
        return; 
      }
    }
    
    // Default fallback state ONLY if no valid memory tracking routing token is present
    if (category && category.sub && category.sub.length > 0) {
      setSelectedSub(category.sub[0]);
    } else {
      setSelectedSub('');
    }
  }, [id, savedSubEvent]); // Trigger adjustments on ID changes and the actual saved sub-event value

  // Handle cross-routing data injection from menu views
  useEffect(() => {
    if (selectedFoodFromState) {
      setSelectedFoodItems(selectedFoodFromState);
    }
    window.scrollTo(0, 0);
  }, [selectedFoodFromState]);

  const [form, setForm] = useState({ 
    date: '', 
    v_brk: 0, v_lun: 0, v_snk: 0, v_din: 0, 
    nv_brk: 0, nv_lun: 0, nv_snk: 0, nv_din: 0 
  });

  const removeItem = (itemName) => {
    setSelectedFoodItems(prev => prev.filter(item => item.name !== itemName));
  };

  const fullAmount = (form.v_brk * 49) + (form.v_lun * 149) + (form.v_snk * 79) + (form.v_din * 249) + 
                       (form.nv_brk * 99) + (form.nv_lun * 249) + (form.nv_snk * 119) + (form.nv_din * 299);

  const getDisplayAmount = () => payMethod === 'Half Payment' ? fullAmount / 2 : fullAmount;

  const handleProceedToPayment = () => {
    if (!form.date) return alert("Please select an Event Date!");
    if (selectedFoodItems.length === 0) return alert("Your menu is empty! Please select food items.");
    if (fullAmount <= 0) return alert("Please enter the number of plates!");
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinalConfirm = async () => {
    if (!payMethod) return alert('Select Payment Method!');
    
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.email) return alert('User session not found. Please login again.');

    const newId = 'EVT-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newBooking = {
      id: newId,
      userName: user.fullname || 'Guest User',
      userEmail: user.email,
      category: category?.name || 'Event',
      event: selectedSub,
      bookingDate: form.date,
      totalBill: `₹${fullAmount}`,
      amount: `₹${getDisplayAmount()}`,
      paymentMethod: payMethod,
      items: (selectedFoodItems || []).map(i => {
        if (typeof i === 'string') {
          try { return JSON.parse(i); } catch (e) { return i; }
        }
        return i;
      }),
      status: 'Pending'
    };

    try {
      await createRegistration(newBooking);
      setCurrentStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      alert(error.response?.message || 'Registration also failed.');
    }
  };

  const renderSelectedMenuPreview = () => {
    const sections = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
    return sections.map(section => {
      const items = selectedFoodItems.filter(i => i.category && i.category.toUpperCase().includes(section));
      if (items.length === 0) return null;
      return (
        <div key={section} style={{marginBottom: '18px'}}>
          <strong style={{fontSize: '0.75rem', color: '#617d98', display: 'block', marginBottom: '8px', letterSpacing: '1.5px', fontWeight: '700'}}>{section}</strong>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
            {items.map((item, idx) => (
              <span key={idx} style={foodBadge}>
                {item.name}
                <button onClick={() => removeItem(item.name)} style={deleteXBtn}>×</button>
              </span>
            ))}
          </div>
        </div>
      );
    });
  };

  if (currentStep === 'success') {
    return (
      <div style={fullPageCenter}>
        <div style={successCard}>
          <div style={{fontSize: '70px', marginBottom: '20px', filter: 'drop-shadow(0 0 15px rgba(241,196,15,0.4))'}}>⏳</div>
          <h1 style={{color: '#f1c40f', margin: '0 0 12px', fontWeight: '800', letterSpacing: '0.5px'}}>Booking Submitted!</h1>
          <p style={{color: '#a0a0b5', margin: '0 0 30px', fontSize: '0.95rem', lineHeight: '1.6'}}>Your request is <strong style={{color: '#f1c40f'}}>Pending</strong>. Please wait for Admin approval.</p>
          <button onClick={() => navigate('/home')} className="action-btn-glow" style={historyRedirectBtn}>Check My History</button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageContainer}>
      <style>{`
        html, body {
          overflow-y: auto !important;
          height: auto !important;
          min-height: 100vh;
          background: #07070f;
        }
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: #07070f; }
        ::-webkit-scrollbar-thumb { background: rgba(58, 94, 219, 0.3); border-radius: 10px; border: 2px solid #07070f; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(58, 94, 219, 0.6); }
        .action-btn-glow { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .action-btn-glow:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(58,94,219,0.5); filter: brightness(1.1); }
        .action-btn-glow:active { transform: translateY(1px); }
        .input-glow-focus:focus { border-color: #3a5edb !important; box-shadow: 0 0 14px rgba(58,94,219,0.45) !important; background: rgba(15,15,35,0.9) !important; }
        .back-nav-btn { transition: all 0.2s ease; }
        .back-nav-btn:hover { background: rgba(255,255,255,0.08) !important; color: #fff !important; border-color: rgba(255,255,255,0.2) !important; }
        .clickable-pay-card { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
        .clickable-pay-card:hover { transform: scale(1.03); border-color: rgba(173,216,230,0.5) !important; background: rgba(20,20,45,0.6) !important; }
        input[type="number"]::-webkit-inner-spin-button { display: block; opacity: 0.5; }
      `}</style>

      <div style={scrollContent}>
        <div style={{ width: '100%', maxWidth: '850px', display: 'flex', justifyContent: 'flex-start' }}>
          <button onClick={() => navigate('/home')} className="back-nav-btn" style={backHomeBtn}>🏠 Back to Home</button>
        </div>
        
        <div style={mainRegistrationBox}>
          <h2 style={titleHeader}>
            {category?.name} <span style={{fontWeight: '300', color: 'rgba(255,255,255,0.4)', paddingLeft: '8px'}}>| Registration</span>
          </h2>
          
          {currentStep === 'details' ? (
            <>
              <div style={{textAlign: 'center', marginBottom: '35px'}}>
                {/* PRESERVATION BRIDGE: Keep the current event ID when entering the menu flow */}
                <button 
                  onClick={() => navigate(`/menu/${id}`, { state: { selectedFood: selectedFoodItems, savedSubEvent: selectedSub } })} 
                  className="action-btn-glow" 
                  style={menuBtnStyle}
                >
                  SELECT FOOD ITEMS 🍱
                </button>
              </div>

              {selectedFoodItems.length > 0 ? (
                <div style={selectionPreviewBox}>
                  <h4 style={{margin: '0 0 15px 0', color: '#add8e6', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.5px'}}>Selected Menu Preview</h4>
                  {renderSelectedMenuPreview()}
                </div>
              ) : (
                <div style={{...selectionPreviewBox, textAlign: 'center', border: '1px dashed rgba(231,76,60,0.4)', background: 'rgba(231,76,60,0.02)'}}>
                  <p style={{color: '#e74c3c', margin: 0, fontWeight: '600', fontSize: '0.9rem', letterSpacing: '0.3px'}}>⚠️ No food items selected. Use the manager tool above.</p>
                </div>
              )}

              <div style={topInputs}>
                <div style={inputGroup}>
                  <label style={labelStyle}>Specific Event Type</label>
                  <select 
                    className="input-glow-focus" 
                    style={selectField} 
                    value={selectedSub} 
                    onChange={(e) => setSelectedSub(e.target.value)}
                  >
                    {category?.sub?.map(s => (
                      <option key={s} value={s} style={{background: '#0d0d1e', color: '#fff'}}>{s}</option>
                    ))}
                  </select>
                </div>
                <div style={inputGroup}>
                  <label style={labelStyle}>Booking Date</label>
                  <input type="date" className="input-glow-focus" style={dateField} value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                </div>
              </div>

              <div style={foodGrid}>
                <div style={foodBox}>
                  <h3 style={{color:'#2ecc71', marginBottom:'20px', fontSize:'0.95rem', fontWeight:'800', letterSpacing: '1px', borderBottom: '1px solid rgba(46,204,113,0.15)', paddingBottom: '10px'}}>VEGETARIAN PLATTER</h3>
                  {['Breakfast (₹49)', 'Lunch (₹149)', 'Snacks (₹79)', 'Dinner (₹249)'].map((f,i)=> (
                    <div key={i} style={foodRow}>
                        <span style={{fontSize: '0.9rem', color: '#d0d0e1'}}>{f}</span> 
                        <input type="number" min="0" placeholder="0" className="input-glow-focus" style={numberInput} value={form[`v_${['brk','lun','snk','din'][i]}`] || ''} onChange={e => setForm({...form, [`v_${['brk','lun','snk','din'][i]}`]: Number(e.target.value)})} />
                    </div>
                  ))}
                </div>
                
                <div style={foodBox}>
                  <h3 style={{color:'#e74c3c', marginBottom:'20px', fontSize:'0.95rem', fontWeight:'800', letterSpacing: '1px', borderBottom: '1px solid rgba(231,76,60,0.15)', paddingBottom: '10px'}}>NON-VEGETARIAN PLATTER</h3>
                  {['Breakfast (₹99)', 'Lunch (₹249)', 'Snacks (₹119)', 'Dinner (₹299)'].map((f,i)=> (
                    <div key={i} style={foodRow}>
                        <span style={{fontSize: '0.9rem', color: '#d0d0e1'}}>{f}</span> 
                        <input type="number" min="0" placeholder="0" className="input-glow-focus" style={numberInput} value={form[`nv_${['brk','lun','snk','din'][i]}`] || ''} onChange={e => setForm({...form, [`nv_${['brk','lun','snk','din'][i]}`]: Number(e.target.value)})} />
                    </div>
                  ))}
                </div>
              </div>
              
              <div style={totalContainer}>Total Estimated Cost: <span style={{color: '#fff'}}>₹{fullAmount}</span></div>
              <button onClick={handleProceedToPayment} className="action-btn-glow" style={proceedBtn}>PROCEED TO PAYMENT</button>
            </>
          ) : (
            <div style={{padding: '5px 0'}}>
              <div style={{marginBottom: '30px', display: 'flex', flexDirection: 'column'}}>
                <label style={labelStyle}>Specific Event Type</label>
                <select 
                  className="input-glow-focus" 
                  style={{...selectField, background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(58,94,219,0.3)'}} 
                  value={selectedSub} 
                  onChange={(e) => setSelectedSub(e.target.value)}
                >
                  {category?.sub?.map(s => (
                    <option key={s} value={s} style={{background: '#0d0d1e', color: '#fff'}}>{s}</option>
                  ))}
                </select>
              </div>

              <h3 style={{marginBottom:'30px', color: '#add8e6', fontWeight: '700', textAlign:'center', fontSize: '1.25rem'}}>Select Desired Payment Channel</h3>
              <div style={payFlex}>
                {['UPI / Online', 'Half Payment', 'Cash on Delivery'].map(m => (
                  <div key={m} onClick={() => setPayMethod(m)} className="clickable-pay-card" style={payMethod === m ? activePayCard : payCard}>{m}</div>
                ))}
              </div>
              
              <div style={summaryBox}>
                 <p style={{margin: 0, fontWeight: '500'}}>Net Due Amount Right Now: <span style={{color: '#2ecc71', fontWeight: '800', fontSize: '1.6rem', marginLeft: '6px'}}>₹{getDisplayAmount()}</span></p>
              </div>

              <div style={{display:'flex', gap:'16px', justifyContent:'center', marginTop: '40px'}}>
                 <button onClick={() => setCurrentStep('details')} style={{...finalPayBtn, background: 'rgba(255,255,255,0.04)', color: '#b0b0cc', border: '1px solid rgba(255,255,255,0.08)', width: '140px'}}>Back</button>
                 <button onClick={handleFinalConfirm} className="action-btn-glow" style={{...finalPayBtn, width: '220px'}}>Confirm & Secure Booking</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- CSS Styles parameters ---
const pageContainer = { width: '100%', minHeight: '100vh', background: '#07070f', color: '#fff', overflowY: 'unset', fontFamily: "'Poppins', sans-serif" };
const scrollContent = { padding: '40px 20px 80px', display: 'flex', flexDirection: 'column', alignItems: 'center' };
const mainRegistrationBox = { width: '100%', maxWidth: '850px', background: 'rgba(13, 13, 33, 0.7)', backdropFilter: 'blur(20px)', padding: '45px 35px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 25px 55px rgba(0,0,0,0.55)' };
const titleHeader = { textAlign: 'center', color: '#fff', marginBottom: '40px', fontWeight: '800', fontSize: '1.75rem', letterSpacing: '0.3px' };
const topInputs = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '35px' };
const inputGroup = { display: 'flex', flexDirection: 'column' };
const labelStyle = { color: '#6d6d87', fontSize: '0.78rem', marginBottom: '10px', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' };
const selectionPreviewBox = { background: 'rgba(5,5,15,0.4)', padding: '22px', borderRadius: '16px', marginBottom: '35px', border: '1px solid rgba(255,255,255,0.04)' };
const summaryBox = { padding: '22px', background: 'rgba(46,204,113,0.03)', border: '1px solid rgba(46,204,113,0.25)', borderRadius: '16px', textAlign: 'center', fontSize: '1.15rem', color: '#b5ccbe' };
const foodBadge = { background: 'rgba(173,216,230,0.08)', color: '#add8e6', border: '1px solid rgba(173,216,230,0.2)', padding: '7px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '8px' };
const deleteXBtn = { background: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, fontSize: '11px', fontWeight: 'bold' };
const selectField = { padding: '14px 16px', background: 'rgba(0,0,0,0.4)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', outline: 'none', fontSize: '0.95rem', transition: 'all 0.3s' };
const dateField = { ...selectField, colorScheme: 'dark' };
const menuBtnStyle = { padding: '16px 55px', background: 'linear-gradient(135deg, #030391 0%, #3a5edb 100%)', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.5px' };
const foodGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' };
const foodBox = { background: 'rgba(0,0,0,0.25)', padding: '25px', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.03)' };
const foodRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' };
const numberInput = { width: '75px', padding: '10px', background: 'rgba(0,0,0,0.5)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', textAlign: 'center', outline: 'none', fontSize: '0.95rem', transition: 'all 0.3s' };
const totalContainer = { fontSize: '1.9rem', textAlign: 'center', margin: '40px 0 30px', fontWeight: '900', color: '#add8e6', letterSpacing: '0.5px' };
const proceedBtn = { width: '100%', padding: '18px', background: '#fff', color: '#050510', border: 'none', borderRadius: '14px', fontWeight: '800', cursor: 'pointer', fontSize: '1rem', letterSpacing: '0.5px' };
const backHomeBtn = { background: 'rgba(255,255,255,0.02)', color: '#8c8ca3', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 24px', borderRadius: '30px', cursor: 'pointer', marginBottom: '25px', fontSize: '0.85rem', fontWeight: '600' };
const payFlex = { display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '35px', flexWrap: 'wrap' };
const payCard = { padding: '26px 20px', border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.3)', borderRadius: '18px', cursor: 'pointer', width: '150px', textAlign: 'center', fontWeight: '600', fontSize: '0.95rem', color: '#a5a5c2' };
const activePayCard = { ...payCard, borderColor: '#3a5edb', color: '#fff', background: 'rgba(58,94,219,0.2)', boxShadow: '0 0 25px rgba(58,94,219,0.35)' };
const finalPayBtn = { padding: '16px 45px', background: '#2ecc71', borderRadius: '14px', color: '#fff', cursor: 'pointer', fontWeight: '700', border: 'none', fontSize: '1rem', letterSpacing: '0.3px' };
const fullPageCenter = { minHeight: '100vh', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#05050d', fontFamily: "'Poppins', sans-serif" };
const successCard = { background: 'rgba(13, 13, 30, 0.8)', backdropFilter: 'blur(20px)', padding: '55px 45px', borderRadius: '28px', textAlign: 'center', color: '#fff', border: '1px solid rgba(241,196,15,0.25)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)', width: '90%', maxWidth: '460px' };
const historyRedirectBtn = { marginTop: '10px', padding: '16px 40px', background: '#f1c40f', color: '#000', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '800', fontSize: '0.95rem', boxShadow: '0 6px 20px rgba(241,196,15,0.25)' };
export default Event;