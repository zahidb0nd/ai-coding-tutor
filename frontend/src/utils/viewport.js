/**
 * Viewport and mobile optimization utilities
 */

/**
 * Prevent iOS zoom on input focus
 * Add meta tag if not present
 */
export function preventIOSZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    } else {
        // Ensure proper viewport settings
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
}

/**
 * Allow iOS zoom (for accessibility)
 */
export function allowIOSZoom() {
    const viewport = document.querySelector('meta[name="viewport"]');
    
    if (viewport) {
        viewport.content = 'width=device-width, initial-scale=1.0';
    }
}

/**
 * Get safe area insets
 */
export function getSafeAreaInsets() {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    return {
        top: parseInt(computedStyle.getPropertyValue('--safe-top') || '0'),
        bottom: parseInt(computedStyle.getPropertyValue('--safe-bottom') || '0'),
        left: parseInt(computedStyle.getPropertyValue('--safe-left') || '0'),
        right: parseInt(computedStyle.getPropertyValue('--safe-right') || '0'),
    };
}

/**
 * Vibrate on touch (haptic feedback)
 * @param {number|number[]} pattern - Vibration pattern in ms
 */
export function vibrate(pattern = 10) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

/**
 * Lock scroll (for modals)
 */
export function lockScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
}

/**
 * Unlock scroll
 */
export function unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
}

/**
 * Check if device is touch-enabled
 */
export function isTouchDevice() {
    return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0
    );
}

/**
 * Get device pixel ratio for high-DPI screens
 */
export function getPixelRatio() {
    return window.devicePixelRatio || 1;
}

/**
 * Check if running in standalone mode (PWA)
 */
export function isStandalone() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
    );
}
