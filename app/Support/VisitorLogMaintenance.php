<?php

namespace App\Support;

use App\Models\VisitorLog;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Keeps the visitor_logs table inside the hosting plan's disk budget.
 *
 * Two independent rules apply, and the size rule wins when they disagree:
 *
 *   1. Age: rows older than `visitor.retention_days` are removed.
 *   2. Size: once the table passes `visitor.disk_threshold_mb`, its oldest rows
 *      are removed regardless of age, because a full disk takes MySQL down.
 *
 * The second rule is why retention is a target rather than a promise. On a busy
 * site the ceiling arrives long before a full year has passed, so every early
 * trim is written to the log as a warning rather than done quietly.
 *
 * Nothing here ever drops the table, and only rows from visitor_logs are
 * touched.
 */
class VisitorLogMaintenance
{
    /**
     * Summary of one maintenance pass.
     *
     * @phpstan-type MaintenanceResult array{
     *     ran: bool,
     *     deleted_by_age: int,
     *     deleted_by_size: int,
     *     size_before_mb: float,
     *     size_after_mb: float,
     *     trimmed_early: bool
     * }
     */
    public const MAINTENANCE_CHECK_KEY = 'visitor_maintenance_checked_at';

    /**
     * Run maintenance at most once per configured interval.
     *
     * The host has no cron, so this rides along with ordinary page views. The
     * cache guard is what keeps it cheap: without it every single request would
     * hit information_schema for the table size.
     *
     * @return MaintenanceResult|null null when the check is still cooling down
     */
    public static function runIfNeeded(): ?array
    {
        $minutes = max(1, (int) config('visitor.maintenance_check_minutes', 60));

        $acquired = Cache::add(self::MAINTENANCE_CHECK_KEY, now()->timestamp, now()->addMinutes($minutes));

        if (! $acquired) {
            return null;
        }

        return self::run();
    }

    /**
     * Apply the age rule, then the size rule.
     *
     * @param  int|null  $retentionDays  Overrides `visitor.retention_days` for this pass.
     * @param  bool  $force  Apply the size rule even while under the ceiling.
     * @return MaintenanceResult
     */
    public static function run(?int $retentionDays = null, bool $force = false): array
    {
        $retentionDays ??= (int) config('visitor.retention_days', 365);
        $thresholdMb = (float) config('visitor.disk_threshold_mb', 190);

        $sizeBeforeMb = static::sizeInMb();
        $deletedByAge = static::deleteOlderThan(Carbon::now()->subDays(max(0, $retentionDays)));

        $deletedBySize = 0;

        if ($force || static::sizeInMb() > $thresholdMb) {
            $deletedBySize = static::deleteUntilUnderThreshold($thresholdMb);
        }

        $result = [
            'ran' => true,
            'deleted_by_age' => $deletedByAge,
            'deleted_by_size' => $deletedBySize,
            'size_before_mb' => $sizeBeforeMb,
            'size_after_mb' => static::sizeInMb(),
            'trimmed_early' => $deletedBySize > 0,
        ];

        if ($deletedBySize > 0) {
            Log::warning('visitor_logs trimmed early to stay under the disk ceiling', $result);
        }

        return $result;
    }

    /**
     * Report what a pass would touch, without deleting a single row.
     *
     * @phpstan-type MaintenancePreview array{
     *     total_rows: int,
     *     rows_past_retention: int,
     *     size_mb: float,
     *     disk_threshold_mb: float,
     *     over_threshold: bool,
     *     retention_days: int
     * }
     *
     * @return MaintenancePreview
     */
    public static function preview(?int $retentionDays = null): array
    {
        $retentionDays ??= (int) config('visitor.retention_days', 365);
        $cutoff = Carbon::now()->subDays(max(0, $retentionDays));
        $thresholdMb = (float) config('visitor.disk_threshold_mb', 190);
        $sizeMb = static::sizeInMb();

        return [
            'total_rows' => VisitorLog::query()->count(),
            'rows_past_retention' => VisitorLog::query()
                ->whereDate('visit_date', '<', $cutoff->format('Y-m-d'))
                ->count(),
            'size_mb' => $sizeMb,
            'disk_threshold_mb' => $thresholdMb,
            'over_threshold' => $sizeMb > $thresholdMb,
            'retention_days' => $retentionDays,
        ];
    }

    /**
     * Current on-disk footprint of the visitor table, in megabytes.
     */
    public static function sizeInMb(): float
    {
        $connection = DB::connection();
        $table = (new VisitorLog)->getTable();

        if ($connection->getDriverName() === 'sqlite') {
            return round(static::estimatedBytesPerRow() * $connection->table($table)->count() / 1048576, 4);
        }

        $measured = $connection->selectOne(
            'select (data_length + index_length) / 1048576 as megabytes
             from information_schema.tables
             where table_schema = database() and table_name = ?',
            [$table]
        );

        return round((float) ($measured->megabytes ?? 0), 2);
    }

    /**
     * Remove rows whose visit_date is older than the given date.
     */
    private static function deleteOlderThan(Carbon $cutoff): int
    {
        $deleted = 0;

        while (true) {
            $ids = VisitorLog::query()
                ->whereDate('visit_date', '<', $cutoff->format('Y-m-d'))
                ->orderBy('id')
                ->limit(static::batchSize())
                ->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $removed = VisitorLog::query()->whereIn('id', $ids)->delete();
            $deleted += $removed;

            if ($removed === 0) {
                break;
            }
        }

        return $deleted;
    }

    /**
     * Drop the oldest rows until the table fits the disk budget again.
     *
     * The row budget is derived from a fixed per-row cost rather than from the
     * live table size. That distinction matters: InnoDB frees pages internally
     * on DELETE but never shrinks DATA_LENGTH, so a loop that waits for the
     * reported size to drop would keep deleting forever and empty the table. A
     * fixed budget converges on the first pass instead.
     *
     * `visitor.min_rows_after_trim` is the floor that stops a full disk from
     * turning into a total loss of analytics data.
     */
    private static function deleteUntilUnderThreshold(float $thresholdMb): int
    {
        $targetRows = static::targetRowCount($thresholdMb);
        $totalRows = VisitorLog::query()->count();
        $excess = $totalRows - $targetRows;

        if ($excess <= 0) {
            return 0;
        }

        return static::deleteOldestRows($excess);
    }

    /**
     * How many rows fit inside the ceiling, given the configured per-row cost.
     */
    private static function targetRowCount(float $thresholdMb): int
    {
        $bytesPerRow = max(1, (int) config('visitor.estimated_bytes_per_row', 2560));
        $budgetRows = (int) floor(($thresholdMb * 1048576) / $bytesPerRow);
        $floorRows = max(0, (int) config('visitor.min_rows_after_trim', 1000));

        return max($budgetRows, $floorRows);
    }

    /**
     * Delete at most $maxRows, oldest first, in batches.
     */
    private static function deleteOldestRows(int $maxRows): int
    {
        $deleted = 0;
        $remaining = $maxRows;

        while ($remaining > 0) {
            $ids = VisitorLog::query()
                ->orderBy('visit_date')
                ->orderBy('id')
                ->limit(min(static::batchSize(), $remaining))
                ->pluck('id');

            if ($ids->isEmpty()) {
                break;
            }

            $removed = VisitorLog::query()->whereIn('id', $ids)->delete();
            $deleted += $removed;
            $remaining -= $removed;

            if ($removed === 0) {
                break;
            }
        }

        return $deleted;
    }

    private static function batchSize(): int
    {
        return max(1, (int) config('visitor.trim_batch_size', 500));
    }

    /**
     * Configured on-disk cost of one row, index overhead included.
     */
    private static function estimatedBytesPerRow(): int
    {
        return max(1, (int) config('visitor.estimated_bytes_per_row', 2560));
    }
}
