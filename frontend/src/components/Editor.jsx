import Editor from '@monaco-editor/react';

export default function CodeEditor({ code, onChange, language = 'javascript' }) {
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
                options={{
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
                }}
            />
        </div>
    );
}
