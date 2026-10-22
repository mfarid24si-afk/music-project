import React from 'react';
import { LuHouse, LuLibrary, LuSearch, LuUser } from 'react-icons/lu';

const NAV_ITEMS = [
    { id: 'home', label: 'Home', icon: LuHouse },
    { id: 'search', label: 'Search', icon: LuSearch },
    { id: 'library', label: 'Library', icon: LuLibrary },
];

/**
 * Mobile bottom navigation. It sits under the floating mini player and
 * only appears below `lg`, where the left rail is still hidden.
 */
export default function BottomNav({ currentView, setView, onOpenProfile }) {
    return (
        <nav
            aria-label="Primary"
            className="player-glass fixed inset-x-0 bottom-0 z-50 grid h-[var(--player-nav-h)] grid-cols-4 border-t border-line-strong/30 pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
            {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => setView(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`focus-ring flex min-h-11 flex-col items-center justify-center gap-0.5 transition-colors duration-200 ease-out motion-reduce:transition-none ${
                            isActive
                                ? 'text-primary-container'
                                : 'text-on-surface-variant hover:text-ink-strong'
                        }`}
                    >
                        <Icon
                            className="h-5 w-5"
                            fill={isActive ? 'currentColor' : 'none'}
                            aria-hidden="true"
                        />
                        <span className="font-mono text-[10px] leading-none font-medium">
                            {item.label}
                        </span>
                    </button>
                );
            })}

            <button
                type="button"
                onClick={onOpenProfile}
                aria-label="Profile and settings"
                className="focus-ring flex min-h-11 flex-col items-center justify-center gap-0.5 text-on-surface-variant transition-colors duration-200 ease-out hover:text-ink-strong motion-reduce:transition-none"
            >
                <LuUser className="h-5 w-5" aria-hidden="true" />
                <span className="font-mono text-[10px] leading-none font-medium">
                    Profile
                </span>
            </button>
        </nav>
    );
}
