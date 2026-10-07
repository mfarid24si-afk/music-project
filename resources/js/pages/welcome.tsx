import { Head } from '@inertiajs/react';
import { AudioProvider } from '@/player/context/AudioContext';
import PlayerApp from '@/player/App';

export default function Welcome() {
    return (
        <AudioProvider>
            <Head title="Web Music Player" />
            <PlayerApp />
        </AudioProvider>
    );
}
