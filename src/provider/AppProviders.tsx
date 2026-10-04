'use client';

import * as React from 'react';
import { SessionProvider } from 'next-auth/react';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import { ClientThemeWrapper } from './ClientThemeWrapper';
import { UIProvider } from './UIProvider';
import { ThemeProvider } from '@/components/theme-provider';

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <SessionProvider>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                    <UIProvider>
                        <ClientThemeWrapper>{children}</ClientThemeWrapper>
                    </UIProvider>
                </ThemeProvider>
            </SessionProvider>
        </NextAppDirEmotionCacheProvider>
    );
}