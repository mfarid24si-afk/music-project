<?php

namespace App\Console\Commands;

use App\Support\VisitorBackupReminder;
use Illuminate\Console\Command;

class SendVisitorBackupReminderCommand extends Command
{
    /**
     * @var string
     */
    protected $signature = 'visitors:backup-reminder {--test : Send one reminder immediately, ignoring the calendar}';

    /**
     * @var string
     */
    protected $description = 'Send the year-end reminder that visitor data can still be exported';

    public function handle(): int
    {
        $isTest = (bool) $this->option('test');

        if ($isTest) {
            $hours = (array) config('visitor.backup.reminder_hours', []);

            if ($hours === []) {
                $this->error('No reminder hours are configured, so there is nothing to send.');

                return self::FAILURE;
            }

            // Only the first slot goes out, so verifying mail does not look like
            // the real 18:00/20:00/22:00 sequence and does not fill the inbox.
            VisitorBackupReminder::sendDue(force: true, onlyHour: (int) $hours[0]);

            $this->info('Test reminder dispatched to '.config('visitor.backup.notify_email'));
            $this->line('Mailer: '.config('mail.default').' from '.config('mail.from.address'));

            return self::SUCCESS;
        }

        $sent = VisitorBackupReminder::sendDue();

        if ($sent === []) {
            $this->line('Nothing due. Reminders only go out on the configured date after the first hour.');

            return self::SUCCESS;
        }

        foreach ($sent as $hour) {
            $this->line("Sent reminder for {$hour}:00");
        }

        return self::SUCCESS;
    }
}
