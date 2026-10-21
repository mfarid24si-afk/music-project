import { createInertiaApp } from '@inertiajs/react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { initializeTheme } from '@/hooks/use-appearance';

const rawAppName = import.meta.env.VITE_APP_NAME;
const appName =
    rawAppName && !rawAppName.includes('${') ? rawAppName : 'Spotirid';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        if (name === 'welcome') {
            return null;
        }
        return null;
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster />
            </TooltipProvider>
        );
    },
    progress: {
        color: 'var(--accent-color)',
        delay: 150,
    },
});

// This will set light / dark mode on load...
initializeTheme();
