import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Stomp from 'stompjs';
import SockJS from 'sockjs-client/dist/sockjs';

if (typeof global === 'undefined') {
    window.global = window;
}

const ChatWindow = ({ partnerName, partnerEmail, partnerPhoto, onClose, currentUserEmail }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8084/api/chat/history', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter messages relevant to this partner (Case Insensitive)
                const relevant = data.filter(msg => {
                    const s = (msg.sender || "").toLowerCase();
                    const r = (msg.recipient || "").toLowerCase();
                    const me = (currentUserEmail || "").toLowerCase();
                    const other = (partnerEmail || "").toLowerCase();
                    return (s === me && r === other) || (s === other && r === me);
                });
                setMessages(relevant);
            }
        } catch (error) {
            console.error("Failed to fetch chat history", error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMessage = {
            sender: currentUserEmail, // Backend can enforce this too
            recipient: partnerEmail,
            content: input,
            type: 'CHAT'
        };

        // Optimistic UI update
        const tempMsg = { ...newMessage, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, tempMsg]);
        setInput("");

        try {
            const token = localStorage.getItem('token');
            await fetch('http://localhost:8084/api/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newMessage)
            });
            fetchHistory(); // Sync to get real ID/timestamp
        } catch (error) {
            console.error("Failed to send message", error);
        }
    };

    // Initial History Load
    useEffect(() => {
        fetchHistory();
    }, [partnerEmail]);

    // WebSocket Connection
    useEffect(() => {
        if (!currentUserEmail) return;

        let client = null;
        let socket = null;
        let retryTimeout = null;

        const connect = () => {
            socket = new SockJS('http://localhost:8084/ws');
            client = Stomp.over(socket);

            client.debug = (str) => {
                // console.log("STOMP: " + str); // Uncomment for debugging
            };

            client.connect({}, () => {
                const topic = `/topic/user/${currentUserEmail.toLowerCase()}/messages`;
                console.log("Connected to WebSocket. Subscribing to " + topic);
                client.subscribe(topic, (payload) => {
                    const msg = JSON.parse(payload.body);
                    // Update if message belongs to this conversation
                    if (msg.sender === partnerEmail || (msg.sender === currentUserEmail && msg.recipient === partnerEmail)) {
                        setMessages(prev => {
                            // If sender is ME, we added it optimistically.
                            if (msg.sender === currentUserEmail) return prev;
                            return [...prev, msg];
                        });
                    }
                });
            }, (err) => {
                console.error("WebSocket Connection Error, retrying in 5s...", err);
                retryTimeout = setTimeout(connect, 5000);
            });
        };

        connect();

        return () => {
            if (client && client.connected) {
                try { client.disconnect(); } catch (e) { console.error("Disconnect error", e); }
            }
            if (retryTimeout) clearTimeout(retryTimeout);
        };
    }, [currentUserEmail, partnerEmail]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="glass"
            style={{
                position: 'fixed', bottom: '20px', right: '20px', width: '350px', height: '500px',
                background: 'rgba(255, 255, 255, 0.95)', borderRadius: '20px', zIndex: 1000,
                display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}
        >
            {/* Header */}
            <div style={{ padding: '15px', background: '#0071e3', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {partnerPhoto ? (
                        <img src={`data:image/jpeg;base64,${partnerPhoto}`} alt={partnerName} style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', border: '2px solid white' }} />
                    ) : (
                        <div style={{ width: '30px', height: '30px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {partnerName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span style={{ fontWeight: '600' }}>{partnerName}</span>
                </div>
                <span onClick={onClose} style={{ cursor: 'pointer', fontSize: '1.5rem', lineHeight: '1' }}>×</span>
            </div>

            {/* Messages */}
            <div className="hide-scrollbar" style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#888', marginTop: '20px', fontSize: '0.9rem' }}>
                        Start the conversation with {partnerName}!
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} style={{
                        alignSelf: msg.sender === currentUserEmail ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: msg.sender === currentUserEmail ? '#0071e3' : '#f5f5f7',
                        color: msg.sender === currentUserEmail ? 'white' : '#1d1d1f',
                        fontSize: '0.9rem',
                        borderBottomRightRadius: msg.sender === currentUserEmail ? '2px' : '12px',
                        borderBottomLeftRadius: msg.sender === currentUserEmail ? '12px' : '2px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        {msg.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} style={{ padding: '15px', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '10px', background: 'white' }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    style={{ flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #e5e5e5', outline: 'none', fontSize: '0.95rem', background: '#f5f5f7' }}
                />
                <button type="submit" style={{ background: '#0071e3', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                    ➤
                </button>
            </form>
        </motion.div>
    );
};

export default ChatWindow;
