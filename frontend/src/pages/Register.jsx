import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const validatePassword = (pass) => {
        // At least 8 chars, 1 number, 1 special char
        const regex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/;
        return regex.test(pass);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validatePassword(password)) {
            setError('Password must be at least 8 chars and contain a number and special character (@, #, etc).');
            return;
        }

        const result = await register(name, email, password);
        if (result.success) {
            navigate('/login');
        } else {
            setError(result.message || 'Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', paddingTop: '0' }}>
            <motion.div
                className="glass"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: '40px', borderRadius: '24px', width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.9)', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)' }}
            >
                <h2 style={{ textAlign: 'center', marginBottom: '30px', color: '#1d1d1f', fontSize: '2rem' }}>Join Resourcify</h2>
                {error && <div style={{ color: '#d32f2f', textAlign: 'center', marginBottom: '20px', padding: '10px', background: 'rgba(211, 47, 47, 0.1)', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d2d2d7', background: '#fff', outline: 'none', color: '#1d1d1f', fontSize: '1rem', transition: 'border-color 0.2s' }}
                            placeholder="John Doe"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d2d2d7', background: '#fff', outline: 'none', color: '#1d1d1f', fontSize: '1rem', transition: 'border-color 0.2s' }}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#555', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #d2d2d7', background: '#fff', outline: 'none', color: '#1d1d1f', fontSize: '1rem', transition: 'border-color 0.2s' }}
                            placeholder="••••••••"
                            required
                        />
                        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>At least 8 chars, 1 number, 1 special char</p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="btn"
                        type="submit"
                        style={{ marginTop: '10px', width: '100%', padding: '16px', fontSize: '1.05rem', background: '#0071e3', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Create Account
                    </motion.button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.9rem', color: '#666' }}>
                    Already have an account? <span style={{ color: '#0071e3', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => navigate('/login')}>Sign in</span>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
