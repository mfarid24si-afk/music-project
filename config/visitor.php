<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Visitor Log Retention
    |--------------------------------------------------------------------------
    |
    | How long raw visitor rows are kept before the periodic trim removes them.
    | The trim runs on its own, whether or not anyone ever exports the data, so
    | this is the hard upper bound on how old a row can get.
    |
    */

    'retention_days' => (int) env('VISITOR_RETENTION_DAYS', 365),

    /*
    |--------------------------------------------------------------------------
    | Disk Safety Valve
    |--------------------------------------------------------------------------
    |
    | The hosting plan only has 1 GB of disk, so the visitor table is capped well
    | below that. When the table grows past this ceiling the trim drops its oldest
    | rows regardless of age. In practice this means retention_days is a target,
    | not a guarantee: on a busy site the ceiling is reached long before a full
    | year has passed, and an alert is logged whenever that happens.
    |
    */

    'disk_threshold_mb' => (int) env('VISITOR_DISK_THRESHOLD_MB', 190),

    /*
    |--------------------------------------------------------------------------
    | Maintenance Cadence
    |--------------------------------------------------------------------------
    |
    | No cron is available on the target host, so maintenance rides along with
    | ordinary page views. The visitor route checks a cache key first so the
    | database query for the table size runs at most once per interval instead of
    | on every single request.
    |
    */

    'maintenance_check_minutes' => (int) env('VISITOR_MAINTENANCE_CHECK_MINUTES', 60),

    'trim_batch_size' => (int) env('VISITOR_TRIM_BATCH_SIZE', 500),

    /*
    | On-disk cost of a single row, index overhead included. This is the basis for
    | the row budget that keeps the table under the ceiling, so it has to be a
    | stable number: deriving it from the live table size would compound every
    | pass and delete far more rows than the ceiling requires, because InnoDB
    | never shrinks its tablespace after a DELETE.
    |
    */

    'estimated_bytes_per_row' => (int) env('VISITOR_ESTIMATED_BYTES_PER_ROW', 2560),

    /*
    | Rows the disk safety valve must never delete, however far over the ceiling
    | the table is. Without this floor a full disk would wipe the visitor history
    | completely instead of trading some history for a running site.
    |
    */

    'min_rows_after_trim' => (int) env('VISITOR_MIN_ROWS_AFTER_TRIM', 1000),

    /*
    |--------------------------------------------------------------------------
    | Year End Backup Reminder
    |--------------------------------------------------------------------------
    |
    | Three nudges on 31 December reminding the administrator that the visitor
    | data can still be exported. Nothing is written to disk and no archive file
    | is created: exporting stays a manual action through the dashboard button.
    |
    | Each reminder hour sends at most once. The cache keys are namespaced per
    | date, so the reminder runs again the following year.
    |
    | @see \App\Support\VisitorBackupReminder::sendDue()
    |
    */

    'backup' => [
        'notify_email' => env('VISITOR_BACKUP_NOTIFY_EMAIL'),
        'reminder_month' => (int) env('VISITOR_BACKUP_REMINDER_MONTH', 12),
        'reminder_day' => (int) env('VISITOR_BACKUP_REMINDER_DAY', 31),
        'reminder_hours' => array_values(array_filter(array_map(
            'intval',
            explode(',', (string) env('VISITOR_BACKUP_REMINDER_HOURS', '18,20,22'))
        ))),
    ],

];
