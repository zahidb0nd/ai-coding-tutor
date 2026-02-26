import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import CodeEditor from '../Editor';

// Mock Monaco Editor
vi.mock('@monaco-editor/react', () => ({
    default: ({ value, onChange, language, theme, options }) => (
        <div data-testid="monaco-editor">
            <textarea
                data-testid="editor-textarea"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-language={language}
                data-theme={theme}
            />
        </div>
    ),
}));

describe('CodeEditor Component', () => {
    it('renders Monaco editor wrapper', () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="console.log('test')" onChange={mockOnChange} />);
        
        expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });

    it('passes code value to editor', () => {
        const code = "function test() { return 'hello'; }";
        const mockOnChange = vi.fn();
        render(<CodeEditor code={code} onChange={mockOnChange} />);
        
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea.value).toBe(code);
    });

    it('calls onChange when code is modified', () => {
        const mockOnChange = vi.fn();
        const { getByTestId } = render(<CodeEditor code="" onChange={mockOnChange} />);
        
        const textarea = getByTestId('editor-textarea');
        textarea.value = 'new code';
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        expect(mockOnChange).toHaveBeenCalledWith('new code');
    });

    it('defaults to javascript language', () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);
        
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea.getAttribute('data-language')).toBe('javascript');
    });

    it('accepts custom language prop', () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} language="python" />);
        
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea.getAttribute('data-language')).toBe('python');
    });

    it('uses vs-dark theme', () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);
        
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea.getAttribute('data-theme')).toBe('vs-dark');
    });

    it('handles empty code gracefully', () => {
        const mockOnChange = vi.fn();
        render(<CodeEditor code="" onChange={mockOnChange} />);
        
        const textarea = screen.getByTestId('editor-textarea');
        expect(textarea.value).toBe('');
    });

    it('handles null value by converting to empty string', () => {
        const mockOnChange = vi.fn();
        const { getByTestId } = render(<CodeEditor code="" onChange={mockOnChange} />);
        
        const textarea = getByTestId('editor-textarea');
        textarea.value = null;
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        expect(mockOnChange).toHaveBeenCalledWith('');
    });
});
