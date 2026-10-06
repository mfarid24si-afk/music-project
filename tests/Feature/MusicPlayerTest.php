<?php

use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use App\Models\VisitorLog;
use Illuminate\Http\UploadedFile;

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
test('admin dashboard renders flash messages with their animation target class', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)
        ->withSession(['success' => 'Playlist berhasil disetujui'])
        ->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertSee('Playlist berhasil disetujui')
        ->assertSee('class="alert alert-success"', escape: false);
});

test('admin dashboard loads the built gsap animation entry', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk()->assertSee('admin-animations', escape: false);
});

test('admin dashboard table rows expose the gsap animation target', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    Music::create([
        'slug' => 'lagu-untuk-animasi',
        'title' => 'Lagu Untuk Animasi',
        'artist' => 'Artis Uji',
        'audio_file' => 'lagu-untuk-animasi.mp3',
        'is_active' => 1,
    ]);

    $response = $this->actingAs($admin)
        ->get(route('admin.dashboard', ['tab' => 'music']));

    $response->assertOk()
        ->assertSee('class="table-responsive"', escape: false)
        ->assertSee('Lagu Untuk Animasi');
});

test('admin dashboard ships the top page loader for full page navigations', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertOk()
        ->assertSee('@keyframes page-loader-fill', escape: false)
        ->assertSee("LOADER_ID = 'page-loader'", escape: false)
        ->assertSee('#page-loader > span', escape: false)
        ->assertSee('background: var(--accent)', escape: false)
        ->assertDontSee('page-loader-sweep', escape: false);
});

test('settings page returns ok', function () {
    $response = $this->get('/settings.php');

    $response->assertOk();
});

test('playlist creation initiates in pending state requiring admin approval', function () {
    $response = $this->postJson('/api/playlists', [
        'name' => 'Akustik Santai',
        'description' => 'Koleksi lagu akustik sore',
        'emoji' => '🎸',
        'gradient' => 'sunset',
    ]);

    $response->assertCreated()
        ->assertJson([
            'success' => true,
            'data' => [
                'name' => 'Akustik Santai',
                'status' => 'pending',
                'is_public' => false,
                'isLocked' => true,
            ],
        ]);

    $playlistId = $response->json('data.id');
    $playlist = Playlist::find($playlistId);
    expect($playlist)->not->toBeNull();
    expect($playlist->status)->toBe('pending');
    expect($playlist->is_public)->toBeFalse();
});

test('admin can approve pending playlist to unlock it', function () {
    $playlist = Playlist::create([
        'slug' => 'test-playlist-pending',
        'name' => 'Pending Playlist',
        'status' => 'pending',
        'is_public' => false,
    ]);

    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.playlists.approve', $playlist->id));

    $response->assertRedirect();
    $playlist->refresh();
    expect($playlist->status)->toBe('approved');
    expect($playlist->is_public)->toBeTrue();
});

test('guest cannot delete a playlist', function () {
    $playlist = Playlist::create([
        'slug' => 'test-playlist-guest-delete',
        'name' => 'Playlist Pengunjung',
        'status' => 'pending',
        'is_public' => false,
    ]);

    $this->deleteJson("/api/playlists/{$playlist->id}")->assertUnauthorized();

    expect(Playlist::find($playlist->id))->not->toBeNull();
});

test('admin can delete a playlist', function () {
    $playlist = Playlist::create([
        'slug' => 'test-playlist-admin-delete',
        'name' => 'Playlist Admin',
        'status' => 'approved',
        'is_public' => true,
    ]);

    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $this->actingAs($admin)
        ->deleteJson("/api/playlists/{$playlist->id}")
        ->assertOk()
        ->assertJson(['success' => true]);

    expect(Playlist::find($playlist->id))->toBeNull();
});

test('admin login page contains password visibility toggle eye button', function () {
    $response = $this->get(route('admin.login'));

    $response->assertOk();
    $response->assertSee('id="togglePasswordBtn"', false);
    $response->assertSee('id="eyeIconOpen"', false);
    $response->assertSee('id="eyeIconClosed"', false);
});

test('admin dashboard contains dark and light mode toggle and color theme options', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard', ['tab' => 'settings']));

    $response->assertOk();
    $response->assertSee('id="quickModeToggle"', false);
    $response->assertSee('id="btnModeDark"', false);
    $response->assertSee('id="btnModeLight"', false);
    $response->assertSee('id="adminThemeSwatches"', false);
});

test('admin dashboard music tab contains multi song bulk upload form and repeater elements', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard', ['tab' => 'music']));

    $response->assertOk();
    $response->assertSee('id="formModeFile"', false);
    $response->assertSee('id="formModeUrl"', false);
    $response->assertSee('id="bulkSongsContainer"', false);
    $response->assertSee('addBulkSongRow()', false);
    $response->assertSee(route('admin.music.bulk'), false);
    $response->assertSee('btn-preview-audio', false);
    $response->assertSee('toggleAudioPreview(this)', false);
});

test('guest cannot bulk upload songs', function () {
    $response = $this->post(route('admin.music.bulk'), [
        'songs' => [
            [
                'title' => 'Song 1',
                'artist' => 'Artist 1',
                'audio_url' => 'https://example.com/song1.mp3',
            ],
        ],
    ]);

    $response->assertRedirect(route('login'));
});

test('admin can bulk upload multiple songs successfully', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.music.bulk'), [
        'songs' => [
            [
                'title' => 'Yellow',
                'artist' => 'Coldplay',
                'audio_url' => 'https://cdn.example.com/yellow.mp3',
                'cover_url' => 'https://cdn.example.com/yellow.jpg',
                'album' => 'Parachutes',
                'genre' => 'Alternative',
                'description' => 'Classic Coldplay hit',
                'youtube_url' => 'https://www.youtube.com/watch?v=yKNxeF4KMsY',
            ],
            [
                'title' => 'Fix You',
                'artist' => 'Coldplay',
                'audio_url' => 'https://cdn.example.com/fixyou.mp3',
                'album' => 'X&Y',
                'genre' => 'Rock',
            ],
        ],
    ]);

    $response->assertRedirect(route('admin.dashboard', ['tab' => 'music']));
    $response->assertSessionHas('success');

    expect(Music::where('title', 'Yellow')->where('artist', 'Coldplay')->exists())->toBeTrue();
    expect(Music::where('title', 'Fix You')->where('artist', 'Coldplay')->exists())->toBeTrue();
});

test('admin bulk upload ignores completely empty rows', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.music.bulk'), [
        'songs' => [
            [
                'title' => 'Viva La Vida',
                'artist' => 'Coldplay',
                'audio_url' => 'https://cdn.example.com/vivalavida.mp3',
            ],
            [
                'title' => '',
                'artist' => '',
                'audio_url' => '',
                'cover_url' => '',
                'album' => '',
            ],
        ],
    ]);

    $response->assertRedirect(route('admin.dashboard', ['tab' => 'music']));
    $response->assertSessionHas('success');

    expect(Music::where('title', 'Viva La Vida')->exists())->toBeTrue();
});

test('admin bulk upload rejects dangerous protocols', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.music.bulk'), [
        'songs' => [
            [
                'title' => 'Malicious Track',
                'artist' => 'Hacker',
                'audio_url' => 'javascript:alert(1)',
            ],
        ],
    ]);

    $response->assertSessionHasErrors(['songs.0.audio_url']);
    expect(Music::where('title', 'Malicious Track')->exists())->toBeFalse();
});

test('admin dashboard contains users tab and displays user list', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->get(route('admin.dashboard', ['tab' => 'users']));

    $response->assertOk();
    $response->assertSee('Kelola Pengguna', false);
    $response->assertSee('Tambah Akun Pengguna Baru', false);
    $response->assertSee('action="'.route('admin.users.store').'"', false);
    $response->assertSee($admin->email, false);
});

test('guest cannot create user via admin endpoint', function () {
    $response = $this->post(route('admin.users.store'), [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertRedirect(route('login'));
    expect(User::where('email', 'newuser@example.com')->exists())->toBeFalse();
});

test('admin can create a new user with credentials', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Budi Santoso',
        'email' => 'budi@spotirid.com',
        'password' => 'secret1234',
        'password_confirmation' => 'secret1234',
    ]);

    $response->assertRedirect(route('admin.dashboard', ['tab' => 'users']));
    $response->assertSessionHas('success');

    $createdUser = User::where('email', 'budi@spotirid.com')->first();
    expect($createdUser)->not->toBeNull();
    expect($createdUser->name)->toBe('Budi Santoso');
    expect(Hash::check('secret1234', $createdUser->password))->toBeTrue();
});

test('admin user creation validates unique email and password confirmation', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $response = $this->actingAs($admin)->post(route('admin.users.store'), [
        'name' => 'Duplicate User',
        'email' => 'admin@spotirid.com',
        'password' => 'short',
        'password_confirmation' => 'mismatch',
    ]);

    $response->assertSessionHasErrors(['email', 'password']);
});

test('admin cannot delete their own account but can delete another user', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $otherUser = User::create([
        'name' => 'Target User',
        'email' => 'target@spotirid.com',
        'password' => bcrypt('password123'),
    ]);

    // Try self deletion
    $selfDeleteResponse = $this->actingAs($admin)->delete(route('admin.users.delete', $admin->id));
    $selfDeleteResponse->assertSessionHas('error');
    expect(User::where('id', $admin->id)->exists())->toBeTrue();

    // Delete other user
    $deleteResponse = $this->actingAs($admin)->delete(route('admin.users.delete', $otherUser->id));
    $deleteResponse->assertRedirect(route('admin.dashboard', ['tab' => 'users']));
    $deleteResponse->assertSessionHas('success');
    expect(User::where('id', $otherUser->id)->exists())->toBeFalse();
});

test('public self registration is disabled', function () {
    $response = $this->get('/register');
    $response->assertNotFound();
});

test('guest cannot submit song via suggest endpoint', function () {
    $response = $this->postJson(route('music.suggest'), [
        'title' => 'Guest Track',
        'artist' => 'Guest',
        'audio_url' => 'https://cdn.example.com/guest.mp3',
    ]);

    $response->assertUnauthorized();
});

test('authenticated member can submit song via suggest endpoint and defaults to pending', function () {
    $member = User::create([
        'name' => 'Member One',
        'email' => 'member1@spotirid.com',
        'password' => bcrypt('password123'),
    ]);

    $response = $this->actingAs($member)->postJson(route('music.suggest'), [
        'title' => 'Fix You Live',
        'artist' => 'Coldplay',
        'audio_url' => 'https://cdn.example.com/audio/fix-you-live.mp3',
        'cover_url' => 'https://cdn.example.com/covers/fix-you.jpg',
        'youtube_url' => 'https://youtube.com/watch?v=12345678901',
        'album' => 'Live 2012',
        'genre' => 'Rock',
        'description' => 'Great live version',
    ]);

    $response->assertCreated();
    $response->assertJson([
        'success' => true,
    ]);

    $song = Music::where('title', 'Fix You Live')->first();
    expect($song)->not->toBeNull();
    expect($song->artist)->toBe('Coldplay');
    expect($song->uploader_name)->toBe('Member One');
    expect($song->is_active)->toBeFalse(); // Must be pending!
});

test('suggest song endpoint rejects file uploads', function () {
    $member = User::create([
        'name' => 'Member Two',
        'email' => 'member2@spotirid.com',
        'password' => bcrypt('password123'),
    ]);

    $fakeFile = UploadedFile::fake()->create('track.mp3', 100);

    $response = $this->actingAs($member)->post(route('music.suggest'), [
        'title' => 'Uploaded Track',
        'artist' => 'Artist',
        'audio' => $fakeFile,
        'audio_url' => 'https://cdn.example.com/track.mp3',
    ]);

    $response->assertStatus(422);
    expect(Music::where('title', 'Uploaded Track')->exists())->toBeFalse();
});

test('admin can approve pending song and make it live on beranda', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $pendingSong = Music::create([
        'slug' => 'pending-song-1',
        'title' => 'Pending Approval Track',
        'artist' => 'Indie Artist',
        'audio_file' => 'https://cdn.example.com/pending.mp3',
        'uploader_name' => 'Member One',
        'is_active' => 0,
    ]);

    // Admin dashboard shows the pending song
    $dashResponse = $this->actingAs($admin)->get(route('admin.dashboard', ['tab' => 'music']));
    $dashResponse->assertOk();
    $dashResponse->assertSee('Pending Approval Track');
    $dashResponse->assertSee('Member One');

    // Approve song
    $approveResponse = $this->actingAs($admin)->post(route('admin.music.approve', $pendingSong->id));
    $approveResponse->assertRedirect(route('admin.dashboard', ['tab' => 'music']));
    $approveResponse->assertSessionHas('success');

    $pendingSong->refresh();
    expect($pendingSong->is_active)->toBeTrue();
});

test('admin can reject pending song and remove it from database', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $rejectedSong = Music::create([
        'slug' => 'rejected-song-1',
        'title' => 'To Be Rejected Track',
        'artist' => 'Spam Artist',
        'audio_file' => 'https://cdn.example.com/spam.mp3',
        'uploader_name' => 'Member Spam',
        'is_active' => 0,
    ]);

    // Reject song
    $rejectResponse = $this->actingAs($admin)->post(route('admin.music.reject', $rejectedSong->id));
    $rejectResponse->assertRedirect(route('admin.dashboard', ['tab' => 'music']));
    $rejectResponse->assertSessionHas('info');

    expect(Music::where('id', $rejectedSong->id)->exists())->toBeFalse();
});

test('admin can update user account information and password', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $user = User::create([
        'name' => 'Original Name',
        'email' => 'original@spotirid.com',
        'password' => bcrypt('oldpassword'),
    ]);

    $response = $this->actingAs($admin)->post(route('admin.users.update', $user->id), [
        'name' => 'Updated Name',
        'email' => 'updated@spotirid.com',
        'password' => 'newsecretpass',
        'password_confirmation' => 'newsecretpass',
    ]);

    $response->assertRedirect(route('admin.dashboard', ['tab' => 'users']));
    $response->assertSessionHas('success');

    $user->refresh();
    expect($user->name)->toBe('Updated Name');
    expect($user->email)->toBe('updated@spotirid.com');
    expect(Hash::check('newsecretpass', $user->password))->toBeTrue();
});

test('suggest song endpoint requires all fields strictly', function () {
    $member = User::create([
        'name' => 'Strict Member',
        'email' => 'strict@spotirid.com',
        'password' => bcrypt('password123'),
    ]);

    // Missing cover_url, youtube_url, album, genre, description
    $response = $this->actingAs($member)->postJson(route('music.suggest'), [
        'title' => 'Incomplete Track',
        'artist' => 'Incomplete Artist',
        'audio_url' => 'https://cdn.example.com/audio.mp3',
    ]);

    $response->assertStatus(422);
    $response->assertJsonValidationErrors(['cover_url', 'youtube_url', 'album', 'genre', 'description']);
});

test('admin can edit metadata and approve pending song in one go', function () {
    $admin = User::firstOrCreate(
        ['email' => 'admin@spotirid.com'],
        ['name' => 'Administrator', 'password' => bcrypt('password')]
    );

    $song = Music::create([
        'slug' => 'draft-track',
        'title' => 'Draft Track',
        'artist' => 'Draft Artist',
        'audio_file' => 'https://cdn.example.com/draft.mp3',
        'uploader_name' => 'Member User',
        'is_active' => 0,
    ]);

    $response = $this->actingAs($admin)->post(route('admin.music.approve-edit', $song->id), [
        'title' => 'Polished Track',
        'artist' => 'Polished Artist',
        'audio_url' => 'https://cdn.example.com/polished.mp3',
        'cover_url' => 'https://cdn.example.com/polished.jpg',
        'youtube_url' => 'https://youtube.com/watch?v=12345678901',
        'album' => 'Polished Album',
        'genre' => 'Polished Genre',
        'description' => 'Polished description notes',
    ]);

    $response->assertRedirect(route('admin.dashboard', ['tab' => 'music']));
    $response->assertSessionHas('success');

    $song->refresh();
    expect($song->title)->toBe('Polished Track');
    expect($song->artist)->toBe('Polished Artist');
    expect($song->audio_file)->toBe('https://cdn.example.com/polished.mp3');
    expect($song->is_active)->toBeTrue();
});
