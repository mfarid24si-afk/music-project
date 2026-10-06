<?php

namespace App\Http\Controllers;

use App\Models\Music;
use App\Models\Playlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class MusicController extends Controller
{
    /**
     * Display a listing of songs.
     */
    public function index(Request $request): JsonResponse
    {
        $search = trim((string) $request->query('search', ''));
        $genre = trim((string) $request->query('genre', ''));
        $limit = min((int) $request->query('limit', 50), 100);
        $offset = max((int) $request->query('offset', 0), 0);

        $cacheKey = 'music_list_'.md5("{$search}_{$genre}_{$limit}_{$offset}");

        try {
            $payload = Cache::remember($cacheKey, 60, function () use ($search, $genre, $limit, $offset) {
                $query = Music::where('is_active', 1);

                if ($search !== '') {
                    $query->where(function ($q) use ($search) {
                        $q->where('title', 'like', "%{$search}%")
                            ->orWhere('artist', 'like', "%{$search}%")
                            ->orWhere('album', 'like', "%{$search}%")
                            ->orWhere('uploader_name', 'like', "%{$search}%");
                    });
                }

                if ($genre !== '') {
                    $query->where('genre', $genre);
                }

                $total = $query->count();

                $songs = $query->orderBy('created_at', 'desc')
                    ->offset($offset)
                    ->limit($limit)
                    ->get()
                    ->map(function (Music $song) {
                        return [
                            'id' => $song->id,
                            'slug' => $song->slug,
                            'title' => $song->title,
                            'artist' => $song->artist,
                            'album' => $song->album ?? '',
                            'genre' => $song->genre ?? '',
                            'description' => $song->description ?? '',
                            'cover_image' => $song->cover_image,
                            'audio_file' => $song->audio_file,
                            'youtube_url' => $song->youtube_url ?? '',
                            'duration' => $song->duration ?? '',
                            'file_size' => $song->file_size ?? 0,
                            'play_count' => $song->play_count ?? 0,
                            'uploader_name' => $song->uploader_name ?: 'Admin',
                            'created_at' => $song->created_at?->toDateTimeString(),
                            'updated_at' => $song->updated_at?->toDateTimeString(),
                            'img' => $song->img,
                            'src' => $song->src,
                        ];
                    });

                return [
                    'success' => true,
                    'data' => $songs,
                    'total' => $total,
                    'limit' => $limit,
                    'offset' => $offset,
                ];
            });

            return response()->json($payload)->header('Cache-Control', 'public, max-age=30');
        } catch (\Throwable $e) {
            Log::warning('Music DB query failed: '.$e->getMessage());

            return response()->json([
                'success' => true,
                'data' => $this->getFallbackSongs(),
                'total' => 5,
                'limit' => $limit,
                'offset' => $offset,
                'db_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Store a newly created song in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'audio_url' => 'nullable|string|max:500',
            'cover_url' => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'duration' => 'nullable|string|max:20',
            'uploader_name' => 'nullable|string|max:100',
            'audio' => 'nullable|file|mimes:mp3,wav,ogg,flac,m4a,mp4|max:51200',
            'cover' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $title = trim($request->input('title'));
        $artist = trim($request->input('artist'));
        $audioUrl = trim((string) $request->input('audio_url', ''));
        $coverUrl = trim((string) $request->input('cover_url', ''));

        if (! $request->hasFile('audio') && $audioUrl === '') {
            return response()->json([
                'success' => false,
                'message' => 'Harap upload file audio atau masukkan URL direct audio.',
            ], 422);
        }

        $savedAudioName = $audioUrl;
        $fileSize = 0;

        if ($request->hasFile('audio')) {
            $file = $request->file('audio');
            $ext = strtolower($file->getClientOriginalExtension());
            $slug = Str::slug("{$artist} - {$title}") ?: 'track';
            $hash = Str::random(8);
            $savedAudioName = "{$slug}-{$hash}.{$ext}";
            $fileSize = $file->getSize();
            $file->move(public_path('assets/music'), $savedAudioName);
        }

        $savedCoverName = $coverUrl;

        if ($request->hasFile('cover')) {
            $coverFile = $request->file('cover');
            $coverExt = strtolower($coverFile->getClientOriginalExtension());
            $coverSlug = Str::slug("{$artist} - {$title}-cover") ?: 'cover';
            $coverHash = Str::random(8);
            $savedCoverName = "{$coverSlug}-{$coverHash}.{$coverExt}";
            $coverFile->move(public_path('assets/covers'), $savedCoverName);
        }

        $slug = Str::slug("{$artist} - {$title}").'-'.Str::random(6);

        $uploaderName = trim((string) $request->input('uploader_name', 'Admin')) ?: 'Admin';

        $music = Music::create([
            'slug' => $slug,
            'title' => $title,
            'artist' => $artist,
            'album' => $request->input('album') ?: null,
            'genre' => $request->input('genre') ?: null,
            'description' => $request->input('description') ?: null,
            'cover_image' => $savedCoverName ?: 'believer.jpg',
            'audio_file' => $savedAudioName,
            'youtube_url' => $request->input('youtube_url') ?: null,
            'duration' => $request->input('duration') ?: null,
            'file_size' => $fileSize,
            'play_count' => 0,
            'uploader_name' => $uploaderName,
            'is_active' => 1,
        ]);

        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => "Lagu \"{$title}\" berhasil ditambahkan ke library.",
            'data' => $music,
        ], 201);
    }

    /**
     * Submit a song suggestion by an authenticated member.
     * Song is created with is_active = 0 (pending admin approval).
     * Accepts ONLY URL inputs, file uploads are rejected.
     */
    public function suggestSong(Request $request): JsonResponse
    {
        if ($request->hasFile('audio') || $request->hasFile('cover')) {
            return response()->json([
                'success' => false,
                'message' => 'Pengajuan lagu hanya mendukung direct link URL audio, bukan upload file.',
            ], 422);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'audio_url' => ['required', 'string', 'max:1000', 'url:http,https'],
            'cover_url' => ['required', 'string', 'max:1000', 'url:http,https'],
            'youtube_url' => ['required', 'string', 'max:1000', 'url:http,https'],
            'album' => 'required|string|max:255',
            'genre' => 'required|string|max:100',
            'description' => 'required|string|max:1000',
        ], [
            'title.required' => 'Judul lagu wajib diisi.',
            'artist.required' => 'Nama artist wajib diisi.',
            'audio_url.required' => 'Direct Audio URL wajib diisi.',
            'audio_url.url' => 'Audio URL harus berupa tautan web yang valid (dimulai dengan http:// atau https://).',
            'cover_url.required' => 'Direct Cover Image URL wajib diisi.',
            'cover_url.url' => 'Cover URL harus berupa tautan web yang valid (dimulai dengan http:// atau https://).',
            'youtube_url.required' => 'Link video YouTube wajib diisi.',
            'youtube_url.url' => 'Link video YouTube harus berupa tautan web yang valid.',
            'album.required' => 'Nama album wajib diisi.',
            'genre.required' => 'Genre lagu wajib diisi.',
            'description.required' => 'Deskripsi / catatan rilis wajib diisi.',
        ]);

        $title = strip_tags(trim((string) $request->input('title')));
        $artist = strip_tags(trim((string) $request->input('artist')));
        $audioUrl = trim((string) $request->input('audio_url'));
        $coverUrl = $request->input('cover_url') ? trim((string) $request->input('cover_url')) : null;
        $youtubeUrl = $request->input('youtube_url') ? trim((string) $request->input('youtube_url')) : null;

        if (! $coverUrl && $youtubeUrl) {
            if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/', $youtubeUrl, $matches)) {
                $coverUrl = 'https://img.youtube.com/vi/'.$matches[1].'/hqdefault.jpg';
            }
        }

        $slugBase = Str::slug("{$artist} - {$title}") ?: 'track';
        $slug = $slugBase.'-'.Str::random(6);

        $user = Auth::user();
        $uploaderName = $user ? $user->name : 'Member';

        $music = Music::create([
            'slug' => $slug,
            'title' => $title,
            'artist' => $artist,
            'album' => $request->input('album') ? strip_tags(trim((string) $request->input('album'))) : null,
            'genre' => $request->input('genre') ? strip_tags(trim((string) $request->input('genre'))) : null,
            'description' => $request->input('description') ? strip_tags(trim((string) $request->input('description'))) : null,
            'cover_image' => $coverUrl ?: 'believer.jpg',
            'audio_file' => $audioUrl,
            'youtube_url' => $youtubeUrl,
            'duration' => null,
            'file_size' => 0,
            'play_count' => 0,
            'uploader_name' => $uploaderName,
            'is_active' => 0,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lagu \"{$title}\" berhasil diajukan! Menunggu peninjauan dan persetujuan Administrator sebelum tampil di Beranda.",
            'data' => $music,
        ], 201);
    }

    /**
     * Update an existing song.
     */
    public function update(Request $request, int|string $id): JsonResponse
    {
        $song = Music::find($id);
        if (! $song) {
            return response()->json(['success' => false, 'message' => 'Lagu tidak ditemukan.'], 404);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'audio_url' => 'nullable|string|max:500',
            'cover_url' => 'nullable|string|max:500',
            'youtube_url' => 'nullable|string|max:500',
            'duration' => 'nullable|string|max:20',
            'cover' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $title = trim($request->input('title'));
        $artist = trim($request->input('artist'));
        $audioUrl = trim((string) $request->input('audio_url', ''));
        $coverUrl = trim((string) $request->input('cover_url', ''));

        if ($audioUrl !== '') {
            $song->audio_file = $audioUrl;
        }

        if ($request->hasFile('cover')) {
            $coverFile = $request->file('cover');
            $coverExt = strtolower($coverFile->getClientOriginalExtension());
            $coverSlug = Str::slug("{$artist} - {$title}-cover") ?: 'cover';
            $coverHash = Str::random(8);
            $newCoverName = "{$coverSlug}-{$coverHash}.{$coverExt}";
            $coverFile->move(public_path('assets/covers'), $newCoverName);

            // Remove old local cover if exists
            if ($song->cover_image && ! str_starts_with($song->cover_image, 'http') && file_exists(public_path('assets/covers/'.$song->cover_image))) {
                @unlink(public_path('assets/covers/'.$song->cover_image));
            }
            $song->cover_image = $newCoverName;
        } elseif ($coverUrl !== '') {
            $song->cover_image = $coverUrl;
        }

        $song->title = $title;
        $song->artist = $artist;
        $song->album = $request->input('album') ?: null;
        $song->genre = $request->input('genre') ?: null;
        $song->description = $request->input('description') ?: null;
        $song->youtube_url = $request->input('youtube_url') ?: null;
        $song->duration = $request->input('duration') ?: $song->duration;
        $song->save();

        return response()->json([
            'success' => true,
            'message' => "Lagu \"{$title}\" berhasil diperbarui.",
            'data' => $song,
        ]);
    }

    /**
     * Remove a song from database and storage.
     */
    public function destroy(int|string $id): JsonResponse
    {
        $song = Music::find($id);
        if (! $song) {
            return response()->json(['success' => false, 'message' => 'Lagu tidak ditemukan.'], 404);
        }

        $title = $song->title;

        // Delete audio file if local
        if ($song->audio_file && ! str_starts_with($song->audio_file, 'http')) {
            $audioPath = public_path('assets/music/'.$song->audio_file);
            if (file_exists($audioPath)) {
                @unlink($audioPath);
            }
        }

        // Delete cover file if local
        if ($song->cover_image && ! str_starts_with($song->cover_image, 'http')) {
            $coverPath = public_path('assets/covers/'.$song->cover_image);
            if (file_exists($coverPath)) {
                @unlink($coverPath);
            }
        }

        $song->delete();
        Cache::flush();

        return response()->json([
            'success' => true,
            'message' => "Lagu \"{$title}\" berhasil dihapus beserta file terkait.",
        ]);
    }

    /**
     * Increment play count for a song.
     */
    public function playStat(Request $request): JsonResponse
    {
        $id = (int) ($request->input('id') ?: ($request->json('id') ?: 0));
        if ($id <= 0) {
            $raw = json_decode($request->getContent(), true);
            $id = (int) ($raw['id'] ?? 0);
        }
        if ($id <= 0) {
            return response()->json(['success' => false, 'message' => 'ID lagu tidak valid.'], 400);
        }

        $song = Music::find($id);
        if (! $song) {
            return response()->json(['success' => false, 'message' => 'Lagu tidak ditemukan.'], 404);
        }

        $song->increment('play_count');

        return response()->json([
            'success' => true,
            'id' => $song->id,
            'play_count' => $song->play_count,
        ]);
    }

    /**
     * Get community / public playlists.
     */
    public function getPlaylists(): JsonResponse
    {
        try {
            $playlists = Cache::remember('community_playlists', 30, function () {
                return Playlist::with(['songs' => function ($q) {
                    $q->where('is_active', 1);
                }])
                    ->orderBy('created_at', 'desc')
                    ->get()
                    ->map(function (Playlist $pl) {
                        $status = $pl->status ?: ($pl->is_public ? 'approved' : 'pending');

                        return [
                            'id' => (string) $pl->id,
                            'slug' => $pl->slug,
                            'name' => $pl->name,
                            'description' => $pl->description ?? '',
                            'emoji' => $pl->emoji ?? '🎧',
                            'gradient' => $pl->gradient ?? 'default',
                            'customCover' => $pl->custom_cover ?? null,
                            'creator_name' => $pl->creator_name ?: 'Admin',
                            'status' => $status,
                            'is_public' => (bool) $pl->is_public,
                            'isLocked' => $status !== 'approved',
                            'songs' => $pl->songs->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                            'created_at' => $pl->created_at?->toDateTimeString(),
                        ];
                    });
            });

            return response()->json(['success' => true, 'data' => $playlists]);
        } catch (\Throwable $e) {
            Log::warning('Playlists DB query failed: '.$e->getMessage());

            return response()->json([
                'success' => true,
                'data' => [],
                'db_error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Save a playlist to community database.
     */
    public function storePlaylist(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'emoji' => 'nullable|string|max:20',
            'gradient' => 'nullable|string|max:50',
            'custom_cover' => 'nullable|string',
            'creator_name' => 'nullable|string|max:100',
            'songs' => 'nullable|array',
        ]);

        try {
            $name = trim($request->input('name'));
            $slug = Str::slug($name).'-'.Str::random(6);

            $playlist = Playlist::create([
                'slug' => $slug,
                'name' => $name,
                'description' => $request->input('description'),
                'emoji' => $request->input('emoji', '🎧'),
                'gradient' => $request->input('gradient', 'default'),
                'custom_cover' => $request->input('custom_cover'),
                'creator_name' => trim($request->input('creator_name') ?: 'User'),
                'status' => 'pending',
                'is_public' => false,
            ]);

            $songIds = $request->input('songs', []);
            if (! empty($songIds)) {
                $syncData = [];
                foreach ($songIds as $pos => $sId) {
                    $syncData[$sId] = ['order_position' => $pos];
                }
                $playlist->songs()->sync($syncData);
            }

            Cache::forget('community_playlists');

            $loaded = $playlist->load('songs');

            return response()->json([
                'success' => true,
                'message' => "Pengajuan playlist \"{$name}\" berhasil dikirim. Menunggu persetujuan Administrator.",
                'data' => [
                    'id' => (string) $loaded->id,
                    'slug' => $loaded->slug,
                    'name' => $loaded->name,
                    'description' => $loaded->description ?? '',
                    'emoji' => $loaded->emoji ?? '🎧',
                    'gradient' => $loaded->gradient ?? 'default',
                    'customCover' => $loaded->custom_cover ?? null,
                    'creator_name' => $loaded->creator_name,
                    'status' => 'pending',
                    'is_public' => false,
                    'isLocked' => true,
                    'songs' => $loaded->songs->pluck('id')->map(fn ($id) => (string) $id)->values()->all(),
                    'created_at' => $loaded->created_at?->toDateTimeString(),
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menyimpan ke database server: '.$e->getMessage(),
            ], 200);
        }
    }

    /**
     * Delete a community playlist.
     */
    public function destroyPlaylist(int|string $id): JsonResponse
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Administrator yang dapat menghapus playlist.',
            ], 403);
        }

        if (isset($user->role) && strtolower((string) $user->role) === 'user') {
            return response()->json([
                'success' => false,
                'message' => 'Hanya Administrator yang dapat menghapus playlist.',
            ], 403);
        }

        $playlist = Playlist::find($id);
        if (! $playlist) {
            return response()->json(['success' => false, 'message' => 'Playlist tidak ditemukan.'], 404);
        }

        $playlist->delete();
        Cache::forget('community_playlists');

        return response()->json(['success' => true, 'message' => 'Playlist berhasil dihapus.']);
    }

    /**
     * Update an existing community playlist.
     */
    public function updatePlaylist(Request $request, int|string $id): JsonResponse
    {
        $playlist = Playlist::find($id);
        if (! $playlist) {
            return response()->json(['success' => false, 'message' => 'Playlist tidak ditemukan.'], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'emoji' => 'nullable|string|max:20',
            'gradient' => 'nullable|string|max:50',
            'custom_cover' => 'nullable|string',
            'songs' => 'nullable|array',
        ]);

        if ($request->has('name')) {
            $playlist->name = trim($request->input('name'));
        }
        if ($request->has('description')) {
            $playlist->description = $request->input('description');
        }
        if ($request->has('emoji')) {
            $playlist->emoji = $request->input('emoji');
        }
        if ($request->has('gradient')) {
            $playlist->gradient = $request->input('gradient');
        }
        if ($request->has('custom_cover')) {
            $playlist->custom_cover = $request->input('custom_cover');
        }

        $playlist->save();

        if ($request->has('songs')) {
            $songIds = (array) $request->input('songs', []);
            $syncData = [];
            foreach ($songIds as $pos => $sId) {
                $syncData[$sId] = ['order_position' => $pos];
            }
            $playlist->songs()->sync($syncData);
        }

        Cache::forget('community_playlists');

        return response()->json([
            'success' => true,
            'message' => 'Playlist berhasil diperbarui.',
            'data' => $playlist->load('songs'),
        ]);
    }

    /**
     * Add or remove a song from playlist.
     */
    public function togglePlaylistSong(Request $request, int|string $id): JsonResponse
    {
        $playlist = Playlist::find($id);
        if (! $playlist) {
            return response()->json(['success' => false, 'message' => 'Playlist tidak ditemukan.'], 404);
        }

        $songId = (int) $request->input('song_id');
        if ($songId <= 0) {
            return response()->json(['success' => false, 'message' => 'ID lagu tidak valid.'], 400);
        }

        $exists = $playlist->songs()->where('music_id', $songId)->exists();
        if ($exists) {
            $playlist->songs()->detach($songId);
            $action = 'removed';
        } else {
            $count = $playlist->songs()->count();
            $playlist->songs()->attach($songId, ['order_position' => $count]);
            $action = 'added';
        }

        Cache::forget('community_playlists');

        return response()->json([
            'success' => true,
            'action' => $action,
            'message' => $action === 'added' ? 'Lagu ditambahkan ke playlist.' : 'Lagu dihapus dari playlist.',
            'songs' => $playlist->songs()->pluck('music_id')->map(fn ($id) => (string) $id)->values()->all(),
        ]);
    }

    /**
     * Fallback songs when database is initializing or offline.
     *
     * @return list<array<string, mixed>>
     */
    private function getFallbackSongs(): array
    {
        return [
            [
                'id' => '1',
                'slug' => 'imagine-dragons-believer',
                'title' => 'Believer',
                'artist' => 'Imagine Dragons',
                'album' => 'Evolve',
                'genre' => 'Rock',
                'description' => 'Driving percussion, explosive arena-rock dynamics.',
                'cover_image' => 'assets/covers/believer.jpg',
                'audio_file' => 'assets/music/believer.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=7wtfhZwyrcc',
                'duration' => '3:37',
                'file_size' => 4123078,
                'play_count' => 124,
                'uploader_name' => 'Admin',
                'created_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
                'img' => url('assets/covers/believer.jpg'),
                'src' => url('assets/music/believer.mp4'),
            ],
            [
                'id' => '4',
                'slug' => 'ed-sheeran-shape-of-you',
                'title' => 'Shape of You',
                'artist' => 'Ed Sheeran',
                'album' => '÷ (Divide)',
                'genre' => 'Pop',
                'description' => 'Infectious pop rhythms with marimba-infused beats.',
                'cover_image' => 'assets/covers/shape-of-you.jpg',
                'audio_file' => 'assets/music/shape.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=JGwWNGJdvx8',
                'duration' => '3:54',
                'file_size' => 4500000,
                'play_count' => 98,
                'uploader_name' => 'Admin',
                'created_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
                'img' => url('assets/covers/shape-of-you.jpg'),
                'src' => url('assets/music/shape.mp4'),
            ],
            [
                'id' => '5',
                'slug' => 'backstreet-boys-shape-of-my-heart',
                'title' => 'Shape Of My Heart',
                'artist' => 'Backstreet Boys',
                'album' => 'Black & Blue',
                'genre' => 'Pop',
                'description' => 'Classic late-90s vocal harmony pop ballad.',
                'cover_image' => 'assets/covers/shape-of-my-heart.jpg',
                'audio_file' => 'assets/music/of my heart.mp4',
                'youtube_url' => 'https://www.youtube.com/watch?v=OT5msu-dap8',
                'duration' => '4:23',
                'file_size' => 5100000,
                'play_count' => 76,
                'uploader_name' => 'Admin',
                'created_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
                'img' => url('assets/covers/shape-of-my-heart.jpg'),
                'src' => url('assets/music/of my heart.mp4'),
            ],
            [
                'id' => '6',
                'slug' => 'alex-si-alan-miss-you',
                'title' => 'Miss You',
                'artist' => 'Alex Si Alan',
                'album' => 'Acoustic Sessions',
                'genre' => 'Pop',
                'description' => 'Intimate acoustic arrangement with emotive vocal delivery.',
                'cover_image' => 'assets/covers/i-miss-you.png',
                'audio_file' => 'assets/music/I Miss You.mp4',
                'youtube_url' => '',
                'duration' => '3:45',
                'file_size' => 4200000,
                'play_count' => 42,
                'uploader_name' => 'Admin',
                'created_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
                'img' => url('assets/covers/i-miss-you.png'),
                'src' => url('assets/music/I Miss You.mp4'),
            ],
            [
                'id' => '7',
                'slug' => 'afgan-jodoh-pasti-bertemu',
                'title' => 'Jodoh Pasti Bertemu',
                'artist' => 'Afgan',
                'album' => 'L1ve to Love',
                'genre' => 'Pop',
                'description' => 'Soulful Indonesian pop ballad with sweeping orchestration.',
                'cover_image' => 'assets/covers/bertemu.jpg',
                'audio_file' => 'assets/music/Jodoh Pasti Bertemu.mp3',
                'youtube_url' => '',
                'duration' => '3:51',
                'file_size' => 4600000,
                'play_count' => 55,
                'uploader_name' => 'Admin',
                'created_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
                'img' => url('assets/covers/bertemu.jpg'),
                'src' => url('assets/music/Jodoh Pasti Bertemu.mp3'),
            ],
        ];
    }
}
