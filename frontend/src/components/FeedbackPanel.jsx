export default function FeedbackPanel({ feedback, loading }) {
    if (loading) {
        return (
            <div style={{ padding: 24 }}>
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 24,
                    }}
                >
                    <div className="spinner" />
                    <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                        AI is reviewing your code...
                    </span>
                </div>
                {/* Shimmer loading skeleton */}
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="loading-shimmer"
                        style={{
                            height: i === 1 ? 60 : 40,
                            borderRadius: 'var(--radius-sm)',
                            marginBottom: 12,
                        }}
                    />
                ))}
            </div>
        );
    }

    if (!feedback) {
        return (
            <div
                style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                }}
            >
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
                <p style={{ fontSize: 14 }}>
                    Write your solution and click <strong>"Get Feedback"</strong> to receive
                    AI-powered code review.
                </p>
            </div>
        );
    }

    return (
        <div style={{ padding: 24, overflowY: 'auto' }}>
            {/* Score */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 24,
                    padding: 20,
                    background: 'var(--bg-secondary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                }}
            >
                <div
                    style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                        background:
                            feedback.score >= 70
                                ? 'rgba(0, 184, 148, 0.15)'
                                : feedback.score >= 40
                                    ? 'rgba(253, 203, 110, 0.15)'
                                    : 'rgba(225, 112, 85, 0.15)',
                        color:
                            feedback.score >= 70
                                ? 'var(--success)'
                                : feedback.score >= 40
                                    ? 'var(--warning)'
                                    : 'var(--danger)',
                        border: `2px solid ${feedback.score >= 70
                                ? 'var(--success)'
                                : feedback.score >= 40
                                    ? 'var(--warning)'
                                    : 'var(--danger)'
                            }`,
                    }}
                >
                    {feedback.score}
                </div>
                <div>
                    <div
                        style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 2 }}
                    >
                        Score
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                        {feedback.score >= 70
                            ? '🎉 Great job!'
                            : feedback.score >= 40
                                ? '💪 Getting there!'
                                : '📚 Keep practicing!'}
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div style={{ marginBottom: 24 }}>
                <h4
                    style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: 8,
                    }}
                >
                    Summary
                </h4>
                <p
                    style={{
                        fontSize: 14,
                        lineHeight: 1.6,
                        color: 'var(--text-secondary)',
                    }}
                >
                    {feedback.summary}
                </p>
            </div>

            {/* Line Comments */}
            {feedback.line_comments && feedback.line_comments.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <h4
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 12,
                        }}
                    >
                        Line-by-line Feedback
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {feedback.line_comments.map((comment, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    gap: 12,
                                    padding: 12,
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1px solid var(--border)',
                                    fontSize: 13,
                                }}
                            >
                                <span
                                    style={{
                                        color: 'var(--accent)',
                                        fontWeight: 600,
                                        fontFamily: 'monospace',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    Line {comment.line}
                                </span>
                                <span style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                    {comment.comment}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Next Steps */}
            {feedback.next_steps && feedback.next_steps.length > 0 && (
                <div>
                    <h4
                        style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: 12,
                        }}
                    >
                        Next Steps
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {feedback.next_steps.map((step, idx) => (
                            <div
                                key={idx}
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'flex-start',
                                    fontSize: 14,
                                    color: 'var(--text-secondary)',
                                    lineHeight: 1.5,
                                }}
                            >
                                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                                    {idx + 1}.
                                </span>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
