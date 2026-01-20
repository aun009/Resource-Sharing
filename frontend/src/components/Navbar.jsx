import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaToolbox, FaUserCircle, FaComments } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="glass"
      style={{
        position: 'fixed',
        top: '20px',
        left: '0',
        right: '0',
        margin: '0 auto',
        width: '95%',
        maxWidth: '1200px',
        zIndex: 1000,
        padding: '18px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: '24px',
      }}
    >
      <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          <div style={{ width: '10px', height: '10px', background: '#ff5f57', borderRadius: '50%' }}></div>
          <div style={{ width: '10px', height: '10px', background: '#febc2e', borderRadius: '50%' }}></div>
          <div style={{ width: '10px', height: '10px', background: '#28c840', borderRadius: '50%' }}></div>
        </div>
        <span style={{ fontWeight: '700', letterSpacing: '-0.5px' }}>Resourcify</span>
      </Link>

      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <NavLink to="/" icon={<FaMapMarkerAlt />} text="Explore" active={location.pathname === '/'} />
        <NavLink to="/marketplace" icon={<FaToolbox />} text="Marketplace" active={location.pathname === '/marketplace'} />
        <NavLink to="/chat" icon={<FaComments />} text="Chat" active={location.pathname === '/chat'} />

        {user ? (
          <>
            <NavLink to="/profile" icon={<FaUserCircle />} text="Profile" active={location.pathname === '/profile'} />
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => {
                if (window.confirm("Are you sure you want to sign out?")) {
                  logout();
                  navigate('/login');
                }
              }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--secondary)', fontSize: '0.85rem', marginLeft: '10px' }}
            >
              Sign Out
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="btn"
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            Sign In
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, icon, text, active }) => (
  <Link to={to} style={{ textDecoration: 'none', position: 'relative', color: active ? 'var(--accent)' : 'var(--text)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: '500', transition: 'color 0.3s' }}>
    <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
      {icon}
    </motion.div>
    {text}
    {active && (
      <motion.div
        layoutId="underline"
        style={{ position: 'absolute', bottom: '-4px', width: '100%', height: '2px', background: 'var(--accent)', borderRadius: '1px' }}
      />
    )}
  </Link>
);

export default Navbar;
