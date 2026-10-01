import React from 'react';
import { useAudio } from '../context/AudioContext';

export default function ToastContainer() {
  const { toasts } = useAudio();

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-xl backdrop-blur-md border text-sm font-medium transition-all duration-300 pointer-events-auto flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-[#1e1e1e]/95 border-red-500/30 text-red-400'
              : toast.type === 'info'
              ? 'bg-[#1e1e1e]/95 border-blue-500/30 text-blue-300'
              : 'bg-[#1e1e1e]/95 border-[#ccf228]/40 text-[#ccf228]'
          }`}
        >
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
