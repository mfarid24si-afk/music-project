import { createInertiaApp } from '@inertiajs/react';
import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

const rawAppName = import.meta.env.VITE_APP_NAME;
const appName =
    rawAppName && !rawAppName.includes('${') ? rawAppName : 'Spotirid';

declare global {
    interface Window {
        __spotiridShowBootError?: (detail?: string) => void;
        __spotiridAppMounted?: boolean;
    }
}

class BootErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: unknown) {
        const msg =
            error instanceof Error ? error.message : String(error);

        // React DOM reconciliation errors (e.g. removeChild from
        // double-root in dev HMR) are recovered by the boundary
        // itself — never show the fatal boot-error overlay for them.
        if (/removeChild|insertBefore|appendChild/.test(msg)) {
            return;
        }

        if (typeof window !== 'undefined' && window.__spotiridShowBootError) {
            window.__spotiridShowBootError(msg);
        }
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

if (!window.__spotiridAppMounted) {
    window.__spotiridAppMounted = true;
    void createInertiaApp({
        title: (title) => (title ? `${title} - ${appName}` : appName),
        layout: () => null,
        strictMode: true,
        withApp(app) {
            return (
                <BootErrorBoundary>
                    <TooltipProvider delayDuration={0}>
                        {app}
                        <Toaster />
                    </TooltipProvider>
                </BootErrorBoundary>
            );
        },
        progress: {
            color: 'var(--accent-color)',
            delay: 150,
        },
    });
}

// This will set light / dark mode on load...
initializeTheme();
