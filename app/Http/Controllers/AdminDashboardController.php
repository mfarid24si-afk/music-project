<?php

namespace App\Http\Controllers;

use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use App\Support\VisitorBackupReminder;
use App\Support\VisitorTracking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;
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

        $visitorBackupReminderOpen = $this->handleVisitorBackupReminder($request);

        try {
            $totalSongs = Music::where('is_active', 1)->count();
            $totalPendingSongs = Music::where('is_active', 0)->count();
            $pendingSongs = Music::where('is_active', 0)->orderBy('created_at', 'desc')->get();
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

            $totalUsers = User::count();
            $userSearch = trim((string) $request->query('user_search', ''));
            $usersQuery = User::orderBy('created_at', 'desc');
            if ($userSearch !== '') {
                $usersQuery->where(function ($q) use ($userSearch) {
                    $q->where('name', 'like', "%{$userSearch}%")
                        ->orWhere('email', 'like', "%{$userSearch}%");
                });
            }
            $users = $usersQuery->paginate(15, ['*'], 'users_page')->withQueryString();
        } catch (\Throwable $e) {
            $totalSongs = 0;
            $totalPendingSongs = 0;
            $pendingSongs = collect();
            $totalPlays = 0;
            $totalApprovedPlaylists = 0;
            $totalPendingPlaylists = 0;
            $pendingPlaylists = collect();
            $approvedPlaylists = collect();
            $songs = new LengthAwarePaginator([], 0, 15);
            $totalUsers = 0;
            $userSearch = '';
            $users = new LengthAwarePaginator([], 0, 15);
            session()->flash('error', 'Catatan database: '.$e->getMessage());
        }

        $analyticsData = $this->getAnalyticsData();
        $visitorTrackingEnabled = VisitorTracking::isEnabled();
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
            'systemInfo',
            'visitorBackupReminderOpen',
            'visitorTrackingEnabled',
            'totalUsers',
            'users',
            'userSearch',
            'totalPendingSongs',
            'pendingSongs'
        ));
    }

    /**
     * Resolve the year-end visitor backup banner and fire any due reminder email.
     *
     * There is no cron on this host, so the dashboard doubles as the trigger.
     * Dismissing stores a flag in the session, which keeps the banner out of the
     * database and out of a new migration.
     */
    private function handleVisitorBackupReminder(Request $request): bool
    {
        if ($request->boolean('dismiss_visitor_reminder')) {
            session()->put('visitor_backup_reminder_dismissed_at', Carbon::now()->toDateString());
        }

        $dismissedOn = session()->get('visitor_backup_reminder_dismissed_at');

        if ($dismissedOn !== null && $dismissedOn === Carbon::now()->toDateString()) {
            return false;
        }

        if (! VisitorBackupReminder::isReminderWindowOpen()) {
            return false;
        }

        try {
            VisitorBackupReminder::sendDue();
        } catch (\Throwable $e) {
            Log::error('Visitor backup reminder failed to send', ['message' => $e->getMessage()]);
        }

        return true;
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
     * Reject a submitted playlist by deleting it entirely.
     */
    public function rejectPlaylist(int|string $id): RedirectResponse
    {
        try {
            $playlist = Playlist::findOrFail($id);
            $name = $playlist->name;
            $playlist->songs()->detach();
            $playlist->delete();
            Cache::flush();

            return redirect()->route('admin.dashboard', ['tab' => 'playlists'])
                ->with('info', "Playlist \"{$name}\" ditolak dan dihapus dari sistem.");
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
     * Compute visitor analytics for the charts.
     *
     * @return array<string, array<string, mixed>>
     */
    private function getAnalyticsData(): array
    {
        $today = date('Y-m-d');
        $currentYear = (int) date('Y');
        $currentMonth = (int) date('m');

        // 1. Harian: 24 jam (00:00 - 23:00) dihitung REAL dari visitor_logs hari ini
        $hourlyLabels = [];
        $hourlyData = [];
        for ($h = 0; $h < 24; $h++) {
            $hourlyLabels[] = sprintf('%02d:00', $h);
            $hourlyData[$h] = 0;
        }

        try {
            $dailyLogs = DB::table('visitor_logs')
                ->where('visit_date', $today)
                ->selectRaw('visit_hour, count(*) as total')
                ->groupBy('visit_hour')
                ->pluck('total', 'visit_hour');

            foreach ($dailyLogs as $hour => $count) {
                if (isset($hourlyData[$hour])) {
                    $hourlyData[$hour] = (int) $count;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Analytics daily query error: '.$e->getMessage());
        }

        // 2. Mingguan: 7 hari terakhir (6 hari lalu sampai hari ini) dihitung REAL
        $dayNamesIndo = [
            'Sun' => 'Minggu',
            'Mon' => 'Senin',
            'Tue' => 'Selasa',
            'Wed' => 'Rabu',
            'Thu' => 'Kamis',
            'Fri' => 'Jumat',
            'Sat' => 'Sabtu',
        ];

        $weeklyLabels = [];
        $weeklyDates = [];
        $weeklyUnique = [];
        $weeklyViews = [];

        for ($i = 6; $i >= 0; $i--) {
            $ts = (int) strtotime("-{$i} days");
            $d = date('Y-m-d', $ts);
            $dayShort = date('D', $ts);
            $dayLabel = ($dayNamesIndo[$dayShort] ?? $dayShort).' ('.date('d/m', $ts).')';

            $weeklyLabels[] = $dayLabel;
            $weeklyDates[] = $d;
            $weeklyUnique[$d] = 0;
            $weeklyViews[$d] = 0;
        }

        try {
            $startDate = $weeklyDates[0];
            $endDate = $weeklyDates[6];

            $weekLogs = DB::table('visitor_logs')
                ->whereBetween('visit_date', [$startDate, $endDate])
                ->selectRaw('visit_date, count(*) as total_views, count(distinct ip_hash) as unique_ips')
                ->groupBy('visit_date')
                ->get();

            foreach ($weekLogs as $row) {
                if (isset($weeklyUnique[$row->visit_date])) {
                    $weeklyUnique[$row->visit_date] = (int) $row->unique_ips;
                    $weeklyViews[$row->visit_date] = (int) $row->total_views;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Analytics weekly query error: '.$e->getMessage());
        }

        // 3. Bulanan: 4 interval minggu dalam bulan berjalan dihitung REAL
        $monthlyLabels = ['Minggu 1 (1-7)', 'Minggu 2 (8-14)', 'Minggu 3 (15-21)', 'Minggu 4 (22+)'];
        $monthlyData = [0, 0, 0, 0];

        try {
            $monthLogs = DB::table('visitor_logs')
                ->whereYear('visit_date', $currentYear)
                ->whereMonth('visit_date', $currentMonth)
                ->selectRaw('DAY(visit_date) as dom, count(*) as total')
                ->groupByRaw('DAY(visit_date)')
                ->get();

            foreach ($monthLogs as $row) {
                $day = (int) $row->dom;
                $cnt = (int) $row->total;
                if ($day <= 7) {
                    $monthlyData[0] += $cnt;
                } elseif ($day <= 14) {
                    $monthlyData[1] += $cnt;
                } elseif ($day <= 21) {
                    $monthlyData[2] += $cnt;
                } else {
                    $monthlyData[3] += $cnt;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Analytics monthly query error: '.$e->getMessage());
        }

        // 4. Tahunan: 12 Bulan (Jan - Des) tahun berjalan dihitung REAL
        $yearlyLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        $yearlyData = array_fill(0, 12, 0);

        try {
            $yearLogs = DB::table('visitor_logs')
                ->whereYear('visit_date', $currentYear)
                ->selectRaw('MONTH(visit_date) as month_num, count(*) as total')
                ->groupByRaw('MONTH(visit_date)')
                ->pluck('total', 'month_num');

            foreach ($yearLogs as $mNum => $cnt) {
                $idx = ((int) $mNum) - 1;
                if (isset($yearlyData[$idx])) {
                    $yearlyData[$idx] = (int) $cnt;
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Analytics yearly query error: '.$e->getMessage());
        }

        return [
            'daily' => [
                'labels' => $hourlyLabels,
                'data' => array_values($hourlyData),
            ],
            'weekly' => [
                'labels' => $weeklyLabels,
                'unique' => array_values($weeklyUnique),
                'views' => array_values($weeklyViews),
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
