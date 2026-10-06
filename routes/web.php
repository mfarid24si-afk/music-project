<?php

use App\Http\Controllers\AdminAuthController;
use App\Http\Controllers\AdminDashboardController;
use App\Http\Controllers\AdminVisitorController;
use App\Support\VisitorLogMaintenance;
use App\Support\VisitorTracking;
use Illuminate\Http\Request;
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
    Route::post('/music/bulk', [AdminDashboardController::class, 'storeBulkSongs'])->name('admin.music.bulk');
    Route::post('/music/{id}', [AdminDashboardController::class, 'updateSong'])->name('admin.music.update');
    Route::delete('/music/{id}', [AdminDashboardController::class, 'deleteSong'])->name('admin.music.delete');

    Route::post('/profile', [AdminDashboardController::class, 'updateAdminProfile'])->name('admin.profile.update');
    Route::post('/password', [AdminDashboardController::class, 'updateAdminPassword'])->name('admin.password.update');

    Route::get('/visitors/export', [AdminVisitorController::class, 'export'])->name('admin.visitors.export');
    Route::post('/visitors/tracking', [AdminVisitorController::class, 'updateTracking'])->name('admin.visitors.tracking.update');
});

/*
|--------------------------------------------------------------------------
| Public Player Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function (Request $request) {
    // Counting can be switched off from the admin dashboard. A failure here is
    // swallowed for the same reason the maintenance failure below is: a broken
    // home page costs real visitors, a missed row does not.
    try {
        VisitorTracking::record($request);
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
