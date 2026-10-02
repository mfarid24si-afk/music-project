<?php

use App\Http\Controllers\MusicController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Standard REST API Endpoints
Route::get('/music', [MusicController::class, 'index']);
Route::post('/music', [MusicController::class, 'store']);
Route::post('/music/play-stat', [MusicController::class, 'playStat']);
Route::match(['post', 'put'], '/music/{id}', [MusicController::class, 'update'])->whereNumber('id');
Route::delete('/music/{id}', [MusicController::class, 'destroy'])->whereNumber('id');

// Community Shared Playlists Endpoints
Route::get('/playlists', [MusicController::class, 'getPlaylists']);
Route::post('/playlists', [MusicController::class, 'storePlaylist']);
Route::put('/playlists/{id}', [MusicController::class, 'updatePlaylist']);
Route::delete('/playlists/{id}', [MusicController::class, 'destroyPlaylist']);
Route::post('/playlists/{id}/songs', [MusicController::class, 'togglePlaylistSong']);
// Backward-compatible endpoints for old paths
Route::get('/music.php', [MusicController::class, 'index']);
Route::post('/upload_music.php', [MusicController::class, 'store']);
Route::post('/update_music.php', function (Request $request) {
    $id = $request->input('id');

    return app(MusicController::class)->update($request, $id);
});
Route::post('/delete_music.php', function (Request $request) {
    $id = $request->input('id');

    return app(MusicController::class)->destroy($id);
});
Route::post('/play_stat.php', [MusicController::class, 'playStat']);
