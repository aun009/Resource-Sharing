import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs';
import { API_BASE_URL, WS_BASE_URL } from '../config';

const ChatPage = () => {
    const { user, token } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedPartner, setSelectedPartner] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [currentUserEmail, setCurrentUserEmail] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const messagesEndRef = useRef(null);
    const selectedPartnerRef = useRef(null);

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
            console.error(error);
        }
    };

    const fetchConversations = async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setConversations(data);
            }
        } catch (error) {
            console.error("Failed to fetch conversations", error);
        }
    };

    const fetchHistory = async () => {
        if (!selectedPartner) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/chat/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter
                const relevant = data.filter(msg =>
                    (msg.sender === currentUserEmail && msg.recipient === selectedPartner.email) ||
                    (msg.sender === selectedPartner.email && msg.recipient === currentUserEmail)
                );
                setMessages(relevant);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        }
    };

    useEffect(() => {
        fetchCurrentUser();
        fetchConversations();
    }, [token]);

    // Keep ref updated
    useEffect(() => {
        selectedPartnerRef.current = selectedPartner;
        if (selectedPartner) {
            fetchHistory();
        }
    }, [selectedPartner]);

    // WebSocket Connection
    useEffect(() => {
        if (!currentUserEmail) return;

        const socket = new SockJS(`${WS_BASE_URL}/ws`);
        const client = Stomp.over(socket);
        client.debug = null; // Disable debug logs

        client.connect({}, () => {
            client.subscribe(`/topic/user/${currentUserEmail}/messages`, (payload) => {
                const msg = JSON.parse(payload.body);
                const currentPartner = selectedPartnerRef.current;

                // Update active chat if relevant
                if (currentPartner && (msg.sender === currentPartner.email || msg.recipient === currentPartner.email)) {
                    setMessages(prev => [...prev, msg]);
                }

                // Refresh conversations list to show new message preview/order
                fetchConversations();
            });
        }, (err) => {
            console.error("WebSocket error:", err);
        });

        return () => {
            if (client && client.connected) client.disconnect();
        };
    }, [currentUserEmail]);

    // Scroll only when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, selectedPartner]); // Depend on length and partner change

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return '';
        let date;
        // Handle Array format [yyyy, mm, dd, hh, mm, ss]
        if (Array.isArray(timestamp)) {
            date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5]);
        } else {
            date = new Date(timestamp);
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedPartner) return;

        const newMessage = {
            sender: currentUserEmail,
            recipient: selectedPartner.email,
            content: input,
            type: 'CHAT'
        };

        // Optimistic
        setMessages(prev => [...prev, { ...newMessage, timestamp: new Date().toISOString() }]);
        setInput("");

        try {
            await fetch(`${API_BASE_URL}/api/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMessage)
            });
            fetchHistory(); // Sync
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    return (
        <div className="container" style={{ paddingTop: '130px', height: '100vh', display: 'flex', gap: '20px', paddingBottom: '20px', boxSizing: 'border-box' }}>
            {/* Sidebar List */}
            <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="glass"
                style={{ width: '320px', borderRadius: '24px', padding: '20px', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border)' }}
            >
                <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', color: 'var(--text)', paddingLeft: '10px' }}>Messages</h2>
                <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {conversations.length === 0 && <p style={{ color: 'var(--secondary)', textAlign: 'center', marginTop: '50px' }}>No active conversations.</p>}
                    {conversations.map((c, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ scale: 1.02, backgroundColor: 'var(--item-bg)' }}
                            onClick={() => setSelectedPartner(c)}
                            style={{
                                padding: '15px', borderRadius: '18px', cursor: 'pointer',
                                background: selectedPartner?.email === c.email ? '#0071e3' : 'transparent',
                                color: selectedPartner?.email === c.email ? 'white' : 'var(--text)',
                                transition: 'background-color 0.2s ease',
                                display: 'flex', alignItems: 'center', gap: '15px',
                                border: selectedPartner?.email === c.email ? 'none' : '1px solid transparent'
                            }}
                        >
                            <div style={{
                                width: '45px', height: '45px', borderRadius: '50%',
                                background: selectedPartner?.email === c.email ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #e0e0e0, #f5f5f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1.1rem', color: selectedPartner?.email === c.email ? 'white' : '#555',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                                overflow: 'hidden'
                            }}>
                                {c.photo ? (
                                    <img src={`data:image/jpeg;base64,${c.photo}`} alt={c.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    c.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontWeight: '600', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Chat Area */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass"
                style={{ flex: 1, borderRadius: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', background: 'var(--card-bg)', border: '1px solid var(--border)', position: 'relative' }}
            >
                {!selectedPartner ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                        <div style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.2 }}>💬</div>
                        <p style={{ fontSize: '1.2rem' }}>Select a conversation to start chatting</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div style={{
                            padding: '20px 30px',
                            borderBottom: '1px solid var(--border)',
                            background: 'var(--bg)', // slightly distinct header bg
                            display: 'flex', alignItems: 'center', gap: '15px',
                            zIndex: 10
                        }}>
                            <div style={{
                                width: '45px', height: '45px', borderRadius: '50%',
                                background: 'linear-gradient(135deg, #0071e3, #00c6fb)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1.2rem', color: 'white',
                                boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)',
                                overflow: 'hidden'
                            }}>
                                {selectedPartner.photo ? (
                                    <img src={`data:image/jpeg;base64,${selectedPartner.photo}`} alt={selectedPartner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    selectedPartner.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, color: 'var(--text)', fontSize: '1.2rem' }}>{selectedPartner.name}</h3>
                                <span style={{ fontSize: '0.85rem', color: '#34c759', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34c759' }}></span>
                                    Online
                                </span>
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="hide-scrollbar" style={{ flex: 1, padding: '20px 30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)' }}>
                            {messages.map((msg, index) => {
                                const isMe = msg.sender === currentUserEmail;
                                return (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        key={index}
                                        style={{
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '70%',
                                            padding: '12px 16px',
                                            borderRadius: '20px',
                                            background: isMe ? '#0071e3' : 'var(--item-bg)',
                                            color: isMe ? 'white' : 'var(--text)',
                                            fontSize: '1rem',
                                            lineHeight: '1.5',
                                            borderBottomRightRadius: isMe ? '4px' : '20px',
                                            borderBottomLeftRadius: isMe ? '20px' : '4px',
                                            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                            border: isMe ? 'none' : '1px solid var(--border)',
                                            display: 'flex', flexDirection: 'column'
                                        }}
                                    >
                                        <span>{msg.content}</span>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            marginTop: '4px',
                                            opacity: 0.7,
                                            alignSelf: 'flex-end',
                                            color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--secondary)'
                                        }}>
                                            {formatMessageTime(msg.timestamp)}
                                        </span>
                                    </motion.div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={sendMessage} style={{ padding: '20px 30px', background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', gap: '15px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                style={{
                                    flex: 1, padding: '16px 24px', borderRadius: '30px',
                                    border: '1px solid var(--border)', outline: 'none',
                                    fontSize: '1rem', background: 'var(--item-bg)', color: 'var(--text)',
                                    transition: 'all 0.2s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#0071e3'}
                                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                disabled={!input.trim()}
                                style={{
                                    padding: '16px', borderRadius: '50%',
                                    background: input.trim() ? '#0071e3' : 'var(--secondary)',
                                    color: 'white', border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    width: '54px', height: '54px',
                                    opacity: input.trim() ? 1 : 0.5
                                }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </motion.button>
                        </form>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default ChatPage;
