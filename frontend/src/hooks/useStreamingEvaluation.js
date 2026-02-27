import { useState, useRef, useCallback } from 'react';

export function useStreamingEvaluation() {
    const [streamedResponse, setStreamedResponse] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [error, setError] = useState(null);
    const [finalResult, setFinalResult] = useState(null);

    const responseRef = useRef("");

    const evaluateStream = useCallback(async (payload, token) => {
        setIsStreaming(true);
        setError(null);
        setFinalResult(null);
        responseRef.current = "";
        setStreamedResponse("");

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
            const res = await fetch(`${baseUrl}/api/submissions/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("Stream connection failed");

            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let lastRenderTime = performance.now();

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setStreamedResponse(responseRef.current);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.error) throw new Error(data.error);
                            if (data.done) {
                                setFinalResult(data);
                            } else if (data.content) {
                                responseRef.current += data.content;
                                const now = performance.now();
                                if (now - lastRenderTime > 30) {
                                    setStreamedResponse(responseRef.current);
                                    lastRenderTime = now;
                                }
                            }
                        } catch (e) {
                            if (e.message !== "Unexpected end of JSON input" && !e.message.includes("is not valid JSON") && e.message !== data?.error) {
                                // console.error("Parse error:", e);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error in evaluateStream:', err);
            setError(err.message);
        } finally {
            setIsStreaming(false);
        }
    }, []);

    return {
        streamedResponse,
        finalResult,
        isStreaming,
        error,
        evaluateStream
    };
}
