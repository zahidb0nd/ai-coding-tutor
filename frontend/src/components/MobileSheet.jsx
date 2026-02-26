import { useEffect } from 'react';

/**
 * Mobile bottom sheet component
 * Slides up from bottom on mobile, regular modal on desktop
 */
export default function MobileSheet({ isOpen, onClose, title, children }) {
    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when sheet is open
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className={`overlay ${isOpen ? 'visible' : ''}`}
                onClick={onClose}
                style={{ zIndex: 199 }}
            />

            {/* Sheet */}
            <div className={`mobile-sheet ${isOpen ? 'open' : ''}`}>
                {/* Drag handle */}
                <div className="mobile-sheet-handle" />

                {/* Header */}
                {title && (
                    <div
                        style={{
                            padding: 'var(--space-4)',
                            borderBottom: '1px solid var(--border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <h3
                            style={{
                                fontSize: 'var(--text-lg)',
                                fontWeight: 'var(--font-semibold)',
                                margin: 0,
                            }}
                        >
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                fontSize: '24px',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                padding: 'var(--space-2)',
                                minWidth: 'var(--touch-min)',
                                minHeight: 'var(--touch-min)',
                            }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="mobile-sheet-content">{children}</div>
            </div>
        </>
    );
}
