import { vibrate } from '../utils/viewport';

/**
 * Touch-optimized button component
 * Minimum 44x44px touch target, haptic feedback
 */
export default function TouchButton({ 
    children, 
    onClick, 
    variant = 'primary', 
    size = 'md',
    disabled = false,
    fullWidth = false,
    icon = null,
    ...props 
}) {
    const handleClick = (e) => {
        if (!disabled) {
            vibrate(10); // Haptic feedback
            onClick?.(e);
        }
    };

    const classNames = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-block',
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            onClick={handleClick}
            disabled={disabled}
            {...props}
        >
            {icon && <span style={{ marginRight: 'var(--space-2)' }}>{icon}</span>}
            {children}
        </button>
    );
}
