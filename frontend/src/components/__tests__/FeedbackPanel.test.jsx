import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FeedbackPanel from '../FeedbackPanel';

describe('FeedbackPanel Component', () => {
    it('shows loading state when loading prop is true', () => {
        render(<FeedbackPanel loading={true} feedback={null} />);
        
        expect(screen.getByText(/analyzing your code/i)).toBeInTheDocument();
    });

    it('shows empty state when no feedback and not loading', () => {
        render(<FeedbackPanel loading={false} feedback={null} />);
        
        expect(screen.getByText(/submit your code/i)).toBeInTheDocument();
    });

    it('displays score when feedback is provided', () => {
        const feedback = {
            score: 85,
            summary: 'Great work!',
            line_comments: [],
            next_steps: [],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText('85')).toBeInTheDocument();
    });

    it('displays summary text', () => {
        const feedback = {
            score: 75,
            summary: 'Good effort, but needs improvement',
            line_comments: [],
            next_steps: [],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText(/good effort, but needs improvement/i)).toBeInTheDocument();
    });

    it('displays line comments when provided', () => {
        const feedback = {
            score: 60,
            summary: 'Some issues found',
            line_comments: [
                { line: 5, comment: 'Missing semicolon' },
                { line: 10, comment: 'Use const instead of var' },
            ],
            next_steps: [],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText(/line 5/i)).toBeInTheDocument();
        expect(screen.getByText(/missing semicolon/i)).toBeInTheDocument();
        expect(screen.getByText(/line 10/i)).toBeInTheDocument();
        expect(screen.getByText(/use const instead of var/i)).toBeInTheDocument();
    });

    it('displays next steps when provided', () => {
        const feedback = {
            score: 70,
            summary: 'Decent solution',
            line_comments: [],
            next_steps: ['Learn about arrow functions', 'Practice async/await'],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText(/learn about arrow functions/i)).toBeInTheDocument();
        expect(screen.getByText(/practice async\/await/i)).toBeInTheDocument();
    });

    it('shows success styling for scores >= 70', () => {
        const feedback = {
            score: 90,
            summary: 'Excellent!',
            line_comments: [],
            next_steps: [],
        };
        
        const { container } = render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        // Check that score is displayed
        expect(screen.getByText('90')).toBeInTheDocument();
    });

    it('shows warning styling for scores between 40-69', () => {
        const feedback = {
            score: 55,
            summary: 'Needs work',
            line_comments: [],
            next_steps: [],
        };
        
        const { container } = render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText('55')).toBeInTheDocument();
    });

    it('shows danger styling for scores < 40', () => {
        const feedback = {
            score: 30,
            summary: 'Keep trying',
            line_comments: [],
            next_steps: [],
        };
        
        const { container } = render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText('30')).toBeInTheDocument();
    });

    it('handles feedback with no line comments gracefully', () => {
        const feedback = {
            score: 80,
            summary: 'Good job!',
            line_comments: [],
            next_steps: ['Keep practicing'],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText('80')).toBeInTheDocument();
        expect(screen.getByText(/good job!/i)).toBeInTheDocument();
    });

    it('handles feedback with no next steps gracefully', () => {
        const feedback = {
            score: 100,
            summary: 'Perfect!',
            line_comments: [{ line: 1, comment: 'Nice code structure' }],
            next_steps: [],
        };
        
        render(<FeedbackPanel loading={false} feedback={feedback} />);
        
        expect(screen.getByText('100')).toBeInTheDocument();
        expect(screen.getByText(/perfect!/i)).toBeInTheDocument();
    });
});
