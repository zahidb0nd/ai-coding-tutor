import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProgress, getSubmissions } from '../api';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

export default function Dashboard() {
    const [progress, setProgress] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user) {
            navigate('/');
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [progressRes, submissionsRes] = await Promise.all([
                getUserProgress(user.id),
                getSubmissions(user.id),
            ]);
            setProgress(progressRes.data);
            setSubmissions(submissionsRes.data);
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const levelLabels = ['', 'Beginner', 'Novice', 'Intermediate', 'Advanced', 'Expert'];
    const levelColors = ['', '#00b894', '#00cec9', '#6c5ce7', '#e17055', '#d63031'];

    if (loading) {
        return (
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                <div
                    className="loading-shimmer"
                    style={{ height: 40, width: 300, borderRadius: 8, marginBottom: 32 }}
                />
                <div
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}
                >
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="loading-shimmer" style={{ height: 100, borderRadius: 12 }} />
                    ))}
                </div>
                <div className="loading-shimmer" style={{ height: 300, borderRadius: 12 }} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <p>{error}</p>
                <button
                    onClick={fetchData}
                    style={{
                        marginTop: 16,
                        padding: '8px 20px',
                        borderRadius: 8,
                        border: '1px solid var(--accent)',
                        background: 'transparent',
                        color: 'var(--accent)',
                        cursor: 'pointer',
                    }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const stats = progress?.stats || {};
    const chartData = (progress?.recentScores || []).map((s, idx) => ({
        name: `#${idx + 1}`,
        score: s.score,
        challenge: s.challenge,
    }));

    const statCards = [
        {
            label: 'Total Submissions',
            value: stats.totalSubmissions || 0,
            icon: '📝',
            color: '#6c5ce7',
        },
        {
            label: 'Average Score',
            value: stats.averageScore || 0,
            icon: '📊',
            color: '#00b894',
        },
        {
            label: 'Current Streak',
            value: `${progress?.user?.currentStreak || 0} Days`,
            icon: '🔥',
            color: '#e84393',
        },
        {
            label: 'Challenges Completed',
            value: `${stats.completedChallenges || 0} / ${stats.totalChallenges || 0}`,
            icon: '🏆',
            color: '#fdcb6e',
        },
        {
            label: 'Highest Score',
            value: stats.highestScore || 0,
            icon: '⭐',
            color: '#e17055',
        },
        {
            label: 'Best Solve Time',
            value: progress?.user?.fastestSolveTime ? `${Math.floor(progress.user.fastestSolveTime / 1000)}s` : '-',
            icon: '⏱️',
            color: '#a29bfe',
        }
    ];

    return (
        <div
            className="animate-fade-in"
            style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}
        >
            {/* Header */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 32,
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Dashboard</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        Track your coding progress
                    </p>
                </div>

                {/* Level badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 20px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                    }}
                >
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 24,
                            background: `${levelColors[user?.level || 1]}22`,
                            border: `2px solid ${levelColors[user?.level || 1]}`,
                        }}
                    >
                        {user?.level || 1}
                    </div>
                    <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Level</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: levelColors[user?.level || 1] }}>
                            {levelLabels[user?.level || 1]}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: 16,
                    marginBottom: 32,
                }}
            >
                {statCards.map((card, idx) => (
                    <div
                        key={idx}
                        style={{
                            padding: 20,
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = card.color + '66';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--border)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <div style={{ fontSize: 28, marginBottom: 8 }}>{card.icon}</div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>
                            {card.value}
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                            {card.label}
                        </div>
                    </div>
                ))}
            </div>

            {/* Score Chart */}
            {chartData.length > 0 && (
                <div
                    style={{
                        padding: 24,
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        marginBottom: 32,
                    }}
                >
                    <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
                        Score Progress
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-muted)"
                                fontSize={12}
                            />
                            <YAxis
                                domain={[0, 100]}
                                stroke="var(--text-muted)"
                                fontSize={12}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8,
                                    color: 'var(--text-primary)',
                                    fontSize: 13,
                                }}
                                formatter={(value, name, props) => [
                                    value,
                                    props.payload.challenge || 'Score',
                                ]}
                            />
                            <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#6c5ce7"
                                strokeWidth={2}
                                dot={{ fill: '#6c5ce7', strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: '#a29bfe' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Submission History */}
            <div
                style={{
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Submission History</h2>
                </div>

                {submissions.length === 0 ? (
                    <div
                        style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}
                    >
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
                        <p>No submissions yet. Start solving challenges!</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table
                            style={{
                                width: '100%',
                                borderCollapse: 'collapse',
                                fontSize: 14,
                            }}
                        >
                            <thead>
                                <tr
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        textAlign: 'left',
                                    }}
                                >
                                    <th style={thStyle}>Challenge</th>
                                    <th style={thStyle}>Difficulty</th>
                                    <th style={thStyle}>Score</th>
                                    <th style={thStyle}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {submissions.slice(0, 20).map((sub) => (
                                    <tr
                                        key={sub.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                        }}
                                        onClick={() => navigate(`/challenges/${sub.challengeId}`)}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background = 'var(--bg-card-hover)')
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = 'transparent')
                                        }
                                    >
                                        <td style={tdStyle}>{sub.challenge?.title || 'Unknown'}</td>
                                        <td style={tdStyle}>
                                            <span
                                                style={{
                                                    padding: '2px 8px',
                                                    borderRadius: 12,
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    background: 'var(--bg-secondary)',
                                                    color: 'var(--text-secondary)',
                                                }}
                                            >
                                                Lv.{sub.challenge?.difficulty || '?'}
                                            </span>
                                        </td>
                                        <td style={tdStyle}>
                                            <span
                                                style={{
                                                    fontWeight: 600,
                                                    color:
                                                        sub.score >= 70
                                                            ? 'var(--success)'
                                                            : sub.score >= 40
                                                                ? 'var(--warning)'
                                                                : 'var(--danger)',
                                                }}
                                            >
                                                {sub.score ?? '—'}
                                            </span>
                                        </td>
                                        <td style={{ ...tdStyle, color: 'var(--text-muted)' }}>
                                            {new Date(sub.submittedAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

const thStyle = {
    padding: '12px 20px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const tdStyle = {
    padding: '12px 20px',
};
