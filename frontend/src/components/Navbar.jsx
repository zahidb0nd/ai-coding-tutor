import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useIsMobile } from '../hooks/useMediaQuery';
import MobileBottomNav from './MobileBottomNav';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useIsMobile();

    const token = localStorage.getItem('token');
    const isLoggedIn = token && token !== 'undefined' && token !== 'null';

    let user = null;
    try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== 'undefined' && userStr !== 'null') {
            user = JSON.parse(userStr);
        }
    } catch (e) {
        console.error('Failed to parse user', e);
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const levelLabels = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
    const levelColors = ['', '#00b894', '#00cec9', '#6c5ce7', '#e17055', '#d63031'];

    if (!isLoggedIn) return null;

    // Mobile uses bottom navigation
    if (isMobile) {
        return <MobileBottomNav />;
    }

    const navItems = [
        { label: 'Challenges', path: '/challenges' },
        { label: 'Leaderboard', path: '/leaderboard' },
        { label: 'History', path: '/history' },
        { label: 'Dashboard', path: '/dashboard' },
    ];
    if (user && user.role === 'instructor') {
        navItems.push({ label: 'Instructor', path: '/instructor' });
    }

    // Desktop navigation
    return (
        <nav
            className="sticky-header desktop-only"
            style={{
                zIndex: 100,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(8px)',
                borderBottom: '1px solid var(--border)',
                padding: '0 var(--container-padding)',
            }}
        >
            <div
                className="container"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 64,
                }}
            >
                {/* Logo */}
                <Link
                    to="/challenges"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                    }}
                >
                    <span style={{ fontSize: 24 }}>🧠</span>
                    <span
                        style={{
                            fontSize: 18,
                            fontWeight: 700,
                            color: 'var(--accent)',
                        }}
                    >
                        CodeTutor
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                padding: '8px 16px',
                                borderRadius: 'var(--radius-sm)',
                                textDecoration: 'none',
                                fontSize: 14,
                                fontWeight: 500,
                                color:
                                    location.pathname === item.path
                                        ? 'var(--accent)'
                                        : 'var(--text-secondary)',
                                background:
                                    location.pathname === item.path
                                        ? 'rgba(108, 92, 231, 0.1)'
                                        : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* User info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {user && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span
                                style={{
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 12,
                                    fontWeight: 600,
                                    background: `${levelColors[user.level] || levelColors[1]}15`,
                                    color: levelColors[user.level] || levelColors[1],
                                    border: `1px solid ${levelColors[user.level] || levelColors[1]}44`,
                                }}
                            >
                                Lv.{user.level} {levelLabels[user.level] || 'Beginner'}
                            </span>
                            <span
                                style={{
                                    fontSize: 14,
                                    color: 'var(--text-secondary)',
                                    fontWeight: 500,
                                }}
                            >
                                {user.name}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            padding: '6px 14px',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--border)',
                            background: 'transparent',
                            color: 'var(--text-muted)',
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.borderColor = 'var(--danger)';
                            e.target.style.color = 'var(--danger)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.color = 'var(--text-muted)';
                        }}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
