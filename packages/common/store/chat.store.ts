'use client';

import { Model, models } from '@repo/ai/models';
import { ChatMode } from '@repo/shared/config';
import { MessageGroup, Thread, ThreadItem } from '@repo/shared/types';
import { nanoid } from 'nanoid';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { useAppStore } from './app.store';

let CONFIG_KEY = 'chat-config';

// ── API layer (PostgreSQL via Next.js route handlers) ────────────────────────

const reviveThread = (t: any): Thread => ({
    ...t,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    pinnedAt: t.pinnedAt ? new Date(t.pinnedAt) : new Date(),
});

const reviveItem = (i: any): ThreadItem => ({
    ...i,
    createdAt: new Date(i.createdAt),
    updatedAt: new Date(i.updatedAt),
});

const api = {
    listThreads: async (): Promise<Thread[]> => {
        const res = await fetch('/api/threads');
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(reviveThread);
    },
    getThread: async (id: string): Promise<Thread | null> => {
        const res = await fetch(`/api/threads/${id}`);
        if (!res.ok) return null;
        return reviveThread(await res.json());
    },
    createThread: async (thread: Thread): Promise<void> => {
        await fetch('/api/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(thread),
        });
    },
    updateThread: async (id: string, patch: Record<string, unknown>): Promise<void> => {
        await fetch(`/api/threads/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
    },
    deleteThread: async (id: string): Promise<void> => {
        await fetch(`/api/threads/${id}`, { method: 'DELETE' });
    },
    clearThreads: async (): Promise<void> => {
        await fetch('/api/threads', { method: 'DELETE' });
    },
    listItems: async (threadId: string): Promise<ThreadItem[]> => {
        const res = await fetch(`/api/threads/${threadId}/items`);
        if (!res.ok) return [];
        const data = await res.json();
        return data.map(reviveItem);
    },
    upsertItem: async (threadId: string, item: ThreadItem): Promise<void> => {
        await fetch(`/api/threads/${threadId}/items`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item),
        });
    },
    deleteItem: async (threadId: string, itemId: string): Promise<{ remaining: number }> => {
        const res = await fetch(`/api/threads/${threadId}/items/${itemId}`, {
            method: 'DELETE',
        });
        if (!res.ok) return { remaining: -1 };
        return res.json();
    },
    deleteFollowups: async (threadId: string, afterIso: string): Promise<void> => {
        await fetch(
            `/api/threads/${threadId}/items?after=${encodeURIComponent(afterIso)}`,
            { method: 'DELETE' }
        );
    },
};

const loadInitialData = async () => {
    const configStr =
        typeof window !== 'undefined' ? localStorage.getItem(CONFIG_KEY) : null;
    const config = configStr
        ? JSON.parse(configStr)
        : {
              customInstructions: undefined,
              model: models[0].id,
              useWebSearch: false,
              showSuggestions: true,
              chatMode: ChatMode.GEMINI_2_FLASH,
          };
    const chatMode = config.chatMode || ChatMode.GEMINI_2_FLASH;
    const useWebSearch = typeof config.useWebSearch === 'boolean' ? config.useWebSearch : false;
    const customInstructions = config.customInstructions || '';

    const threads = await api.listThreads();
    const initialThreads = threads.length ? threads : [];

    return {
        threads: initialThreads.sort(
            (a, b) => b.createdAt?.getTime() - a.createdAt?.getTime()
        ),
        currentThreadId: config.currentThreadId || initialThreads[0]?.id,
        config,
        useWebSearch,
        chatMode,
        customInstructions,
        showSuggestions: config.showSuggestions ?? true,
    };
};

type State = {
    model: Model;
    isGenerating: boolean;
    useWebSearch: boolean;
    customInstructions: string;
    showSuggestions: boolean;
    editor: any;
    chatMode: ChatMode;
    context: string;
    imageAttachment: { base64?: string; file?: File };
    abortController: AbortController | null;
    threads: Thread[];
    threadItems: ThreadItem[];
    currentThreadId: string | null;
    activeThreadItemView: string | null;
    currentThread: Thread | null;
    currentThreadItem: ThreadItem | null;
    messageGroups: MessageGroup[];
    isLoadingThreads: boolean;
    isLoadingThreadItems: boolean;
    currentSources: string[];
    creditLimit: {
        remaining: number | undefined;
        maxLimit: number | undefined;
        reset: string | undefined;
        isAuthenticated: boolean;
        isFetched: boolean;
    };
};

type Actions = {
    setModel: (model: Model) => void;
    setEditor: (editor: any) => void;
    setContext: (context: string) => void;
    fetchRemainingCredits: () => Promise<void>;
    setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => void;
    clearImageAttachment: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
    stopGeneration: () => void;
    setAbortController: (abortController: AbortController) => void;
    createThread: (optimisticId: string, thread?: Pick<Thread, 'title'>) => Promise<Thread>;
    setChatMode: (chatMode: ChatMode) => void;
    updateThread: (thread: Pick<Thread, 'id' | 'title'>) => Promise<void>;
    getThread: (threadId: string) => Promise<Thread | null>;
    pinThread: (threadId: string) => Promise<void>;
    unpinThread: (threadId: string) => Promise<void>;
    createThreadItem: (threadItem: ThreadItem) => Promise<void>;
    updateThreadItem: (threadId: string, threadItem: Partial<ThreadItem>) => Promise<void>;
    switchThread: (threadId: string) => void;
    setActiveThreadItemView: (threadItemId: string) => void;
    setCustomInstructions: (customInstructions: string) => void;
    deleteThreadItem: (threadItemId: string) => Promise<void>;
    deleteThread: (threadId: string) => Promise<void>;
    getPreviousThreadItems: (threadId?: string) => ThreadItem[];
    getCurrentThreadItem: (threadId?: string) => ThreadItem | null;
    getCurrentThread: () => Thread | null;
    removeFollowupThreadItems: (threadItemId: string) => Promise<void>;
    getThreadItems: (threadId: string) => Promise<ThreadItem[]>;
    loadThreadItems: (threadId: string) => Promise<void>;
    setCurrentThreadItem: (threadItem: ThreadItem) => void;
    clearAllThreads: () => void;
    setCurrentSources: (sources: string[]) => void;
    setUseWebSearch: (useWebSearch: boolean) => void;
    setShowSuggestions: (showSuggestions: boolean) => void;
};

// ── Batched persistence for streaming updates ────────────────────────────────

const BATCH_PROCESS_INTERVAL = 500; // flush queued item writes every 500ms

type BatchUpdateQueue = {
    items: Map<string, ThreadItem>;
    timeoutId: NodeJS.Timeout | null;
};

const batchUpdateQueue: BatchUpdateQueue = {
    items: new Map(),
    timeoutId: null,
};

const processBatchUpdate = async () => {
    if (batchUpdateQueue.items.size === 0) return;

    const itemsToUpdate = Array.from(batchUpdateQueue.items.values());
    batchUpdateQueue.items.clear();

    await Promise.all(
        itemsToUpdate.map(item =>
            api
                .upsertItem(item.threadId, item)
                .catch(err => console.error(`Failed to persist item ${item.id}:`, err))
        )
    );
};

const queueThreadItemForUpdate = (threadItem: ThreadItem) => {
    batchUpdateQueue.items.set(threadItem.id, threadItem);

    if (!batchUpdateQueue.timeoutId) {
        batchUpdateQueue.timeoutId = setTimeout(() => {
            processBatchUpdate();
            batchUpdateQueue.timeoutId = null;
        }, BATCH_PROCESS_INTERVAL);
    }
};

export const useChatStore = create(
    immer<State & Actions>((set, get) => ({
        model: models[0],
        isGenerating: false,
        editor: undefined,
        context: '',
        threads: [],
        chatMode: ChatMode.GEMINI_2_FLASH,
        threadItems: [],
        useWebSearch: false,
        customInstructions: '',
        currentThreadId: null,
        activeThreadItemView: null,
        currentThread: null,
        currentThreadItem: null,
        imageAttachment: { base64: undefined, file: undefined },
        messageGroups: [],
        abortController: null,
        isLoadingThreads: false,
        isLoadingThreadItems: false,
        currentSources: [],
        creditLimit: {
            remaining: undefined,
            maxLimit: undefined,
            reset: undefined,
            isAuthenticated: false,
            isFetched: false,
        },
        showSuggestions: true,

        setCustomInstructions: (customInstructions: string) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, customInstructions })
            );
            set(state => {
                state.customInstructions = customInstructions;
            });
        },

        setImageAttachment: (imageAttachment: { base64?: string; file?: File }) => {
            set(state => {
                state.imageAttachment = imageAttachment;
            });
        },

        clearImageAttachment: () => {
            set(state => {
                state.imageAttachment = { base64: undefined, file: undefined };
            });
        },

        setActiveThreadItemView: (threadItemId: string) => {
            set(state => {
                state.activeThreadItemView = threadItemId;
            });
        },

        setShowSuggestions: (showSuggestions: boolean) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, showSuggestions })
            );
            set(state => {
                state.showSuggestions = showSuggestions;
            });
        },

        setUseWebSearch: (useWebSearch: boolean) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, useWebSearch }));
            set(state => {
                state.useWebSearch = useWebSearch;
            });
        },

        setChatMode: (chatMode: ChatMode) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(CONFIG_KEY, JSON.stringify({ ...existingConfig, chatMode }));
            set(state => {
                state.chatMode = chatMode;
            });
        },

        pinThread: async (threadId: string) => {
            await api.updateThread(threadId, { pinned: true });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: true, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        unpinThread: async (threadId: string) => {
            await api.updateThread(threadId, { pinned: false });
            set(state => {
                state.threads = state.threads.map(thread =>
                    thread.id === threadId
                        ? { ...thread, pinned: false, pinnedAt: new Date() }
                        : thread
                );
            });
        },

        fetchRemainingCredits: async () => {
            try {
                const response = await fetch('/api/messages/remaining');
                if (!response.ok) throw new Error('Failed to fetch credit info');

                const data = await response.json();
                set({
                    creditLimit: {
                        ...data,
                        isFetched: true,
                    },
                });
            } catch (error) {
                console.error('Error fetching remaining credits:', error);
            }
        },

        getPinnedThreads: async () => {
            return get()
                .threads.filter(t => t.pinned)
                .sort((a, b) => b.pinnedAt.getTime() - a.pinnedAt.getTime());
        },

        removeFollowupThreadItems: async (threadItemId: string) => {
            const threadItem = get().threadItems.find(t => t.id === threadItemId);
            if (!threadItem) return;

            await api.deleteFollowups(
                threadItem.threadId,
                new Date(threadItem.createdAt).toISOString()
            );

            set(state => {
                state.threadItems = state.threadItems.filter(
                    t =>
                        t.createdAt <= threadItem.createdAt ||
                        t.threadId !== threadItem.threadId
                );
            });
        },

        getThreadItems: async (threadId: string) => {
            return api.listItems(threadId);
        },

        setCurrentSources: (sources: string[]) => {
            set(state => {
                state.currentSources = sources;
            });
        },

        setCurrentThreadItem: threadItem =>
            set(state => {
                state.currentThreadItem = threadItem;
            }),

        setEditor: editor =>
            set(state => {
                state.editor = editor;
            }),

        setContext: context =>
            set(state => {
                state.context = context;
            }),

        setIsGenerating: isGenerating => {
            useAppStore.getState().dismissSideDrawer();
            set(state => {
                state.isGenerating = isGenerating;
            });
        },

        stopGeneration: () => {
            set(state => {
                state.isGenerating = false;
                state.abortController?.abort();
            });
        },

        setAbortController: abortController =>
            set(state => {
                state.abortController = abortController;
            }),

        loadThreadItems: async (threadId: string) => {
            const threadItems = await api.listItems(threadId);
            set(state => {
                state.threadItems = threadItems;
            });
        },

        clearAllThreads: async () => {
            await api.clearThreads();
            set(state => {
                state.threads = [];
                state.threadItems = [];
                state.currentThreadId = null;
                state.currentThread = null;
            });
        },

        getThread: async (threadId: string) => {
            const local = get().threads.find(t => t.id === threadId);
            if (local) return local;
            return api.getThread(threadId);
        },

        createThread: async (optimisticId: string, thread?: Pick<Thread, 'title'>) => {
            const threadId = optimisticId || nanoid();
            const newThread: Thread = {
                id: threadId,
                title: thread?.title || 'New Thread',
                updatedAt: new Date(),
                createdAt: new Date(),
                pinned: false,
                pinnedAt: new Date(),
            };
            set(state => {
                state.threads.push(newThread);
                state.currentThreadId = newThread.id;
                state.currentThread = newThread;
            });

            await api.createThread(newThread);
            return newThread;
        },

        setModel: async (model: Model) => {
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, model: model.id })
            );
            set(state => {
                state.model = model;
            });
        },

        updateThread: async thread => {
            const existingThread = get().threads.find(t => t.id === thread.id);
            if (!existingThread) return;

            const updatedThread: Thread = {
                ...existingThread,
                ...thread,
                updatedAt: new Date(),
            };

            set(state => {
                const index = state.threads.findIndex((t: Thread) => t.id === thread.id);
                if (index !== -1) {
                    state.threads[index] = updatedThread;
                }
                if (state.currentThreadId === thread.id) {
                    state.currentThread = updatedThread;
                }
            });

            try {
                await api.updateThread(thread.id, { title: updatedThread.title });
            } catch (error) {
                console.error('Failed to update thread:', error);
            }
        },

        createThreadItem: async threadItem => {
            const threadId = get().currentThreadId;
            if (!threadId) return;
            try {
                set(state => {
                    if (state.threadItems.find(t => t.id === threadItem.id)) {
                        state.threadItems = state.threadItems.map(t =>
                            t.id === threadItem.id ? threadItem : t
                        );
                    } else {
                        state.threadItems.push({ ...threadItem, threadId });
                    }
                });

                await api.upsertItem(threadId, { ...threadItem, threadId });
            } catch (error) {
                console.error('Failed to create thread item:', error);
            }
        },

        updateThreadItem: async (threadId, threadItem) => {
            if (!threadItem.id) return;
            if (!threadId) return;

            try {
                const existingItem = get().threadItems.find(t => t.id === threadItem.id);

                const updatedItem = existingItem
                    ? { ...existingItem, ...threadItem, threadId, updatedAt: new Date() }
                    : ({
                          id: threadItem.id,
                          threadId,
                          createdAt: new Date(),
                          updatedAt: new Date(),
                          ...threadItem,
                      } as ThreadItem);

                set(state => {
                    const index = state.threadItems.findIndex(t => t.id === threadItem.id);
                    if (index !== -1) {
                        state.threadItems[index] = updatedItem;
                    } else {
                        state.threadItems.push(updatedItem);
                    }
                });

                queueThreadItemForUpdate(updatedItem);
            } catch (error) {
                console.error('Error in updateThreadItem:', error);

                try {
                    const fallbackItem = {
                        id: threadItem.id,
                        threadId,
                        query: threadItem.query || '',
                        mode: threadItem.mode || ChatMode.GEMINI_2_FLASH,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        ...threadItem,
                        error: threadItem.error || `Something went wrong`,
                    } as ThreadItem;
                    await api.upsertItem(threadId, fallbackItem);
                } catch (fallbackError) {
                    console.error(
                        'Critical: Failed even fallback thread item update:',
                        fallbackError
                    );
                }
            }
        },

        switchThread: async (threadId: string) => {
            const thread = get().threads.find(t => t.id === threadId);
            const existingConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
            localStorage.setItem(
                CONFIG_KEY,
                JSON.stringify({ ...existingConfig, currentThreadId: threadId })
            );
            set(state => {
                state.currentThreadId = threadId;
                state.currentThread = thread || null;
            });
            get().loadThreadItems(threadId);
        },

        deleteThreadItem: async threadItemId => {
            const threadId = get().currentThreadId;
            if (!threadId) return;

            const { remaining } = await api.deleteItem(threadId, threadItemId);
            set(state => {
                state.threadItems = state.threadItems.filter(
                    (t: ThreadItem) => t.id !== threadItemId
                );
            });

            if (remaining === 0) {
                set(state => {
                    state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                    state.currentThreadId = state.threads[0]?.id ?? null;
                    state.currentThread = state.threads[0] || null;
                });

                if (typeof window !== 'undefined') {
                    window.location.href = '/chat';
                }
            }
        },

        deleteThread: async threadId => {
            await api.deleteThread(threadId);
            set(state => {
                state.threads = state.threads.filter((t: Thread) => t.id !== threadId);
                state.currentThreadId = state.threads[0]?.id ?? null;
                state.currentThread = state.threads[0] || null;
            });
        },

        getPreviousThreadItems: threadId => {
            const state = get();

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === threadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });

            if (allThreadItems.length > 1) {
                return allThreadItems.slice(0, -1);
            }

            return [];
        },

        getCurrentThreadItem: () => {
            const state = get();

            const allThreadItems = state.threadItems
                .filter(item => item.threadId === state.currentThreadId)
                .sort((a, b) => {
                    return a.createdAt.getTime() - b.createdAt.getTime();
                });
            return allThreadItems[allThreadItems.length - 1] || null;
        },

        getCurrentThread: () => {
            const state = get();
            return state.threads.find(t => t.id === state.currentThreadId) || null;
        },
    }))
);

if (typeof window !== 'undefined') {
    loadInitialData().then(
        ({
            threads,
            currentThreadId,
            chatMode,
            useWebSearch,
            showSuggestions,
            customInstructions,
        }) => {
            useChatStore.setState({
                threads,
                currentThreadId,
                currentThread: threads.find(t => t.id === currentThreadId) || threads?.[0],
                chatMode,
                useWebSearch,
                showSuggestions,
                customInstructions,
            });
        }
    );
}
