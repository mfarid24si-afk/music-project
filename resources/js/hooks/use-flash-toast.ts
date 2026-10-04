import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { showFlashToast } from '@/lib/toast-animation';
import type { FlashToast } from '@/types/ui';

export function useFlashToast(): void {
    useEffect(() => {
        return router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            showFlashToast(data.type, data.message);
        });
    }, []);
}
