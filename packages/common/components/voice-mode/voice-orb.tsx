'use client';

import { Orb, OrbAgentState } from '@repo/ui';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAgentStream } from '../../hooks/agent-provider';
import { useVoiceChat } from '../../hooks/use-voice-chat';
import { useAppStore, useChatStore } from '../../store';

const STATUS_TEXT: Record<string, string> = {
    idle: 'برای شروع گفت‌و‌گو، روی میکروفون بزنید',
    connecting: 'در حال اتصال...',
    recording: 'در حال گوش دادن...',
    processing: 'در حال پردازش صدا...',
    generating: 'در حال تولید پاسخ...',
    speaking: 'در حال پاسخ‌گویی...',
    error: 'خطا — لطفاً دوباره تلاش کنید',
};

/**
 * Maps the voice chat state machine to the Orb visual state.
 */
function toOrbState(s: string): OrbAgentState {
    if (s === 'recording') return 'listening';
    if (s === 'processing' || s === 'generating' || s === 'connecting') return 'thinking';
    if (s === 'speaking') return 'talking';
    return null;
}

export function VoiceOrb() {
    const params = useParams();
    const currentThreadId = params?.threadId?.toString();
    const router = useRouter();

    const { handleSubmit } = useAgentStream();
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const createThread = useChatStore(state => state.createThread);
    const setIsVoiceMode = useAppStore(state => state.setIsVoiceMode);

    const handleSubmitRef = useRef(handleSubmit);
    const useWebSearchRef = useRef(useWebSearch);
    const threadIdRef = useRef<string | undefined>(currentThreadId);
    useEffect(() => {
        handleSubmitRef.current = handleSubmit;
    }, [handleSubmit]);
    useEffect(() => {
        useWebSearchRef.current = useWebSearch;
    }, [useWebSearch]);
    useEffect(() => {
        threadIdRef.current = currentThreadId;
    }, [currentThreadId]);

    /**
     * Called by the voice hook when a user utterance is transcribed. Sends the
     * transcript through the same chat backend (handleSubmit) and waits for the
     * agent's response so it can be spoken back.
     */
    const onTranscript = useCallback(async (transcript: string): Promise<string> => {
        let threadId = threadIdRef.current;
        if (!threadId) {
            threadId = uuidv4();
            createThread(threadId, { title: transcript });
            router.push(`/chat/${threadId}`);
            threadIdRef.current = threadId;
        }

        const existingItems = await getThreadItems(threadId);
        const sortedItems = existingItems.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        const existingIds = new Set(sortedItems.map(i => i.id));

        const formData = new FormData();
        formData.append('query', transcript);

        // Set up subscription BEFORE submitting so we don't miss fast events.
        const responsePromise = new Promise<string>(resolve => {
            let started = false;
            let resolved = false;

            const finalize = (text: string) => {
                if (resolved) return;
                resolved = true;
                try {
                    unsub();
                } catch {}
                resolve(text);
            };

            const unsub = useChatStore.subscribe(state => {
                if (resolved) return;
                if (state.isGenerating) {
                    started = true;
                }
                if (started && !state.isGenerating) {
                    const newItem = state.threadItems
                        .filter(i => i.threadId === threadId && !existingIds.has(i.id))
                        .sort(
                            (a, b) =>
                                new Date(b.createdAt).getTime() -
                                new Date(a.createdAt).getTime()
                        )[0];
                    const text = newItem?.answer?.text || '';
                    finalize(text);
                }
            });

            // Safety timeout — never hang forever
            setTimeout(() => finalize(''), 120_000);
        });

        handleSubmitRef.current({
            formData,
            newThreadId: threadId,
            messages: sortedItems,
            useWebSearch: useWebSearchRef.current,
        });

        const text = await responsePromise;
        return text;
    }, [createThread, getThreadItems, router]);

    const voice = useVoiceChat({
        onTranscript,
        language: 'fa',
    });

    // Auto-start the session when the orb mounts and stop on unmount.
    useEffect(() => {
        void voice.start();
        return () => {
            voice.stop();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const orbState = useMemo(() => toOrbState(voice.state), [voice.state]);
    const statusText = STATUS_TEXT[voice.state] || '';

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6">
            <div className="relative flex h-[280px] w-[280px] items-center justify-center rounded-full border-3 border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
                <Orb
                    agentState={orbState}
                    getInputVolume={voice.getInputVolume}
                    getOutputVolume={voice.getOutputVolume}
                    colors={['#6366f1', '#a855f7']}
                    className="h-full w-full overflow-hidden rounded-full"
                />
            </div>
            <div className="flex flex-col items-center gap-2">
                <p className="text-foreground text-sm font-medium">{statusText}</p>
                {voice.error && (
                    <p className="text-destructive max-w-md text-center text-xs">
                        {voice.error}
                    </p>
                )}
                <p className="text-muted-foreground text-xs">
                    صحبت کنید، با مکث پیامتان ارسال می‌شود
                </p>
            </div>
        </div>
    );
}
