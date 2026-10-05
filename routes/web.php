<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminVisitorController;
use App\Models\VisitorLog;
use App\Support\VisitorLogMaintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Admin Authentication & Dashboard Routes
|--------------------------------------------------------------------------
*/
Route::get('/admin/login', [AdminAuthController::class, 'showLogin'])->name('admin.login');
Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::post('/admin/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/', [AdminDashboardController::class, 'index'])->name('admin.dashboard');
    Route::post('/playlists/{id}/approve', [AdminDashboardController::class, 'approvePlaylist'])->name('admin.playlists.approve');
    Route::post('/playlists/{id}/unpublish', [AdminDashboardController::class, 'unpublishPlaylist'])->name('admin.playlists.unpublish');
    Route::post('/playlists/{id}/reject', [AdminDashboardController::class, 'rejectPlaylist'])->name('admin.playlists.reject');
    Route::delete('/playlists/{id}', [AdminDashboardController::class, 'deletePlaylist'])->name('admin.playlists.delete');

    Route::post('/music', [AdminDashboardController::class, 'storeSong'])->name('admin.music.store');
    Route::post('/music/{id}', [AdminDashboardController::class, 'updateSong'])->name('admin.music.update');
    Route::delete('/music/{id}', [AdminDashboardController::class, 'deleteSong'])->name('admin.music.delete');

    Route::post('/profile', [AdminDashboardController::class, 'updateAdminProfile'])->name('admin.profile.update');
    Route::post('/password', [AdminDashboardController::class, 'updateAdminPassword'])->name('admin.password.update');

    Route::get('/visitors/export', [AdminVisitorController::class, 'export'])->name('admin.visitors.export');
});

/*
|--------------------------------------------------------------------------
| Public Player Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function (Request $request) {
    try {
        $ip = $request->ip() ?: '127.0.0.1';
        $ipHash = md5($ip.date('Y-m-d'));
        $cacheKey = 'visitor_logged_'.$ipHash.'_'.date('H');
        if (! Cache::has($cacheKey)) {
            Cache::put($cacheKey, 1, 3600);
            VisitorLog::create([
                'ip_hash' => $ipHash,
                'path' => $request->path() ?: '/',
                'visit_date' => date('Y-m-d'),
                'visit_hour' => (int) date('G'),
            ]);
        }
    } catch (Throwable $e) {
    }

    // The host has no cron, so visitor log maintenance rides along with traffic.
    // Failures are logged and swallowed: a full disk is bad, but a broken home
    // page is worse, because that is also where visitors would stop coming in.
    try {
        VisitorLogMaintenance::runIfNeeded();
    } catch (Throwable $e) {
        Log::error('Visitor log maintenance failed', ['message' => $e->getMessage()]);
    }

    return inertia('welcome');
})->name('home');
Route::get('/settings.php', function () {
    return response()->file(public_path('settings.php'), ['Content-Type' => 'text/html']);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
