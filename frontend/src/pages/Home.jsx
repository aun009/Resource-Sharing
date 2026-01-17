import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';

// Fix for default marker icon missing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const ChangeView = ({ center }) => {
    const map = useMap();
    map.setView(center, 13);
    return null;
}

const Home = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = React.useState('Tools');
    const [location, setLocation] = useState([51.505, -0.09]); // Default London
    const [hasLocation, setHasLocation] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showChat, setShowChat] = useState(false);

    // New state for ChatWindow
    const [chatPartner, setChatPartner] = useState(null);

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentUserEmail, setCurrentUserEmail] = useState('');

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        if (!lat1 || !lon1 || !lat2 || !lon2) return "Unknown";
        const R = 6371; // km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c;
        return d.toFixed(1) + "km";
    };

    const fetchCurrentUser = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8084/api/users/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const email = await response.text();
                setCurrentUserEmail(email);
            }
        } catch (error) {
            console.error("Failed to fetch current user", error);
        }
    };

    const fetchRequests = async () => {
        try {
            const response = await fetch('http://localhost:8084/api/requests');
            if (response.ok) {
                const data = await response.json();

                // Map backend data to frontend model
                const mappedRequests = data.map(req => ({
                    id: req.id,
                    name: req.requester ? req.requester.name : 'Unknown',
                    email: req.requester ? req.requester.email : '',
                    item: req.item,
                    type: req.type,
                    intent: req.intent,
                    status: req.status,
                    helper: req.helper,
                    image: req.image,
                    distance: hasLocation ? calculateDistance(location[0], location[1], req.latitude, req.longitude) : "Unknown",
                    time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
                    latitude: req.latitude,
                    longitude: req.longitude,
                    duration: req.duration,
                    rawDistance: hasLocation && req.latitude ? parseFloat(calculateDistance(location[0], location[1], req.latitude, req.longitude).replace('km', '')) : 999
                }));

                setRequests(mappedRequests);
            }
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation([position.coords.latitude, position.coords.longitude]);
                    setHasLocation(true);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const [myRequests, setMyRequests] = useState([]);

    const fetchMyRequests = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8084/api/requests/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const mapped = data.map(req => ({
                    ...req,
                    status: req.status,
                    helper: req.helper,
                    image: req.image,
                    distance: hasLocation ? calculateDistance(location[0], location[1], req.latitude, req.longitude) : "Unknown",
                    time: req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'
                }));
                setMyRequests(mapped);
            }
        } catch (error) {
            console.error("Error fetching my requests:", error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchRequests();
        if (token) fetchMyRequests(); // Initial fetch
        const interval = setInterval(() => {
            fetchRequests();
            if (token) fetchMyRequests();
        }, 10000);
        return () => clearInterval(interval);
    }, [hasLocation, location, token]);

    // Filter by Type
    const filteredRequests = activeTab === 'Activity'
        ? myRequests // Show all my requests (sorted by newest?)
        : requests.filter(req => req.type === activeTab);

    const handleLifecycleAction = async (id, action) => {
        if (action === 'complete') {
            if (window.confirm("Has the request been successfully fulfilled? click OK to complete.")) {
                // Proceed with complete
            } else {
                if (window.confirm("Do you want to re-open the request to find another helper?")) {
                    action = 'reopen';
                } else {
                    return; // Do nothing
                }
            }
        }

        try {
            const response = await fetch(`http://localhost:8084/api/requests/${id}/${action}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchMyRequests(); // Refresh
                fetchRequests();
            } else {
                alert("Action failed");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleOfferClick = (request) => {
        if (!token) {
            alert("Please sign up to offer help!");
            navigate('/register');
            return;
        }
        if (request.email === currentUserEmail) {
            alert("You cannot offer help to yourself!");
            return;
        }
        setSelectedRequest(request);
        setShowOfferModal(true);
    };

    const confirmOffer = () => {
        if (!selectedRequest) return;

        setShowOfferModal(false);

        // Open Chat Window
        setChatPartner({
            name: selectedRequest.name,
            email: selectedRequest.email
        });
        setShowChat(true);

        // Ideally backend call for 'offerHelp' goes here (Wait, we need to actually call the backend!)
        // The original logic missed the backend call! Let's fix that too.
        // Actually, the previous code missed calling offerHelp API? 
        // Let's check... in the previous file content, confirmOffer just opened chat.
        // I will add the backend call here.

        fetch(`http://localhost:8084/api/requests/${selectedRequest.id}/offer`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => {
            if (res.ok) {
                alert(selectedRequest.intent === 'OFFER' ? "Request sent! Owner will be notified." : "Offer sent! Waiting for approval.");
                fetchRequests();
                fetchMyRequests();
            }
        });
    };

    const [showPostModal, setShowPostModal] = useState(false);
    const [newItem, setNewItem] = useState({ item: '', type: 'Tools', duration: '', intent: 'REQUEST', description: '', price: '', image: '' });

    const handlePostClick = () => {
        if (!token) {
            alert("Please sign up to post a request!");
            navigate('/register');
            return;
        }
        setShowPostModal(true);
    };

    const handlePostRequest = async (e) => {
        e.preventDefault();
        const reqLat = hasLocation ? location[0] : 51.505;
        const reqLon = hasLocation ? location[1] : -0.09;

        const newRequest = {
            item: newItem.item,
            type: newItem.type,
            duration: newItem.price, // Mapping Price to Duration for now as per DB schema
            description: newItem.description,
            image: newItem.image,
            intent: newItem.intent,
            status: 'OPEN',
            latitude: reqLat,
            longitude: reqLon
        };

        try {
            const response = await fetch('http://localhost:8084/api/requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newRequest)
            });

            if (response.ok) {
                alert(`Posted successfully! User nearby will be notified.`);
                setShowPostModal(false);
                setNewItem({ item: '', type: 'Tools', duration: '', intent: 'REQUEST', description: '', price: '', image: '' });
                fetchRequests();
                fetchMyRequests();
            } else {
                alert("Failed to post request. Please try again.");
            }
        } catch (error) {
            console.error("Error posting request:", error);
            alert("Error posting request.");
        }
    };

    // Delete Request
    const handleDeleteRequest = async (id) => {
        if (!window.confirm("Are you sure you want to delete this request?")) return;
        try {
            const response = await fetch(`http://localhost:8084/api/requests/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setRequests(prev => prev.filter(r => r.id !== id));
                setMyRequests(prev => prev.filter(r => r.id !== id));
            } else {
                alert("Failed to delete request");
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Clear All Activity
    const handleClearActivity = async () => {
        if (!window.confirm("Are you sure you want to clear ALL your activity? This will delete all your requests.")) return;
        try {
            const response = await fetch('http://localhost:8084/api/requests/my/all', {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setMyRequests([]);
                alert("Activity cleared.");
            } else {
                alert("Failed to clear activity.");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openChat = (name, email) => {
        setChatPartner({ name, email });
        setShowChat(true);
    };

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'row', gap: '20px', height: 'calc(100vh - 100px)', paddingTop: '100px' }}>
            <motion.div
                className="glass"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                style={{ flex: 1, borderRadius: '24px', padding: '20px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Local Map</h2>
                </div>

                <div style={{ flex: 1, background: '#e5e5f7', borderRadius: '16px', position: 'relative', overflow: 'hidden', display: 'flex' }}>
                    <MapContainer center={location} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <ChangeView center={location} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {hasLocation && (
                            <Marker position={location} icon={redIcon}>
                                <Popup>You are here</Popup>
                            </Marker>
                        )}
                        {filteredRequests.map(req => (
                            <Marker
                                key={req.id}
                                position={[req.latitude || 51.505, req.longitude || -0.09]}
                                icon={req.intent === 'OFFER' ? greenIcon : blueIcon}
                            >
                                <Popup>
                                    <strong>{req.intent === 'OFFER' ? 'OFFER:' : 'WANTED:'} {req.item}</strong><br />
                                    {req.name}<br />
                                    {req.distance}
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </motion.div>

            <motion.div
                className="glass"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                style={{ flex: 1, borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0 }}>Marketplace</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {activeTab === 'Activity' && (
                            <button
                                className="btn"
                                onClick={handleClearActivity}
                                style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', background: '#ff3b30' }}
                            >
                                Clear All
                            </button>
                        )}
                        <button
                            className="btn"
                            onClick={handlePostClick}
                            style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', background: '#0071e3' }}
                        >
                            + Post
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', background: 'rgba(0,0,0,0.05)', padding: '5px', borderRadius: '12px', width: 'fit-content' }}>
                    {['Tools', 'Skills', 'Activity'].map(tab => (
                        <span
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '6px 14px',
                                background: activeTab === tab ? 'white' : 'transparent',
                                color: activeTab === tab ? (tab === 'Tools' ? 'var(--accent)' : (tab === 'Activity' ? '#ff9500' : '#34c759')) : '#888',
                                borderRadius: '10px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                fontWeight: '600',
                                boxShadow: activeTab === tab ? '0 2px 5px rgba(0,0,0,0.1)' : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {tab}
                        </span>
                    ))}
                </div>

                <div className="hide-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '15px', overflowY: 'auto' }}>
                    {filteredRequests.map(req => (
                        <RequestCard
                            key={req.id}
                            request={req}
                            isOwner={currentUserEmail === (req.email || req.requester?.email)}
                            onOffer={() => handleOfferClick(req)}
                            onDelete={() => handleDeleteRequest(req.id)}
                            onAccept={() => handleLifecycleAction(req.id, 'accept')}
                            onReject={() => handleLifecycleAction(req.id, 'reject')}
                            onComplete={() => handleLifecycleAction(req.id, 'complete')}
                            onReopen={() => handleLifecycleAction(req.id, 'reopen')}
                            onChat={openChat}
                        />
                    ))}
                    {filteredRequests.length === 0 && (
                        <div style={{ textAlign: 'center', color: 'gray', marginTop: '20px' }}>No items found for {activeTab}.</div>
                    )}
                </div>
            </motion.div>

            {/* Post Request Modal */}
            {showPostModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2100, backdropFilter: 'blur(5px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass"
                        style={{ padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', background: 'white' }}
                    >
                        <h3 style={{ marginTop: 0, color: '#1d1d1f', fontSize: '1.5rem', marginBottom: '20px' }}>Post to Marketplace</h3>
                        <form onSubmit={handlePostRequest} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <button type="button" onClick={() => setNewItem({ ...newItem, intent: 'REQUEST' })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: newItem.intent === 'REQUEST' ? '#0071e3' : 'white', color: newItem.intent === 'REQUEST' ? 'white' : 'black', fontWeight: '500' }}>
                                    I Need
                                </button>
                                <button type="button" onClick={() => setNewItem({ ...newItem, intent: 'OFFER' })}
                                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ddd', background: newItem.intent === 'OFFER' ? '#34c759' : 'white', color: newItem.intent === 'OFFER' ? 'white' : 'black', fontWeight: '500' }}>
                                    I Have
                                </button>
                            </div>
                            <input type="text" value={newItem.item} onChange={(e) => setNewItem({ ...newItem, item: e.target.value })} placeholder="Title (e.g. Power Drill)" required style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />

                            <select value={newItem.type} onChange={(e) => setNewItem({ ...newItem, type: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', background: 'white' }}>
                                <option value="Tools">Tool</option>
                                <option value="Skills">Skill</option>
                            </select>

                            <input type="text" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} placeholder="Price (e.g. ₹15/day or Free)" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none' }} />

                            {newItem.intent === 'OFFER' && (
                                <>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        id="imageUpload"
                                        style={{ display: 'none' }}
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setNewItem({ ...newItem, image: reader.result });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                    />
                                    <div
                                        onClick={() => document.getElementById('imageUpload').click()}
                                        style={{
                                            border: '2px dashed #ddd', borderRadius: '12px', padding: '20px',
                                            textAlign: 'center', cursor: 'pointer', color: '#0071e3', fontWeight: '500',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px'
                                        }}
                                    >
                                        {newItem.image ? (
                                            <img src={newItem.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                        ) : (
                                            "Click to Upload Image"
                                        )}
                                    </div>
                                </>
                            )}

                            <textarea value={newItem.description} onChange={(e) => setNewItem({ ...newItem, description: e.target.value })} placeholder="Description" rows="3" style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', outline: 'none', resize: 'none', fontFamily: 'inherit' }} />

                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '15px' }}>
                                <button type="button" onClick={() => setShowPostModal(false)} className="btn" style={{ background: '#f5f5f7', color: '#333' }}>Cancel</button>
                                <button type="submit" className="btn" style={{ background: '#0071e3', padding: '10px 24px' }}>Post Item</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Offer Help Confirmation Modal */}
            {showOfferModal && selectedRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                    zIndex: 2000, backdropFilter: 'blur(5px)'
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass"
                        style={{ padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '400px', background: 'white', textAlign: 'center' }}
                    >
                        <h3 style={{ color: '#1d1d1f' }}>{selectedRequest.intent === 'OFFER' ? 'Request Item?' : 'Confirm Help Offer?'}</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            {selectedRequest.intent === 'OFFER'
                                ? <span>You are requesting <strong>{selectedRequest.item}</strong> from <strong>{selectedRequest.name}</strong>.</span>
                                : <span>You are offering to help <strong>{selectedRequest.name}</strong> with <strong>{selectedRequest.item}</strong>.</span>
                            }
                        </p>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={() => setShowOfferModal(false)} className="btn" style={{ background: '#ccc', color: '#333' }}>Cancel</button>
                            <button onClick={confirmOffer} className="btn" style={{ background: '#34c759' }}>Confirm & Chat</button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Chat Window */}
            {showChat && chatPartner && (
                <ChatWindow
                    partnerName={chatPartner.name}
                    partnerEmail={chatPartner.email}
                    onClose={() => setShowChat(false)}
                    currentUserEmail={currentUserEmail}
                />
            )}
        </div>
    );
};

// Updated RequestCard
const RequestCard = ({ request, onOffer, isOwner, onDelete, onAccept, onReject, onComplete, onReopen, onChat }) => {
    const { name, item, intent, distance, time, status, helper, duration, image } = request;
    const [showMenu, setShowMenu] = useState(false);

    // Status Badge Color
    const getStatusColor = () => {
        if (status === 'IN_PROGRESS') return '#ff9500'; // Orange
        if (status === 'COMPLETED') return '#8e8e93'; // Gray
        if (status === 'PENDING_APPROVAL') return '#0071e3'; // Blue
        return '#34c759'; // Green (Open)
    };

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            style={{
                background: status === 'COMPLETED' ? 'rgba(240,240,240,0.8)' : 'rgba(255, 255, 255, 0.95)',
                padding: '16px',
                borderRadius: '16px',
                borderLeft: `5px solid ${getStatusColor()}`,
                border: '1px solid rgba(0,0,0,0.05)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                transition: 'box-shadow 0.2s ease',
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.8rem', color: '#666', fontWeight: 'bold'
                    }}>
                        {name ? name.charAt(0) : '?'}
                    </div>
                    <div>
                        <strong style={{ color: '#1d1d1f' }}>{name || 'Unknown'}</strong>
                        <div style={{ fontSize: '0.75rem', color: intent === 'OFFER' ? '#34c759' : '#0071e3', fontWeight: '600', display: 'flex', gap: '5px' }}>
                            {intent === 'OFFER' ? 'OFFERING' : 'REQUESTING'}
                            {status !== 'OPEN' && <span style={{ color: getStatusColor() }}>• {status.replace('_', ' ')}</span>}
                        </div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#888', fontWeight: '500' }}>{time}</span>
                    {isOwner && (
                        <div style={{ position: 'relative' }}>
                            <div
                                onClick={() => setShowMenu(!showMenu)}
                                style={{ cursor: 'pointer', padding: '0 5px', fontSize: '1.2rem', color: '#888' }}
                            >
                                ⋮
                            </div>
                            {showMenu && (
                                <div
                                    onMouseLeave={() => setShowMenu(false)}
                                    style={{
                                        position: 'absolute', right: 0, top: '25px',
                                        background: 'white', padding: '5px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                                        borderRadius: '8px', zIndex: 100,
                                        width: '120px', display: 'flex', flexDirection: 'column'
                                    }}
                                >
                                    {status === 'IN_PROGRESS' && (
                                        <>
                                            <button onClick={onComplete} style={{ padding: '8px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#34c759' }}>Complete</button>
                                            <button onClick={() => { if (window.confirm("Cancel transaction and re-list item?")) onReopen(); }} style={{ padding: '8px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ff9500' }}>Cancel</button>
                                        </>
                                    )}
                                    <button onClick={onDelete} style={{ padding: '8px', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: '#ff3b30' }}>Delete</button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div style={{ fontSize: '0.95rem', marginBottom: '4px', color: '#333' }}>
                {intent === 'OFFER' ? 'Offering:' : 'Looking for:'} <strong>{item}</strong>
            </div>
            {duration && (
                <div style={{ fontSize: '0.85rem', color: '#0071e3', fontWeight: '500', marginBottom: '16px' }}>
                    {duration.replace('$', '₹')}
                </div>
            )}

            {image && (
                <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
                    <img src={image} alt={item} style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }} />
                </div>
            )}

            {/* Action Buttons Area */}
            {isOwner && status === 'PENDING_APPROVAL' && helper && (
                <div style={{ background: '#f0f0f5', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.85rem', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span><strong>{helper.name}</strong> {intent === 'OFFER' ? 'is requesting this item!' : 'offered to help!'}</span>
                        <button onClick={() => onChat(helper.name, helper.email)} style={{ border: 'none', background: 'none', color: '#0071e3', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Chat 💬
                        </button>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={onAccept} style={{ flex: 1, background: '#34c759', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>Accept</button>
                        <button onClick={onReject} style={{ flex: 1, background: '#ff3b30', color: 'white', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}>Reject</button>
                    </div>
                </div>
            )}

            {status === 'IN_PROGRESS' && (
                <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <button onClick={() => isOwner ? (helper && onChat(helper.name, helper.email)) : onChat(name, request.email)} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#f0f0f5', border: 'none', color: '#0071e3', fontWeight: '600', cursor: 'pointer' }}>
                        Chat with {isOwner ? (helper ? helper.name : 'Helper') : name} 💬
                    </button>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>📍</span> {distance}
                </div>
                {!isOwner && status === 'OPEN' && (
                    <button
                        className="btn"
                        onClick={onOffer}
                        style={{
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            background: intent === 'OFFER' ? '#34c759' : '#0071e3',
                            color: 'white',
                            borderRadius: '20px',
                            border: 'none',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        {intent === 'OFFER' ? 'Request Item' : 'Offer Help'}
                    </button>
                )}
                {/* Visual indicator if I am the helper */}
                {!isOwner && helper && status !== 'OPEN' && (
                    <span style={{ fontSize: '0.8rem', color: '#0071e3', fontWeight: 'bold' }}>
                        {status === 'IN_PROGRESS' ? 'Help in Progress' : 'Pending Approval'}
                    </span>
                )}
            </div>
        </motion.div>
    );
};

export default Home;
