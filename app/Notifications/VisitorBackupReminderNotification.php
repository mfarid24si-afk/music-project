<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Nudges the administrator to export visitor data before the year closes.
 *
 * Deliberately not queued. The host has no queue worker and no cron, so a
 * queued notification would simply sit in the jobs table forever.
 */
class VisitorBackupReminderNotification extends Notification
{
    public function __construct(
        public readonly int $reminderHour,
        public readonly int $reminderNumber,
        public readonly int $reminderTotal,
    ) {}

    /**
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $retentionDays = (int) config('visitor.retention_days', 365);

        return (new MailMessage)
            ->subject('Spotirid: data visitor bisa dibackup sekarang')
            ->greeting('Halo Admin Spotirid')
            ->line(sprintf(
                'Ini pengingat ke-%d dari %d. Peringatan Berlaku setiap tahun pada tanggal %d, pukul %s.',
                $this->reminderNumber,
                $this->reminderTotal,
                (int) config('visitor.backup.reminder_day', 31),
                sprintf('%02d:00', $this->reminderHour)
            ))
            ->line('Kalau kamu ingin mencadangkan data visitor, unduh sekarang lewat tombol di bawah.')
            ->action('Export Data Visitor', route('admin.visitors.export'))
            ->line(sprintf(
                'Kalau tidak diunduh, data tetap dihapus otomatis setelah %d hari. Ekspor bersifat opsional, hanya untuk pencadangan.',
                $retentionDays
            ))
            ->line('File diunduh langsung ke perangkat kamu, tidak disimpan di server.');
    }
}
