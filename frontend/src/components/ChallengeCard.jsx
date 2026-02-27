import { useNavigate } from 'react-router-dom';

export default function ChallengeCard({ challenge }) {
    const navigate = useNavigate();

    const difficultyLabels = ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Expert'];
    const difficultyColors = ['', '#00b894', '#00cec9', '#fdcb6e', '#e17055', '#d63031'];

    return (
        <div
            onClick={() => navigate(`/challenges/${challenge.id}`)}
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 24,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-card)';
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
        >
            {/* Difficulty badge */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <span
                    style={{
                        padding: '4px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        background: `${difficultyColors[challenge.difficulty]}22`,
                        color: difficultyColors[challenge.difficulty],
                        border: `1px solid ${difficultyColors[challenge.difficulty]}44`,
                    }}
                >
                    {difficultyLabels[challenge.difficulty]}
                </span>
                <span
                    style={{
                        fontSize: 11,
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        letterSpacing: '0.5px',
                    }}
                >
                    {challenge.language}
                </span>
            </div>

            {/* Title */}
            <h3
                style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: 8,
                    lineHeight: 1.3,
                }}
            >
                {challenge.title}
            </h3>

            {/* Description preview */}
            <p
                style={{
                    fontSize: 14,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {challenge.description}
            </p>

            {/* Difficulty dots */}
            <div
                style={{
                    display: 'flex',
                    gap: 4,
                    marginTop: 16,
                }}
            >
                {[1, 2, 3, 4, 5].map((level) => (
                    <div
                        key={level}
                        style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background:
                                level <= challenge.difficulty
                                    ? difficultyColors[challenge.difficulty]
                                    : 'var(--border)',
                            transition: 'background 0.2s',
                        }}
                    />
                ))}
            </div>
        </div>
    );
}
