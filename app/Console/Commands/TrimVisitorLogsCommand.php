<?php

namespace App\Console\Commands;

use App\Models\VisitorLog;
use App\Support\VisitorLogMaintenance;
use Illuminate\Console\Command;

class TrimVisitorLogsCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'visitors:trim
                            {--days= : Override the configured retention window for this pass}
                            {--force : Apply the disk ceiling even while the table is under it}
                            {--dry-run : Report what would happen without deleting anything}';

    /**
     * @var string
     */
    protected $description = 'Delete expired visitor_logs rows and keep the table under its disk ceiling';

    public function handle(): int
    {
        $daysOption = $this->option('days');

        if ($daysOption !== null && ! is_numeric($daysOption)) {
            $this->error('The --days option must be a number.');

            return self::INVALID;
        }

        $retentionDays = $daysOption === null ? null : (int) $daysOption;

        if ($this->option('dry-run')) {
            $this->reportPreview($retentionDays);

            return self::SUCCESS;
        }

        $result = VisitorLogMaintenance::run($retentionDays, (bool) $this->option('force'));

        $this->line('Removed by age  : '.$result['deleted_by_age']);
        $this->line('Removed by size : '.$result['deleted_by_size']);
        $this->line('Size             : '.$result['size_before_mb'].' MB -> '.$result['size_after_mb'].' MB');
        $this->line('Rows remaining   : '.VisitorLog::query()->count());

        if ($result['trimmed_early']) {
            $this->warn('The disk ceiling was reached, so rows younger than the retention window went as well.');
            $this->warn('Raise VISITOR_DISK_THRESHOLD_MB only if the host genuinely has spare disk.');
        }

        return self::SUCCESS;
    }

    private function reportPreview(?int $retentionDays): void
    {
        $preview = VisitorLogMaintenance::preview($retentionDays);

        $this->line('Dry run - nothing will be deleted.');
        $this->line('  retention window : '.$preview['retention_days'].' days');
        $this->line('  disk ceiling     : '.$preview['disk_threshold_mb'].' MB');
        $this->line('  current size     : '.$preview['size_mb'].' MB');
        $this->line('  total rows       : '.$preview['total_rows']);
        $this->line('  past retention   : '.$preview['rows_past_retention']);

        if ($preview['over_threshold']) {
            $this->line('  ceiling exceeded : yes, the oldest rows would also be removed');
        }
    }
}
