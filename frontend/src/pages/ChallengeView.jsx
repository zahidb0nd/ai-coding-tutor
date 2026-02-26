import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChallenge, submitCode, getHint } from '../api';
import CodeEditor from '../components/Editor';
import FeedbackPanel from '../components/FeedbackPanel';
import { SUPPORTED_LANGUAGES, LANGUAGE_TEMPLATES } from '../utils/languages';

export default function ChallengeView() {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES['javascript']);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Hint state
    const [hintText, setHintText] = useState('');
    const [requestingHint, setRequestingHint] = useState(false);
    const [hintError, setHintError] = useState('');
    const [hintCooldown, setHintCooldown] = useState(0);

    // Timer state
    const [timerActive, setTimerActive] = useState(false);
    const [elapsedMs, setElapsedMs] = useState(0);
    const lastActiveRef = useRef(Date.now());

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        let timer;
        if (hintCooldown > 0) {
            timer = setInterval(() => setHintCooldown(c => c - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [hintCooldown]);

    useEffect(() => {
        fetchChallenge();
    }, [id]);

    useEffect(() => {
        let interval;
        if (timerActive) {
            interval = setInterval(() => {
                const now = Date.now();
                const delta = now - lastActiveRef.current;
                lastActiveRef.current = now;
                setElapsedMs(prev => prev + delta);
            }, 100);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const formatTime = (ms) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const fetchChallenge = async () => {
        setLoading(true);
        try {
            const res = await getChallenge(id);
            setChallenge(res.data);
            if (res.data.language && SUPPORTED_LANGUAGES.find(l => l.value === res.data.language)) {
                setLanguage(res.data.language);
                setCode(LANGUAGE_TEMPLATES[res.data.language]);
            }
            // Start timer when loaded
            lastActiveRef.current = Date.now();
            setTimerActive(true);
        } catch (err) {
            setError('Failed to load challenge.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!code.trim() || code.trim() === '// Write your solution here') {
            setError('Please write some code before submitting.');
            return;
        }

        setSubmitting(true);
        setTimerActive(false);
        setError('');
        setFeedback(null);

        try {
            const res = await submitCode({
                userId: user.id,
                challengeId: id,
                code,
                language,
                durationMs: elapsedMs,
                timezoneOffset: new Date().getTimezoneOffset()
            });
            setFeedback(res.data.feedback);
            // Don't resume timer if they solved it successfully
            if (res.data.feedback?.score < 70) {
                lastActiveRef.current = Date.now();
                setTimerActive(true);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to get feedback. Please try again.');
            lastActiveRef.current = Date.now();
            setTimerActive(true); // Resume timer on error
        } finally {
            setSubmitting(false);
        }
    };

    const handleGetHint = async () => {
        setRequestingHint(true);
        setHintError('');
        try {
            const res = await getHint(id, { code });
            setHintText(res.data.hint);
            setHintCooldown(30); // 30 seconds cooldown
        } catch (err) {
            setHintError(err.response?.data?.error || 'Failed to get a hint.');
            if (err.response?.status === 429) {
                setHintCooldown(30);
            }
        } finally {
            setRequestingHint(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 32 }}>
                <div
                    className="loading-shimmer"
                    style={{ height: 40, width: 300, borderRadius: 8, marginBottom: 24 }}
                />
                <div style={{ display: 'flex', gap: 24, height: 'calc(100vh - 160px)' }}>
                    <div className="loading-shimmer" style={{ flex: 1, borderRadius: 12 }} />
                    <div className="loading-shimmer" style={{ width: 400, borderRadius: 12 }} />
                </div>
            </div>
        );
    }

    if (!challenge) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: 64,
                    color: 'var(--text-muted)',
                }}
            >
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <p>Challenge not found.</p>
            </div>
        );
    }

    const difficultyLabels = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    const difficultyColors = ['', '#00b894', '#00cec9', '#fdcb6e', '#e17055', '#d63031'];

    return (
        <div
            className="animate-fade-in"
            style={{
                height: 'calc(100vh - 64px)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}
        >
            {/* Header bar */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 24px',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>{challenge.title}</h2>
                    <span
                        style={{
                            padding: '3px 10px',
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background: `${difficultyColors[challenge.difficulty]}22`,
                            color: difficultyColors[challenge.difficulty],
                            border: `1px solid ${difficultyColors[challenge.difficulty]}44`,
                        }}
                    >
                        {difficultyLabels[challenge.difficulty]}
                    </span>
                    <select
                        value={language}
                        onChange={(e) => {
                            const newLang = e.target.value;
                            if (code === LANGUAGE_TEMPLATES[language]) {
                                setCode(LANGUAGE_TEMPLATES[newLang]);
                            }
                            setLanguage(newLang);
                        }}
                        style={{
                            marginLeft: 16,
                            padding: '4px 12px',
                            borderRadius: '4px',
                            background: 'var(--bg-card)',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border)',
                            fontSize: 13,
                        }}
                    >
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <option key={lang.value} value={lang.value}>{lang.label}</option>
                        ))}
                    </select>

                    <div style={{
                        marginLeft: 16,
                        padding: '4px 12px',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '16px',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: timerActive ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: '1px solid var(--border)'
                    }}>
                        ⏱ {formatTime(elapsedMs)}
                    </div>
                </div>
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    style={{
                        padding: '8px 24px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: submitting
                            ? 'var(--border-light)'
                            : 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: submitting ? 'none' : '0 4px 16px var(--accent-glow)',
                    }}
                >
                    {submitting ? (
                        <>
                            <span className="spinner" style={{ width: 16, height: 16 }} />
                            Analyzing...
                        </>
                    ) : (
                        <>🚀 Get Feedback</>
                    )}
                </button>
            </div>

            {/* Error bar */}
            {error && (
                <div
                    style={{
                        padding: '10px 24px',
                        background: 'rgba(225, 112, 85, 0.1)',
                        borderBottom: '1px solid rgba(225, 112, 85, 0.3)',
                        color: 'var(--danger)',
                        fontSize: 13,
                    }}
                >
                    {error}
                </div>
            )}

            {/* Main split view */}
            <div
                style={{
                    flex: 1,
                    display: 'flex',
                    overflow: 'hidden',
                }}
            >
                {/* Left — Code Editor */}
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <CodeEditor
                        code={code}
                        onChange={setCode}
                        language={language}
                    />
                </div>

                {/* Right — Challenge info + Feedback */}
                <div
                    style={{
                        width: 420,
                        borderLeft: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        background: 'var(--bg-secondary)',
                    }}
                >
                    {/* Challenge description */}
                    <div
                        style={{
                            padding: 20,
                            borderBottom: '1px solid var(--border)',
                            flexShrink: 0,
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 14,
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                marginBottom: 10,
                            }}
                        >
                            Challenge Description
                        </h3>
                        <p
                            style={{
                                fontSize: 14,
                                lineHeight: 1.7,
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {challenge.description}
                        </p>

                        {/* Difficulty Explanation */}
                        {challenge.difficultyExplanation && (
                            <div style={{
                                marginTop: 12,
                                padding: '8px 12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '6px',
                                borderLeft: `3px solid ${difficultyColors[challenge.difficulty]}`
                            }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>Why this difficulty?</span>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                                    {challenge.difficultyExplanation}
                                </p>
                            </div>
                        )}

                        {/* Hint Section */}
                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                                <button
                                    onClick={handleGetHint}
                                    disabled={requestingHint || hintCooldown > 0}
                                    style={{
                                        background: 'rgba(108, 92, 231, 0.1)',
                                        color: 'var(--accent)',
                                        border: '1px solid var(--accent)',
                                        padding: '6px 14px',
                                        borderRadius: '20px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: (requestingHint || hintCooldown > 0) ? 'not-allowed' : 'pointer',
                                        opacity: (requestingHint || hintCooldown > 0) ? 0.6 : 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {requestingHint ? (
                                        <>
                                            <span className="spinner" style={{ width: 12, height: 12, border: '2px solid rgba(108, 92, 231, 0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                            Thinking...
                                        </>
                                    ) : hintCooldown > 0 ? (
                                        <>⏳ Wait {hintCooldown}s</>
                                    ) : (
                                        <>💡 Give me a hint</>
                                    )}
                                </button>
                            </div>

                            {hintError && (
                                <div style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 12 }}>
                                    {hintError}
                                </div>
                            )}

                            {hintText && (
                                <div style={{
                                    padding: '12px 16px',
                                    background: 'rgba(253, 203, 110, 0.1)',
                                    border: '1px solid rgba(253, 203, 110, 0.3)',
                                    borderRadius: '8px',
                                    color: 'var(--text-primary)',
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    animation: 'fadeIn 0.3s ease-out'
                                }}>
                                    <strong>Hint: </strong> {hintText}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Feedback */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <FeedbackPanel feedback={feedback} loading={submitting} />
                    </div>
                </div>
            </div>
        </div>
    );
}
