<?php

namespace App\Http\Controllers;

use App\Models\Music;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminSongController extends Controller
{
    /**
     * Approve a pending song submission.
     */
    public function approveSong(int|string $id): RedirectResponse
    {
        try {
            $song = Music::findOrFail($id);
            $song->update(['is_active' => 1]);
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Lagu \"{$song->title}\" oleh {$song->artist} berhasil disetujui dan kini aktif di Beranda!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyetujui lagu: '.$e->getMessage());
        }
    }

    /**
     * Reject and delete a pending song submission.
     */
    public function rejectSong(int|string $id): RedirectResponse
    {
        try {
            $song = Music::findOrFail($id);
            $title = $song->title;
            $song->delete();
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('info', "Pengajuan lagu \"{$title}\" telah ditolak dan dihapus.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menolak lagu: '.$e->getMessage());
        }
    }

    /**
     * Update metadata and approve a pending song submission.
     */
    public function updateAndApproveSong(Request $request, int|string $id): RedirectResponse
    {
        $song = Music::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'audio_url' => ['required', 'string', 'max:1000', 'url:http,https'],
            'cover_url' => ['nullable', 'string', 'max:1000', 'url:http,https'],
            'youtube_url' => ['nullable', 'string', 'max:1000', 'url:http,https'],
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:1000',
        ], [
            'title.required' => 'Judul lagu wajib diisi.',
            'artist.required' => 'Nama artist wajib diisi.',
            'audio_url.required' => 'Direct audio URL wajib diisi.',
            'audio_url.url' => 'Audio URL harus berupa tautan yang valid (http:// atau https://).',
        ]);

        try {
            $title = strip_tags(trim((string) $request->input('title')));
            $artist = strip_tags(trim((string) $request->input('artist')));
            $audioUrl = trim((string) $request->input('audio_url'));
            $coverUrl = $request->input('cover_url') ? trim((string) $request->input('cover_url')) : $song->cover_image;
            $youtubeUrl = $request->input('youtube_url') ? trim((string) $request->input('youtube_url')) : null;

            if ((! $coverUrl || $coverUrl === 'believer.jpg') && $youtubeUrl) {
                if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/', $youtubeUrl, $matches)) {
                    $coverUrl = 'https://img.youtube.com/vi/'.$matches[1].'/hqdefault.jpg';
                }
            }

            $song->update([
                'title' => $title,
                'artist' => $artist,
                'audio_file' => $audioUrl,
                'cover_image' => $coverUrl ?: 'believer.jpg',
                'youtube_url' => $youtubeUrl,
                'album' => $request->input('album') ? strip_tags(trim((string) $request->input('album'))) : null,
                'genre' => $request->input('genre') ? strip_tags(trim((string) $request->input('genre'))) : null,
                'description' => $request->input('description') ? strip_tags(trim((string) $request->input('description'))) : null,
                'is_active' => 1,
            ]);

            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Lagu \"{$title}\" berhasil diedit dan disetujui untuk terbit di Beranda!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui & menyetujui lagu: '.$e->getMessage());
        }
    }

    /**
     * Upload and store a new song into library.
     */
    public function storeSong(Request $request): RedirectResponse
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
        $youtubeUrl = trim((string) $request->input('youtube_url', ''));

        if (! $request->hasFile('audio') && $audioUrl === '' && $youtubeUrl === '') {
            return back()->with('error', 'Harap upload file audio, direct URL audio, atau masukkan link video YouTube.')->withInput();
        }

        if (! $request->hasFile('audio') && $audioUrl === '' && $youtubeUrl !== '') {
            $audioUrl = $youtubeUrl;
            if ($coverUrl === '') {
                if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/', $youtubeUrl, $matches)) {
                    $coverUrl = 'https://img.youtube.com/vi/'.$matches[1].'/hqdefault.jpg';
                }
            }
        }
        try {
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
            $uploaderName = trim((string) $request->input('uploader_name', Auth::user()?->name ?: 'Admin')) ?: 'Admin';

            Music::create([
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

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Lagu \"{$title}\" oleh {$artist} berhasil ditambahkan ke library!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menambahkan lagu: '.$e->getMessage())->withInput();
        }
    }

    /**
     * Store multiple songs at once from direct URLs.
     */
    public function storeBulkSongs(Request $request): RedirectResponse
    {
        $rawSongs = $request->input('songs', []);
        if (! is_array($rawSongs) || empty($rawSongs)) {
            return back()->with('error', 'Tidak ada data lagu yang dikirimkan.')->withInput();
        }

        $validSongs = [];
        foreach ($rawSongs as $item) {
            if (! is_array($item)) {
                continue;
            }

            $audioUrl = trim((string) ($item['audio_url'] ?? ''));
            $title = trim((string) ($item['title'] ?? ''));
            $artist = trim((string) ($item['artist'] ?? ''));

            // Skip completely empty spaces
            if ($audioUrl === '' && $title === '' && $artist === '') {
                continue;
            }

            $validSongs[] = [
                'audio_url' => $audioUrl,
                'title' => $title,
                'artist' => $artist,
                'album' => trim((string) ($item['album'] ?? '')) ?: null,
                'genre' => trim((string) ($item['genre'] ?? '')) ?: null,
                'description' => trim((string) ($item['description'] ?? '')) ?: null,
                'cover_url' => trim((string) ($item['cover_url'] ?? '')) ?: null,
                'youtube_url' => trim((string) ($item['youtube_url'] ?? '')) ?: null,
            ];
        }

        if (empty($validSongs)) {
            return back()->with('error', 'Harap isi minimal satu lagu dengan Judul, Artist, dan Audio URL.')->withInput();
        }

        // Validate each non-empty entry
        // Validate each non-empty entry with strict protocol checks and batch limits
        $validator = validator(['songs' => $validSongs], [
            'songs' => 'required|array|min:1|max:50',
            'songs.*.title' => 'required|string|max:255',
            'songs.*.artist' => 'required|string|max:255',
            'songs.*.audio_url' => ['required', 'string', 'max:1000', 'url:http,https'],
            'songs.*.cover_url' => ['nullable', 'string', 'max:1000', 'url:http,https'],
            'songs.*.album' => 'nullable|string|max:255',
            'songs.*.genre' => 'nullable|string|max:100',
            'songs.*.description' => 'nullable|string|max:1000',
            'songs.*.youtube_url' => ['nullable', 'string', 'max:1000', 'url:http,https'],
        ], [
            'songs.max' => 'Maksimal 50 lagu per satu kali simpan demi kestabilan server.',
            'songs.*.title.required' => 'Judul lagu wajib diisi untuk setiap baris.',
            'songs.*.artist.required' => 'Nama artist wajib diisi untuk setiap baris.',
            'songs.*.audio_url.required' => 'Direct Audio URL wajib diisi untuk setiap baris.',
            'songs.*.audio_url.url' => 'Audio URL harus berupa tautan web yang valid (dimulai dengan http:// atau https://).',
            'songs.*.cover_url.url' => 'Cover URL harus berupa tautan web yang valid (dimulai dengan http:// atau https://).',
            'songs.*.youtube_url.url' => 'YouTube URL harus berupa tautan web yang valid (dimulai dengan http:// atau https://).',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        $uploaderName = trim((string) (Auth::user()?->name ?: 'Admin')) ?: 'Admin';

        try {
            $savedCount = DB::transaction(function () use ($validSongs, $uploaderName): int {
                $count = 0;
                foreach ($validSongs as $songData) {
                    $title = strip_tags(trim($songData['title']));
                    $artist = strip_tags(trim($songData['artist']));
                    $audioUrl = trim($songData['audio_url']);
                    $coverUrl = $songData['cover_url'] ? trim($songData['cover_url']) : null;
                    $youtubeUrl = $songData['youtube_url'] ? trim($songData['youtube_url']) : null;
                    $album = $songData['album'] ? strip_tags(trim($songData['album'])) : null;
                    $genre = $songData['genre'] ? strip_tags(trim($songData['genre'])) : null;
                    $description = $songData['description'] ? strip_tags(trim($songData['description'])) : null;
                    // Auto-fallback cover from YouTube if cover_url is empty but youtube_url is provided
                    if (! $coverUrl && $youtubeUrl) {
                        if (preg_match('/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/', $youtubeUrl, $matches)) {
                            $coverUrl = 'https://img.youtube.com/vi/'.$matches[1].'/hqdefault.jpg';
                        }
                    }

                    $slugBase = Str::slug("{$artist} - {$title}") ?: 'track';
                    $slug = $slugBase.'-'.Str::random(6);

                    Music::create([
                        'slug' => $slug,
                        'title' => $title,
                        'artist' => $artist,
                        'album' => $album,
                        'genre' => $genre,
                        'description' => $description,
                        'cover_image' => $coverUrl ?: 'believer.jpg',
                        'audio_file' => $audioUrl,
                        'youtube_url' => $youtubeUrl,
                        'duration' => null,
                        'file_size' => 0,
                        'play_count' => 0,
                        'uploader_name' => $uploaderName,
                        'is_active' => 1,
                    ]);

                    $count++;
                }

                return $count;
            });

            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Berhasil menambahkan {$savedCount} lagu sekaligus ke library!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menambahkan lagu secara massal: '.$e->getMessage())->withInput();
        }
    }

    /**
     * Update existing song metadata.
     */
    public function updateSong(Request $request, int|string $id): RedirectResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'artist' => 'required|string|max:255',
            'album' => 'nullable|string|max:255',
            'genre' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'youtube_url' => 'nullable|string|max:500',
            'cover' => 'nullable|file|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        try {
            $song = Music::findOrFail($id);

            if ($request->hasFile('cover')) {
                $coverFile = $request->file('cover');
                $coverExt = strtolower($coverFile->getClientOriginalExtension());
                $coverSlug = Str::slug("{$song->artist} - {$song->title}-cover") ?: 'cover';
                $coverHash = Str::random(8);
                $savedCoverName = "{$coverSlug}-{$coverHash}.{$coverExt}";
                $coverFile->move(public_path('assets/covers'), $savedCoverName);
                $song->cover_image = $savedCoverName;
            }

            $song->title = trim($request->input('title'));
            $song->artist = trim($request->input('artist'));
            $song->album = $request->input('album') ?: null;
            $song->genre = $request->input('genre') ?: null;
            $song->description = $request->input('description') ?: null;
            $song->youtube_url = $request->input('youtube_url') ?: null;
            $song->save();

            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Metadata lagu \"{$song->title}\" berhasil diperbarui.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui lagu: '.$e->getMessage());
        }
    }

    /**
     * Delete song from library and disk.
     */
    public function deleteSong(int|string $id): RedirectResponse
    {
        try {
            $song = Music::findOrFail($id);
            $title = $song->title;

            // Delete audio file if local
            if ($song->audio_file && ! str_starts_with($song->audio_file, 'http')) {
                $audioPath = public_path('assets/music/'.$song->audio_file);
                if (file_exists($audioPath)) {
                    @unlink($audioPath);
                }
            }

            // Delete cover file if local
            if ($song->cover_image && ! str_starts_with($song->cover_image, 'http') && ! str_contains($song->cover_image, 'believer.jpg')) {
                $coverPath = public_path('assets/covers/'.$song->cover_image);
                if (file_exists($coverPath)) {
                    @unlink($coverPath);
                }
            }

            $song->delete();
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'music'])
                ->with('success', "Lagu \"{$title}\" berhasil dihapus dari library beserta filenya.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus lagu: '.$e->getMessage());
        }
    }
}
