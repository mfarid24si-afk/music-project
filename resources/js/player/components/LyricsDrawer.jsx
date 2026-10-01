import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import { fetchLyricsFromAPI } from '../services/api';
import { X, Mic, Music2 } from 'lucide-react';

export default function LyricsDrawer({ isOpen, onClose }) {
  const { currentSong, currentTime, seekTo } = useAudio();
  const [lyricsData, setLyricsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const activeLineRef = useRef(null);

  // Fetch lyrics when song changes or drawer opens
  useEffect(() => {
    if (!isOpen || !currentSong) return;

    let isMounted = true;
    async function loadLyrics() {
      setLoading(true);
      const data = await fetchLyricsFromAPI(currentSong.artist, currentSong.title);
      if (isMounted) {
        setLyricsData(data);
        setLoading(false);
      }
    }
    loadLyrics();

    return () => { isMounted = false; };
  }, [isOpen, currentSong]);

  // Parse synced lyrics if available
  const parsedLines = React.useMemo(() => {
    if (!lyricsData || !lyricsData.syncedLyrics) return null;
    const raw = lyricsData.syncedLyrics.split('\n').filter(l => l.trim());
    const parsed = [];
    for (const line of raw) {
      const match = line.match(/^\[(\d+):(\d+)(?:[.,](\d+))?\](.*)/);
      if (match) {
        const m = parseInt(match[1], 10);
        const s = parseInt(match[2], 10);
        let ms = match[3] ? parseInt(match[3], 10) : 0;
        if (match[3] && match[3].length === 2) ms *= 10;
        const time = m * 60 + s + (ms / 1000);
        parsed.push({ time, text: match[4].trim() });
      }
    }
    return parsed.length > 0 ? parsed : null;
  }, [lyricsData]);

  // Active line calculation
  const activeIndex = React.useMemo(() => {
    if (!parsedLines) return -1;
    let idx = -1;
    for (let i = 0; i < parsedLines.length; i++) {
      if (currentTime >= parsedLines[i].time) {
        idx = i;
      }
    }
    return idx;
  }, [parsedLines, currentTime]);

  // Auto-scroll active line into center
  useEffect(() => {
    if (activeLineRef.current && scrollRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-screen w-full max-w-md bg-[#1b1b1f] border-l border-[#454934]/30 z-50 flex flex-col shadow-2xl animate-fadeSlideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#343538]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-container/10 border border-primary-container/30 flex items-center justify-center text-primary-container">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Lyrics</h3>
              <p className="text-xs text-on-surface-variant truncate max-w-[240px]">
                {currentSong?.title} — {currentSong?.artist}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#292a2d] text-on-surface-variant hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-3">
              <div className="w-7 h-7 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono">Searching lyrics database...</p>
            </div>
          ) : parsedLines ? (
            <div className="flex flex-col gap-3 py-10">
              {parsedLines.map((line, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <p
                    key={idx}
                    ref={isActive ? activeLineRef : null}
                    onClick={() => seekTo(line.time)}
                    className={`text-lg md:text-xl font-bold font-display cursor-pointer transition-all duration-200 py-1.5 px-3 rounded-lg ${
                      isActive
                        ? 'text-primary-container bg-primary-container/10 scale-[1.02] shadow-[0_0_12px_var(--accent-glow)]'
                        : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    {line.text || '♪ ♪ ♪'}
                  </p>
                );
              })}
            </div>
          ) : lyricsData && lyricsData.plainLyrics ? (
            <div className="whitespace-pre-line text-sm md:text-base leading-relaxed text-white/80 font-medium">
              {lyricsData.plainLyrics}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-2 text-center">
              <Music2 className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold text-white/70">No synchronized lyrics available</p>
              <p className="text-xs text-on-surface-variant max-w-xs">
                Lyrics could not be found for this track. You can still enjoy the lossless audio playback.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
