import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isLoggedIn = !!localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    const levelLabels = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
    const levelColors = ['', '#00b894', '#00cec9', '#6c5ce7', '#e17055', '#d63031'];

    if (!isLoggedIn) return null;

    const navItems = [
        { label: 'Challenges', path: '/challenges' },
        { label: 'Leaderboard', path: '/leaderboard' },
        { label: 'History', path: '/history' },
        { label: 'Dashboard', path: '/dashboard' },
    ];
    if (user && user.role === 'instructor') {
        navItems.push({ label: 'Instructor', path: '/instructor' });
    }

    return (
        <nav
            style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'rgba(10, 10, 15, 0.85)',
                backdropFilter: 'blur(16px)',
                borderBottom: '1px solid var(--border)',
                padding: '0 24px',
            }}
        >
            <div
                style={{
                    maxWidth: 1200,
                    margin: '0 auto',
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
                            background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
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
                    className="desktop-nav"
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
                                    background: `${levelColors[user.level] || levelColors[1]}22`,
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
