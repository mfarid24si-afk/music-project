<?php

use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

$app = Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();

if (isset($_ENV['VERCEL']) || isset($_SERVER['VERCEL'])) {
    $storagePath = '/tmp/storage';
    try {
        @mkdir($storagePath, 0777, true);
        @mkdir($storagePath.'/framework/views', 0777, true);
        @mkdir($storagePath.'/framework/cache', 0777, true);
        @mkdir($storagePath.'/framework/sessions', 0777, true);
        @mkdir($storagePath.'/logs', 0777, true);
    } catch (Throwable $e) {
    }
    $app->useStoragePath($storagePath);
}

// Guard against a stray Vite "hot" file reaching production (e.g. via a
// file-upload deploy such as Alwaysdata). If present, @vite emits dev-server
// URLs (http://[::1]:5173) and every page renders blank. The hot file is only
// meaningful for local `npm run dev`, so drop it when running in production.
$app->booted(function () use ($app): void {
    if (! $app->environment('production')) {
        return;
    }
    if (is_file($hotFile = $app->publicPath('hot'))) {
        @unlink($hotFile);
    }
});

return $app;
