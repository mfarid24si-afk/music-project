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

        <link rel="icon" href="/favicon.ico" sizes="any">
        <link rel="icon" href="/favicon.svg" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png">

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
    </body>
</html>
