import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getChallenges } from '../api';
import ChallengeCard from '../components/ChallengeCard';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function Challenges() {
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [selectedLanguage, setSelectedLanguage] = useState('all');
    const isMobile = useIsMobile();

    useEffect(() => {
        fetchChallenges();
    }, []);

    const fetchChallenges = async () => {
        setLoading(true);
        try {
            const filters = {};
            if (selectedDifficulty !== 'all') filters.difficulty = parseInt(selectedDifficulty);
            if (selectedLanguage !== 'all') filters.language = selectedLanguage;

            const res = await getChallenges(filters);
            setChallenges(res.data);
        } catch (err) {
            setError('Failed to load challenges.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, [selectedDifficulty, selectedLanguage]);

    const filteredChallenges = challenges;

    return (
        <div className="container animate-fade-in" style={{ padding: 'var(--space-8) var(--container-padding)' }}>
            <h1 style={{ fontSize: isMobile ? 'var(--text-2xl)' : 'var(--text-4xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
                Coding Challenges
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-8)', fontSize: isMobile ? 'var(--text-sm)' : 'var(--text-base)' }}>
                Choose a challenge and start coding!
            </p>

            {error && (
                <div style={{ color: 'var(--danger)', padding: 'var(--space-4)', background: 'rgba(225, 112, 85, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-6)', textAlign: 'center' }}>
                    {error}
                </div>
            )}

            {/* Filters */}
            <div style={{ display: 'flex', gap: isMobile ? 'var(--space-2)' : 'var(--space-4)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
                <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="input"
                    style={{
                        flex: isMobile ? '1 1 45%' : '0 0 auto',
                        minWidth: isMobile ? 0 : '150px',
                        padding: 'var(--space-2) var(--space-4)',
                        fontSize: 'var(--text-base)',
                    }}
                >
                    <option value="all">All Difficulties</option>
                    <option value="1">Beginner</option>
                    <option value="2">Easy</option>
                    <option value="3">Medium</option>
                    <option value="4">Hard</option>
                    <option value="5">Expert</option>
                </select>

                <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className="input"
                    style={{
                        flex: isMobile ? '1 1 45%' : '0 0 auto',
                        minWidth: isMobile ? 0 : '150px',
                        padding: 'var(--space-2) var(--space-4)',
                        fontSize: 'var(--text-base)',
                    }}
                >
                    <option value="all">All Languages</option>
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                </select>
            </div>

            {/* Challenges Grid */}
            {loading ? (
                <div className="grid-responsive">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="loading-shimmer" style={{ height: 200, borderRadius: 'var(--radius-md)' }} />
                    ))}
                </div>
            ) : filteredChallenges.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-16)', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>🤔</div>
                    <p>No challenges match your filters. Try adjusting them!</p>
                </div>
            ) : (
                <div className="grid-responsive">
                    {filteredChallenges.map((challenge) => (
                        <ChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                </div>
            )}
        </div>
    );
}
