import Editor from '@monaco-editor/react';
import { useIsMobile } from '../hooks/useMediaQuery';

export default function CodeEditor({ code, onChange, language = 'javascript' }) {
    const isMobile = useIsMobile();

    // Mobile-optimized editor options
    const mobileOptions = {
        fontSize: 16, // Prevents iOS zoom on tap
        fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace",
        minimap: { enabled: false },
        padding: { top: 12, bottom: 12 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: false,
        folding: false, // Simplify for mobile
        automaticLayout: true,
        tabSize: 2,
        renderLineHighlight: 'line',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        suggestOnTriggerCharacters: false, // Reduce autocomplete on mobile
        quickSuggestions: false,
        parameterHints: { enabled: false },
        snippetSuggestions: 'none',
        bracketPairColorization: { enabled: true },
        // Mobile-specific
        lineDecorationsWidth: 5,
        lineNumbersMinChars: 3,
        scrollbar: {
            vertical: 'auto',
            horizontal: 'auto',
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
        },
        overviewRulerLanes: 0,
    };

    // Desktop options
    const desktopOptions = {
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
        minimap: { enabled: false },
        padding: { top: 16, bottom: 16 },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        lineNumbers: 'on',
        glyphMargin: true,
        folding: true,
        automaticLayout: true,
        tabSize: 2,
        renderLineHighlight: 'all',
        cursorBlinking: 'smooth',
        smoothScrolling: true,
        suggestOnTriggerCharacters: true,
        bracketPairColorization: { enabled: true },
    };

    return (
        <div
            style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                height: '100%',
            }}
        >
            <Editor
                height="100%"
                language={language}
                value={code}
                onChange={(value) => onChange(value || '')}
                theme="vs-dark"
                options={isMobile ? mobileOptions : desktopOptions}
            />
        </div>
    );
}
