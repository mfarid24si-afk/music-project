<?php

use App\Models\Music;
use App\Models\User;
use App\Models\VisitorLog;

beforeEach(function () {
    if (Music::count() === 0) {
        Music::create([
            'slug' => 'believer',
            'title' => 'Believer',
            'artist' => 'Imagine Dragons',
            'album' => 'Evolve',
            'genre' => 'Rock',
            'cover_image' => 'believer.jpg',
            'audio_file' => 'believer.mp4',
            'duration' => '3:24',
            'file_size' => 4123078,
            'play_count' => 10,
            'uploader_name' => 'Admin',
            'is_active' => 1,
        ]);
    }
});

test('public music player page renders successfully and logs visitor', function () {
    $response = $this->get(route('home'));

    $response->assertOk();
    expect(VisitorLog::count())->toBeGreaterThan(0);
});

test('api music endpoint returns active songs with correct structure', function () {
    $response = $this->getJson('/api/music');

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'data' => [
                '*' => [
                    'id',
                    'title',
                    'artist',
                    'genre',
                    'img',
                    'src',
                ],
            ],
            'total',
        ]);

    $data = $response->json('data');
    expect($data)->toBeArray();
    expect(count($data))->toBeGreaterThan(0);
});

test('api music play-stat endpoint increments play count', function () {
    $song = Music::first();
    expect($song)->not->toBeNull();
    $initialPlays = $song->play_count;

    $response = $this->postJson('/api/music/play-stat', [
        'id' => $song->id,
    ]);
    $response->assertOk()
        ->assertJson([
            'success' => true,
            'id' => $song->id,
        ]);

    expect($song->fresh()->play_count)->toBe($initialPlays + 1);
});

test('api playlists endpoint returns playlists list', function () {
    $response = $this->getJson('/api/playlists');

    $response->assertOk()
        ->assertJsonStructure([
            'success',
            'data',
        ]);
});

test('admin login page renders successfully', function () {
    $response = $this->get(route('admin.login'));

    $response->assertOk();
});

test('admin dashboard redirects guest to login', function () {
    $response = $this->get(route('admin.dashboard'));

    $response->assertRedirect(route('login'));
});

test('authenticated admin can view dashboard', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk();
});

test('settings page returns ok', function () {
    $response = $this->get('/settings.php');

    $response->assertOk();
});
