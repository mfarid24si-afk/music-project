<?php

namespace App\Http\Controllers;

use App\Models\VisitorLog;
use App\Support\VisitorTracking;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminVisitorController extends Controller
{
    /**
     * Columns shipped in the export, in order.
     *
     * @var list<string>
     */
    private const EXPORT_COLUMNS = [
        'ip_hash',
        'path',
        'visit_date',
        'visit_hour',
        'created_at',
        'updated_at',
    ];

    /**
     * Turn visitor counting on or off from the dashboard.
     *
     * Only new page views stop being recorded. Rows that were already collected
     * stay untouched, the charts keep reading from them, and the export still
     * works, so switching counting off is reversible without losing anything.
     */
    public function updateTracking(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $enabled = (bool) $validated['enabled'];

        VisitorTracking::setEnabled($enabled);

        return redirect()
            ->route('admin.dashboard', ['tab' => 'overview'])
            ->with('success', $enabled
                ? 'Pencatatan pengunjung aktif lagi. Kunjungan berikutnya mulai dicatat.'
                : 'Pencatatan pengunjung dinonaktifkan. Kunjungan baru tidak dicatat; data lama dan grafik tetap utuh.');
    }

    /**
     * Stream visitor rows straight to the browser as CSV.
     *
     * Nothing is written to disk: the hosting plan only has 1 GB, and a year of
     * exports would compete with MySQL for the same space. Rows are read with
     * cursor() so memory stays flat no matter how many there are.
     */
    public function export(Request $request): StreamedResponse
    {
        $validated = $request->validate([
            'from' => ['nullable', 'date_format:Y-m-d'],
            'to' => ['nullable', 'date_format:Y-m-d', 'after_or_equal:from'],
        ]);

        $from = $validated['from'] ?? null;
        $to = $validated['to'] ?? null;

        $query = VisitorLog::query()->orderBy('visit_date')->orderBy('visit_hour')->orderBy('id');

        if ($from !== null) {
            $query->whereDate('visit_date', '>=', $from);
        }

        if ($to !== null) {
            $query->whereDate('visit_date', '<=', $to);
        }

        $filename = 'spotirid-visitor-'.Carbon::now()->format('Y-m-d-His').'.csv';

        return response()->streamDownload(function () use ($query): void {
            $handle = fopen('php://output', 'wb');

            if ($handle === false) {
                return;
            }

            fputcsv($handle, self::EXPORT_COLUMNS);

            foreach ($query->cursor() as $row) {
                fputcsv($handle, array_map(
                    static fn (string $column): string => (string) ($row->{$column} ?? ''),
                    self::EXPORT_COLUMNS
                ));
            }

            fclose($handle);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
}
