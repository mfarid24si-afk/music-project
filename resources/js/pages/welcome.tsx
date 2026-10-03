import { Head } from '@inertiajs/react';
import { AudioProvider } from '@/player/context/AudioContext';
import PlayerApp from '@/player/App';

export default function Welcome() {
    return (
        <>
            <Head title="High-Fidelity Streaming" />
            <AudioProvider>
                <PlayerApp />
            </AudioProvider>
        </>
    );
}
