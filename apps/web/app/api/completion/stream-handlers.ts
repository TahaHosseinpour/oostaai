import { runWorkflow } from '@repo/ai/workflow';
import { CHAT_MODE_CREDIT_COSTS } from '@repo/shared/config';
import { logger } from '@repo/shared/logger';
import { Geo } from '@vercel/functions';
import { CompletionRequestType, StreamController } from './types';
import { sanitizePayloadForJSON } from './utils';

export function sendMessage(
    controller: StreamController,
    encoder: TextEncoder,
    payload: Record<string, any>
) {
    try {
        if (payload.content && typeof payload.content === 'string') {
            payload.content = normalizeMarkdownContent(payload.content);
        }

        const sanitizedPayload = sanitizePayloadForJSON(payload);
        const message = `event: ${payload.type}\ndata: ${JSON.stringify(sanitizedPayload)}\n\n`;

        controller.enqueue(encoder.encode(message));
        controller.enqueue(new Uint8Array(0));
    } catch (error) {
        // This is critical - we should log errors in message serialization
        logger.error('Error serializing message payload', error, {
            payloadType: payload.type,
            threadId: payload.threadId,
        });

        const errorMessage = `event: done\ndata: ${JSON.stringify({
            type: 'done',
            status: 'error',
            error: 'Failed to serialize payload',
            threadId: payload.threadId,
            threadItemId: payload.threadItemId,
            parentThreadItemId: payload.parentThreadItemId,
        })}\n\n`;
        controller.enqueue(encoder.encode(errorMessage));
    }
}

export function normalizeMarkdownContent(content: string): string {
    const normalizedContent = content.replace(/\\n/g, '\n');
    return normalizedContent;
}

export async function executeStream({
    controller,
    encoder,
    data,
    abortController,
    gl,
    userId,
    onFinish,
}: {
    controller: StreamController;
    encoder: TextEncoder;
    data: CompletionRequestType;
    abortController: AbortController;
    userId?: string;
    gl?: Geo;
    onFinish?: () => Promise<void>;
}): Promise<{ success: boolean } | Response> {
    try {
        const creditCost = CHAT_MODE_CREDIT_COSTS[data.mode];

        const { signal } = abortController;

        const workflow = runWorkflow({
            mode: data.mode,
            question: data.prompt,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            messages: data.messages,
            customInstructions: data.customInstructions,
            webSearch: data.webSearch || false,
            config: {
                maxIterations: data.maxIterations || 3,
                signal,
            },
            gl,
            mcpConfig: data.mcpConfig || {},
            showSuggestions: data.showSuggestions || false,
            onFinish: onFinish,
        });

        workflow.onAll((event, payload) => {
            sendMessage(controller, encoder, {
                type: event,
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                query: data.prompt,
                mode: data.mode,
                webSearch: data.webSearch || false,
                showSuggestions: data.showSuggestions || false,
                [event]: payload,
            });
        });

        if (process.env.NODE_ENV === 'development') {
            logger.debug('Starting workflow', { threadId: data.threadId });
        }

        await workflow.start('router', {
            question: data.prompt,
        });

        if (process.env.NODE_ENV === 'development') {
            logger.debug('Workflow completed', { threadId: data.threadId });
        }

        console.log('[WORKFLOW SUMMARY]', workflow.getTimingSummary());

        sendMessage(controller, encoder, {
            type: 'done',
            status: 'complete',
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        });

        return { success: true };
    } catch (error) {
        if (abortController.signal.aborted) {
            // Aborts are normal user actions, not errors
            if (process.env.NODE_ENV === 'development') {
                logger.debug('Workflow aborted', { threadId: data.threadId });
            }

            sendMessage(controller, encoder, {
                type: 'done',
                status: 'aborted',
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        } else {
            // Actual errors during workflow execution are important
            logger.error('Workflow execution error', error, {
                userId,
                threadId: data.threadId,
                mode: data.mode,
            });

            sendMessage(controller, encoder, {
                type: 'done',
                status: 'error',
                error: error instanceof Error ? error.message : String(error),
                threadId: data.threadId,
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
            });
        }

        throw error;
    }
}

export async function executeDjangoStream({
    controller,
    encoder,
    data,
    abortController,
    onFinish,
}: {
    controller: StreamController;
    encoder: TextEncoder;
    data: CompletionRequestType;
    abortController: AbortController;
    onFinish?: () => Promise<void>;
}): Promise<void> {
    const djangoUrl = `${process.env.DJANGO_API_URL}/api/chat/`;

    const res = await fetch(djangoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            prompt: data.prompt,
            messages: data.messages,
            threadId: data.threadId,
            threadItemId: data.threadItemId,
            parentThreadItemId: data.parentThreadItemId,
        }),
        signal: abortController.signal,
    });

    if (!res.ok || !res.body) {
        throw new Error(`Django responded with status ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || '';

        for (const message of messages) {
            if (!message.trim()) continue;

            const eventMatch = message.match(/^event: (.+)$/m);
            const dataMatch = message.match(/^data: (.+)$/m);
            if (!eventMatch || !dataMatch) continue;

            const eventType = eventMatch[1].trim();

            // skip steps — frontend doesn't need them
            if (eventType === 'steps') continue;

            try {
                const payload = JSON.parse(dataMatch[1]);

                let transformed: Record<string, any>;
                if (eventType === 'answer') {
                    // frontend expects eventData.answer.text
                    transformed = { ...payload, answer: { text: payload.text } };
                } else if (eventType === 'done') {
                    // frontend checks data.type === 'done'
                    transformed = { ...payload, type: 'done' };
                } else {
                    transformed = payload;
                }

                const line = `event: ${eventType}\ndata: ${JSON.stringify(transformed)}\n\n`;
                controller.enqueue(encoder.encode(line));
            } catch {
                // malformed JSON from Django — skip
            }
        }
    }

    try {
        await onFinish?.();
    } catch (e) {
        // credit deduction is best-effort; don't fail the stream if Redis is unavailable
        logger.error('onFinish failed (credit deduction skipped):', e);
    }
}
