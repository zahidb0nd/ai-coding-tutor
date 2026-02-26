import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInstructorAnalytics, createInstructorChallenge } from '../api';

export default function InstructorDashboard() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const [challengeForm, setChallengeForm] = useState({
        title: '',
        description: '',
        difficulty: 1,
        language: 'javascript',
        rubric: ''
    });
    const [creating, setCreating] = useState(false);
    const [createMsg, setCreateMsg] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user || user.role !== 'instructor') {
            navigate('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await getInstructorAnalytics();
            setAnalytics(res.data);
        } catch (err) {
            setError('Failed to load instructor analytics.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateChallenge = async (e) => {
        e.preventDefault();
        setCreating(true);
        setCreateMsg('');
        try {
            await createInstructorChallenge(challengeForm);
            setCreateMsg('Challenge created successfully!');
            setChallengeForm({ title: '', description: '', difficulty: 1, language: 'javascript', rubric: '' });
            fetchData(); // Refresh analytics
        } catch (err) {
            setCreateMsg(err.response?.data?.error || 'Failed to create challenge.');
        } finally {
            setCreating(false);
        }
    };

    if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading Instructor View...</div>;
    if (error) return <div style={{ padding: 32, color: 'var(--danger)', textAlign: 'center' }}>{error}</div>;

    const cards = [
        { label: 'Total Users', value: analytics.totalUsers, icon: '👥' },
        { label: 'Platform Submissions', value: analytics.totalSubmissions, icon: '📝' },
        { label: 'Total Challenges', value: analytics.totalChallenges, icon: '🎯' },
        { label: 'Avg Platform Score', value: analytics.averageScore, icon: '📊' }
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32 }}>Instructor Dashboard</h1>

            {/* Analytics Grid */}
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Platform Overview</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 48 }}>
                {cards.map((c, i) => (
                    <div key={i} style={{ padding: 20, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
                        <div style={{ fontSize: 28, fontWeight: 'bold' }}>{c.value}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Create Challenge Form */}
            <h2 style={{ fontSize: 20, marginBottom: 16 }}>Create Challenge Set</h2>
            <div style={{ background: 'var(--bg-card)', padding: 24, borderRadius: 8, border: '1px solid var(--border)', maxWidth: 600 }}>
                {createMsg && <div style={{ marginBottom: 16, padding: 12, borderRadius: 6, background: createMsg.includes('success') ? 'rgba(0,184,148,0.1)' : 'rgba(214,48,49,0.1)', color: createMsg.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{createMsg}</div>}
                <form onSubmit={handleCreateChallenge} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Title</label>
                        <input required value={challengeForm.title} onChange={e => setChallengeForm({ ...challengeForm, title: e.target.value })} style={inputStyle} placeholder="E.g. Binary Search" />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Description</label>
                        <textarea required value={challengeForm.description} onChange={e => setChallengeForm({ ...challengeForm, description: e.target.value })} style={{ ...inputStyle, minHeight: 100 }} placeholder="Write a function that..." />
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Difficulty (1-5)</label>
                            <input required type="number" min="1" max="5" value={challengeForm.difficulty} onChange={e => setChallengeForm({ ...challengeForm, difficulty: parseInt(e.target.value) })} style={inputStyle} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Language</label>
                            <select value={challengeForm.language} onChange={e => setChallengeForm({ ...challengeForm, language: e.target.value })} style={inputStyle}>
                                <option value="javascript">JavaScript</option>
                                <option value="typescript">TypeScript</option>
                                <option value="python">Python</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: 'var(--text-secondary)' }}>Scoring Rubric (For AI)</label>
                        <textarea required value={challengeForm.rubric} onChange={e => setChallengeForm({ ...challengeForm, rubric: e.target.value })} style={{ ...inputStyle, minHeight: 80 }} placeholder="100pts for O(log n) time, 50pts for O(n)" />
                    </div>
                    <button type="submit" disabled={creating} style={{ padding: '10px 16px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 6, fontWeight: 600, cursor: creating ? 'not-allowed' : 'pointer', opacity: creating ? 0.7 : 1 }}>
                        {creating ? 'Creating...' : 'Create Challenge'}
                    </button>
                </form>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 6,
    border: '1px solid var(--border)',
    background: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    fontSize: 14
};
