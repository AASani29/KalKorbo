import { useState, useEffect, useRef, useCallback } from 'react';

// Extend Window interface for browser compatibility
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

interface UseVoiceRecognitionOptions {
    continuous?: boolean;
    interimResults?: boolean;
    lang?: string;
    onEnd?: () => void;
    onError?: (error: string) => void;
}

export function useVoiceRecognition(options: UseVoiceRecognitionOptions = {}) {
    const {
        continuous = true,
        interimResults = true,
        lang = 'en-US',
        onEnd,
        onError
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<any>(null);
    const isListeningRef = useRef(false);

    // Check browser support
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            setIsSupported(false);
            setError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = continuous;
        recognition.interimResults = interimResults;
        recognition.lang = lang;
        recognition.maxAlternatives = 1;

        // Handle results
        recognition.onresult = (event: any) => {
            let interimText = '';
            let finalText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcriptPart = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalText += transcriptPart;
                } else {
                    interimText += transcriptPart;
                }
            }

            if (finalText) {
                setTranscript(finalText);
                setInterimTranscript('');
            } else {
                setInterimTranscript(interimText);
            }
        };

        // Handle errors
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);

            let errorMessage = 'An error occurred with speech recognition.';

            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage = 'No microphone found. Please check your device.';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied. Please allow microphone access.';
                    break;
                case 'network':
                    errorMessage = 'Network error occurred. Please check your connection.';
                    break;
                case 'aborted':
                    // Ignore aborted errors (usually from manual stop)
                    return;
            }

            setError(errorMessage);
            setIsListening(false);
            isListeningRef.current = false;

            if (onError) {
                onError(errorMessage);
            }
        };

        // Handle end
        recognition.onend = () => {
            // Only restart if we're supposed to be listening
            if (isListeningRef.current && continuous) {
                try {
                    recognition.start();
                } catch (err) {
                    console.error('Error restarting recognition:', err);
                    setIsListening(false);
                    isListeningRef.current = false;
                }
            } else {
                setIsListening(false);
                isListeningRef.current = false;

                if (onEnd) {
                    onEnd();
                }
            }
        };

        // Handle start
        recognition.onstart = () => {
            setError(null);
            setIsListening(true);
            isListeningRef.current = true;
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (err) {
                    // Ignore errors on cleanup
                }
            }
        };
    }, [continuous, interimResults, lang, onEnd, onError]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }

        if (!recognitionRef.current) {
            setError('Speech recognition not initialized.');
            return;
        }

        try {
            setTranscript('');
            setInterimTranscript('');
            setError(null);
            isListeningRef.current = true;
            recognitionRef.current.start();
        } catch (err: any) {
            // If already started, ignore the error
            if (err.message?.includes('already started')) {
                console.log('Recognition already started');
            } else {
                console.error('Error starting recognition:', err);
                setError('Failed to start speech recognition.');
                isListeningRef.current = false;
            }
        }
    }, [isSupported]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                isListeningRef.current = false;
                recognitionRef.current.stop();
            } catch (err) {
                console.error('Error stopping recognition:', err);
            }
        }
    }, []);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    return {
        isListening,
        transcript,
        interimTranscript,
        isSupported,
        error,
        startListening,
        stopListening,
        resetTranscript
    };
}
