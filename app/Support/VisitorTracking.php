<?php

namespace App\Support;

use App\Models\VisitorLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Decides whether a page view gets recorded, and records it when it does.
 *
 * The switch lives in the cache rather than in config so the administrator can
 * flip it from the dashboard without a deploy or an .env edit. Config stays the
 * fallback, which means a flushed cache falls back to the shipped default instead
 * of leaving counting in an undefined state.
 *
 * Maintenance is deliberately outside this gate. Trimming protects the disk
 * budget of rows that have already been recorded, so it keeps running while
 * counting is paused.
 *
 * @see VisitorLogMaintenance
 */
class VisitorTracking
{
    /**
     * Cache key holding the administrator's current choice.
     */
    public const STATE_KEY = 'visitor_tracking_enabled';

    /**
     * Whether new page views are currently being recorded.
     */
    public static function isEnabled(): bool
    {
        return (bool) Cache::get(
            self::STATE_KEY,
            (bool) config('visitor.tracking_enabled', true)
        );
    }

    /**
     * Turn counting on or off.
     */
    public static function setEnabled(bool $enabled): void
    {
        Cache::forever(self::STATE_KEY, $enabled);
    }

    /**
     * Record one page view, at most once per IP per hour.
     *
     * The raw IP never reaches the database: it only feeds a hash that rotates
     * daily, so the table cannot be read back into a list of visitors.
     *
     * Returns the stored row, or null when counting is switched off or this IP
     * has already been counted within the last hour.
     */
    public static function record(Request $request): ?VisitorLog
    {
        if (! self::isEnabled()) {
            return null;
        }

        $ip = $request->ip() ?: '127.0.0.1';
        $ipHash = md5($ip.date('Y-m-d'));
        $dedupeKey = self::dedupeKey($ipHash);

        if (Cache::has($dedupeKey)) {
            return null;
        }

        Cache::put($dedupeKey, 1, 3600);

        return VisitorLog::create([
            'ip_hash' => $ipHash,
            'path' => $request->path() ?: '/',
            'visit_date' => date('Y-m-d'),
            'visit_hour' => (int) date('G'),
        ]);
    }

    /**
     * Hourly dedupe key for one visitor.
     */
    private static function dedupeKey(string $ipHash): string
    {
        return 'visitor_logged_'.$ipHash.'_'.date('H');
    }
}
