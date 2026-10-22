import React from 'react';
import { useAudio } from '../context/AudioContext';
import {
    LuCircleAlert,
    LuCircleCheck,
    LuInfo,
    LuTriangleAlert,
} from 'react-icons/lu';

const TOAST_TONE = {
    error: 'border-danger/30 bg-overlay/95 text-danger',
    warning: 'border-warning/30 bg-overlay/95 text-warning',
    info: 'border-info/30 bg-overlay/95 text-info',
    success: 'border-primary-container/40 bg-overlay/95 text-primary-container',
};

const TOAST_ICON = {
    error: LuCircleAlert,
    warning: LuTriangleAlert,
    info: LuInfo,
    success: LuCircleCheck,
};
export default function ToastContainer() {
    const { toasts } = useAudio();

    return (
        <div
            role="status"
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed top-5 right-5 z-[100] flex w-auto max-w-sm flex-col gap-2"
        >
            {toasts.map((toast) => {
                const Icon = TOAST_ICON[toast.type] || TOAST_ICON.info;
                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto inline-flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-md transition-opacity duration-300 motion-reduce:transition-none ${
                            TOAST_TONE[toast.type] || TOAST_TONE.success
                        }`}
                    >
                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span className="leading-tight">{toast.message}</span>
                    </div>
                );
            })}
        </div>
    );
}
