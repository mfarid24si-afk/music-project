import { AudioProvider } from '@/player/context/AudioContext';
import PlayerApp from '@/player/App';

export default function Welcome() {
    return (
        <AudioProvider>
            <PlayerApp />
        </AudioProvider>
    );
}
