<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect theme preference and apply it immediately to avoid FOUC --}}
        <script>
            (function() {
                try {
                    const mode = localStorage.getItem('spotify_ultra_color_mode') || localStorage.getItem('appearance') || '{{ $appearance ?? "system" }}';
                    let isDark = true;
                    if (mode === 'light') {
                        isDark = false;
                    } else if (mode === 'system') {
                        isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
                    }
                    const root = document.documentElement;
                    root.classList.remove('light', 'dark');
                    root.classList.add(isDark ? 'dark' : 'light');
                    root.style.colorScheme = isDark ? 'dark' : 'light';
                    var meta = document.querySelector('meta[name="theme-color"]');
                    if (meta) {
                        meta.setAttribute('content', isDark ? '#121316' : '#f4f5f8');
                    } else {
                        meta = document.createElement('meta');
                        meta.setAttribute('name', 'theme-color');
                        meta.setAttribute('content', isDark ? '#121316' : '#f4f5f8');
                        document.head.appendChild(meta);
                    }
                } catch (e) {
                    // ignore
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <meta name="app-url" content="{{ url('/') }}">
        <meta name="asset-url" content="{{ asset('/') }}">
        <meta name="theme-color" content="#121316">

        <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any">
        <link rel="icon" href="{{ asset('favicon.svg') }}" type="image/svg+xml">
        <link rel="apple-touch-icon" href="{{ asset('apple-touch-icon.png') }}">

        {{-- Boot-failure safety net: if @vite assets 404 (e.g. public/build not
             deployed) or JS throws before mounting, the user must never be left
             staring at an unexplained black screen. --}}
        <style>
            #spotirid-boot-error {
                position: fixed;
                inset: 0;
                z-index: 2147483647;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 24px;
                background: #121316;
                color: #f3f3f5;
                font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
                text-align: center;
            }
            #spotirid-boot-error.is-visible { display: flex; }
            #spotirid-boot-error .card {
                max-width: 440px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px;
                padding: 28px 24px;
                background: rgba(255, 255, 255, 0.03);
            }
            #spotirid-boot-error h1 { font-size: 18px; margin: 0 0 8px; }
            #spotirid-boot-error p { font-size: 13px; line-height: 1.5; color: #9a9ca6; margin: 0 0 16px; }
            #spotirid-boot-error pre {
                text-align: left;
                font-size: 11px;
                line-height: 1.5;
                white-space: pre-wrap;
                word-break: break-word;
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 10px;
                padding: 10px 12px;
                color: #ffb3b3;
                margin: 0 0 16px;
            }
            #spotirid-boot-error button {
                font: inherit;
                font-weight: 600;
                cursor: pointer;
                border: none;
                border-radius: 999px;
                padding: 10px 20px;
                background: #ccf228;
                color: #000;
            }
        </style>
        <script>
            (function () {
                var shown = false;
                window.__spotiridShowBootError = function (detail) {
                    if (shown) return;
                    shown = true;
                    try { sessionStorage.removeItem('spotirid_booted'); } catch (e) {}
                    var el = document.getElementById('spotirid-boot-error');
                    if (!el) {
                        el = document.createElement('div');
                        el.id = 'spotirid-boot-error';
                        el.className = 'card';
                        el.innerHTML =
                            '<div class="card"><h1>Spotirid gagal dimuat</h1>' +
                            '<p>Aplikasi tidak dapat dimulai di perangkat ini. Coba muat ulang halaman, atau periksa koneksi.</p>' +
                            '<pre></pre>' +
                            '<button type="button" onclick="location.reload()">Muat Ulang</button></div>';
                        document.body.appendChild(el);
                    }
                    var pre = el.querySelector('pre');
                    if (pre) pre.textContent = detail || 'Unknown boot error.';
                    el.classList.add('is-visible');
                };
                window.addEventListener('error', function (e) {
                    if (e.target && (e.target.tagName === 'SCRIPT' || e.target.tagName === 'LINK')) {
                        window.__spotiridShowBootError('Failed to load asset: ' + (e.target.src || e.target.href));
                    }
                }, true);
                window.addEventListener('unhandledrejection', function (e) {
                    window.__spotiridShowBootError('Unhandled error: ' + (e.reason && e.reason.message ? e.reason.message : e.reason));
                });
                setTimeout(function () {
                    if (!document.querySelector('#app, [data-page]')) {
                        window.__spotiridShowBootError('App did not mount within 8s. The Vite bundle may be missing (public/build).');
                    }
                }, 8000);
            })();
        </script>

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap" rel="stylesheet">
        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ config('app.name', 'Spotirid') }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
        <div id="spotirid-boot-error" role="alert"></div>
        <noscript>
            <div id="spotirid-boot-error" class="is-visible">
                <div class="card">
                    <h1>JavaScript diperlukan</h1>
                    <p>Spotirid membutuhkan JavaScript untuk berjalan. Aktifkan JavaScript di browser Anda, lalu muat ulang halaman.</p>
                </div>
            </div>
        </noscript>
    </body>
</html>
