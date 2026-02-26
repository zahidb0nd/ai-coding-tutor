import { describe, it, expect } from 'vitest';
import { calculateStreak } from '../../lib/streak.js';

describe('calculateStreak Unit Tests', () => {
    it('returns 1 for a completely new user with no previous submissions', () => {
        const result = calculateStreak(0, null, new Date('2026-02-26T14:00:00Z'), 0);
        expect(result).toBe(1);
    });

    it('increments streak when submission is exactly 1 day after last submission', () => {
        const lastSubmission = new Date('2026-02-25T10:00:00Z');
        const currentSubmission = new Date('2026-02-26T14:00:00Z');

        const result = calculateStreak(5, lastSubmission, currentSubmission, 0);
        expect(result).toBe(6);
    });

    it('resets streak to 1 if more than 48 hours have passed (missed a day)', () => {
        const lastSubmission = new Date('2026-02-24T10:00:00Z');
        const currentSubmission = new Date('2026-02-26T14:00:00Z');

        const result = calculateStreak(5, lastSubmission, currentSubmission, 0);
        expect(result).toBe(1);
    });

    it('maintains current streak if submitting multiple times on the same date', () => {
        const lastSubmission = new Date('2026-02-26T01:00:00Z');
        const currentSubmission = new Date('2026-02-26T23:00:00Z');

        const result = calculateStreak(5, lastSubmission, currentSubmission, 0);
        expect(result).toBe(5);
    });

    it('respects timezone offset crossing midnight bounds (e.g. +05:30 IST)', () => {
        // IST is +05:30. -330 minutes.
        // Last submission was Feb 25 11:00 PM IST (17:30 UTC)
        const lastSubmission = new Date('2026-02-25T17:30:00Z');

        // Next submission is Feb 26 12:30 AM IST (Feb 25 19:00 UTC)
        // Without offset, this looks like the SAME UTC day.
        const currentSubmission = new Date('2026-02-25T19:00:00Z');

        // Expect streak to increment because it passed local midnight
        const result = calculateStreak(1, lastSubmission, currentSubmission, -330);
        expect(result).toBe(2);
    });
});
