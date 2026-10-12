<?php

namespace App\Http\Controllers;

use App\Models\Playlist;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PlaylistController extends Controller
{
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
                    ->where(function ($q) {
                        $q->whereNull('status')->orWhere('status', '!=', 'rejected');
                    })
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
     * Update a community playlist.
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
}
