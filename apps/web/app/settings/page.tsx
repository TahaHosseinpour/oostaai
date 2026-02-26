'use client';
import { SettingsContent } from '@repo/common/components';
import { Button } from '@repo/ui';
import { IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const router = useRouter();

    return (
        <div className="flex h-full flex-col">
            <div className="border-border flex flex-row items-center gap-3 border-b px-4 py-3">
                <Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
                    <IconArrowRight size={16} strokeWidth={2} />
                </Button>
                <h3 className="text-lg font-bold">تنظیمات</h3>
            </div>
            <div className="no-scrollbar flex-1 overflow-y-auto">
                <SettingsContent />
            </div>
        </div>
    );
}
