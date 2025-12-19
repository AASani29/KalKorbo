import { useState, useRef, useCallback } from 'react';

export interface AudioRecorderState {
    isRecording: boolean;
    isPaused: boolean;
    recordingTime: number;
    audioBlob: Blob | null;
    error: string | null;
}

export function useAudioRecorder() {
    const [isRecording, setIsRecording] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            setAudioBlob(null);
            audioChunksRef.current = [];

            // Request microphone access with enhanced settings for better quality
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                    sampleRate: 48000, // Higher quality
                    channelCount: 1 // Mono for voice
                }
            });

            streamRef.current = stream;

            // Create MediaRecorder with best available codec
            let mimeType = 'audio/webm;codecs=opus';
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm';
            }
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/mp4';
            }

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType,
                audioBitsPerSecond: 128000 // Higher bitrate for better quality
            });
            mediaRecorderRef.current = mediaRecorder;

            // Handle data available
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle recording stop
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setAudioBlob(blob);

                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            // Start recording
            mediaRecorder.start(100); // Collect data every 100ms
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err: any) {
            console.error('Error starting recording:', err);

            let errorMessage = 'Failed to start recording';
            if (err.name === 'NotAllowedError') {
                errorMessage = 'Microphone access denied. Please allow microphone access.';
            } else if (err.name === 'NotFoundError') {
                errorMessage = 'No microphone found. Please connect a microphone.';
            }

            setError(errorMessage);
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setIsPaused(false);

            // Clear timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording]);

    const pauseRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && !isPaused) {
            mediaRecorderRef.current.pause();
            setIsPaused(true);

            // Pause timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }, [isRecording, isPaused]);

    const resumeRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording && isPaused) {
            mediaRecorderRef.current.resume();
            setIsPaused(false);

            // Resume timer
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    }, [isRecording, isPaused]);

    const resetRecording = useCallback(() => {
        setAudioBlob(null);
        setRecordingTime(0);
        setError(null);
        audioChunksRef.current = [];
    }, []);

    return {
        isRecording,
        isPaused,
        recordingTime,
        audioBlob,
        error,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        resetRecording
    };
}
