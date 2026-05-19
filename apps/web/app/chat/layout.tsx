'use client';

import { ChatInput, VoiceOrb } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';

export default function ChatPageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { threadId: string };
}) {
    const isVoiceMode = useAppStore(state => state.isVoiceMode);

    return (
        <div className="relative flex h-full w-full flex-col">
            {isVoiceMode ? (
                <div className="flex flex-1 items-center justify-center overflow-hidden">
                    <VoiceOrb />
                </div>
            ) : (
                children
            )}
            <ChatInput />
        </div>
    );
}
