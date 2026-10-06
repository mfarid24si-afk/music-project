<?php

use App\Models\Music;
use App\Models\Playlist;
use App\Models\User;
use App\Models\VisitorLog;
use App\Notifications\VisitorBackupReminderNotification;
use App\Support\VisitorBackupReminder;
use App\Support\VisitorLogMaintenance;
use App\Support\VisitorTracking;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Schema;

beforeEach(function () {
    // The server schema carries users.role but the committed migration does not,
    // so the column is added here to exercise both middleware branches.
    if (! Schema::hasColumn('users', 'role')) {
        Schema::table('users', function ($table) {
            $table->string('role', 20)->nullable();
        });
    }

    config([
        'visitor.tracking_enabled' => true,
        'visitor.retention_days' => 365,
        'visitor.disk_threshold_mb' => 190,
        'visitor.trim_batch_size' => 500,
        'visitor.estimated_bytes_per_row' => 2560,
        'visitor.min_rows_after_trim' => 1000,
        'visitor.backup.notify_email' => 'admin@spotirid.test',
        'visitor.backup.reminder_month' => 12,
        'visitor.backup.reminder_day' => 31,
        'visitor.backup.reminder_hours' => [18, 20, 22],
    ]);

    $this->admin = User::factory()->create(['role' => 'admin']);
    $this->regularUser = User::factory()->create(['role' => 'user']);
});

function makeVisitor(string $visitDate, int $hour = 10): VisitorLog
{
    return VisitorLog::create([
        'ip_hash' => md5($visitDate.$hour),
        'path' => '/',
        'visit_date' => $visitDate,
        'visit_hour' => $hour,
    ]);
}

function seedMusicAndPlaylist(): void
{
    Music::create([
        'slug' => 'believer', 'title' => 'Believer', 'artist' => 'Imagine Dragons',
        'album' => 'Evolve', 'genre' => 'Rock', 'cover_image' => 'a.jpg',
        'audio_file' => 'a.mp4', 'duration' => '3:24', 'file_size' => 1024,
        'play_count' => 1, 'uploader_name' => 'Admin', 'is_active' => 1,
    ]);

    Playlist::create(['slug' => 'playlist-uji', 'name' => 'Playlist Uji', 'status' => 'approved', 'is_public' => 1]);
}

describe('admin middleware', function () {
    test('tamu diarahkan ke login', function () {
        $this->get(route('admin.dashboard'))->assertRedirect(route('login'));
    });

    test('user biasa ditolak dengan 403', function () {
        $this->actingAs($this->regularUser)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    });

    test('admin boleh membuka dashboard', function () {
        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertOk();
    });

    test('akun tanpa role diperlakukan sebagai admin', function () {
        $roleless = User::factory()->create(['role' => null]);

        $this->actingAs($roleless)
            ->get(route('admin.dashboard'))
            ->assertOk();
    });

    test('form login admin tetap bisa diakses tamu', function () {
        $this->get(route('admin.login'))->assertOk();
    });
});

describe('export csv', function () {
    test('admin bisa mengunduh csv dengan header dan baris', function () {
        makeVisitor('2026-03-15');

        $response = $this->actingAs($this->admin)->get(route('admin.visitors.export'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');

        $csv = $response->streamedContent();
        expect($csv)->toContain('ip_hash,path,visit_date,visit_hour,created_at,updated_at');
        expect($csv)->toContain('2026-03-15');
    });

    test('user biasa tidak bisa mengunduh', function () {
        $this->actingAs($this->regularUser)
            ->get(route('admin.visitors.export'))
            ->assertForbidden();
    });

    test('filter tanggal hanya menyertakan rentang yang diminta', function () {
        makeVisitor('2026-01-10');
        makeVisitor('2026-06-20');
        makeVisitor('2026-12-30');

        $csv = $this->actingAs($this->admin)
            ->get(route('admin.visitors.export', ['from' => '2026-06-01', 'to' => '2026-12-31']))
            ->streamedContent();

        expect($csv)->toContain('2026-06-20');
        expect($csv)->toContain('2026-12-30');
        expect($csv)->not->toContain('2026-01-10');
    });

    test('tanggal tidak valid ditolak', function () {
        $this->actingAs($this->admin)
            ->get(route('admin.visitors.export', ['from' => 'bukan-tanggal']))
            ->assertSessionHasErrors('from');
    });

    test('export tidak menyimpan file ke disk', function () {
        makeVisitor('2026-03-15');

        $this->actingAs($this->admin)->get(route('admin.visitors.export'))->assertOk();

        expect(File::exists(storage_path('app/spotirid-visitor-'.Carbon::now()->format('Y-m-d-His').'.csv')))->toBeFalse();
    });
});

describe('trim visitor logs', function () {
    test('baris melewati retensi dihapus dan yang terbaru dipertahankan', function () {
        makeVisitor('2024-01-01');
        makeVisitor('2025-06-15');
        makeVisitor(Carbon::now()->subDays(10)->format('Y-m-d'));

        $result = VisitorLogMaintenance::run();

        expect($result['deleted_by_age'])->toBe(2);
        expect(VisitorLog::count())->toBe(1);
        expect(VisitorLog::first()->visit_date)->toBe(Carbon::now()->subDays(10)->format('Y-m-d'));
    });

    test('ambang ukuran memaksa hapus baris terlama', function () {
        config([
            'visitor.disk_threshold_mb' => 0.0,
            'visitor.trim_batch_size' => 1,
            'visitor.min_rows_after_trim' => 0,
        ]);

        makeVisitor('2026-01-01', 9);
        makeVisitor('2026-02-01', 10);
        makeVisitor('2026-03-01', 11);

        $result = VisitorLogMaintenance::run();

        expect($result['deleted_by_size'])->toBe(3);
        expect($result['trimmed_early'])->toBeTrue();
        expect(VisitorLog::count())->toBe(0);
    });

    test('lantai pengaman mencegah tabelvisitor dikosongkan', function () {
        // InnoDB never shrinks DATA_LENGTH after a DELETE, so the safety valve must
        // not wait for the reported size to drop or it would erase everything.
        config([
            'visitor.disk_threshold_mb' => 0.0,
            'visitor.min_rows_after_trim' => 2,
        ]);

        makeVisitor('2026-01-01', 9);
        makeVisitor('2026-02-01', 10);
        makeVisitor('2026-03-01', 11);

        $result = VisitorLogMaintenance::run();

        expect($result['deleted_by_size'])->toBe(1);
        expect(VisitorLog::count())->toBe(2);
        expect(VisitorLog::whereDate('visit_date', '2026-03-01')->exists())->toBeTrue();
    });

    test('anggaran baris konvergen dan tidak terus menghapus', function () {
        config([
            'visitor.disk_threshold_mb' => 0.005,
            'visitor.trim_batch_size' => 2,
            'visitor.min_rows_after_trim' => 0,
        ]);

        foreach (range(1, 5) as $day) {
            makeVisitor(sprintf('2026-01-%02d', $day));
        }

        $first = VisitorLogMaintenance::run();
        expect($first['deleted_by_size'])->toBe(3);
        expect(VisitorLog::count())->toBe(2);

        // A second pass over an unchanged physical size must be a no-op.
        $second = VisitorLogMaintenance::run();
        expect($second['deleted_by_size'])->toBe(0);
        expect(VisitorLog::count())->toBe(2);
    });

    test('tabel di bawah ambang tidak dihapus oleh aturan ukuran', function () {
        config(['visitor.disk_threshold_mb' => 100000]);

        makeVisitor('2026-03-01');
        makeVisitor('2026-03-02');

        $result = VisitorLogMaintenance::run();

        expect($result['deleted_by_size'])->toBe(0);
        expect(VisitorLog::count())->toBe(2);
    });

    test('dry run tidak menghapus apa pun', function () {
        makeVisitor('2024-01-01');

        $this->artisan('visitors:trim', ['--dry-run' => true])->assertSuccessful();

        expect(VisitorLog::count())->toBe(1);
    });

    test('opsi days menimpa jendela retensi', function () {
        makeVisitor(Carbon::now()->subDays(100)->format('Y-m-d'));
        makeVisitor(Carbon::now()->subDays(10)->format('Y-m-d'));

        $this->artisan('visitors:trim', ['--days' => 30])->assertSuccessful();

        expect(VisitorLog::count())->toBe(1);
    });

    test('opsi days bukan angka ditolak', function () {
        $this->artisan('visitors:trim', ['--days' => 'abc'])->assertExitCode(2);
    });

    test('tabel visitor_logs tidak pernah di-drop', function () {
        config(['visitor.disk_threshold_mb' => 0.0, 'visitor.min_rows_after_trim' => 0]);
        makeVisitor('2026-01-01');

        VisitorLogMaintenance::run();

        expect(Schema::hasTable('visitor_logs'))->toBeTrue();
    });

    test('tabel lain tidak tersentuh', function () {
        seedMusicAndPlaylist();
        $userCountBefore = User::count();

        config(['visitor.disk_threshold_mb' => 0.0, 'visitor.min_rows_after_trim' => 0]);
        makeVisitor('2026-01-01');
        makeVisitor('2026-02-01');

        VisitorLogMaintenance::run();

        expect(Music::count())->toBe(1);
        expect(Playlist::count())->toBe(1);
        expect(User::count())->toBe($userCountBefore);
    });

    test('pemangkasan dipanggil dari halaman publik dan tersaring cache', function () {
        Cache::forget(VisitorLogMaintenance::MAINTENANCE_CHECK_KEY);
        makeVisitor('2026-03-01');

        $this->get(route('home'))->assertOk();
        expect(Cache::has(VisitorLogMaintenance::MAINTENANCE_CHECK_KEY))->toBeTrue();

        Cache::put(VisitorLogMaintenance::MAINTENANCE_CHECK_KEY, now()->timestamp, now()->addHour());
        makeVisitor('2024-01-01');
        $this->get(route('home'))->assertOk();

        expect(VisitorLog::whereDate('visit_date', '2024-01-01')->exists())->toBeTrue();
    });
});

describe('pengingat akhir tahun', function () {
    test('tidak mengirim di luar tanggal 31 desember', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-30 19:00'));

        expect(VisitorBackupReminder::sendDue())->toBe([]);
        Notification::assertNothingSent();
    });

    test('tidak mengirim sebelum jam pertama', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-31 17:59'));

        expect(VisitorBackupReminder::sendDue())->toBe([]);
        Notification::assertNothingSent();
    });

    test('mengirim slot jam yang sudah lewat beserta slot yang belum', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-31 19:30'));

        expect(VisitorBackupReminder::sendDue())->toBe([18]);

        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 1);
    });

    test('saat jam 21 semua slot yang terlewat terkirim', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-31 21:00'));

        expect(VisitorBackupReminder::sendDue())->toBe([18, 20]);

        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 2);
    });

    test('cache mencegah pengiriman ulang pada hari yang sama', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-31 23:00'));

        VisitorBackupReminder::sendDue();
        expect(VisitorBackupReminder::sendDue())->toBe([]);

        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 3);
    });

    test('cache tidak menahan pengiriman di tahun berikutnya', function () {
        Notification::fake();

        $this->travelTo(Carbon::parse('2026-12-31 23:00'));
        VisitorBackupReminder::sendDue();

        $this->travelTo(Carbon::parse('2027-12-31 23:00'));
        expect(VisitorBackupReminder::sendDue())->toBe([18, 20, 22]);

        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 6);
    });

    test('dilewati tanpa email tujuan yang dikonfigurasi', function () {
        Notification::fake();
        config(['visitor.backup.notify_email' => null]);
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        expect(VisitorBackupReminder::sendDue())->toBe([]);

        Notification::assertNothingSent();
    });

    test('slot tanpa penerima tetap terbuka untuk dicoba ulang', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        config(['visitor.backup.notify_email' => null]);
        VisitorBackupReminder::sendDue();

        config(['visitor.backup.notify_email' => 'admin@spotirid.test']);
        expect(VisitorBackupReminder::sendDue())->toBe([18]);
    });

    test('kegagalan mailer dicoba ulang pada kunjungan berikutnya', function () {
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        Notification::shouldReceive('route')->andThrow(new RuntimeException('SMTP connection refused'));

        // A failed delivery must not consume the slot for the rest of the day.
        expect(VisitorBackupReminder::sendDue())->toBe([]);

        Notification::fake();

        expect(VisitorBackupReminder::sendDue())->toBe([18]);
        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 1);
    });

    test('opsi test command hanya mengirim satu email', function () {
        Notification::fake();
        $this->travelTo(Carbon::parse('2026-06-01 10:00'));

        $this->artisan('visitors:backup-reminder', ['--test' => true])->assertSuccessful();

        Notification::assertSentOnDemand(VisitorBackupReminderNotification::class, 1);
    });

    test('opsi test command gagal bila tidak ada jam yang dikonfigurasi', function () {
        Notification::fake();
        config(['visitor.backup.reminder_hours' => []]);

        $this->artisan('visitors:backup-reminder', ['--test' => true])->assertFailed();
    });

    test('email memakai kanal mail dan menyebut tautan export', function () {
        $notification = new VisitorBackupReminderNotification(18, 1, 3);

        expect($notification->via(new stdClass))->toBe(['mail']);

        $mail = $notification->toMail(new stdClass);

        expect($mail)->toBeInstanceOf(MailMessage::class);
        expect($mail->subject)->toContain('visitor');
    });
});

describe('banner dashboard', function () {
    test('muncul pada 31 desember setelah jam pertama', function () {
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertSee('Data visitor bisa dibackup');
    });

    test('tidak muncul di luar jadwal', function () {
        $this->travelTo(Carbon::parse('2026-12-30 19:00'));

        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertDontSee('Data visitor bisa dibackup');
    });

    test('bisa ditutup lewat tautan', function () {
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        $this->actingAs($this->admin)
            ->get(route('admin.dashboard', ['dismiss_visitor_reminder' => 1]))
            ->assertOk()
            ->assertDontSee('Data visitor bisa dibackup');
    });

    test('user biasa tidak melihat banner karena tertolak lebih dulu', function () {
        $this->travelTo(Carbon::parse('2026-12-31 19:00'));

        $this->actingAs($this->regularUser)
            ->get(route('admin.dashboard'))
            ->assertForbidden();
    });
});

describe('sakelar pencatatan pengunjung', function () {
    test('tamu tidak bisa mengubah sakelar', function () {
        $this->post(route('admin.visitors.tracking.update'), ['enabled' => '0'])
            ->assertRedirect(route('login'));

        expect(VisitorTracking::isEnabled())->toBeTrue();
    });

    test('user biasa ditolak dengan 403', function () {
        $this->actingAs($this->regularUser)
            ->post(route('admin.visitors.tracking.update'), ['enabled' => '0'])
            ->assertForbidden();

        expect(VisitorTracking::isEnabled())->toBeTrue();
    });

    test('tanpa nilai enabled tidak diterima', function () {
        $this->actingAs($this->admin)
            ->post(route('admin.visitors.tracking.update'))
            ->assertSessionHasErrors('enabled');

        expect(VisitorTracking::isEnabled())->toBeTrue();
    });

    test('nilai yang bukan boolean ditolak', function () {
        $this->actingAs($this->admin)
            ->post(route('admin.visitors.tracking.update'), ['enabled' => 'mungkin'])
            ->assertSessionHasErrors('enabled');

        expect(VisitorTracking::isEnabled())->toBeTrue();
    });

    test('admin bisa mematikan pencatatan', function () {
        $this->actingAs($this->admin)
            ->post(route('admin.visitors.tracking.update'), ['enabled' => '0'])
            ->assertRedirect(route('admin.dashboard', ['tab' => 'overview']))
            ->assertSessionHas('success');

        expect(VisitorTracking::isEnabled())->toBeFalse();
    });

    test('admin bisa menyalakan pencatatan kembali', function () {
        VisitorTracking::setEnabled(false);

        $this->actingAs($this->admin)
            ->post(route('admin.visitors.tracking.update'), ['enabled' => '1'])
            ->assertRedirect(route('admin.dashboard', ['tab' => 'overview']));

        expect(VisitorTracking::isEnabled())->toBeTrue();
    });

    test('halaman depan tidak menambah baris saat pencatatan mati', function () {
        VisitorTracking::setEnabled(false);

        $this->get(route('home'))->assertOk();

        expect(VisitorLog::count())->toBe(0);
    });

    test('halaman depan tetap mencatat saat pencatatan hidup', function () {
        VisitorTracking::setEnabled(true);

        $this->get(route('home'))->assertOk();

        expect(VisitorLog::count())->toBe(1);
    });

    test('data lama tetap bisa diekspor saat pencatatan mati', function () {
        makeVisitor('2026-03-15');
        VisitorTracking::setEnabled(false);

        $csv = $this->actingAs($this->admin)
            ->get(route('admin.visitors.export'))
            ->streamedContent();

        expect($csv)->toContain('2026-03-15');
    });

    test('perawatan tetap berjalan meski pencatatan mati', function () {
        makeVisitor('2024-01-01');
        VisitorTracking::setEnabled(false);
        Cache::forget(VisitorLogMaintenance::MAINTENANCE_CHECK_KEY);

        $this->get(route('home'))->assertOk();

        expect(VisitorLog::whereDate('visit_date', '<', now()->subDays(365)->toDateString())->count())->toBe(0);
    });

    test('dashboard menampilkan status hidup dan tombol untuk mematikan', function () {
        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertSee('Pencatatan Pengunjung')
            ->assertSee('Nonaktifkan')
            ->assertSee('name="enabled" value="0"', false);
    });

    test('dashboard menampilkan status mati dan tombol untuk menyalakan', function () {
        VisitorTracking::setEnabled(false);

        $this->actingAs($this->admin)
            ->get(route('admin.dashboard'))
            ->assertOk()
            ->assertSee('Pencatatan Pengunjung')
            ->assertSee('Aktifkan Lagi')
            ->assertSee('name="enabled" value="1"', false)
            ->assertSee('Pencatatan pengunjung sedang dinonaktifkan');
    });
});
