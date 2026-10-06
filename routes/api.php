<?php

use App\Http\Controllers\MusicController;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Standard REST API Endpoints
Route::get('/music', [MusicController::class, 'index']);
Route::post('/music', [MusicController::class, 'store']);
Route::post('/music/play-stat', [MusicController::class, 'playStat']);
Route::match(['post', 'put'], '/music/{id}', [MusicController::class, 'update'])->whereNumber('id');
Route::delete('/music/{id}', [MusicController::class, 'destroy'])->whereNumber('id');
Route::post('/music/suggest', [MusicController::class, 'suggestSong'])->middleware(['web', 'auth']);

// Community Shared Playlists Endpoints
Route::get('/playlists', [MusicController::class, 'getPlaylists']);
Route::post('/playlists', [MusicController::class, 'storePlaylist']);
Route::put('/playlists/{id}', [MusicController::class, 'updatePlaylist']);
// Deletion is admin-only. The `web` group is applied so the admin session is
// readable here; the API group carries no session, and CSRF is dropped because
// the session cookie is already SameSite-protected.
Route::delete('/playlists/{id}', [MusicController::class, 'destroyPlaylist'])
    ->middleware(['web', 'auth'])
    ->withoutMiddleware(ValidateCsrfToken::class);
Route::post('/playlists/{id}/songs', [MusicController::class, 'togglePlaylistSong']);
// Backward-compatible endpoints for old paths
Route::get('/music.php', [MusicController::class, 'index']);
Route::post('/upload_music.php', [MusicController::class, 'store']);
Route::post('/update_music.php', function (Request $request) {
    $id = (int) $request->input('id');
    if ($id <= 0) {
        return response()->json(['success' => false, 'message' => 'ID lagu tidak valid.'], 400);
    }

    return app(MusicController::class)->update($request, $id);
});
Route::post('/delete_music.php', function (Request $request) {
    $id = (int) $request->input('id');
    if ($id <= 0) {
        return response()->json(['success' => false, 'message' => 'ID lagu tidak valid.'], 400);
    }

    return app(MusicController::class)->destroy($id);
});
Route::post('/play_stat.php', [MusicController::class, 'playStat']);
