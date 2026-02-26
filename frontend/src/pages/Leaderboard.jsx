import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';

export default function Leaderboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const currentUser = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchLeaderboard(page);
    }, [page]);

    const fetchLeaderboard = async (targetPage) => {
        setLoading(true);
        setError('');
        try {
            const res = await getLeaderboard({ page: targetPage, limit: 10 });
            setUsers(res.data.users);
            setTotalPages(res.data.totalPages);
            setPage(res.data.currentPage);
        } catch (err) {
            setError('Failed to load leaderboard.');
        } finally {
            setLoading(false);
        }
    };

    const getRankBadge = (index, currentPage) => {
        const actualRank = (currentPage - 1) * 10 + index + 1;
        if (actualRank === 1) return <span style={{ color: '#FFD700', fontWeight: 'bold' }}>1st</span>;
        if (actualRank === 2) return <span style={{ color: '#C0C0C0', fontWeight: 'bold' }}>2nd</span>;
        if (actualRank === 3) return <span style={{ color: '#CD7F32', fontWeight: 'bold' }}>3rd</span>;
        return actualRank + 'th';
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px' }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, textAlign: 'center' }}>Top Coders</h1>

            {error && (
                <div style={{ color: 'var(--danger)', padding: 16, background: 'rgba(225, 112, 85, 0.1)', borderRadius: 8, marginBottom: 24, textAlign: 'center' }}>
                    {error}
                </div>
            )}

            <div style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                overflow: 'hidden'
            }}>
                {loading ? (
                    <div style={{ padding: 32, textAlign: 'center' }}>
                        <div className="spinner" style={{ margin: '0 auto', width: 24, height: 24, border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    </div>
                ) : users.length === 0 ? (
                    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                        No rank data available yet. Start solving challenges!
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', width: '80px' }}>Rank</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>User</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Level</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Streak</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => {
                                const isCurrentUser = currentUser?.id === user.id;
                                return (
                                    <tr
                                        key={user.id}
                                        style={{
                                            borderBottom: '1px solid var(--border)',
                                            background: isCurrentUser ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                                        }}
                                    >
                                        <td style={{ padding: '16px', fontWeight: 600 }}>{getRankBadge(index, page)}</td>
                                        <td style={{ padding: '16px', fontWeight: isCurrentUser ? 700 : 400 }}>
                                            {user.name}
                                            {isCurrentUser && <span style={{ marginLeft: 8, fontSize: 12, padding: '2px 8px', background: 'var(--accent)', borderRadius: 12, color: '#fff' }}>You</span>}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>Lv. {user.level}</td>
                                        <td style={{ padding: '16px', textAlign: 'center', color: user.currentStreak > 0 ? '#fdcb6e' : 'var(--text-muted)' }}>
                                            {user.currentStreak > 0 ? `${user.currentStreak} 🔥` : '-'}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600, color: 'var(--accent)' }}>
                                            {user.totalScore}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 24 }}>
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                    >
                        Previous
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
