import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const Menu = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation(); // Extracted to listen to incoming state params
    
    // Read initial selections if they exist from the builder state
    const [selectedItems, setSelectedItems] = useState(() => {
        return location.state?.selectedFood || [];
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("ALL");
    const [expandedCategory, setExpandedCategory] = useState("🍳 BREAKFAST-Veg 🟢");

    // Capture the incoming sub-event so we can pass it right back safely
    const savedSubEvent = location.state?.savedSubEvent || "";

    const menuData = {
        "🍳 BREAKFAST": {
            "Veg 🟢": {
                image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80", 
                items: ["Idli", "Dosa", "Masala Dosa", "Plain Paratha", "Aloo Paratha", "Upma", "Poha", "Vegetable Sandwich", "Bread Butter", "Bread Jam", "Pongal", "Puri with Aloo Curry", "Vegetable Omelette", "Set Dosa", "Rava Dosa", "Onion Dosa", "Uttapam", "Vegetable Uttapam", "Tomato Omelette", "Cornflakes with Milk", "Oats Porridge", "Ragi Dosa", "Ragi Idli", "Wheat Dosa", "Veg Frankie", "Cheese Sandwich", "Sprouts Chaat", "Fruit Bowl", "Smoothie Bowl"]
            },
            "Non-Veg 🔴": {
                image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80", 
                items: ["Egg Bhurji", "Omelette with Toast", "Egg Dosa", "Chicken Keema Dosa", "Egg Chicken Dosa", "Puri Chicken Curry", "Dosa Chicken Curry", "Egg Paratha", "Egg Sandwich", "Chicken Sandwich", "Keema Paratha", "Egg Bhurji Roll", "Chicken Sausage", "Boiled Eggs", "Scrambled Eggs", "Egg Muffins"]
            }
        },
        "🍱 LUNCH": {
            "Rice & Veg Varieties 🍚": {
                image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80", 
                items: ["Steamed Rice", "Jeera Rice", "Ghee Rice", "Lemon Rice", "Tomato Rice", "Coconut Rice", "Curd Rice", "Veg Pulao", "Fried Rice", "Mint Rice", "Coriander Rice", "Spinach Rice", "Sambar Rice", "Rasam Rice", "Khichdi", "Bisibele Bath", "Puliyogare", "Vegetable Khichdi", "Paneer Rice", "Mushroom Rice"]
            },
            "Veg Biryanis 🟢": {
                image: "https://images.unsplash.com/photo-1563379091339-03b17af4a4f9?auto=format&fit=crop&w=600&q=80", 
                items: ["Veg Biryani", "Paneer Biryani", "Mushroom Biryani", "Soya Chunk Biryani", "Jackfruit Biryani", "Kaju Biryani", "Vegetable Dum Biryani"]
            },
            "Non-Veg Biryanis 🔴": {
                image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", 
                items: ["Chicken Biryani", "Mutton Biryani", "Egg Biryani", "Prawn Biryani", "Hyderabadi Dum Biryani", "Kolkata Biryani", "Donne Biryani", "Ambur Biryani", "Malabar Chicken Biryani", "Fish Biryani", "Keema Biryani", "Afghani Chicken Biryani"]
            },
            "Veg Curries 🍛": {
                image: "https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=600&q=80", 
                items: ["Dal Tadka", "Dal Fry", "Dal Makhani", "Paneer Butter Masala", "Shahi Paneer", "Kadai Paneer", "Mix Veg Curry", "Aloo Gobi", "Aloo Matar", "Malai Kofta", "Navratan Korma", "Veg Kurma", "Palak Paneer", "Matar Paneer", "Chole Masala", "Rajma Masala", "Bhindi Masala", "Baingan Bharta", "Veg Stew", "Pumpkin Curry"]
            },
            "Non-Veg Curries 🍖": {
                image: "https://images.unsplash.com/photo-1603894584134-f132f1782bb5?auto=format&fit=crop&w=600&q=80", 
                items: ["Butter Chicken", "Chicken Chettinad", "Chicken Curry", "Kadai Chicken", "Pepper Chicken", "Chicken Korma", "Mutton Rogan Josh", "Mutton Curry", "Keema Masala", "Egg Masala", "Egg Curry", "Fish Curry", "Fish Masala", "Prawn Curry", "Crab Curry", "Chicken Vindaloo", "Kerala Fish Curry", "Goan Fish Curry", "Chicken Stew", "Mutton Korma"]
            },
            "Salads & Sides 🥗": {
                image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80", 
                items: ["Green Salad", "Onion Salad", "Tomato Cucumber Salad", "Sprouts Salad", "Fruit Salad", "Boondi Raita", "Cucumber Raita", "Onion Raita", "Beetroot Salad", "Carrot Salad", "Kosambari", "Curd", "Papad", "Pickle"]
            },
            "Sweets 🍬": {
                image: "https://images.unsplash.com/photo-1589119908995-c6800ffca83e?auto=format&fit=crop&w=600&q=80", 
                items: ["Gulab Jamun", "Rasgulla", "Jalebi", "Kheer", "Rice Payasam", "Semiya Payasam", "Carrot Halwa", "Badam Halwa", "Mysore Pak", "Ladoo", "Peda", "Barfi", "Kalakand", "Shrikhand", "Malpua"]
            }
        },
        "🍿 SNACKS": {
            "Veg 🟢": {
                image: "https://images.unsplash.com/photo-1601050633647-8f8f5f4a2115?auto=format&fit=crop&w=600&q=80", 
                items: ["Samosa", "Pakora", "Veg Cutlet", "Pani Puri", "Vada", "Bhel Puri", "Masala Puri", "Pav Bhaji", "Bread Roll", "Cheese Balls", "French Fries", "Veg Momos", "Corn Chaat", "Banana Chips", "Murukku"]
            },
            "Non-Veg 🔴": {
                image: "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80", 
                items: ["Chicken Pakora", "Chicken Cutlet", "Egg Puff", "Fish Fingers", "Chicken Roll", "Egg Roll", "Chicken Momos", "Chicken Wings", "Chicken Nuggets", "Fish Pakora", "Prawn Tempura"]
            }
        },
        "🍽️ DINNER": {
            "Veg Tiffins & Breads 🌮": {
                image: "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=600&q=80", 
                items: ["Chapati", "Roti", "Phulka", "Butter Roti", "Naan", "Butter Naan", "Garlic Naan", "Kulcha", "Stuffed Kulcha", "Paratha", "Aloo Paratha", "Gobi Paratha", "Paneer Paratha", "Poori", "Bhatura", "Dosa", "Masala Dosa", "Set Dosa", "Rava Dosa", "Onion Dosa", "Uttapam", "Appam", "Idiyappam", "Puttu", "Pongal", "Khichdi", "Veg Upma", "Semiya Upma", "Lemon Sevai"]
            },
            "Non-Veg Tiffins & Sides 🔴": {
                image: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445?auto=format&fit=crop&w=600&q=80", 
                items: ["Vegetable Omelette", "Egg Bhurji", "Egg Roast", "Chicken Sandwich", "Veg Burger", "Chicken Burger", "Veg Frankie", "Chicken Frankie", "Egg Frankie", "Chicken Shawarma", "Egg Shawarma"]
            },
            "Veg Starters 🟢": {
                image: "https://images.unsplash.com/photo-1541518763669-27fef04b14ea?auto=format&fit=crop&w=600&q=80", 
                items: ["Veg Soup", "Sweet Corn Soup", "Clear Soup", "Paneer Bhurji", "Mushroom Pepper Fry", "Gobi Manchurian", "Veg Manchurian", "Paneer Tikka", "Hara Bhara Kebab", "Veg Grilled Platter", "Veg Spring Rolls", "Cheese Corn Balls", "Veg Seekh Kebab"]
            },
            "Non-Veg Starters 🔴": {
                image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80", 
                items: ["Chicken Soup", "Hot & Sour Soup", "Manchow Soup", "Chicken Manchurian", "Chicken Tikka", "Fish Fry", "Chicken Fry", "Mutton Fry", "Prawn Fry", "Chicken Lollipop", "Tandoori Chicken", "Afghani Chicken", "Seekh Kebab", "Shami Kebab", "Non-Veg Grilled Platter", "Chicken 65", "Pepper Chicken Fry"]
            },
            "Veg Main Course 🍜": {
                image: "https://images.unsplash.com/photo-1612058560366-cd24270083cd?auto=format&fit=crop&w=600&q=80", 
                items: ["Veg Noodles", "Hakka Noodles", "Veg Fried Rice", "Paneer Fried Rice", "Mushroom Fried Rice", "Dal Makhani", "Chana Dal", "Veg Thali", "Paneer Curry with Roti", "Veg Kurma with Paratha"]
            },
            "Non-Veg Main Course 🍖": {
                image: "https://images.unsplash.com/photo-1512058454905-6b841e7ad132?auto=format&fit=crop&w=600&q=80", 
                items: ["Egg Noodles", "Chicken Noodles", "Schezwan Noodles", "Chicken Fried Rice", "Egg Curry with Roti", "Chicken Curry with Naan", "Fish Curry with Rice", "Non-Veg Thali", "Mutton Curry with Roti", "Prawn Masala with Rice"]
            },
            "Add-ons 🥗": {
                image: "https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?auto=format&fit=crop&w=600&q=80", 
                items: ["Curd", "Buttermilk", "Papad", "Pickle", "Green Chutney", "Coconut Chutney"]
            }
        }
    };

    const toggleItem = (category, itemName) => {
        setSelectedItems(prev => {
            const isSelected = prev.find(i => i.category === category && i.name === itemName);
            if (isSelected) {
                return prev.filter(i => !(i.category === category && i.name === itemName));
            } else {
                return [...prev, { category, name: itemName }];
            }
        });
    };

    // Updated to include savedSubEvent parameter inside navigation bridge 
    const handleConfirm = () => {
        if (selectedItems.length === 0) return alert("Please select at least one item!");
        navigate(`/event/${id || 1}`, { 
            state: { 
                selectedFood: selectedItems,
                savedSubEvent: savedSubEvent // Keeps the active sub-event intact
            } 
        });
    };

    // Explicitly navigate back to builder while maintaining the active sub-event selection
    const handleCancelAndGoBack = () => {
        navigate(`/event/${id || 1}`, {
            state: {
                selectedFood: location.state?.selectedFood || [],
                savedSubEvent: savedSubEvent // Keeps active sub-event intact even on cancel
            }
        });
    };

    const tabs = ["ALL", "BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

    return (
        <div style={menuPage}>
            <style>{`
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: #f1f3f6; }
                ::-webkit-scrollbar-thumb { background: #cccccc; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #e23744; }
                .food-card-hover { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
                .food-card-hover:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(226,55,68,0.3) !important; }
                .tab-chip { transition: all 0.2s ease; }
                .tab-chip:hover { background: rgba(0, 0, 0, 0.05); color: #000; }
                .search-input-glow:focus { border-color: #e23744 !important; box-shadow: 0 0 15px rgba(226,55,68,0.15) !important; background: #fff !important; }
                .item-interactive-box { transition: all 0.2s ease; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
                .item-interactive-box:hover { background: #fcfcfd !important; border-color: #b0b0b5 !important; transform: translateY(-1px); }
            `}</style>

            {/* Selection Sidebar */}
            <div style={sidebar}>
                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '2px solid #f1f3f6', paddingBottom: '18px'}}>
                    <h2 style={sidebarHeader}>Your Basket</h2>
                    <span style={itemCounterCount}>{selectedItems.length} Items</span>
                </div>
                
                <div style={selectionList}>
                    {selectedItems.length === 0 ? (
                        <div style={{textAlign: 'center', marginTop: '100px'}}>
                            <div style={{fontSize: '48px', marginBottom: '15px'}}>🛒</div>
                            <p style={{color: '#1c1c27', fontSize: '0.95rem', fontWeight: '700', margin: '0 0 4px'}}>Your basket is empty</p>
                            <p style={{color: '#828294', fontSize: '0.8rem'}}>Select appetizing dishes from catalog</p>
                        </div>
                    ) : (
                        selectedItems.map((item, idx) => (
                            <div key={idx} style={selectedItemTag}>
                                <div style={{display: 'flex', flexDirection: 'column', gap: '2px'}}>
                                    <span style={{fontSize: '0.88rem', fontWeight: '700', color: '#1c1c27'}}>{item.name}</span>
                                    <span style={{fontSize: '0.72rem', color: '#e23744', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px'}}>{item.category.replace(/[^\w\s]/gi, '')}</span>
                                </div>
                                <span onClick={() => toggleItem(item.category, item.name)} style={removeIcon}>×</span>
                            </div>
                        ))
                    )}
                </div>
                
                <div style={footerAction}>
                    <button onClick={handleConfirm} style={doneBtn}>Confirm Selections</button>
                    <button onClick={handleCancelAndGoBack} style={eventRedirectBtn}>Back to Builder</button>
                </div>
            </div>

            {/* Main Light Catalog Interface */}
            <div style={mainContent}>
                <header style={header}>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '4px', flex: 1}}>
                        <p style={{color: '#e23744', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', margin: 0}}>Premium Catering</p>
                        <h1 style={mainTitle}>MENU CATALOG</h1>
                    </div>
                    
                    <div style={{position: 'relative', width: '340px'}}>
                        <input 
                            type="text" 
                            placeholder="Search dishes (e.g., Biryani, Dosa)..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input-glow"
                            style={searchBarInput}
                        />
                        <span style={searchIconIndicator}>🔍</span>
                    </div>
                </header>

                <div style={tabContainerBar}>
                    {tabs.map(tab => (
                        <button 
                            key={tab} 
                            onClick={() => setActiveTab(tab)}
                            className="tab-chip"
                            style={activeTab === tab ? activeTabChip : passiveTabChip}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={menuContainer}>
                    {Object.entries(menuData)
                      .filter(([catName]) => activeTab === "ALL" || catName.includes(activeTab))
                      .map(([catName, subCats]) => {
                        
                        const containsFilteredItems = Object.values(subCats).some(sub => 
                            sub.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
                        );

                        if (searchQuery && !containsFilteredItems) return null;

                        return (
                            <div key={catName} style={{marginBottom: '50px'}}>
                                <h2 style={categoryTitle}>{catName}</h2>
                                <div style={categoryGrid}>
                                    {Object.entries(subCats).map(([subName, data]) => {
                                        const categoryId = `${catName}-${subName}`;
                                        const isExpanded = expandedCategory === categoryId;
                                        
                                        const filteredItemsList = data.items.filter(item => 
                                            item.toLowerCase().includes(searchQuery.toLowerCase())
                                        );

                                        if (searchQuery && filteredItemsList.length === 0) return null;

                                        return (
                                            <div key={subName} style={categoryWrapper}>
                                                <div 
                                                    className="food-card-hover"
                                                    style={{...categoryCard, backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.85) 45%, rgba(0,0,0,0.2)), url(${data.image})`}}
                                                    onClick={() => setExpandedCategory(isExpanded ? null : categoryId)}
                                                >
                                                    <div style={cardOverlay}>
                                                        <h3 style={cardText}>{subName}</h3>
                                                        <span style={{
                                                            fontSize: '0.85rem', 
                                                            color: isExpanded ? '#fff' : '#ffcbd1', 
                                                            marginTop: '4px', 
                                                            fontWeight: '800'
                                                        }}>
                                                            {isExpanded ? 'Collapse Items △' : `Explore ${filteredItemsList.length} Dishes ➔`}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div style={itemGridContainer}>
                                                        {filteredItemsList.map(item => {
                                                            const isActive = selectedItems.some(i => i.category === catName && i.name === item);
                                                            return (
                                                                <div 
                                                                    key={item} 
                                                                    onClick={() => toggleItem(catName, item)}
                                                                    className="item-interactive-box"
                                                                    style={isActive ? activeItemBox : itemBox}
                                                                >
                                                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                                        <span style={{fontSize: '0.75rem', color: subName.includes('Veg 🟢') || subName.includes('Rice') || subName.includes('Sweets') ? '#27ae60' : '#e74c3c'}}>●</span>
                                                                        <span style={itemText}>{item}</span>
                                                                    </div>
                                                                    {isActive ? (
                                                                        <div style={checkMarkBadge}>ADDED</div>
                                                                    ) : (
                                                                        <div style={addCrossBadge}>+ ADD</div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

// Layout Theme Styles
const menuPage = { display: 'flex', height: '100vh', background: '#f8f9fa', color: '#1c1c27', overflow: 'hidden', fontFamily: "'Poppins', sans-serif" };
const sidebar = { width: '340px', background: '#ffffff', borderRight: '1px solid #e1e4e8', padding: '35px 24px', display: 'flex', flexDirection: 'column', boxShadow: '4px 0 15px rgba(0,0,0,0.02)' };
const sidebarHeader = { fontSize: '1.3rem', fontWeight: '800', letterSpacing: '0.3px', margin: 0, color: '#1c1c27' };
const itemCounterCount = { background: 'rgba(226,55,68,0.08)', color: '#e23744', padding: '5px 14px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '800' };
const selectionList = { flex: 1, overflowY: 'auto', marginTop: '25px', paddingRight: '4px' };
const selectedItemTag = { background: '#f8f9fa', padding: '14px 16px', borderRadius: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e1e4e8' };
const removeIcon = { cursor: 'pointer', color: '#a0a0b0', fontWeight: '400', padding: '0 4px', fontSize: '1.3rem', transition: 'color 0.2s' };
const footerAction = { marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px' };

const mainContent = { flex: 1, overflowY: 'auto', padding: '45px 50px', background: '#f8f9fa' };
const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '35px', borderBottom: '2px solid #eef1f5', paddingBottom: '25px' };
const mainTitle = { fontSize: '2.1rem', fontWeight: '900', letterSpacing: '0.5px', color: '#1c1c27', margin: 0 };
const searchBarInput = { width: '100%', padding: '14px 20px 14px 45px', background: '#ffffff', border: '1px solid #dcdce2', borderRadius: '16px', color: '#1c1c27', outline: 'none', fontSize: '0.9rem', transition: 'all 0.25s ease', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' };
const searchIconIndicator = { position: 'absolute', left: '16px', top: '15px', fontSize: '0.95rem', opacity: 0.4 };

const tabContainerBar = { display: 'flex', gap: '12px', marginBottom: '40px', borderBottom: '1px solid #eef1f5', paddingBottom: '18px' };
const passiveTabChip = { background: '#ffffff', color: '#555566', border: '1px solid #dcdce2', padding: '9px 22px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
const activeTabChip = { ...passiveTabChip, background: '#e23744', color: '#fff', borderColor: '#e23744', boxShadow: '0 6px 18px rgba(226,55,68,0.25)' };

const menuContainer = { maxWidth: '1150px', margin: '0 auto' };
const categoryTitle = { fontSize: '1.45rem', marginBottom: '25px', borderLeft: '5px solid #e23744', paddingLeft: '16px', color: '#1c1c27', textTransform: 'uppercase', fontWeight: '900', letterSpacing: '0.3px' };
const categoryGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' };
const categoryWrapper = { display: 'flex', flexDirection: 'column', gap: '15px' };

const categoryCard = { height: '170px', borderRadius: '20px', backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', position: 'relative', border: '1px solid rgba(0,0,0,0.04)', overflow: 'hidden', boxShadow: '0 10px 22px rgba(0,0,0,0.12)' };
const cardOverlay = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px' };
const cardText = { margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#fff', letterSpacing: '0.3px' };

const itemGridContainer = { display: 'flex', flexDirection: 'column', gap: '8px', background: '#ffffff', padding: '12px', borderRadius: '18px', border: '1px solid #e1e4e8', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' };
const itemBox = { padding: '14px 18px', background: '#ffffff', border: '1px solid #e8e8ed', borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '48px' };
const activeItemBox = { ...itemBox, background: 'rgba(226,55,68,0.02)', borderColor: 'rgba(226,55,68,0.25)' };

const itemText = { fontSize: '0.9rem', color: '#2c2c35', fontWeight: '700' };
const addCrossBadge = { fontSize: '0.75rem', fontWeight: '800', color: '#e23744', background: '#ffffff', padding: '6px 14px', borderRadius: '8px', border: '1px solid #f0b2b6', boxShadow: '0 2px 4px rgba(226,55,68,0.08)' };
const checkMarkBadge = { ...addCrossBadge, color: '#fff', background: '#27ae60', borderColor: '#27ae60', boxShadow: '0 2px 6px rgba(39,174,96,0.2)' };

const doneBtn = { width: '100%', padding: '16px', background: '#e23744', color: '#fff', border: 'none', borderRadius: '16px', cursor: 'pointer', fontWeight: '800', fontSize: '1rem', letterSpacing: '0.3px', boxShadow: '0 8px 25px rgba(226,55,68,0.3)' };
const eventRedirectBtn = { background: 'transparent', color: '#78788a', border: 'none', cursor: 'pointer', padding: '6px', fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.3px' };

export default Menu;