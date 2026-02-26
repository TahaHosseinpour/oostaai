import { ClerkProvider } from '@clerk/nextjs';
import { RootLayout } from '@repo/common/components';
import { ReactQueryProvider, RootProvider } from '@repo/common/context';
import { TooltipProvider, cn } from '@repo/ui';
import { GeistMono } from 'geist/font/mono';
import type { Viewport } from 'next';
import { Metadata } from 'next';
import localFont from 'next/font/local';

import './globals.css';

export const metadata: Metadata = {
    title: 'دستیار هوش مصنوعی',
    description: 'چت با مدل‌های پیشرفته هوش مصنوعی',
    keywords: 'هوش مصنوعی, چت, مدل زبانی',
    openGraph: {
        title: 'دستیار هوش مصنوعی',
        siteName: 'دستیار هوش مصنوعی',
        description: 'چت با مدل‌های پیشرفته هوش مصنوعی',
        type: 'website',
        locale: 'fa_IR',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

const iranYekan = localFont({
    src: [
        { path: './fonts/IRANYekanXFaNum-Thin.woff2', weight: '100' },
        { path: './fonts/IRANYekanXFaNum-UltraLight.woff2', weight: '200' },
        { path: './fonts/IRANYekanXFaNum-Light.woff2', weight: '300' },
        { path: './fonts/IRANYekanXFaNum-Regular.woff2', weight: '400' },
        { path: './fonts/IRANYekanXFaNum-Medium.woff2', weight: '500' },
        { path: './fonts/IRANYekanXFaNum-DemiBold.woff2', weight: '600' },
        { path: './fonts/IRANYekanXFaNum-Bold.woff2', weight: '700' },
        { path: './fonts/IRANYekanXFaNum-ExtraBold.woff2', weight: '800' },
        { path: './fonts/IRANYekanXFaNum-Black.woff2', weight: '900' },
    ],
    variable: '--font-iran-yekan',
    display: 'swap',
});

export default function ParentLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="fa"
            dir="rtl"
            className={cn(GeistMono.variable, iranYekan.variable)}
            suppressHydrationWarning
        >
            <head>
                <link rel="icon" href="/favicon.ico" sizes="any" />

                {/* <script
                    crossOrigin="anonymous"
                    src="//unpkg.com/react-scan/dist/auto.global.js"
                ></script> */}
            </head>
            <body>
                {/* <PostHogProvider> */}
                <ClerkProvider>
                    <RootProvider>
                        {/* <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          > */}
                        <TooltipProvider>
                            <ReactQueryProvider>
                                <RootLayout>{children}</RootLayout>
                            </ReactQueryProvider>
                        </TooltipProvider>
                        {/* </ThemeProvider> */}
                    </RootProvider>
                </ClerkProvider>
                {/* </PostHogProvider> */}
            </body>
        </html>
    );
}
