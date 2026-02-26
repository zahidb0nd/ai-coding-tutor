import { useState, useEffect } from 'react';
import { getChallenges, generateChallenge } from '../api';
import ChallengeCard from '../components/ChallengeCard';

export default function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState('');
    const [difficulty, setDifficulty] = useState('');

    useEffect(() => {
        fetchChallenges();
    }, [difficulty]);

    const fetchChallenges = async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (difficulty) params.difficulty = difficulty;
            const res = await getChallenges(params);
            setChallenges(res.data);
        } catch (err) {
            setError('Failed to load challenges. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const difficultyOptions = [
        { value: '', label: 'All Levels' },
        { value: '1', label: 'Beginner' },
        { value: '2', label: 'Easy' },
        { value: '3', label: 'Medium' },
        { value: '4', label: 'Hard' },
        { value: '5', label: 'Expert' },
    ];

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        try {
            const res = await generateChallenge({ language: 'javascript' }); // Can be extended to allow user language choice
            setChallenges((prev) => [res.data, ...prev]);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate challenge. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div
            style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '32px 24px',
            }}
        >
            {/* Header */}
            <div
                className="animate-fade-in"
                style={{
                    marginBottom: 32,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <div>
                    <h1
                        style={{
                            fontSize: 28,
                            fontWeight: 700,
                            marginBottom: 8,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                        }}
                    >
                        Challenge Library
                        <button
                            onClick={handleGenerate}
                            disabled={generating}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent), #8e44ad)',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: generating ? 'not-allowed' : 'pointer',
                                opacity: generating ? 0.7 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'transform 0.2s',
                            }}
                            onMouseOver={(e) => !generating && (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseOut={(e) => !generating && (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            {generating ? (
                                <>
                                    <span className="spinner" style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                    Generating...
                                </>
                            ) : (
                                <>✨ Generate AI Challenge</>
                            )}
                        </button>
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
                        Pick a challenge and sharpen your skills with AI-powered feedback
                    </p>
                </div>

                {/* Filter */}
                <div style={{ display: 'flex', gap: 6 }}>
                    {difficultyOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setDifficulty(opt.value)}
                            style={{
                                padding: '8px 14px',
                                borderRadius: 20,
                                border: '1px solid',
                                borderColor:
                                    difficulty === opt.value ? 'var(--accent)' : 'var(--border)',
                                background:
                                    difficulty === opt.value
                                        ? 'rgba(108, 92, 231, 0.15)'
                                        : 'transparent',
                                color:
                                    difficulty === opt.value
                                        ? 'var(--accent)'
                                        : 'var(--text-muted)',
                                fontSize: 13,
                                fontWeight: 500,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    style={{
                        padding: 16,
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(225, 112, 85, 0.1)',
                        border: '1px solid rgba(225, 112, 85, 0.3)',
                        color: 'var(--danger)',
                        marginBottom: 24,
                        textAlign: 'center',
                    }}
                >
                    {error}
                    <button
                        onClick={fetchChallenges}
                        style={{
                            marginLeft: 12,
                            padding: '4px 12px',
                            border: '1px solid var(--danger)',
                            borderRadius: 6,
                            background: 'transparent',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: 13,
                        }}
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading ? (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 20,
                    }}
                >
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                            key={i}
                            className="loading-shimmer"
                            style={{
                                height: 200,
                                borderRadius: 'var(--radius-md)',
                            }}
                        />
                    ))}
                </div>
            ) : challenges.length === 0 ? (
                <div
                    style={{
                        textAlign: 'center',
                        padding: 64,
                        color: 'var(--text-muted)',
                    }}
                >
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
                    <p>No challenges found for the selected difficulty.</p>
                </div>
            ) : (
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                        gap: 20,
                    }}
                >
                    {challenges.map((challenge, idx) => (
                        <div
                            key={challenge.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${idx * 0.05}s`, opacity: 0 }}
                        >
                            <ChallengeCard challenge={challenge} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
