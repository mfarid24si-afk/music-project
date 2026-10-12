import { LuPlus, LuSparkles } from 'react-icons/lu';

export default function PlaylistRecommendedSongs({ songs, onAdd }) {
    if (songs.length === 0) {
        return null;
    }

    return (
        <section className="mt-4 flex flex-col gap-4 border-t border-line-strong/30 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LuSparkles className="h-4 w-4 text-primary-container" />
                    <h3 className="font-display text-base font-bold text-white">
                        Recommended for this Playlist
                    </h3>
                </div>
                <span className="font-mono text-[11px] text-on-surface-variant">
                    Quickly build your soundtrack
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {songs.map((song) => (
                    <div
                        key={song.id}
                        className="group flex items-center justify-between rounded-xl border border-line-strong/20 bg-raised p-2.5 transition-all hover:border-primary-container/40"
                    >
                        <div className="flex min-w-0 flex-1 items-center gap-3 pr-2">
                            <img
                                src={song.img}
                                alt={song.title}
                                className="h-10 w-10 flex-shrink-0 rounded-md bg-chip object-cover"
                            />
                            <div className="min-w-0">
                                <p className="truncate font-display text-xs font-semibold text-white">
                                    {song.title}
                                </p>
                                <p className="truncate text-[11px] text-on-surface-variant">
                                    {song.artist}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => onAdd(song.id)}
                            className="flex h-8 flex-shrink-0 items-center gap-1.5 rounded-full bg-chip px-3 font-mono text-xs font-semibold text-primary-container shadow-xs transition-all hover:bg-primary-container hover:text-on-primary-container"
                            title="Add to this playlist"
                        >
                            <LuPlus className="h-3.5 w-3.5" />
                            <span>Add</span>
                        </button>
                    </div>
                ))}
            </div>
        </section>
    );
}
