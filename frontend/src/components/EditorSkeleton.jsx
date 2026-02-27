import React from 'react';

export default function EditorSkeleton() {
    return (
        <div
            style={{
                borderRadius: 'inherit', // Matches parent or explicitly set to var(--radius-md)
                overflow: 'hidden',
                height: '100%',
                width: '100%',
                backgroundColor: '#1e1e1e', // Matches vs-dark theme base background
                display: 'flex',
                flexDirection: 'column',
                padding: '16px 0',
                boxSizing: 'border-box',
            }}
        >
            <div style={{
                padding: '0 40px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}>
                <div style={{ height: '18px', width: '40%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '60%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '50%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '75%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '30%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '85%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '45%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '65%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
                <div style={{ height: '18px', width: '55%', backgroundColor: 'rgba(255, 255, 255, 0.08)', borderRadius: '4px' }}></div>
            </div>
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; }
                        50% { opacity: .4; }
                    }
                `}
            </style>
        </div>
    );
}
