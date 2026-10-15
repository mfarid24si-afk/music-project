import PlaylistIcon from './PlaylistIcon';

export default function PlaylistCoverArt({ playlist, gradient, songs }) {
    if (playlist.customCover) {
        return (
            <div className="group relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-raised shadow-2xl md:h-52 md:w-52">
                <img
                    src={playlist.customCover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 motion-reduce:transition-none"
                />
                <div
                    aria-hidden="true"
                    className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white shadow-md backdrop-blur-md"
                >
                    <PlaylistIcon value={playlist.emoji} className="h-4 w-4" />
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
            <div className="grid h-40 w-40 flex-shrink-0 grid-cols-2 grid-rows-2 overflow-hidden rounded-2xl border border-white/10 shadow-2xl md:h-52 md:w-52">
                {covers.slice(0, 4).map((c, i) => (
                    <img
                        key={i}
                        src={c}
                        alt=""
                        loading="lazy"
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
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                />
                <div
                    aria-hidden="true"
                    className="absolute top-2.5 right-2.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/70 text-white backdrop-blur-md"
                >
                    <PlaylistIcon value={playlist.emoji} className="h-4 w-4" />
                </div>
            </div>
        );
    }
    return (
        <div
            className={`flex h-40 w-40 flex-shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border bg-linear-to-br shadow-2xl md:h-52 md:w-52 ${gradient.class} ${gradient.border}`}
        >
            <PlaylistIcon
                value={playlist.emoji}
                className="h-12 w-12 text-white/80"
            />
            <span className="font-mono text-xs font-bold tracking-wider text-white/60 uppercase">
                Curated Mix
            </span>
        </div>
    );
}
