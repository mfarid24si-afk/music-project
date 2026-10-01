<?php

namespace Database\Seeders;

use App\Models\Music;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        if (! User::where('email', 'admin@spotirid.com')->exists()) {
            User::create([
                'name' => 'Administrator',
                'email' => 'admin@spotirid.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        if (! User::where('email', 'test@example.com')->exists()) {
            User::create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]);
        }

        $defaultSongs = [
            [
                'slug' => 'imagine-dragons-believer',
                'title' => 'Believer',
                'artist' => 'Imagine Dragons',
                'album' => 'Evolve',
                'genre' => 'Rock',
                'description' => 'Driving percussion, explosive arena-rock dynamics, and raw lyrical urgency.',
                'cover_image' => 'believer.jpg',
                'audio_file' => 'believer.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
                'duration' => '3:37',
                'file_size' => 4123078,
                'play_count' => 124,
                'uploader_name' => 'Admin',
                'is_active' => 1,
            ],
            [
                'slug' => 'ed-sheeran-shape-of-you',
                'title' => 'Shape of You',
                'artist' => 'Ed Sheeran',
                'album' => '÷ (Divide)',
                'genre' => 'Pop',
                'description' => 'Infectious pop rhythms with marimba-infused beats and vocal hooks.',
                'cover_image' => 'shape-of-you.jpg',
                'audio_file' => 'shape.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
                'duration' => '3:54',
                'file_size' => 4500000,
                'play_count' => 98,
                'uploader_name' => 'Admin',
                'is_active' => 1,
            ],
            [
                'slug' => 'backstreet-boys-shape-of-my-heart',
                'title' => 'Shape Of My Heart',
                'artist' => 'Backstreet Boys',
                'album' => 'Black & Blue',
                'genre' => 'Pop',
                'description' => 'Classic late-90s vocal harmony pop ballad with lush acoustic textures.',
                'cover_image' => 'shape-of-my-heart.jpg',
                'audio_file' => 'of my heart.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=OT5msu-dap8',
                'duration' => '4:23',
                'file_size' => 5100000,
                'play_count' => 76,
                'uploader_name' => 'Admin',
                'is_active' => 1,
            ],
            [
                'slug' => 'alex-si-alan-miss-you',
                'title' => 'Miss You',
                'artist' => 'Alex Si Alan',
                'album' => 'Acoustic Sessions',
                'genre' => 'Pop',
                'description' => 'Intimate acoustic arrangement with emotive vocal delivery.',
                'cover_image' => 'i-miss-you.png',
                'audio_file' => 'I Miss You.mp4',
                'youtube_url' => null,
                'duration' => '3:45',
                'file_size' => 4200000,
                'play_count' => 42,
                'uploader_name' => 'Admin',
                'is_active' => 1,
            ],
            [
                'slug' => 'afgan-jodoh-pasti-bertemu',
                'title' => 'Jodoh Pasti Bertemu',
                'artist' => 'Afgan',
                'album' => 'L1ve to Love',
                'genre' => 'Pop',
                'description' => 'Soulful Indonesian pop ballad with sweeping orchestration.',
                'cover_image' => 'bertemu.jpg',
                'audio_file' => 'Jodoh Pasti Bertemu.mp3',
                'youtube_url' => null,
                'duration' => '3:51',
                'file_size' => 4600000,
                'play_count' => 55,
                'uploader_name' => 'Admin',
                'is_active' => 1,
            ],
        ];

        foreach ($defaultSongs as $song) {
            Music::firstOrCreate(
                ['slug' => $song['slug']],
                $song
            );
        }
    }
}
