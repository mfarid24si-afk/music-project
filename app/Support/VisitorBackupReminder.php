<?php

namespace App\Support;

use App\Notifications\VisitorBackupReminderNotification;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Sends the year-end "back up your visitor data" reminders.
 *
 * The host has no cron, so this is driven from the admin dashboard instead. That
 * has one honest consequence: if nobody opens the dashboard on 31 December, no
 * reminder is sent. Disk protection is unaffected, because trimming runs off
 * ordinary page views rather than off this class.
 *
 * Every reminder hour is guarded by its own date-scoped cache key, so each one
 * goes out at most once per year no matter how often the dashboard is reloaded.
 */
class VisitorBackupReminder
{
    /**
     * Send whatever reminders are due and have not gone out yet.
     *
     * A slot is only recorded as sent once the mailer accepted it. When delivery
     * fails the cache key is dropped again, so the next dashboard visit retries
     * instead of silently swallowing the reminder for the rest of the day.
     *
     * @param  bool  $force  Ignore the calendar window. Used by the artisan
     *                       command so mail delivery can be verified early.
     * @param  int|null  $onlyHour  Restrict the pass to a single reminder hour.
     * @return list<int> The reminder hours sent during this call.
     */
    public static function sendDue(bool $force = false, ?int $onlyHour = null): array
    {
        $hours = self::reminderHours();

        if ($hours === []) {
            return [];
        }

        $now = Carbon::now();

        if (! $force && ! static::isReminderWindowOpen($now)) {
            return [];
        }

        $sent = [];

        foreach ($hours as $index => $hour) {
            if ($onlyHour !== null && $hour !== $onlyHour) {
                continue;
            }

            if (! $force && $hour > (int) $now->hour) {
                continue;
            }

            $cacheKey = self::cacheKey($now, $hour);

            if (! Cache::add($cacheKey, true, $now->copy()->endOfDay())) {
                continue;
            }

            try {
                $delivered = self::send($hour, $index + 1, count($hours));
            } catch (\Throwable $e) {
                Cache::forget($cacheKey);
                Log::error('Visitor backup reminder could not be delivered.', [
                    'hour' => $hour,
                    'exception' => $e->getMessage(),
                ]);

                continue;
            }

            if (! $delivered) {
                Cache::forget($cacheKey);

                continue;
            }

            $sent[] = $hour;
        }

        return $sent;
    }

    /**
     * Whether the year-end reminder window is currently open.
     */
    public static function isReminderWindowOpen(?Carbon $now = null): bool
    {
        $hours = self::reminderHours();

        if ($hours === []) {
            return false;
        }

        $now ??= Carbon::now();

        return (int) $now->month === (int) config('visitor.backup.reminder_month', 12)
            && (int) $now->day === (int) config('visitor.backup.reminder_day', 31)
            && (int) $now->hour >= min($hours);
    }

    /**
     * Hand the reminder to the mailer.
     *
     * @return bool False when there is no usable recipient, which leaves the slot
     *              open for a later retry.
     */
    private static function send(int $hour, int $number, int $total): bool
    {
        $email = config('visitor.backup.notify_email');

        if (! is_string($email) || trim($email) === '') {
            Log::warning('Visitor backup reminder skipped: VISITOR_BACKUP_NOTIFY_EMAIL is not set.');

            return false;
        }

        Notification::route('mail', $email)
            ->notify(new VisitorBackupReminderNotification($hour, $number, $total));

        return true;
    }

    /**
     * The configured reminder hours, normalised to a re-indexed list of ints.
     *
     * @return list<int>
     */
    private static function reminderHours(): array
    {
        return array_values(array_map(
            'intval',
            (array) config('visitor.backup.reminder_hours', [])
        ));
    }

    private static function cacheKey(Carbon $now, int $hour): string
    {
        return 'visitor_backup_reminder_'.$now->format('Y-m-d').'_'.$hour;
    }
}
