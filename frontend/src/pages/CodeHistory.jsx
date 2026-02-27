import React, { useState, useEffect, Suspense, lazy } from 'react';
import { getSubmissionHistory } from '../api';
import EditorSkeleton from '../components/EditorSkeleton';

const Editor = lazy(() => import('@monaco-editor/react'));

export default function CodeHistory() {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedSubmission, setSelectedSubmission] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await getSubmissionHistory();
            setHistory(res.data);
            if (res.data.length > 0) {
                setSelectedSubmission(res.data[0]);
            }
        } catch (err) {
            setError('Failed to load submission history.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: 32, textAlign: 'center' }}>Loading history...</div>;
    if (error) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

    if (history.length === 0) {
        return (
            <div style={{ padding: 64, textAlign: 'center', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📜</div>
                <h2>No Submission History</h2>
                <p>Complete some challenges to see your history here.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
            {/* Sidebar List */}
            <div style={{ width: 350, borderRight: '1px solid var(--border)', background: 'var(--bg-secondary)', overflowY: 'auto' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>
                    <h2 style={{ fontSize: 18, fontWeight: 600 }}>Your Submissions</h2>
                </div>
                {history.map(sub => (
                    <div
                        key={sub.id}
                        onClick={() => setSelectedSubmission(sub)}
                        style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border)',
                            cursor: 'pointer',
                            background: selectedSubmission?.id === sub.id ? 'rgba(108, 92, 231, 0.1)' : 'transparent',
                            borderLeft: selectedSubmission?.id === sub.id ? '3px solid var(--accent)' : '3px solid transparent',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{sub.challenge.title}</span>
                            <span style={{
                                color: sub.score >= 70 ? 'var(--success)' : 'var(--danger)',
                                fontWeight: 'bold',
                                fontSize: 14
                            }}>
                                {sub.score} / 100
                            </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)' }}>
                            <span>Language: {sub.language || sub.challenge.language}</span>
                            <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                        </div>
                        {sub.durationMs > 0 && (
                            <div style={{ marginTop: 6, fontSize: 12, color: 'var(--text-secondary)' }}>
                                ⏱ Time: {Math.floor(sub.durationMs / 1000)}s
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Viewer */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedSubmission ? (
                    <>
                        <div style={{ padding: 20, borderBottom: '1px solid var(--border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: 20, marginBottom: 8 }}>{selectedSubmission.challenge.title}</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: 0 }}>
                                        Submitted on {new Date(selectedSubmission.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div style={{
                                    padding: '8px 16px',
                                    borderRadius: 8,
                                    background: selectedSubmission.score >= 70 ? 'rgba(0,184,148,0.1)' : 'rgba(214,48,49,0.1)',
                                    color: selectedSubmission.score >= 70 ? 'var(--success)' : 'var(--danger)',
                                    fontWeight: 'bold',
                                    fontSize: 18
                                }}>
                                    Score: {selectedSubmission.score}
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <Suspense fallback={<EditorSkeleton />}>
                                <Editor
                                    height="100%"
                                    language={selectedSubmission.language || selectedSubmission.challenge.language}
                                    value={selectedSubmission.code}
                                    theme="vs-dark"
                                    options={{
                                        readOnly: true,
                                        minimap: { enabled: false },
                                        fontSize: 14,
                                        padding: { top: 16 }
                                    }}
                                />
                            </Suspense>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
