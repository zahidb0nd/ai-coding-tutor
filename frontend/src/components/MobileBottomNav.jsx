import { Link, useLocation } from 'react-router-dom';

export default function MobileBottomNav() {
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const navItems = [
        { label: 'Challenges', path: '/challenges', icon: '🎯' },
        { label: 'Board', path: '/leaderboard', icon: '🏆' },
        { label: 'History', path: '/history', icon: '📜' },
        { label: 'Dashboard', path: '/dashboard', icon: '📊' },
    ];

    if (user && user.role === 'instructor') {
        navItems.push({ label: 'Teach', path: '/instructor', icon: '👨‍🏫' });
    }

    return (
        <nav className="bottom-nav">
            {navItems.map((item) => (
                <Link
                    key={item.path}
                    to={item.path}
                    className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                >
                    <span className="bottom-nav-item-icon">{item.icon}</span>
                    <span>{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
