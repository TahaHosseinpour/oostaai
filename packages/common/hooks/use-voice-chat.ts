'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceChatState =
    | 'idle'
    | 'connecting'
    | 'recording'
    | 'processing'
    | 'generating'
    | 'speaking'
    | 'error';

export type UseVoiceChatOptions = {
    /**
     * Callback invoked when a user utterance is transcribed. Should return when the
     * agent response is ready (text) so it can be spoken back to the user.
     */
    onTranscript: (text: string) => Promise<string | void> | string | void;
    /** RMS threshold below which the audio is considered silence. Default 0.02 */
    silenceThreshold?: number;
    /** Milliseconds of continuous silence before auto-submit. Default 1500 */
    silenceDurationMs?: number;
    /** RMS threshold above which user is considered speaking (barge-in). Default 0.06 */
    bargeInThreshold?: number;
    /** Minimum speech RMS observed before auto-submit fires (avoids submitting empty audio). Default 0.04 */
    minSpeechThreshold?: number;
    /** Optional language hint passed to STT */
    language?: string;
};

export type UseVoiceChatReturn = {
    state: VoiceChatState;
    error: string | null;
    start: () => Promise<void>;
    stop: () => void;
    getInputVolume: () => number;
    getOutputVolume: () => number;
};

/**
 * Voice chat state machine.
 *
 * Flow:
 *   idle → recording → (silence detected) → processing (STT)
 *        → generating (LLM via onTranscript) → speaking (TTS)
 *        → recording (loop)
 *
 * Barge-in: while speaking, mic is still monitored. If RMS spikes above
 * `bargeInThreshold`, the TTS playback is aborted and we resume recording.
 */
export function useVoiceChat(options: UseVoiceChatOptions): UseVoiceChatReturn {
    const {
        onTranscript,
        silenceThreshold = 0.02,
        silenceDurationMs = 1500,
        bargeInThreshold = 0.06,
        minSpeechThreshold = 0.04,
        language,
    } = options;

    const [state, setState] = useState<VoiceChatState>('idle');
    const [error, setError] = useState<string | null>(null);

    // --- Refs (imperative) ---
    const stateRef = useRef<VoiceChatState>('idle');
    const stoppedRef = useRef(false);

    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAnalyserRef = useRef<AnalyserNode | null>(null);
    const outputAnalyserRef = useRef<AnalyserNode | null>(null);
    const inputDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
    const outputDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const inputVolumeRef = useRef(0);
    const outputVolumeRef = useRef(0);
    const silenceStartRef = useRef<number | null>(null);
    const peakRmsRef = useRef(0);
    const submittingRef = useRef(false);

    const ttsAbortRef = useRef<AbortController | null>(null);
    const currentBufferSourceRef = useRef<AudioBufferSourceNode | null>(null);
    const transcriptResultRef = useRef<string | undefined>(undefined);

    const rafRef = useRef<number | null>(null);

    const setVoiceState = useCallback((next: VoiceChatState) => {
        stateRef.current = next;
        setState(next);
    }, []);

    // ----- Volume monitoring (RAF loop) -----
    const startMonitorLoop = useCallback(() => {
        const tick = () => {
            if (stoppedRef.current) return;

            const inAnalyser = inputAnalyserRef.current;
            const inData = inputDataRef.current;
            if (inAnalyser && inData) {
                inAnalyser.getByteTimeDomainData(inData);
                let sum = 0;
                for (let i = 0; i < inData.length; i++) {
                    const v = (inData[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / inData.length);
                inputVolumeRef.current = Math.min(rms * 3, 1);

                const s = stateRef.current;

                if (s === 'recording') {
                    if (rms < silenceThreshold) {
                        if (silenceStartRef.current == null) {
                            silenceStartRef.current = performance.now();
                        } else if (
                            performance.now() - silenceStartRef.current > silenceDurationMs &&
                            peakRmsRef.current > minSpeechThreshold &&
                            !submittingRef.current
                        ) {
                            submittingRef.current = true;
                            void submitRecording();
                        }
                    } else {
                        silenceStartRef.current = null;
                        if (rms > peakRmsRef.current) peakRmsRef.current = rms;
                    }
                } else if (s === 'speaking') {
                    // Barge-in detection
                    if (rms > bargeInThreshold) {
                        bargeIn();
                    }
                }
            }

            const outAnalyser = outputAnalyserRef.current;
            const outData = outputDataRef.current;
            if (outAnalyser && outData) {
                outAnalyser.getByteTimeDomainData(outData);
                let sum = 0;
                for (let i = 0; i < outData.length; i++) {
                    const v = (outData[i] - 128) / 128;
                    sum += v * v;
                }
                const rms = Math.sqrt(sum / outData.length);
                outputVolumeRef.current = Math.min(rms * 3, 1);
            } else {
                outputVolumeRef.current = 0;
            }

            rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [silenceThreshold, silenceDurationMs, bargeInThreshold, minSpeechThreshold]);

    // ----- Recording -----
    const startRecording = useCallback(() => {
        const stream = mediaStreamRef.current;
        if (!stream) return;

        chunksRef.current = [];
        silenceStartRef.current = null;
        peakRmsRef.current = 0;
        submittingRef.current = false;

        const mimeCandidates = [
            'audio/webm;codecs=opus',
            'audio/webm',
            'audio/ogg;codecs=opus',
            'audio/mp4',
        ];
        const mimeType =
            mimeCandidates.find(m => {
                try {
                    return typeof MediaRecorder !== 'undefined' &&
                        MediaRecorder.isTypeSupported(m);
                } catch {
                    return false;
                }
            }) || '';

        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        recorder.ondataavailable = e => {
            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };
        mediaRecorderRef.current = recorder;
        recorder.start(250);

        setVoiceState('recording');
    }, [setVoiceState]);

    const submitRecording = useCallback(async () => {
        const recorder = mediaRecorderRef.current;
        if (!recorder) return;

        setVoiceState('processing');

        const stopped = new Promise<void>(resolve => {
            recorder.onstop = () => resolve();
        });
        try {
            recorder.stop();
        } catch {}
        await stopped;

        const chunks = chunksRef.current;
        chunksRef.current = [];
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });

        if (blob.size === 0) {
            // Nothing captured; restart recording
            startRecording();
            return;
        }

        let transcript = '';
        try {
            const form = new FormData();
            form.append('audio', blob, 'recording.webm');
            if (language) form.append('language', language);
            const res = await fetch('/api/voice/transcribe', {
                method: 'POST',
                body: form,
            });
            if (!res.ok) throw new Error(`STT failed (${res.status})`);
            const data = (await res.json()) as { text?: string };
            transcript = (data?.text || '').trim();
        } catch (e: any) {
            console.error('Transcribe error:', e);
            setError(e?.message || 'Transcription failed');
            setVoiceState('error');
            return;
        }

        if (!transcript) {
            // empty transcript, loop back to recording
            startRecording();
            return;
        }

        setVoiceState('generating');

        let responseText: string | undefined;
        try {
            transcriptResultRef.current = undefined;
            const r = await onTranscript(transcript);
            responseText = typeof r === 'string' ? r : transcriptResultRef.current;
        } catch (e: any) {
            console.error('onTranscript error:', e);
            setError(e?.message || 'Generation failed');
            setVoiceState('error');
            return;
        }

        if (stoppedRef.current) return;

        if (!responseText) {
            // No text returned, loop back
            startRecording();
            return;
        }

        await speakText(responseText);

        if (!stoppedRef.current) {
            startRecording();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language, onTranscript, setVoiceState, startRecording]);

    // ----- TTS playback -----
    const speakText = useCallback(
        async (text: string) => {
            if (!text || stoppedRef.current) return;
            setVoiceState('speaking');

            const audioCtx = audioContextRef.current;
            if (!audioCtx) return;

            const controller = new AbortController();
            ttsAbortRef.current = controller;

            try {
                const res = await fetch('/api/voice/speak', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text }),
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error(`TTS failed (${res.status})`);
                const arrayBuf = await res.arrayBuffer();
                if (controller.signal.aborted) return;

                const decoded = await audioCtx.decodeAudioData(arrayBuf.slice(0));
                if (controller.signal.aborted) return;

                // Set up output analyser
                const outputAnalyser = audioCtx.createAnalyser();
                outputAnalyser.fftSize = 512;
                outputAnalyserRef.current = outputAnalyser;
                outputDataRef.current = new Uint8Array(outputAnalyser.frequencyBinCount);

                const src = audioCtx.createBufferSource();
                src.buffer = decoded;
                src.connect(outputAnalyser);
                outputAnalyser.connect(audioCtx.destination);
                currentBufferSourceRef.current = src;

                await new Promise<void>(resolve => {
                    src.onended = () => resolve();
                    src.start();
                });
            } catch (e: any) {
                if (e?.name === 'AbortError') {
                    // Barge-in or stop
                    return;
                }
                console.error('TTS error:', e);
                setError(e?.message || 'TTS failed');
                setVoiceState('error');
            } finally {
                try {
                    currentBufferSourceRef.current?.disconnect();
                } catch {}
                currentBufferSourceRef.current = null;
                outputAnalyserRef.current = null;
                outputDataRef.current = null;
                ttsAbortRef.current = null;
            }
        },
        [setVoiceState]
    );

    // ----- Barge-in -----
    const bargeIn = useCallback(() => {
        try {
            currentBufferSourceRef.current?.stop();
        } catch {}
        try {
            currentBufferSourceRef.current?.disconnect();
        } catch {}
        currentBufferSourceRef.current = null;
        try {
            ttsAbortRef.current?.abort();
        } catch {}
        ttsAbortRef.current = null;
        outputAnalyserRef.current = null;
        outputDataRef.current = null;
        // Resume recording
        startRecording();
    }, [startRecording]);

    // ----- Public API -----
    const start = useCallback(async () => {
        if (stateRef.current !== 'idle' && stateRef.current !== 'error') return;
        stoppedRef.current = false;
        setError(null);
        setVoiceState('connecting');

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });
            mediaStreamRef.current = stream;

            const AC: typeof AudioContext =
                (window as any).AudioContext || (window as any).webkitAudioContext;
            const ctx = new AC();
            if (ctx.state === 'suspended') {
                try {
                    await ctx.resume();
                } catch {}
            }
            audioContextRef.current = ctx;

            const source = ctx.createMediaStreamSource(stream);
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 512;
            source.connect(analyser);
            inputAnalyserRef.current = analyser;
            inputDataRef.current = new Uint8Array(analyser.frequencyBinCount);

            startMonitorLoop();
            startRecording();
        } catch (e: any) {
            console.error('Voice start error:', e);
            setError(e?.message || 'Microphone access failed');
            setVoiceState('error');
        }
    }, [setVoiceState, startMonitorLoop, startRecording]);

    const stop = useCallback(() => {
        stoppedRef.current = true;
        setVoiceState('idle');

        if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;

        try {
            ttsAbortRef.current?.abort();
        } catch {}
        try {
            currentBufferSourceRef.current?.stop();
        } catch {}
        try {
            currentBufferSourceRef.current?.disconnect();
        } catch {}
        currentBufferSourceRef.current = null;

        const rec = mediaRecorderRef.current;
        if (rec && rec.state !== 'inactive') {
            try {
                rec.stop();
            } catch {}
        }
        mediaRecorderRef.current = null;

        const stream = mediaStreamRef.current;
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
        }
        mediaStreamRef.current = null;

        const ctx = audioContextRef.current;
        if (ctx) {
            try {
                ctx.close();
            } catch {}
        }
        audioContextRef.current = null;
        inputAnalyserRef.current = null;
        outputAnalyserRef.current = null;
        inputDataRef.current = null;
        outputDataRef.current = null;
        inputVolumeRef.current = 0;
        outputVolumeRef.current = 0;
        silenceStartRef.current = null;
        peakRmsRef.current = 0;
        submittingRef.current = false;
    }, [setVoiceState]);

    useEffect(() => {
        return () => {
            stoppedRef.current = true;
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
            try {
                mediaRecorderRef.current?.stop();
            } catch {}
            mediaStreamRef.current?.getTracks().forEach(t => t.stop());
            try {
                audioContextRef.current?.close();
            } catch {}
        };
    }, []);

    const getInputVolume = useCallback(() => inputVolumeRef.current, []);
    const getOutputVolume = useCallback(() => outputVolumeRef.current, []);

    return { state, error, start, stop, getInputVolume, getOutputVolume };
}
