import { getPlaylistIconDefinition } from '../playlistHelpers';

export default function PlaylistIcon({ value, className = 'h-4 w-4' }) {
    const { Icon } = getPlaylistIconDefinition(value);

    return <Icon className={className} aria-hidden="true" />;
}
