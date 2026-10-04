'use client';

import * as React from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from 'next-themes';

export function ClientThemeWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isLight = mounted && resolvedTheme === 'light';

    const muiTheme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: isLight ? 'light' : 'dark',
                    background: {
                        default: isLight ? '#f8fafc' : '#0f172a',
                        paper: isLight ? '#ffffff' : '#1e293b',
                    },
                    text: {
                        primary: isLight ? '#0f172a' : '#f8fafc',
                        secondary: isLight ? '#475569' : '#94a3b8',
                    },
                    divider: isLight ? '#e2e8f0' : '#334155',
                    primary: {
                        main: '#3b82f6',
                    },
                    secondary: {
                        main: '#8b5cf6',
                    },
                    action: {
                        hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                        selected: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.16)',
                    }
                },
            }),
        [isLight],
    );

    return <MuiThemeProvider theme={muiTheme}><CssBaseline />{children}</MuiThemeProvider>;
}