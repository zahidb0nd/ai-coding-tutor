import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CodeEditor from '../Editor';

// Mock the useIsMobile hook
vi.mock('../../hooks/useMediaQuery', () => ({
    useIsMobile: () => false,
}));

// Mock EditorSkeleton
vi.mock('../EditorSkeleton', () => ({
    default: () => <div data-testid="editor-skeleton">Loading...</div>,
}));

// Mock Monaco Editor — must be a default export for React.lazy to resolve
vi.mock('@monaco-editor/react', () => ({
    default: ({ value, onChange, language, theme, options }) => (
        <div data-testid="monaco-editor">
            <textarea
                data-testid="editor-textarea"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                data-language={language}
                data-theme={theme}
            />
        </div>
    ),
}));

describe('CodeEditor Component', () => {
    it('renders Monaco editor wrapper', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="console.log('test')" onChange={mockOnChange} />);

        await waitFor(() => {
            expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
        });
    });

    it('passes code value to editor', async () => {
        const code = "function test() { return 'hello'; }";
        const mockOnChange = vi.fn();
        render(<CodeEditor code={code} onChange={mockOnChange} />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.value).toBe(code);
        });
    });

    it('calls onChange when code is modified', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);

        await waitFor(() => {
            expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();
        });

        const textarea = screen.getByTestId('editor-textarea');
        fireEvent.change(textarea, { target: { value: 'new code' } });

        expect(mockOnChange).toHaveBeenCalledWith('new code');
    });

    it('defaults to javascript language', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.getAttribute('data-language')).toBe('javascript');
        });
    });

    it('accepts custom language prop', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} language="python" />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.getAttribute('data-language')).toBe('python');
        });
    });

    it('uses vs-dark theme', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.getAttribute('data-theme')).toBe('vs-dark');
        });
    });

    it('handles empty code gracefully', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.value).toBe('');
        });
    });

    it('passes empty string value correctly', async () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);

        await waitFor(() => {
            const textarea = screen.getByTestId('editor-textarea');
            expect(textarea.value).toBe('');
        });
    });
});
