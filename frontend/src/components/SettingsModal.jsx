import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SettingsModal = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        about: '',
        skills: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                title: user.title || '',
                about: user.about || '',
                skills: user.skills || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 2000, backdropFilter: 'blur(5px)'
        }}>
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="glass"
                style={{ padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '500px', background: 'var(--card-bg)' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, color: 'var(--text)' }}>Edit Profile</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text)' }}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--secondary)', fontSize: '0.9rem' }}>Full Name</label>
                        <input
                            type="text" name="name"
                            value={formData.name} onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--secondary)', fontSize: '0.9rem' }}>Job Title</label>
                        <input
                            type="text" name="title" placeholder="e.g. Full Stack Developer"
                            value={formData.title} onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--secondary)', fontSize: '0.9rem' }}>About / Bio</label>
                        <textarea
                            name="about" rows="3"
                            value={formData.about} onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', color: 'var(--secondary)', fontSize: '0.9rem' }}>Skills (comma separated)</label>
                        <input
                            type="text" name="skills" placeholder="Coding, Repair, Teaching"
                            value={formData.skills} onChange={handleChange}
                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #ddd', background: 'var(--bg)', color: 'var(--text)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="button" onClick={onClose} className="btn" style={{ background: '#ccc', flex: 1, color: '#333' }}>Cancel</button>
                        <button type="submit" className="btn" style={{ flex: 1 }}>Save Changes</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
