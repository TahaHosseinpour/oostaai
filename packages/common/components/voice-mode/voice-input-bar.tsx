'use client';

import { Button, cn, Flex } from '@repo/ui';
import { IconMessage } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { AttachmentButton, ChatModeButton, WebSearchButton } from '../chat-input/chat-actions';
import { useAppStore } from '../../store';

/**
 * Minimal pill-button input bar shown in voice mode (replaces the text editor).
 * Contains: back-to-chat button + reused web search / attach / model controls.
 */
export function VoiceInputBar() {
    const setIsVoiceMode = useAppStore(state => state.setIsVoiceMode);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full px-3"
        >
            <Flex
                direction="col"
                className={cn(
                    'bg-background border-hard/50 shadow-subtle-sm relative z-10 w-full rounded-xl border'
                )}
            >
                <Flex
                    className="w-full gap-2 px-3 py-2.5"
                    items="center"
                    justify="between"
                >
                    <Flex gap="xs" items="center" className="shrink-0">
                        <Button
                            size="xs"
                            variant="secondary"
                            tooltip="بازگشت به چت متنی"
                            onClick={() => setIsVoiceMode(false)}
                            className="gap-2"
                            rounded="full"
                        >
                            <IconMessage size={14} strokeWidth={2} />
                            <span className="text-xs">چت متنی</span>
                        </Button>
                        <ChatModeButton />
                        <WebSearchButton />
                        <AttachmentButton />
                    </Flex>
                </Flex>
            </Flex>
        </motion.div>
    );
}
