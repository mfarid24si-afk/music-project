import React from 'react';
import { useAudio } from '../context/AudioContext';

export default function ToastContainer() {
    const { toasts } = useAudio();

    return (
        <div className="pointer-events-none fixed top-5 right-5 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium shadow-xl backdrop-blur-md transition-all duration-300 ${
                        toast.type === 'error'
                            ? 'border-red-500/30 bg-overlay/95 text-red-400'
                            : toast.type === 'info'
                              ? 'border-blue-500/30 bg-overlay/95 text-blue-300'
                              : 'border-primary-container/40 bg-overlay/95 text-primary-container'
                    }`}
                >
                    <span>{toast.message}</span>
                </div>
            ))}
        </div>
    );
}
