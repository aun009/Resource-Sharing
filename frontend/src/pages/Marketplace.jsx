import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

import ChatWindow from '../components/ChatWindow';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';

const Marketplace = () => {
    const { user, token } = useAuth();
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [showChat, setShowChat] = useState(false);
    const [chatPartner, setChatPartner] = useState(null);

    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ title: '', category: 'Tool', price: '', description: '', image: '', imageFile: null });

    const fetchCurrentUser = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/me`, {
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

    const fetchResources = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/resources`);
            if (response.ok) {
                const data = await response.json();
                setResources(data); // Backend resource has ownerName and ownerEmail?
                // Need to ensure backend `Resource` entity exposes these if not already. 
                // Previous checks showed `getOwnerEmail` and `getOwnerName` might be needed in DTO or implicit.
                // Resource.java has getOwnerEmail custom getter. Jackson should serialize it if it starts with 'get'.
            }
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchResources();
    }, [token]);

    const handleMessageOwner = (item) => {
        if (!token) {
            alert("Please login to message the owner.");
            return;
        }

        // Check if ownerEmail is available. If backend doesn't send it, we can't chat.
        // Assuming Response body has ownerEmail field from Resource.java getter.
        if (!item.ownerEmail) {
            console.warn("No owner email found for item", item);
            alert("Cannot message owner (contact info missing).");
            return;
        }

        if (item.ownerEmail === currentUserEmail) {
            alert("You cannot message yourself!");
            return;
        }
        setChatPartner({
            name: item.ownerName || 'Owner',
            email: item.ownerEmail
        });
        setShowChat(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewItem({ ...newItem, image: reader.result, imageFile: file });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', newItem.title);
            formData.append('category', newItem.category);
            formData.append('price', newItem.price);
            formData.append('description', newItem.description);
            if (newItem.imageFile) {
                formData.append('image', newItem.imageFile);
            }

            const headers = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_BASE_URL}/api/resources`, {
                method: 'POST',
                headers: headers,
                body: formData
            });

            if (response.ok) {
                alert("Resource added successfully");
                setShowModal(false);
                setNewItem({ title: '', category: 'Tool', price: '', description: '', image: '', imageFile: null });
                fetchResources();
            } else {
                alert("Failed to add resource.");
            }
        } catch (error) {
            console.error("Error adding resource exception", error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '120px' }} >
            <header style={{ marginBottom: '40px', textAlign: 'center', position: 'relative' }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ fontSize: '2.5rem', marginBottom: '10px' }}
                >
                    Community Marketplace
                </motion.h1>
                <p style={{ color: 'var(--secondary)' }}>Borrow tools or learn new skills from your neighbors.</p>
                <button
                    className="btn"
                    onClick={() => setShowModal(true)}
                    style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        background: '#34c759', padding: '12px 24px'
                    }}
                >
                    + Share Resource
                </button>
            </header>

            {
                showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
                        zIndex: 1000, backdropFilter: 'blur(5px)'
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="glass"
                            style={{ padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '500px', background: 'white' }}
                        >
                            <h2 style={{ marginBottom: '20px', color: '#1d1d1f', fontSize: '1.5rem' }}>List an Item</h2>
                            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <input
                                    type="text" placeholder="Title (e.g., Power Drill)"
                                    value={newItem.title} onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} required
                                />
                                <select
                                    value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }}
                                >
                                    <option value="Tool">Tool</option>
                                    <option value="Skill">Skill</option>
                                </select>
                                <input
                                    type="text" placeholder="Price (e.g., $15/day or Free)"
                                    value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} required
                                />

                                <div style={{ border: '1px dashed #ccc', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                                    <label style={{ cursor: 'pointer', display: 'block' }}>
                                        <span style={{ color: '#0071e3', fontWeight: 'bold' }}>Click to Upload Image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                    {newItem.image && (
                                        <div style={{ marginTop: '10px' }}>
                                            <img src={newItem.image} alt="Preview" style={{ maxHeight: '100px', borderRadius: '8px' }} />
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    placeholder="Description" rows="3"
                                    value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    style={{ padding: '12px', borderRadius: '12px', border: '1px solid #ddd' }} required
                                />
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ background: '#ccc', flex: 1, color: '#333' }}>Cancel</button>
                                    <button type="submit" className="btn" style={{ flex: 1 }}>Post Item</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )
            }

            {
                loading ? (
                    <div style={{ textAlign: 'center' }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px', paddingBottom: '40px' }}>
                        {resources.length > 0 ? (
                            resources.map(item => {
                                let imageUrl = "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=500&q=60";
                                if (item.image) {
                                    imageUrl = item.image.startsWith('http') ? item.image : `data:image/jpeg;base64,${item.image}`;
                                }
                                return (
                                    <ItemCard
                                        key={item.id}
                                        item={item} // Pass full item
                                        title={item.title}
                                        type={item.category}
                                        owner={item.ownerName || 'Neighbor'}
                                        price={item.price}
                                        image={imageUrl}
                                        description={item.description}
                                        onMessage={() => handleMessageOwner(item)} // Pass handler
                                    />
                                );
                            })
                        ) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--secondary)' }}>
                                No resources listed yet. Be the first to share!
                            </div>
                        )}
                    </div>
                )
            }

            {/* Chat Window */}
            {showChat && chatPartner && (
                <ChatWindow
                    partnerName={chatPartner.name}
                    partnerEmail={chatPartner.email}
                    onClose={() => setShowChat(false)}
                    currentUserEmail={currentUserEmail}
                />
            )}
        </div >
    );
};

const ItemCard = ({ item, title, type, owner, price, image, description, onMessage }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div style={{ perspective: '1000px', height: '400px' }}>
            <motion.div
                style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
            >
                {/* Front */}
                <div
                    onClick={() => setIsFlipped(true)}
                    style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        borderRadius: '24px', overflow: 'hidden', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column',
                        background: 'var(--card-bg)', border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{ height: '220px', overflow: 'hidden', position: 'relative' }}>
                        <motion.img
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.5 }}
                            src={image}
                            alt={title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'linear-gradient(to bottom, transparent 70%, rgba(0,0,0,0.5))'
                        }} />
                    </div>
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                            <span style={{
                                fontSize: '0.75rem', textTransform: 'uppercase', color: 'white',
                                background: type === 'Tool' ? '#0071e3' : '#34c759',
                                padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', letterSpacing: '0.5px'
                            }}>
                                {type}
                            </span>
                            <span style={{ fontSize: '0.9rem', color: 'var(--secondary)', fontWeight: '500' }}>{owner}</span>
                        </div>
                        <h3 style={{ margin: '5px 0 10px 0', fontSize: '1.2rem', fontWeight: '700', color: 'var(--text)' }}>{title}</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--text)' }}>{price}</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                Details <span style={{ fontSize: '1.0rem' }}>⟳</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div
                    onClick={() => setIsFlipped(false)}
                    style={{
                        position: 'absolute', width: '100%', height: '100%',
                        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)', borderRadius: '24px', padding: '30px', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                        background: '#151516', color: 'white', border: '1px solid #333',
                        boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)'
                    }}
                >
                    <h3 style={{ marginBottom: '15px', fontSize: '1.4rem', color: 'var(--text)' }}>{title}</h3>
                    <p style={{ color: 'var(--secondary)', marginBottom: '30px', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        {description || "Excellent condition. Available for pickup in Downtown area. Contact owner to arrange exchange."}
                    </p>
                    <div style={{ marginBottom: '20px', width: '100%' }}>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '12px',
                            background: 'var(--item-bg)', borderRadius: '12px', alignItems: 'center'
                        }}>
                            <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Trust Score</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>⭐ 4.8</span>
                        </div>
                        <div style={{
                            display: 'flex', justifyContent: 'space-between', padding: '12px',
                            background: 'var(--item-bg)', borderRadius: '12px', alignItems: 'center'
                        }}>
                            <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Response Time</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>&lt; 1hr</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        <button
                            className="btn"
                            onClick={(e) => { e.stopPropagation(); onMessage(); }}
                            style={{ flex: 1, padding: '12px', background: '#0071e3', color: 'white' }}
                        >
                            Message Owner
                        </button>
                    </div>

                    <span style={{ marginTop: '20px', fontSize: '0.8rem', color: 'var(--secondary)', opacity: 0.7 }}>Tap to flip back</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Marketplace;
