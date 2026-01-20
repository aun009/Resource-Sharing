import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            // In a real app, you'd validate the token with the backend here
            // For now, we'll just decode it or assume it's valid if present
            // and set a mock user or fetch user details
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        }
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const jwt = await response.text(); // Backend returns plain string token
                localStorage.setItem('token', jwt);
                setToken(jwt);

                // Mock user details for now as the token login doesn't return user info yet
                const mockUser = { name: email.split('@')[0], email: email, karma: 100 };
                localStorage.setItem('user', JSON.stringify(mockUser));
                setUser(mockUser);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error("Login failed", error);
            return false;
        }
    };

    const register = async (name, email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            if (response.ok) {
                return { success: true };
            } else {
                const msg = await response.text();
                return { success: false, message: msg };
            }
        } catch (error) {
            console.error("Registration failed", error);
            return { success: false, message: "Network error" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
