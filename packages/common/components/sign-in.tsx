'use client';

import { Button } from '@repo/ui';
import { IconX } from '@tabler/icons-react';

type CustomSignInProps = {
    redirectUrl?: string;
    onClose?: () => void;
};

// Auth has been removed — the app runs without login. This component is kept
// only so existing references resolve; it just shows an informational panel.
export const CustomSignIn = ({ onClose }: CustomSignInProps) => {
    return (
        <>
            <Button
                onClick={() => onClose?.()}
                variant="ghost"
                size="icon-sm"
                className="absolute right-2 top-2"
            >
                <IconX className="h-4 w-4" />
            </Button>
            <div className="flex w-[320px] flex-col items-center gap-6">
                <h2 className="text-muted-foreground/70 text-center text-[20px] font-semibold leading-tight">
                    این برنامه بدون نیاز به ورود کار می‌کند
                </h2>
                <Button variant="bordered" size="sm" className="w-full" onClick={onClose}>
                    ادامه
                </Button>
            </div>
        </>
    );
};
