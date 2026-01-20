import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaCog } from 'react-icons/fa';
import SettingsModal from '../components/SettingsModal';

const Profile = () => {
    const { token, logout } = useAuth();
    const [user, setUser] = useState(null);
    const [skills, setSkills] = useState([]);
    const [showSettings, setShowSettings] = useState(false);
    const [myResources, setMyResources] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    // Fetch Profile and Listings
    const fetchProfileData = async () => {
        if (!token) return;
        try {
            // Profile
            const profileRes = await fetch('http://localhost:8084/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const data = await profileRes.json();
                setUser(data);
                if (data.skills) {
                    setSkills(data.skills.split(',').map(s => s.trim()).filter(s => s));
                } else {
                    setSkills([]);
                }
            }

            // My Resources
            const resourcesRes = await fetch('http://localhost:8084/api/resources/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (resourcesRes.ok) {
                setMyResources(await resourcesRes.json());
            }

            // My Requests
            const requestsRes = await fetch('http://localhost:8084/api/requests/my', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (requestsRes.ok) {
                setMyRequests(await requestsRes.json());
            }

        } catch (error) {
            console.error("Failed to fetch profile data", error);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [token]);

    const handleUpdateProfile = async (updatedData) => {
        try {
            const response = await fetch('http://localhost:8084/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                const newData = await response.json();
                setUser(newData);
                if (newData.skills) {
                    setSkills(newData.skills.split(',').map(s => s.trim()).filter(s => s));
                }
                setShowSettings(false);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile", error);
        }
    };

    if (!user) return <div style={{ paddingTop: '120px', textAlign: 'center' }}>Loading Profile...</div>;

    return (
        <div className="container" style={{ paddingTop: '120px', maxWidth: '800px' }}>
            <motion.div
                className="glass"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.6 }}
                style={{ padding: '40px', borderRadius: '30px', textAlign: 'center', backgroundColor: 'var(--card-bg)', position: 'relative' }}
            >
                {/* Settings Button */}
                <button
                    onClick={() => setShowSettings(true)}
                    style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--secondary)' }}
                >
                    <FaCog />
                </button>

                <div style={{ position: 'relative', display: 'inline-block' }}>
                    <div
                        onClick={() => document.getElementById('profilePhotoInput').click()}
                        style={{ cursor: 'pointer', position: 'relative' }}
                    >
                        {user.profilePhoto ? (
                            <motion.img
                                whileHover={{ scale: 1.05 }}
                                src={`data:image/jpeg;base64,${user.profilePhoto}`}
                                alt="Profile"
                                style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '4px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                            />
                        ) : (
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                style={{ width: '120px', height: '120px', background: 'linear-gradient(135deg, #0071e3, #00c6fb)', borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem', fontWeight: 'bold', boxShadow: '0 10px 30px rgba(0, 113, 227, 0.3)' }}
                            >
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </motion.div>
                        )}
                        <div style={{ position: 'absolute', bottom: '5px', right: '0', background: 'white', borderRadius: '50%', padding: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                            📷
                        </div>
                    </div>
                    <input
                        type="file"
                        id="profilePhotoInput"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            setIsUploading(true);
                            const formData = new FormData();
                            formData.append('file', file);
                            try {
                                const res = await fetch('http://localhost:8084/api/users/photo', {
                                    method: 'PUT',
                                    headers: { 'Authorization': `Bearer ${token}` },
                                    body: formData
                                });
                                if (res.ok) {
                                    fetchProfileData();
                                } else {
                                    alert("Failed to upload photo");
                                }
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setIsUploading(false);
                            }
                        }}
                    />
                    {isUploading && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            borderRadius: '50%', background: 'rgba(255,255,255,0.8)',
                            display: 'flex', justifyContent: 'center', alignItems: 'center',
                            color: '#0071e3', fontWeight: 'bold'
                        }}>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                                style={{ width: '30px', height: '30px', border: '3px solid #0071e3', borderTopColor: 'transparent', borderRadius: '50%' }}
                            />
                        </div>
                    )}
                    <div style={{ position: 'absolute', bottom: '20px', right: '0', background: '#34c759', width: '25px', height: '25px', borderRadius: '50%', border: '3px solid white', display: 'none' }}></div>
                </div>

                <h1 style={{ marginBottom: '10px', color: 'var(--text)' }}>{user.name || 'User'}</h1>
                <p style={{ color: 'var(--secondary)', marginBottom: '30px', fontSize: '1.1rem' }}>
                    {user.title || 'Community Member'}
                </p>
                <p style={{ color: 'var(--secondary)', marginBottom: '30px', maxWidth: '600px', margin: '0 auto 30px auto' }}>
                    {user.about || 'No bio yet.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(150px, 1fr) minmax(150px, 1fr)', gap: '20px', marginBottom: '40px' }}>
                    <motion.div whileHover={{ y: -5 }} style={{ background: 'var(--item-bg)', padding: '25px', borderRadius: '24px' }}>
                        <h2 style={{ fontSize: '3rem', margin: '0', background: 'linear-gradient(to right, #0071e3, #00c6fb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.karma || 100}</h2>
                        <span style={{ color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Karma Points</span>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} style={{ background: 'var(--item-bg)', padding: '25px', borderRadius: '24px' }}>
                        <h2 style={{ fontSize: '3rem', margin: '0', background: 'linear-gradient(to right, #34c759, #30b34d)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>98%</h2>
                        <span style={{ color: 'var(--secondary)', fontWeight: '600', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Trust Score</span>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', textAlign: 'left' }}>
                    <div>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>My Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                            {skills.length > 0 ? skills.map((skill, index) => (
                                <motion.span
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    style={{ background: '#e8f0fe', color: '#0071e3', padding: '8px 16px', borderRadius: '20px', fontWeight: '600', fontSize: '0.9rem' }}
                                >
                                    {skill}
                                </motion.span>
                            )) : <span style={{ color: 'var(--secondary)' }}>No skills listed.</span>}
                        </div>
                    </div>

                    <div>
                        <h3 style={{ marginBottom: '20px', color: 'var(--text)' }}>My Listings</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {myResources.length === 0 && myRequests.length === 0 && (
                                <span style={{ color: 'var(--secondary)' }}>No active listings.</span>
                            )}

                            {myResources.map(res => (
                                <ListingItem key={`res-${res.id}`} title={res.title} status="Resource" views="-" />
                            ))}

                            {myRequests.map(req => (
                                <ListingItem key={`req-${req.id}`} title={req.item} status={req.status} views="-" />
                            ))}
                        </div>
                    </div>
                </div>

            </motion.div>

            {showSettings && (
                <SettingsModal
                    user={user}
                    onClose={() => setShowSettings(false)}
                    onSave={handleUpdateProfile}
                />
            )}
        </div>
    );
};

const ListingItem = ({ title, status, views }) => (
    <motion.div
        whileHover={{ x: 5, backgroundColor: 'var(--item-bg)' }}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderRadius: '16px', border: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.2s' }}
    >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '600', fontSize: '1rem', color: 'var(--text)' }}>{title}</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{views} views</span>
        </div>
        <span style={{
            color: status === 'Active' || status === 'Available' ? '#34c759' : '#ff9500',
            fontWeight: '600',
            background: status === 'Active' || status === 'Available' ? 'rgba(52, 199, 89, 0.1)' : 'rgba(255, 149, 0, 0.1)',
            padding: '4px 10px',
            borderRadius: '12px',
            fontSize: '0.75rem'
        }}>
            {status}
        </span>
    </motion.div>
);

export default Profile;
