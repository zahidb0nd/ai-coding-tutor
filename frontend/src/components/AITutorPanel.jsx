import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AITutorPanel({ code, challenge, onGetHint, hintResponse, loading }) {
    // 1: Conceptual, 2: Logic Breakdown, 3: Edge Cases, 4: Code Snippet
    const [hintLevel, setHintLevel] = useState(1);

    const levelDescriptions = {
        1: "Conceptual: High-level theory approach without code.",
        2: "Logic Breakdown: Step-by-step logic list.",
        3: "Edge Cases: Point out potential failures or edge cases.",
        4: "Code Snippet: 2-3 line code correction for immediate errors."
    };

    const handleLevelChange = (e) => {
        setHintLevel(Number(e.target.value));
    };

    const handleVibeCheck = () => {
        onGetHint(hintLevel);
    };

    return (
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 style={{ fontSize: 18, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                🤖 AI Tutor
            </h3>

            {/* Hint Slider */}
            <div style={{
                marginBottom: 24,
                padding: 16,
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)'
            }}>
                <label style={{ display: 'block', marginBottom: 12, fontWeight: 600, fontSize: 14 }}>
                    Hint Level: {hintLevel}
                </label>

                <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={hintLevel}
                    onChange={handleLevelChange}
                    style={{ width: '100%', marginBottom: 8, accentColor: 'var(--primary)' }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    <span>1</span>
                    <span>2</span>
                    <span>3</span>
                    <span>4</span>
                </div>

                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, background: 'var(--bg-primary)', padding: 12, borderRadius: 'var(--radius-sm)' }}>
                    <strong>{levelDescriptions[hintLevel].split(':')[0]}:</strong>
                    {levelDescriptions[hintLevel].split(':')[1]}
                </div>
            </div>

            {/* Vibe Check Button */}
            <button
                onClick={handleVibeCheck}
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
            >
                {loading ? <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : '✨'}
                {loading ? 'Thinking...' : 'Vibe Check'}
            </button>

            {/* Chat Display Area */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                padding: 16
            }}>
                {loading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} className="loading-shimmer" style={{ height: i === 1 ? 60 : 40, borderRadius: 'var(--radius-sm)' }} />
                        ))}
                    </div>
                )}

                {!loading && !hintResponse && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0' }}>
                        <div style={{ fontSize: 32, marginBottom: 12 }}>👋</div>
                        <p style={{ fontSize: 14, lineHeight: 1.5 }}>
                            Select a hint level and click Vibe Check to get help!
                        </p>
                    </div>
                )}

                {!loading && hintResponse && (
                    <div style={{ color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6 }} className="markdown-body">
                        <ReactMarkdown>{hintResponse.hint}</ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
}
