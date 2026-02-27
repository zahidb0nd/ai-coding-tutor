import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api';

export default function Login() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = isLogin
                ? await loginUser({ email: form.email, password: form.password })
                : await registerUser(form);

            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            navigate('/challenges');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                background: 'var(--bg-primary)',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Removed dark mode background decorations */}

            <div
                className="animate-fade-in"
                style={{
                    width: '100%',
                    maxWidth: 440,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🧠</div>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 800,
                            marginBottom: 8,
                            color: 'var(--text-primary)',
                        }}
                    >
                        CodeTutor
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
                        AI-powered coding challenges that grow with you
                    </p>
                </div>

                {/* Card */}
                <div
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 32,
                        boxShadow: 'var(--shadow-md)',
                    }}
                >
                    {/* Tabs */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 4,
                            marginBottom: 28,
                            padding: 4,
                            background: 'var(--bg-input)',
                            borderRadius: 'var(--radius-sm)',
                        }}
                    >
                        {['Login', 'Register'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setIsLogin(tab === 'Login');
                                    setError('');
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px 0',
                                    borderRadius: 6,
                                    border: 'none',
                                    fontSize: 14,
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background:
                                        (tab === 'Login') === isLogin ? 'var(--accent)' : 'transparent',
                                    color:
                                        (tab === 'Login') === isLogin
                                            ? '#fff'
                                            : 'var(--text-muted)',
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {!isLogin && (
                            <div style={{ marginBottom: 16 }}>
                                <label
                                    style={{
                                        display: 'block',
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: 'var(--text-secondary)',
                                        marginBottom: 6,
                                    }}
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Your name"
                                    required={!isLogin}
                                    style={inputStyle}
                                />
                            </div>
                        )}

                        <div style={{ marginBottom: 16 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                    marginBottom: 6,
                                }}
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                style={inputStyle}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label
                                style={{
                                    display: 'block',
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--text-secondary)',
                                    marginBottom: 6,
                                }}
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                required
                                style={inputStyle}
                            />
                        </div>

                        {error && (
                            <div
                                style={{
                                    padding: '10px 14px',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'rgba(225, 112, 85, 0.1)',
                                    border: '1px solid rgba(225, 112, 85, 0.3)',
                                    color: 'var(--danger)',
                                    fontSize: 13,
                                    marginBottom: 16,
                                }}
                            >
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '12px 0',
                                borderRadius: 'var(--radius-sm)',
                                border: 'none',
                                background: loading
                                    ? 'var(--border-light)'
                                    : 'var(--accent)',
                                color: '#fff',
                                fontSize: 15,
                                fontWeight: 600,
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: loading ? 'none' : 'var(--shadow-sm)',
                            }}
                        >
                            {loading
                                ? 'Please wait...'
                                : isLogin
                                    ? 'Sign In'
                                    : 'Create Account'}
                        </button>
                    </form>
                </div>

                {/* Footer text */}
                <p
                    style={{
                        textAlign: 'center',
                        marginTop: 24,
                        fontSize: 13,
                        color: 'var(--text-muted)',
                    }}
                >
                    Built with ❤️ for learners
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)',
    background: 'var(--bg-input)',
    color: 'var(--text-primary)',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'var(--font-sans)',
};
