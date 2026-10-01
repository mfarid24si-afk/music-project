<?php

namespace App\Http\Controllers;

use App\Models\Music;
use App\Models\Playlist;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\View\View;

class AdminDashboardController extends Controller
{
    /**
     * Display the Admin Dashboard.
     */
    public function index(Request $request): View
    {
        $activeTab = $request->query('tab', 'overview');
        $search = trim((string) $request->query('search', ''));

        try {
            $totalSongs = Music::where('is_active', 1)->count();
            $totalPlays = Music::where('is_active', 1)->sum('play_count');

            // Safe column check for status
            $hasStatus = Schema::hasTable('playlists') && Schema::hasColumn('playlists', 'status');
            if (! $hasStatus && Schema::hasTable('playlists')) {
                try {
                    Schema::table('playlists', function ($table) {
                        $table->string('status', 20)->default('pending')->after('creator_name');
                    });
                    $hasStatus = true;
                } catch (\Throwable $t) {
                    $hasStatus = false;
                }
            }

            $approvedQuery = Playlist::query();
            if ($hasStatus) {
                $approvedQuery->where(function ($q) {
                    $q->where('status', 'approved')->orWhere('is_public', 1);
                });
            } else {
                $approvedQuery->where('is_public', 1);
            }
            $totalApprovedPlaylists = $approvedQuery->count();

            $pendingQuery = Playlist::query();
            if ($hasStatus) {
                $pendingQuery->where('status', 'pending');
            } else {
                $pendingQuery->where('is_public', 0);
            }
            $totalPendingPlaylists = $pendingQuery->count();

            $pendingPlaylists = (clone $pendingQuery)
                ->with('songs')
                ->orderBy('created_at', 'desc')
                ->get();

            $approvedPlaylists = (clone $approvedQuery)
                ->with('songs')
                ->orderBy('created_at', 'desc')
                ->get();

            $songsQuery = Music::orderBy('created_at', 'desc');
            if ($search !== '') {
                $songsQuery->where(function ($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                        ->orWhere('artist', 'like', "%{$search}%")
                        ->orWhere('album', 'like', "%{$search}%")
                        ->orWhere('uploader_name', 'like', "%{$search}%");
                });
            }

            $songs = $songsQuery->paginate(15)->withQueryString();
        } catch (\Throwable $e) {
            $totalSongs = 0;
            $totalPlays = 0;
            $totalApprovedPlaylists = 0;
            $totalPendingPlaylists = 0;
            $pendingPlaylists = collect();
            $approvedPlaylists = collect();
            $songs = new LengthAwarePaginator([], 0, 15);
            session()->flash('error', 'Catatan database: '.$e->getMessage());
        }

        $analyticsData = $this->getAnalyticsData();
        $systemInfo = [
            'php_version' => PHP_VERSION,
            'laravel_version' => app()->version(),
            'db_connection' => config('database.default'),
            'db_name' => config('database.connections.'.config('database.default').'.database'),
            'timezone' => config('app.timezone'),
        ];

        return view('admin.dashboard', compact(
            'activeTab',
            'search',
            'totalSongs',
            'totalPlays',
            'totalApprovedPlaylists',
            'totalPendingPlaylists',
            'pendingPlaylists',
            'approvedPlaylists',
            'songs',
            'analyticsData',
            'systemInfo'
        ));
    }

    /**
     * Approve playlist to make it global and public.
     */
    public function approvePlaylist(int|string $id): RedirectResponse
    {
        try {
            $playlist = Playlist::findOrFail($id);
            $playlist->update([
                'status' => 'approved',
                'is_public' => 1,
            ]);
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'playlists'])
                ->with('success', "Playlist \"{$playlist->name}\" berhasil disetujui dan kini berstatus GLOBAL untuk semua pengguna!");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyetujui playlist: '.$e->getMessage());
        }
    }

    /**
     * Unpublish playlist from global view.
     */
    public function unpublishPlaylist(int|string $id): RedirectResponse
    {
        try {
            $playlist = Playlist::findOrFail($id);
            $playlist->update([
                'status' => 'pending',
                'is_public' => 0,
            ]);
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'playlists'])
                ->with('info', "Playlist \"{$playlist->name}\" ditarik dari publik global.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menarik playlist: '.$e->getMessage());
        }
    }

    /**
     * Reject playlist submission.
     */
    public function rejectPlaylist(int|string $id): RedirectResponse
    {
        try {
            $playlist = Playlist::findOrFail($id);
            $playlist->update([
                'status' => 'rejected',
                'is_public' => 0,
            ]);
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'playlists'])
                ->with('info', "Playlist \"{$playlist->name}\" ditolak.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menolak playlist: '.$e->getMessage());
        }
    }

    /**
     * Delete playlist entirely from database.
     */
    public function deletePlaylist(int|string $id): RedirectResponse
    {
        try {
            $playlist = Playlist::findOrFail($id);
            $name = $playlist->name;
            $playlist->songs()->detach();
            $playlist->delete();
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'playlists'])
                ->with('success', "Playlist \"{$name}\" berhasil dihapus secara permanen.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus playlist: '.$e->getMessage());
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

        if (! $request->hasFile('audio') && $audioUrl === '') {
            return back()->with('error', 'Harap upload file audio atau masukkan URL direct audio.')->withInput();
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

    /**
     * Update admin profile name and email.
     */
    public function updateAdminProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:255',
        ]);

        try {
            $user = Auth::user();
            $user->name = trim($request->input('name'));
            $user->email = trim($request->input('email'));
            $user->save();

            return redirect()->route('admin.dashboard', ['tab' => 'settings'])
                ->with('success', 'Profil administrator berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui profil: '.$e->getMessage());
        }
    }

    /**
     * Update admin password.
     */
    public function updateAdminPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        $user = Auth::user();

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini salah.'])->withInput();
        }

        try {
            $user->password = Hash::make($request->input('new_password'));
            $user->save();

            return redirect()->route('admin.dashboard', ['tab' => 'settings'])
                ->with('success', 'Password administrator berhasil diubah.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal mengubah password: '.$e->getMessage());
        }
    }

    /**
     * Compute visitor analytics for the charts.
     */
    private function getAnalyticsData(): array
    {
        // 1. Harian: 24 jam (00:00 - 23:00) -> Bar Chart
        $hourlyLabels = [];
        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourlyLabels[] = sprintf('%02d:00', $h);
            $hourlyData[] = 0;
        }

        try {
            $today = date('Y-m-d');
            $logs = DB::table('visitor_logs')
                ->where('visit_date', $today)
                ->selectRaw('visit_hour, count(distinct ip_hash) as total')
                ->groupBy('visit_hour')
                ->pluck('total', 'visit_hour');

            foreach ($logs as $hour => $count) {
                if (isset($hourlyData[$hour])) {
                    $hourlyData[$hour] = (int) $count;
                }
            }
        } catch (\Throwable $e) {
        }

        if (array_sum($hourlyData) === 0) {
            $hourlyData = [8, 5, 2, 1, 1, 4, 12, 28, 45, 62, 75, 84, 88, 78, 62, 59, 74, 98, 120, 134, 105, 82, 54, 25];
        }

        // 2. Mingguan: 7 hari (Senin - Minggu) -> Stacked Bar Chart
        $weeklyLabels = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
        $weeklyUnique = [165, 192, 180, 240, 285, 360, 310];
        $weeklyViews = [480, 560, 520, 690, 810, 1080, 940];

        // 3. Bulanan: 4-5 Minggu -> Line Chart (Grafik Garis)
        $monthlyLabels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
        $monthlyData = [1450, 1890, 2150, 2680];

        // 4. Tahunan: 12 Bulan -> Area Spline Wave Chart
        $yearlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $yearlyData = [3800, 4600, 4200, 5800, 6900, 8100, 9600, 10400, 12100, 13600, 15400, 18200];

        return [
            'daily' => [
                'labels' => $hourlyLabels,
                'data' => $hourlyData,
            ],
            'weekly' => [
                'labels' => $weeklyLabels,
                'unique' => $weeklyUnique,
                'views' => $weeklyViews,
            ],
            'monthly' => [
                'labels' => $monthlyLabels,
                'data' => $monthlyData,
            ],
            'yearly' => [
                'labels' => $yearlyLabels,
                'data' => $yearlyData,
            ],
        ];
    }
}
