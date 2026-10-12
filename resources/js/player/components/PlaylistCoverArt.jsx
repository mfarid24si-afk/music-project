export default function PlaylistCoverArt({ playlist, gradient, songs }) {
    if (playlist.customCover) {
        return (
            <div className="group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-raised shadow-2xl md:h-52 md:w-52">
                <img
                    src={playlist.customCover}
                    alt={playlist.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-lg shadow-md backdrop-blur-md">
                    {playlist.emoji || '🎧'}
                </div>
            </div>
        );
    }

    const covers = songs
        .slice(0, 4)
        .map((s) => s.img)
        .filter(Boolean);
    if (covers.length >= 4) {
        return (
            <div className="group grid h-40 w-40 flex-shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:h-52 md:w-52">
                {covers.slice(0, 4).map((c, i) => (
                    <img
                        key={i}
                        src={c}
                        alt="Cover"
                        className="h-full w-full object-cover"
                    />
                ))}
            </div>
        );
    }
    if (covers.length > 0) {
        return (
            <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-raised shadow-2xl md:h-52 md:w-52">
                <img
                    src={covers[0]}
                    alt={playlist.name}
                    className="h-full w-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-lg backdrop-blur-md">
                    {playlist.emoji || '🎧'}
                </div>
            </div>
        );
    }
    return (
        <div
            className={`h-40 w-40 rounded-2xl bg-gradient-to-br md:h-52 md:w-52 ${gradient.class} border ${gradient.border} flex flex-shrink-0 flex-col items-center justify-center gap-2 shadow-2xl`}
        >
            <span className="text-5xl">{playlist.emoji || '🎧'}</span>
            <span className="font-mono text-[10px] font-bold tracking-wider text-white/60 uppercase">
                Curated Mix
            </span>
        </div>
    );
}
