import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChallenge, submitCode, getHint } from '../api';
import CodeEditor from '../components/Editor';
import FeedbackPanel from '../components/FeedbackPanel';
import MobileSheet from '../components/MobileSheet';
import { SUPPORTED_LANGUAGES, LANGUAGE_TEMPLATES } from '../utils/languages';

/**
 * Mobile-optimized ChallengeView
 * Vertical layout with collapsible sections and modal feedback
 */
export default function ChallengeViewMobile() {
    const { id } = useParams();
    const [challenge, setChallenge] = useState(null);
    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(LANGUAGE_TEMPLATES['javascript']);
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Mobile-specific state
    const [showDescription, setShowDescription] = useState(true);
    const [showFeedback, setShowFeedback] = useState(false);

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
            setShowFeedback(true); // Open feedback modal on mobile
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit code.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleGetHint = async () => {
        if (!code.trim()) {
            setHintError('Write some code first to get a contextual hint.');
            return;
        }

        setRequestingHint(true);
        setHintError('');

        try {
            const res = await getHint(id, { code });
            setHintText(res.data.hint);
            setHintCooldown(30);
        } catch (err) {
            setHintError(err.response?.data?.error || 'Failed to get hint.');
        } finally {
            setRequestingHint(false);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: 'var(--space-4)' }}>
                <div className="loading-shimmer" style={{ height: 40, borderRadius: 8, marginBottom: 16 }} />
                <div className="loading-shimmer" style={{ height: 300, borderRadius: 12 }} />
            </div>
        );
    }

    if (error && !challenge) {
        return (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
                <p>Challenge not found.</p>
            </div>
        );
    }

    const difficultyLabels = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    const difficultyColors = ['', '#00b894', '#00cec9', '#fdcb6e', '#e17055', '#d63031'];

    return (
        <div className="full-height-mobile" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <div
                className="sticky-header"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-3) var(--space-4)',
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg-secondary)',
                    flexShrink: 0,
                    gap: 'var(--space-2)',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                    <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {challenge.title}
                    </h2>
                    <span
                        style={{
                            padding: '2px 8px',
                            borderRadius: 12,
                            fontSize: 10,
                            fontWeight: 600,
                            background: `${difficultyColors[challenge.difficulty]}22`,
                            color: difficultyColors[challenge.difficulty],
                            border: `1px solid ${difficultyColors[challenge.difficulty]}44`,
                            flexShrink: 0,
                        }}
                    >
                        {difficultyLabels[challenge.difficulty]}
                    </span>
                </div>
                <div style={{
                    padding: '4px 10px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    color: timerActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    flexShrink: 0,
                }}>
                    ⏱ {formatTime(elapsedMs)}
                </div>
            </div>

            {/* Collapsible Description */}
            <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-card)', flexShrink: 0 }}>
                <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="btn btn-ghost"
                    style={{
                        width: '100%',
                        justifyContent: 'space-between',
                        padding: 'var(--space-3) var(--space-4)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                    }}
                >
                    <span>📋 Challenge Description</span>
                    <span>{showDescription ? '▼' : '▶'}</span>
                </button>

                {showDescription && (
                    <div style={{ padding: '0 var(--space-4) var(--space-4)' }} className="stack-sm">
                        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                            {challenge.description}
                        </p>

                        {challenge.difficultyExplanation && (
                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: 'var(--radius-sm)',
                                borderLeft: `3px solid ${difficultyColors[challenge.difficulty]}`
                            }}>
                                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
                                    Why this difficulty?
                                </span>
                                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic' }}>
                                    {challenge.difficultyExplanation}
                                </p>
                            </div>
                        )}

                        {/* Hint button */}
                        <button
                            onClick={handleGetHint}
                            disabled={requestingHint || hintCooldown > 0}
                            className="btn btn-secondary btn-sm"
                            style={{
                                background: 'rgba(108, 92, 231, 0.1)',
                                color: 'var(--accent)',
                                border: '1px solid var(--accent)',
                                opacity: (requestingHint || hintCooldown > 0) ? 0.6 : 1,
                            }}
                        >
                            {requestingHint ? '💭 Thinking...' : hintCooldown > 0 ? `⏳ Wait ${hintCooldown}s` : '💡 Get a Hint'}
                        </button>

                        {hintError && (
                            <div style={{ color: 'var(--danger)', fontSize: 13 }}>{hintError}</div>
                        )}

                        {hintText && (
                            <div style={{
                                padding: 'var(--space-3)',
                                background: 'rgba(253, 203, 110, 0.1)',
                                border: '1px solid rgba(253, 203, 110, 0.3)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--text-primary)',
                                fontSize: 13,
                                lineHeight: 1.6,
                            }}>
                                <strong>Hint: </strong>{hintText}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Language Selector */}
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                <select
                    value={language}
                    onChange={(e) => {
                        const newLang = e.target.value;
                        if (code === LANGUAGE_TEMPLATES[language]) {
                            setCode(LANGUAGE_TEMPLATES[newLang]);
                        }
                        setLanguage(newLang);
                    }}
                    className="input"
                    style={{
                        padding: 'var(--space-2) var(--space-3)',
                        fontSize: 14,
                    }}
                >
                    {SUPPORTED_LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                </select>
            </div>

            {/* Code Editor - takes remaining space */}
            <div style={{ flex: 1, overflow: 'hidden', padding: 'var(--space-2)' }}>
                <CodeEditor code={code} onChange={setCode} language={language} />
            </div>

            {/* Error message */}
            {error && (
                <div style={{
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'rgba(225, 112, 85, 0.1)',
                    color: 'var(--danger)',
                    borderTop: '1px solid var(--danger)',
                    fontSize: 13,
                }}>
                    {error}
                </div>
            )}

            {/* Sticky Submit Button */}
            <div className="sticky-footer">
                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="btn btn-primary btn-block btn-lg"
                >
                    {submitting ? '⏳ Submitting...' : '🚀 Submit Code'}
                </button>
            </div>

            {/* Feedback Modal */}
            <MobileSheet
                isOpen={showFeedback}
                onClose={() => setShowFeedback(false)}
                title="AI Feedback"
            >
                <FeedbackPanel feedback={feedback} loading={submitting} />
            </MobileSheet>
        </div>
    );
}
