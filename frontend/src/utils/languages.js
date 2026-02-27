export const SUPPORTED_LANGUAGES = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'c', label: 'C' }
];

export const LANGUAGE_TEMPLATES = {
    javascript: '// Write your JavaScript solution here\n',
    typescript: '// Write your TypeScript solution here\n',
    python: '# Write your Python solution here\n',
    c: '#include <stdio.h>\n\nint main() {\n  return 0;\n}\n'
};
