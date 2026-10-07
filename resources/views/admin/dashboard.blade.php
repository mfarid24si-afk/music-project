<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard - Spotirid</title>
  <style>
    #page-loader {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 9999;
      overflow: hidden;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.25s ease;
      background: color-mix(in oklab, var(--accent) 20%, transparent);
    }
    #page-loader[aria-busy='true'] { opacity: 1; }
    #page-loader > span {
      display: block;
      height: 100%;
      width: 100%;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent-glow);
      transform: scaleX(0);
      transform-origin: left center;
    }
    #page-loader[aria-busy='true'] > span {
      animation: page-loader-fill 2.4s cubic-bezier(0.33, 1, 0.68, 1) forwards;
    }
    @keyframes page-loader-fill {
      from { transform: scaleX(0); }
      to   { transform: scaleX(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      #page-loader[aria-busy='true'] > span {
        animation: none;
        transform: scaleX(1);
      }
    }
  </style>
  <script>
    (function () {
      var LOADER_ID = 'page-loader';

      function element() {
        var existing = document.getElementById(LOADER_ID);
        if (existing) { return existing; }

        var created = document.createElement('div');
        created.id = LOADER_ID;
        created.setAttribute('aria-hidden', 'true');
        created.innerHTML = '<span></span>';
        document.body.appendChild(created);
        return created;
      }

      function show() {
        element().setAttribute('aria-busy', 'true');
      }

      function hide() {
        var el = document.getElementById(LOADER_ID);
        if (el) { el.removeAttribute('aria-busy'); }
      }

      function isPlainLink(event) {
        if (event.defaultPrevented || event.button !== 0) { return false; }
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return false; }

        var anchor = event.target.closest && event.target.closest('a[href]');
        if (!anchor) { return false; }
        if (anchor.target && anchor.target !== '_self') { return false; }
        if (anchor.hasAttribute('download')) { return false; }

        var url = new URL(anchor.href, window.location.href);
        return url.origin === window.location.origin;
      }

      document.addEventListener('click', function (event) {
        if (isPlainLink(event)) { show(); }
      }, true);

      document.addEventListener('submit', function (event) {
        var form = event.target;
        if (form.target && form.target !== '_self') { return; }
        show();
      }, true);

      window.addEventListener('pageshow', hide);
    })();
  </script>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccf228' stroke-width='2'><circle cx='12' cy='12' r='10'/><circle cx='12' cy='12' r='3'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
  <!-- Chart.js CDN for Analytics Visualizations -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <!-- GSAP animations for the admin dashboard -->
  @vite(['resources/js/lib/admin-animations.ts'])
  <script>
    (function() {
      const savedTheme = localStorage.getItem('spotirid_admin_theme') || 'default';
      const savedMode = localStorage.getItem('spotirid_admin_mode') || 'dark';
      if (savedTheme !== 'default') {
        document.documentElement.setAttribute('data-theme', savedTheme);
      }
      if (savedMode === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    })();
  </script>
  <style>
    :root {
      --bg-primary: #0d0e11;
      --bg-surface: #17181c;
      --bg-elevated: #202227;
      --border-subtle: rgba(255, 255, 255, 0.08);
      --border-accent: rgba(204, 242, 40, 0.35);
      --accent: #ccf228;
      --accent-hover: #dbfa43;
      --accent-glow: rgba(204, 242, 40, 0.22);
      --danger: #ef4444;
      --danger-bg: rgba(239, 68, 68, 0.12);
      --success: #22c55e;
      --success-bg: rgba(34, 197, 94, 0.12);
      --warning: #f59e0b;
      --warning-bg: rgba(245, 158, 11, 0.12);
      --text-main: #f3f3f5;
      --text-muted: #9a9ca6;
      --font-body: 'Hanken Grotesk', -apple-system, sans-serif;
      --font-mono: 'Space Grotesk', monospace;
    }

    /* Theme Color Variations (Identical to User Player) */
    [data-theme="purple"] {
      --accent: #a855f7;
      --accent-hover: #c084fc;
      --accent-glow: rgba(168, 85, 247, 0.25);
      --border-accent: rgba(168, 85, 247, 0.4);
    }
    [data-theme="blue"] {
      --accent: #3b82f6;
      --accent-hover: #60a5fa;
      --accent-glow: rgba(59, 130, 246, 0.25);
      --border-accent: rgba(59, 130, 246, 0.4);
    }
    [data-theme="cyberpunk"] {
      --accent: #ec4899;
      --accent-hover: #f472b6;
      --accent-glow: rgba(236, 72, 153, 0.25);
      --border-accent: rgba(236, 72, 153, 0.4);
    }
    [data-theme="sunset"] {
      --accent: #f97316;
      --accent-hover: #fb923c;
      --accent-glow: rgba(249, 115, 22, 0.25);
      --border-accent: rgba(249, 115, 22, 0.4);
    }
    [data-theme="ocean"] {
      --accent: #06b6d4;
      --accent-hover: #22d3ee;
      --accent-glow: rgba(6, 182, 212, 0.25);
      --border-accent: rgba(6, 182, 212, 0.4);
    }

    /* Light Mode Overrides */
    html.light {
      color-scheme: light;
      --bg-primary: #f4f5f8;
      --bg-surface: #ffffff;
      --bg-elevated: #eaecf1;
      --border-subtle: rgba(0, 0, 0, 0.08);
      --text-main: #111215;
      --text-muted: #555866;
    }
    html.light body {
      background: var(--bg-primary);
      color: var(--text-main);
    }
    html.light .admin-header {
      background: rgba(255, 255, 255, 0.96);
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }
    html.light .header-title,
    html.light .admin-chip span {
      color: #111215;
    }
    html.light .bento-card,
    html.light .section-card,
    html.light .table-container,
    html.light .tab-nav {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.08);
      box-shadow: 0 4px 18px rgba(0, 0, 0, 0.03);
    }
    html.light .bento-val,
    html.light .section-title,
    html.light .song-title {
      color: #111215;
    }
    html.light .form-control {
      background: #f4f5f8;
      border-color: rgba(0, 0, 0, 0.12);
      color: #111215;
    }
    html.light .form-control:focus {
      background: #ffffff;
    }
    html.light th {
      background: #f8f9fa;
      color: #4b4e5a;
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }
    html.light td {
      border-bottom-color: rgba(0, 0, 0, 0.06);
      color: #111215;
    }
    html.light tr:hover td {
      background: #f8f9fa;
    }
    html.light .tab-btn {
      color: #555866;
    }
    html.light .tab-btn.active {
      background: #eaecf1;
      color: #111215;
    }
    html.light .btn-ghost {
      background: rgba(0, 0, 0, 0.05);
      border-color: rgba(0, 0, 0, 0.08);
      color: #111215;
    }
    html.light .btn-ghost:hover {
      background: rgba(0, 0, 0, 0.1);
      color: #000;
    }
    html.light .badge-subtle {
      background: #eaecf1;
      color: #4b4e5a;
    }
    html.light .modal-content {
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.12);
      color: #111215;
    }
    html.light .modal-head {
      border-bottom-color: rgba(0, 0, 0, 0.08);
    }
    html.light .modal-title {
      color: #111215;
    }

    /* Theme & Mode Control UI Elements */
    .mode-toggle-group {
      display: inline-flex;
      background: var(--bg-elevated);
      padding: 4px;
      border-radius: 50px;
      border: 1px solid var(--border-subtle);
      gap: 4px;
    }
    .mode-btn {
      padding: 8px 18px;
      border-radius: 50px;
      border: none;
      background: transparent;
      color: var(--text-muted);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
    }
    .mode-btn.active {
      background: var(--accent);
      color: #000;
      box-shadow: 0 4px 14px var(--accent-glow);
    }
    .theme-swatches {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
    .theme-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid transparent;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
    }
    .theme-btn:hover {
      transform: scale(1.15);
    }
    .theme-btn.active {
      border-color: #ffffff;
      box-shadow: 0 0 0 3px var(--accent), 0 4px 14px rgba(0, 0, 0, 0.35);
      transform: scale(1.1);
    }
    .theme-btn.active::after {
      content: '✓';
      color: #000;
      font-weight: 900;
      font-size: 14px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg-primary);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .icon {
      width: 16px;
      height: 16px;
      stroke-width: 2;
      stroke: currentColor;
      fill: none;
      stroke-linecap: round;
      stroke-linejoin: round;
      display: inline-block;
      vertical-align: middle;
      flex-shrink: 0;
    }
    .icon-sm { width: 13px; height: 13px; }
    .icon-lg { width: 20px; height: 20px; }
    .admin-header {
      background: rgba(23, 24, 28, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border-subtle);
      position: sticky;
      top: 0;
      z-index: 50;
      padding: 0 24px;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }
    .header-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
      color: #fff;
    }
    .header-logo {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-accent);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--accent);
    }
    .header-title {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: -0.3px;
    }
    .header-subtitle {
      font-size: 10px;
      font-family: var(--font-mono);
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border-radius: 50px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      text-decoration: none;
      font-size: 12px;
      font-weight: 600;
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .btn-ghost:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
    .admin-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px 4px 6px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 50px;
      font-size: 12px;
    }
    .avatar-sm {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--accent);
      color: #000;
      font-weight: 800;
      font-size: 10px;
      font-family: var(--font-mono);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .admin-container {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 24px 20px 80px;
      flex: 1;
    }
    .tab-nav {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 24px;
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 12px;
      overflow-x: auto;
    }
    .tab-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 50px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      color: var(--text-muted);
      background: transparent;
      border: 1px solid transparent;
      transition: all 0.2s ease;
      white-space: nowrap;
    }
    .tab-btn:hover {
      color: #fff;
      background: rgba(255, 255, 255, 0.04);
    }
    .tab-btn.active {
      background: var(--accent);
      color: #000;
      box-shadow: 0 4px 16px var(--accent-glow);
    }
    .badge-count {
      padding: 2px 7px;
      border-radius: 50px;
      font-size: 10px;
      font-family: var(--font-mono);
      font-weight: 800;
      background: #ef4444;
      color: #fff;
    }
    .tab-btn.active .badge-count {
      background: #000;
      color: var(--accent);
    }
    .bento-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .bento-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 16px;
      padding: 20px;
      position: relative;
      overflow: hidden;
      transition: all 0.2s ease;
    }
    .bento-card:hover {
      border-color: var(--border-accent);
      transform: translateY(-2px);
    }
    .bento-title {
      font-size: 12px;
      font-weight: 600;
      font-family: var(--font-mono);
      text-transform: uppercase;
      color: var(--text-muted);
      letter-spacing: 0.5px;
    }
    .bento-value {
      font-size: 32px;
      font-weight: 800;
      color: #fff;
      margin-top: 8px;
      letter-spacing: -1px;
    }
    .bento-desc {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    /* Section Cards */
    .section-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      gap: 12px;
      flex-wrap: wrap;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-subtitle {
      font-size: 12px;
      color: var(--text-muted);
      margin-top: 2px;
    }
    /* Analytics Filter Pill Buttons */
    .filter-group {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 50px;
      padding: 4px;
      flex-wrap: wrap;
    }
    .chart-filter-btn {
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      font-family: var(--font-mono);
      border: none;
      background: transparent;
      color: var(--text-muted);
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .chart-filter-btn:hover {
      color: #fff;
    }
    .chart-filter-btn.active {
      background: var(--accent);
      color: #000;
      box-shadow: 0 2px 8px var(--accent-glow);
    }
    /* Table Styling */
    .table-responsive {
      width: 100%;
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
      text-align: left;
    }
    th {
      padding: 12px 14px;
      border-bottom: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    td {
      padding: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      vertical-align: middle;
    }
    tr:hover td {
      background: rgba(255, 255, 255, 0.02);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 3px 8px;
      border-radius: 50px;
      font-size: 10px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-pending {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .badge-approved {
      background: var(--success-bg);
      color: var(--success);
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .badge-rejected {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
      text-decoration: none;
    }
    .btn-approve {
      background: var(--success);
      color: #000;
    }
    .btn-approve:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .btn-danger {
      background: var(--danger-bg);
      color: var(--danger);
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .btn-danger:hover {
      background: var(--danger);
      color: #fff;
    }
    .btn-warning {
      background: var(--warning-bg);
      color: var(--warning);
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .btn-warning:hover {
      background: var(--warning);
      color: #000;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 14px;
    }
    .form-group label {
      font-size: 11px;
      font-family: var(--font-mono);
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
    }
    .form-control {
      width: 100%;
      height: 42px;
      padding: 0 14px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 8px;
      color: #fff;
      font-size: 13px;
      outline: none;
      transition: border 0.2s;
    }
    .form-control:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 2px var(--accent-glow);
    }
    .btn-primary {
      background: var(--accent);
      color: #000;
      font-weight: 800;
      padding: 10px 24px;
      border-radius: 50px;
      border: none;
      cursor: pointer;
      font-size: 13px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 16px var(--accent-glow);
    }
    .btn-primary:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }
    .alert {
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .alert-success { background: var(--success-bg); border: 1px solid rgba(34, 197, 94, 0.3); color: #86efac; }
    .alert-error { background: var(--danger-bg); border: 1px solid rgba(239, 68, 68, 0.3); color: #fca5a5; }
    .alert-info { background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.3); color: #93c5fd; }

    .thumb {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .song-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .song-title {
      font-weight: 700;
      color: #fff;
    }
    .song-artist {
      font-size: 11px;
      color: var(--text-muted);
    }
    .mode-toggle {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .mode-btn {
      padding: 6px 14px;
      border-radius: 50px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
    }
    .mode-btn.active {
      background: var(--accent);
      color: #000;
      border-color: var(--accent);
    }
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(6px);
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      max-width: 520px;
      width: 100%;
      padding: 24px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    }
  </style>
</head>
<body>
  <!-- Top Navigation Header -->
  <header class="admin-header">
    <a href="{{ route('admin.dashboard') }}" class="header-brand">
      <div class="header-logo">
        <svg class="icon icon-lg" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <div>
        <div class="header-title">Spotirid</div>
        <div class="header-subtitle">Admin Control Center</div>
      </div>
    </a>

    <div class="header-actions">
      <a href="{{ url('/') }}" target="_blank" class="btn-ghost" title="Lihat Tampilan Beranda">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span>Ke Beranda Player</span>
      </a>

      <button type="button" class="btn-ghost" id="quickModeToggle" title="Ganti Mode Gelap / Terang">
        <svg id="quickIconSun" class="icon" viewBox="0 0 24 24" style="display: none;">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
        <svg id="quickIconMoon" class="icon" viewBox="0 0 24 24">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
        <span id="quickModeLabel">Dark</span>
      </button>

      <div class="admin-chip">
        <div class="avatar-sm">{{ strtoupper(substr(Auth::user()->name ?? 'A', 0, 2)) }}</div>
        <span>{{ Auth::user()->name ?? 'Admin' }}</span>
      </div>

      <form method="POST" action="{{ route('admin.logout') }}" style="display:inline;">
        @csrf
        <button type="submit" class="btn-ghost" title="Logout">
          <svg class="icon" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Keluar</span>
        </button>
      </form>
    </div>
  </header>

  <!-- Main Content Container -->
  <main class="admin-container">
    <!-- Flash Messages -->
    @if (session('success'))
      <div class="alert alert-success">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span>{{ session('success') }}</span>
      </div>
    @endif
    @if (session('error'))
      <div class="alert alert-error">
        <svg class="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span>{{ session('error') }}</span>
      </div>
    @endif
    @if (session('info'))
      <div class="alert alert-info">
        <svg class="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <span>{{ session('info') }}</span>
      </div>
    @endif

    <!-- Navigation Tabs -->
    <nav class="tab-nav">
      <a href="{{ route('admin.dashboard', ['tab' => 'overview']) }}" class="tab-btn {{ $activeTab === 'overview' ? 'active' : '' }}">
        <svg class="icon" viewBox="0 0 24 24">
          <line x1="18" y1="20" x2="18" y2="10"/>
          <line x1="12" y1="20" x2="12" y2="4"/>
          <line x1="6" y1="20" x2="6" y2="14"/>
        </svg>
        <span>Overview & Metrik</span>
      </a>
      <a href="{{ route('admin.dashboard', ['tab' => 'playlists']) }}" class="tab-btn {{ $activeTab === 'playlists' ? 'active' : '' }}">
        <svg class="icon" viewBox="0 0 24 24">
          <line x1="8" y1="6" x2="21" y2="6"/>
          <line x1="8" y1="12" x2="21" y2="12"/>
          <line x1="8" y1="18" x2="21" y2="18"/>
          <line x1="3" y1="6" x2="3.01" y2="6"/>
          <line x1="3" y1="12" x2="3.01" y2="12"/>
          <line x1="3" y1="18" x2="3.01" y2="18"/>
        </svg>
        <span>Moderasi Playlist</span>
        @if ($totalPendingPlaylists > 0)
          <span class="badge-count">{{ $totalPendingPlaylists }}</span>
        @endif
      </a>
      <a href="{{ route('admin.dashboard', ['tab' => 'music']) }}" class="tab-btn {{ $activeTab === 'music' ? 'active' : '' }}">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M9 18V5l12-2v13"/>
          <circle cx="6" cy="18" r="3"/>
          <circle cx="18" cy="16" r="3"/>
        </svg>
        <span>Kelola Lagu & Upload</span>
        @if ($totalPendingSongs > 0)
          <span class="badge-count" style="background: #f59e0b; color: #000;" title="{{ $totalPendingSongs }} lagu menunggu persetujuan">{{ $totalPendingSongs }}</span>
        @endif
      </a>
      <a href="{{ route('admin.dashboard', ['tab' => 'users']) }}" class="tab-btn {{ $activeTab === 'users' ? 'active' : '' }}">
        <svg class="icon" viewBox="0 0 24 24">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <span>Kelola Pengguna</span>
        <span class="badge-count">{{ $totalUsers }}</span>
      </a>
      <a href="{{ route('admin.dashboard', ['tab' => 'settings']) }}" class="tab-btn {{ $activeTab === 'settings' ? 'active' : '' }}">
        <svg class="icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
        <span>Pengaturan Admin</span>
      </a>
    </nav>

    @if ($visitorBackupReminderOpen)
      <div style="display: flex; align-items: flex-start; gap: 14px; padding: 16px 18px; margin-bottom: 20px; background: var(--warning-bg); border: 1px solid var(--warning); border-radius: 12px;">
        <svg class="icon" style="color: var(--warning); flex-shrink: 0;" viewBox="0 0 24 24">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        <div style="flex: 1; min-width: 0;">
          <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">Data visitor bisa dibackup</div>
          <p style="margin: 6px 0 10px; font-size: 12.5px; line-height: 1.6; color: var(--text-muted);">
            Pengingat ini dikirim 3 kali setiap tanggal {{ config('visitor.backup.reminder_day') }} Desember, pada pukul {{ implode(', ', array_map(fn ($h) => sprintf('%02d:00', $h), config('visitor.backup.reminder_hours'))) }}.
            Kalau kamu ingin menyimpan salinan data pengunjung, unduh sekarang. Kalau tidak, data tetap dihapus otomatis setelah {{ config('visitor.retention_days') }} hari.
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="{{ route('admin.visitors.export') }}" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
              <svg class="icon" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Export Sekarang
            </a>
            <a href="{{ route('admin.dashboard', ['tab' => $activeTab, 'dismiss_visitor_reminder' => 1]) }}" class="btn-ghost" style="text-decoration: none;">
              Tutup
            </a>
          </div>
        </div>
      </div>
    @endif

    <!-- ==================== TAB 1: OVERVIEW & ANALYTICS ==================== -->
    @if ($activeTab === 'overview')
      <div class="bento-grid">
        <div class="bento-card">
          <div class="bento-title">Total Lagu di Library</div>
          <div class="bento-value">{{ $totalSongs }}</div>
          <div class="bento-desc">Lagu aktif siap diputar di Beranda</div>
        </div>

        <div class="bento-card">
          <div class="bento-title">Total Pemutaran (Play Count)</div>
          <div class="bento-value">{{ number_format($totalPlays) }}</div>
          <div class="bento-desc">Akumulasi streaming oleh pengunjung</div>
        </div>

        <div class="bento-card">
          <div class="bento-title">Playlist Global Aktif</div>
          <div class="bento-value">{{ $totalApprovedPlaylists }}</div>
          <div class="bento-desc">Tampil publik di semua halaman & perangkat</div>
        </div>

        <div class="bento-card">
          <div class="bento-title">Playlist Pending</div>
          <div class="bento-value" style="color: {{ $totalPendingPlaylists > 0 ? '#ef4444' : 'inherit' }};">
            {{ $totalPendingPlaylists }}
          </div>
          <div class="bento-desc">Playlist buatan user butuh approval</div>
        </div>

        <div class="bento-card">
          <div class="bento-title">Lagu Pending Approval</div>
          <div class="bento-value" style="color: {{ $totalPendingSongs > 0 ? '#f59e0b' : 'inherit' }};">
            {{ $totalPendingSongs }}
          </div>
          <div class="bento-desc">Pengajuan lagu dari member butuh persetujuan</div>
        </div>
      </div>

      <!-- VISITOR ANALYTICS SECTION (Interactive Charts with Filters) -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <path d="M3 3v18h18"/>
                <path d="m19 9-5 5-4-4-3 3"/>
              </svg>
              <span>Grafik Analitik Pengunjung Spotirid</span>
            </div>
            <p class="section-subtitle">Visualisasi interaktif aktivitas pengunjung berdasarkan periode waktu:</p>
          </div>

          <!-- Filter Pill Buttons -->
          <div class="filter-group">
            <button type="button" class="chart-filter-btn active" id="filter-daily" onclick="switchChart('daily')">
              <span>Harian (24 Jam)</span>
            </button>
            <button type="button" class="chart-filter-btn" id="filter-weekly" onclick="switchChart('weekly')">
              <span>Mingguan (7 Hari)</span>
            </button>
            <button type="button" class="chart-filter-btn" id="filter-monthly" onclick="switchChart('monthly')">
              <span>Bulanan (Minggu)</span>
            </button>
            <button type="button" class="chart-filter-btn" id="filter-yearly" onclick="switchChart('yearly')">
              <span>Tahunan (12 Bulan)</span>
            </button>
          </div>
        </div>

        <!-- Visitor Counting Switch -->
        <form method="POST" action="{{ route('admin.visitors.tracking.update') }}"
              style="display: flex; align-items: center; gap: 10px 12px; flex-wrap: wrap; margin-bottom: 12px; padding: 12px 14px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px;">
          @csrf
          <input type="hidden" name="enabled" value="{{ $visitorTrackingEnabled ? '0' : '1' }}">

          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <svg class="icon" style="color: {{ $visitorTrackingEnabled ? 'var(--success)' : 'var(--text-muted)' }};" viewBox="0 0 24 24">
              @if ($visitorTrackingEnabled)
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
                <circle cx="12" cy="12" r="3"/>
              @else
                <path d="M17.94 17.94A10.4 10.4 0 0 1 12 20C5 20 1 12 1 12a19.8 19.8 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.9 9.9 0 0 1 12 4c7 0 11 8 11 8a19.8 19.8 0 0 1-2.16 3.19"/>
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              @endif
            </svg>
            <span style="font-size: 13px; font-weight: 700;">Pencatatan Pengunjung</span>
            <span class="badge"
                  style="background: {{ $visitorTrackingEnabled ? 'var(--success-bg)' : 'var(--danger-bg)' }}; color: {{ $visitorTrackingEnabled ? 'var(--success)' : 'var(--danger)' }};">
              {{ $visitorTrackingEnabled ? 'Aktif' : 'Nonaktif' }}
            </span>
          </span>

          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
            @if ($visitorTrackingEnabled)
              Aktif — setiap kunjungan dicatat, maksimal 1 baris per IP per jam.
            @else
              Nonaktif — kunjungan baru tidak dicatat. Data lama & grafik tetap utuh.
            @endif
          </span>

          <button type="submit"
                  class="{{ $visitorTrackingEnabled ? 'btn-ghost' : 'btn-primary' }}"
                  style="margin-left: auto; display: inline-flex; align-items: center; gap: 6px; height: 34px;">
            <svg class="icon" viewBox="0 0 24 24">
              @if ($visitorTrackingEnabled)
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.9" y1="4.9" x2="19.1" y2="19.1"/>
              @else
                <circle cx="12" cy="12" r="10"/>
                <polyline points="8 12 11 15 16 9"/>
              @endif
            </svg>
            {{ $visitorTrackingEnabled ? 'Nonaktifkan' : 'Aktifkan Lagi' }}
          </button>
        </form>

        @unless ($visitorTrackingEnabled)
          <div class="alert alert-info" style="margin-bottom: 16px;">
            <svg class="icon" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Pencatatan pengunjung sedang dinonaktifkan. Grafik di bawah hanya menampilkan data historis.</span>
          </div>
        @endunless

        <!-- Export Visitor Data -->
        <form method="GET" action="{{ route('admin.visitors.export') }}"
              style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 18px; padding: 12px 14px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 10px;">
          <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);" for="visitor-export-from">DARI</label>
          <input type="date" id="visitor-export-from" name="from"
                 style="padding: 6px 8px; font-size: 12px; font-family: var(--font-mono); color: var(--text-main); background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 6px;">
          <label style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);" for="visitor-export-to">SAMPAI</label>
          <input type="date" id="visitor-export-to" name="to"
                 style="padding: 6px 8px; font-size: 12px; font-family: var(--font-mono); color: var(--text-main); background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 6px;">
          <button type="submit" class="btn-primary" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
          <span style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
            Kosongkan tanggal untuk export semua. File tidak disimpan di server.
          </span>
        </form>

        <!-- Chart Container -->
        <div style="position: relative; height: 320px; width: 100%;">
          <canvas id="visitorChart"></canvas>
        </div>

        <!-- Legend / Info Strip -->
        <div style="display: flex; gap: 20px; margin-top: 16px; padding-top: 14px; border-top: 1px solid var(--border-subtle); flex-wrap: wrap; font-size: 12px; color: var(--text-muted); font-family: var(--font-mono);">
          <div id="chartMetaType" style="color: #fff; font-weight: 700;">Format: Bar Chart (24 Jam)</div>
          <div>Mode: <span style="color: var(--accent);">Real-Time & Auto-Aggregated</span></div>
          <div>Zona Waktu: <span>Asia/Jakarta (WIB)</span></div>
        </div>
      </div>

      <div class="form-grid">
        <div class="section-card">
          <div class="section-title">
            <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            <span>Aksi Cepat Admin</span>
          </div>
          <p class="section-subtitle" style="margin-bottom: 16px;">Pintasan tugas harian administrator:</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap;">
            <a href="{{ route('admin.dashboard', ['tab' => 'music']) }}" class="btn-primary">
              <svg class="icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Upload Lagu Baru</span>
            </a>
            <a href="{{ route('admin.dashboard', ['tab' => 'playlists']) }}" class="btn-ghost">
              <svg class="icon" viewBox="0 0 24 24">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>Tinjau {{ $totalPendingPlaylists }} Playlist Pending</span>
            </a>
          </div>
        </div>

        <div class="section-card">
          <div class="section-title">
            <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>Aturan Hak Akses</span>
          </div>
          <p class="section-subtitle" style="line-height: 1.6; margin-top: 8px;">
            • <strong>Admin:</strong> Memiliki wewenang penuh untuk upload lagu, mengedit database, menyetujui playlist publik, dan memantau trafik pengunjung.<br>
            • <strong>User / Pengunjung:</strong> Hanya dapat mendengarkan lagu, membuat playlist, dan menambahkan lagu. Playlist user berstatus <em>Pending</em> hingga kamu setujui.
          </p>
        </div>
      </div>
    @endif

    <!-- ==================== TAB 2: PLAYLIST MODERATION ==================== -->
    @if ($activeTab === 'playlists')
      <!-- Section: Pending Approvals -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--warning);" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Menunggu Persetujuan Admin (Pending Queue)</span>
              @if ($pendingPlaylists->count() > 0)
                <span class="badge badge-pending">{{ $pendingPlaylists->count() }} PENDING</span>
              @endif
            </div>
            <p class="section-subtitle">Playlist yang dibuat pengguna anonim dan diajukan untuk tampil global:</p>
          </div>
        </div>

        @if ($pendingPlaylists->isEmpty())
          <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
            <svg class="icon icon-lg" style="width: 36px; height: 36px; color: var(--accent); margin-bottom: 8px;" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <div style="font-weight: 700; color: #fff; font-size: 15px;">Semua playlist telah dimoderasi</div>
            <p style="font-size: 12px; margin-top: 4px;">Tidak ada antrean playlist pending saat ini.</p>
          </div>
        @else
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Playlist</th>
                  <th>Dibuat Oleh</th>
                  <th>Lagu</th>
                  <th>Tanggal</th>
                  <th style="text-align: right;">Aksi Persetujuan</th>
                </tr>
              </thead>
              <tbody>
                @foreach ($pendingPlaylists as $pl)
                  <tr>
                    <td>
                      <div class="song-cell">
                        @if ($pl->custom_cover)
                          <img src="{{ $pl->custom_cover }}" class="thumb" alt="Cover">
                        @else
                          <div class="thumb">
                            <svg class="icon" viewBox="0 0 24 24">
                              <path d="M9 18V5l12-2v13"/>
                              <circle cx="6" cy="18" r="3"/>
                              <circle cx="18" cy="16" r="3"/>
                            </svg>
                          </div>
                        @endif
                        <div>
                          <div class="song-title">{{ $pl->name }}</div>
                          <div class="song-artist">{{ Str::limit($pl->description ?: 'Tidak ada deskripsi', 50) }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style="font-weight: 600; color: #fff;">{{ $pl->creator_name ?: 'Pengunjung' }}</span>
                    </td>
                    <td>
                      <span class="badge" style="background: rgba(255,255,255,0.06);">{{ $pl->songs->count() }} lagu</span>
                    </td>
                    <td style="font-size: 11px; color: var(--text-muted); font-family: var(--font-mono);">
                      {{ $pl->created_at?->diffForHumans() }}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <form method="POST" action="{{ route('admin.playlists.approve', $pl->id) }}" style="display:inline;">
                          @csrf
                          <button type="submit" class="btn-action btn-approve" title="Jadikan Global">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                            <span>Setujui & Publikasikan</span>
                          </button>
                        </form>

                        <form method="POST" action="{{ route('admin.playlists.reject', $pl->id) }}" style="display:inline;">
                          @csrf
                          <button type="submit" class="btn-action btn-warning" title="Tolak">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            <span>Tolak</span>
                          </button>
                        </form>

                        <form method="POST" action="{{ route('admin.playlists.delete', $pl->id) }}" onsubmit="return confirm('Hapus permanen playlist ini?')" style="display:inline;">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn-action btn-danger" title="Hapus">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          </div>
        @endif
      </div>

      <!-- Section: Approved Global Playlists -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
              <span>Playlist Global Aktif (Disetujui)</span>
              <span class="badge badge-approved">{{ $approvedPlaylists->count() }} LIVE</span>
            </div>
            <p class="section-subtitle">Playlist berikut tampil di Beranda dan bisa didengarkan oleh semua pengunjung:</p>
          </div>
        </div>

        @if ($approvedPlaylists->isEmpty())
          <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
            Belum ada playlist global yang disetujui.
          </div>
        @else
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Playlist</th>
                  <th>Kreator</th>
                  <th>Lagu</th>
                  <th>Status</th>
                  <th style="text-align: right;">Kelola</th>
                </tr>
              </thead>
              <tbody>
                @foreach ($approvedPlaylists as $pl)
                  <tr>
                    <td>
                      <div class="song-cell">
                        @if ($pl->custom_cover)
                          <img src="{{ $pl->custom_cover }}" class="thumb" alt="Cover">
                        @else
                          <div class="thumb">
                            <svg class="icon" viewBox="0 0 24 24">
                              <path d="M9 18V5l12-2v13"/>
                              <circle cx="6" cy="18" r="3"/>
                              <circle cx="18" cy="16" r="3"/>
                            </svg>
                          </div>
                        @endif
                        <div>
                          <div class="song-title">{{ $pl->name }}</div>
                          <div class="song-artist">{{ Str::limit($pl->description ?: 'Koleksi publik', 50) }}</div>
                        </div>
                      </div>
                    </td>
                    <td>{{ $pl->creator_name ?: 'Admin' }}</td>
                    <td>{{ $pl->songs->count() }} tracks</td>
                    <td>
                      <span class="badge badge-approved">LIVE GLOBAL</span>
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <form method="POST" action="{{ route('admin.playlists.unpublish', $pl->id) }}" style="display:inline;">
                          @csrf
                          <button type="submit" class="btn-action btn-warning" title="Tarik dari publik">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                              <rect x="6" y="4" width="4" height="16"/>
                              <rect x="14" y="4" width="4" height="16"/>
                            </svg>
                            <span>Tarik / Sembunyikan</span>
                          </button>
                        </form>

                        <form method="POST" action="{{ route('admin.playlists.delete', $pl->id) }}" onsubmit="return confirm('Hapus playlist ini?')" style="display:inline;">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn-action btn-danger" title="Hapus">
                            <svg class="icon icon-sm" viewBox="0 0 24 24">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                            <span>Hapus</span>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          </div>
        @endif
      </div>
    @endif

    <!-- ==================== TAB 3: MUSIC LIBRARY & UPLOAD ==================== -->
    @if ($activeTab === 'music')
      @if ($totalPendingSongs > 0)
        <!-- Pending Song Submissions Moderation Card -->
        <div class="section-card" style="border-color: rgba(245, 158, 11, 0.4); background: linear-gradient(180deg, rgba(245, 158, 11, 0.04) 0%, var(--bg-surface) 100%); margin-bottom: 24px;">
          <div class="section-head">
            <div>
              <div class="section-title" style="color: var(--warning);">
                <svg class="icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span>Pengajuan Lagu Menunggu Persetujuan ({{ $totalPendingSongs }} Lagu)</span>
              </div>
              <p class="section-subtitle">Lagu yang diajukan oleh pengguna berakun. Dengarkan audio dan setujui untuk menerbitkan ke Beranda publik:</p>
            </div>
          </div>

          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Lagu</th>
                  <th>Pengaju</th>
                  <th>Genre & Album</th>
                  <th>Tanggal Pengajuan</th>
                  <th style="text-align: right;">Aksi Moderasi</th>
                </tr>
              </thead>
              <tbody>
                @foreach ($pendingSongs as $ps)
                  <tr>
                    <td>
                      <div class="song-cell">
                        <img src="{{ $ps->img }}" class="thumb" alt="Cover" onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🎵</text></svg>'">
                        <div>
                          <div class="song-title">{{ $ps->title }}</div>
                          <div class="song-artist">{{ $ps->artist }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: #fff;">
                        👤 {{ $ps->uploader_name ?: 'Member' }}
                      </span>
                    </td>
                    <td>
                      <div style="font-size: 12px; color: var(--text-main);">{{ $ps->album ?: '—' }}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">{{ $ps->genre ?: 'Pop' }}</div>
                    </td>
                    <td style="font-size: 12px; color: var(--text-muted);">
                      {{ $ps->created_at ? $ps->created_at->format('d M Y, H:i') : '—' }}
                    </td>
                    <td style="text-align: right;">
                      <div style="display: inline-flex; align-items: center; gap: 8px;">
                        @if ($ps->src)
                          <button type="button" class="btn-ghost" onclick="playModerationAudio('{{ $ps->src }}', this)" title="Dengarkan Lagu Ini" style="padding: 6px 12px; font-size: 11px;">
                            <span class="mod-icon">▶</span>
                            <span class="mod-label">Dengar</span>
                          </button>
                        @endif
                        <button type="button" class="btn-ghost" onclick="openEditPendingSongModal({{ json_encode($ps) }})" title="Edit Detail Lagu Sebelum Disetujui" style="padding: 6px 12px; font-size: 11px; color: var(--accent); border-color: rgba(204, 242, 40, 0.4);">
                          ✏ Edit & Setujui
                        </button>

                        <form method="POST" action="{{ route('admin.music.approve', $ps->id) }}" style="display: inline;">
                          @csrf
                          <button type="submit" class="btn-action btn-approve" title="Setujui & Publikasikan">
                            ✓ Setujui
                          </button>
                        </form>

                        <form method="POST" action="{{ route('admin.music.reject', $ps->id) }}" onsubmit="return confirm('Apakah Anda yakin ingin menolak & menghapus lagu \'{{ $ps->title }}\'?');" style="display: inline;">
                          @csrf
                          <button type="submit" class="btn-action btn-danger" title="Tolak Lagu">
                            ✕ Tolak
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                @endforeach
              </tbody>
            </table>
          </div>
        </div>
      @endif

      <!-- Upload New Song Card -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>Upload Lagu Baru ke Library</span>
            </div>
            <p class="section-subtitle">Hanya Administrator yang memiliki wewenang mengunggah musik baru ke arsip utama:</p>
          </div>
        </div>

        <!-- Mode Switcher -->
        <div class="mode-toggle" style="margin-bottom: 20px;">
          <button type="button" class="mode-btn active" id="btnModeFile" onclick="setMode('file')">📁 Upload File Audio</button>
          <button type="button" class="mode-btn" id="btnModeUrl" onclick="setMode('url')">🌐 Input Link Audio</button>
          <button type="button" class="mode-btn" id="btnModeYoutube" onclick="setMode('youtube')">🔴 Link YouTube (Streaming Langsung)</button>
        </div>

        <!-- Single File Upload Form -->
        <form method="POST" action="{{ route('admin.music.store') }}" enctype="multipart/form-data" id="formModeFile">
          @csrf

          <div class="form-grid">
            <div class="form-group">
              <label for="title">Judul Lagu *</label>
              <input type="text" name="title" id="title" class="form-control" placeholder="contoh: Believer, Shape of You" required>
            </div>

            <div class="form-group">
              <label for="artist">Nama Artist / Penyanyi *</label>
              <input type="text" name="artist" id="artist" class="form-control" placeholder="contoh: Imagine Dragons, Ed Sheeran" required>
            </div>

            <div class="form-group">
              <label for="album">Album (Opsional)</label>
              <input type="text" name="album" id="album" class="form-control" placeholder="contoh: Evolve">
            </div>

            <div class="form-group">
              <label for="genre">Genre (Opsional)</label>
              <input type="text" name="genre" id="genre" class="form-control" placeholder="Pop, Rock, R&B, Acoustic">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="audio">File Audio (.mp3, .wav, .flac, .m4a, .mp4) *</label>
              <input type="file" name="audio" id="audio" class="form-control" accept="audio/*,.mp4" required>
            </div>

            <div class="form-group">
              <label for="cover">File Cover Image (.jpg, .png, .webp)</label>
              <input type="file" name="cover" id="cover" class="form-control" accept="image/*">
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label for="description">Deskripsi / Catatan Rilis</label>
              <input type="text" name="description" id="description" class="form-control" placeholder="Catatan singkat tentang aransemen lagu...">
            </div>

            <div class="form-group">
              <label for="youtube_url">Link Video YouTube (Opsional)</label>
              <input type="url" name="youtube_url" id="youtube_url" class="form-control" placeholder="https://youtube.com/watch?v=...">
            </div>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 8px;">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span>Simpan & Terbitkan File ke Library</span>
          </button>
        </form>

        <!-- Multi-Song Direct URL Bulk Form -->
        <form method="POST" action="{{ route('admin.music.bulk') }}" id="formModeUrl" style="display: none;">
          @csrf

          <div class="alert alert-info" style="margin-bottom: 18px; font-size: 13px;">
            <svg class="icon" viewBox="0 0 24 24" style="flex-shrink: 0; width: 18px; height: 18px;">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>Mode Multi-Data Link:</strong> Masukkan Direct Audio URL. Kamu bisa klik tombol <strong>"+ Tambah Space Lagu Lagi"</strong> di bawah untuk menambah space lagu ke-2, ke-3, dst, lalu simpan semuanya sekaligus dalam sekali klik!
            </div>
          </div>

          <!-- Dynamic Song Cards Container -->
          <div id="bulkSongsContainer">
            <div class="bulk-song-card" data-index="0" style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="badge" style="background: rgba(204, 242, 40, 0.15); color: var(--accent); font-weight: 700; font-family: var(--font-mono); font-size: 11px;">
                    #<span class="song-num">1</span>
                  </span>
                  <span style="font-weight: 700; font-size: 13px; color: #fff;">Space Lagu</span>
                </div>
                <button type="button" class="btn-ghost btn-remove-row" onclick="removeBulkSongRow(this)" style="display: none; padding: 4px 10px; font-size: 11px; color: var(--danger); border-color: rgba(239, 68, 68, 0.3);">
                  ✕ Hapus
                </button>
              </div>

              <div class="form-grid">
                <div class="form-group" style="grid-column: span 2;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <label style="margin-bottom: 0;">Direct Audio URL (HTTP/HTTPS) *</label>
                    <span class="preview-status" style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);"></span>
                  </div>
                  <div style="display: flex; gap: 8px;">
                    <input type="url" name="songs[0][audio_url]" class="form-control song-audio-url" placeholder="https://cdn.example.com/audio/Artist - Song.mp3" required onchange="handleAudioUrlChange(this)" style="flex: 1;">
                    <button type="button" class="btn-ghost btn-preview-audio" onclick="toggleAudioPreview(this)" title="Test Putar Audio" style="flex-shrink: 0; padding: 0 14px; height: 42px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700;">
                      <span class="preview-icon">▶</span>
                      <span class="preview-text">Test Putar</span>
                    </button>
                  </div>
                </div>

                <div class="form-group">
                  <label>Judul Lagu *</label>
                  <input type="text" name="songs[0][title]" class="form-control song-title" placeholder="contoh: Believer" required>
                </div>

                <div class="form-group">
                  <label>Nama Artist / Penyanyi *</label>
                  <input type="text" name="songs[0][artist]" class="form-control song-artist" placeholder="contoh: Imagine Dragons" required>
                </div>

                <div class="form-group">
                  <label>Direct Cover Image URL (Opsional)</label>
                  <input type="url" name="songs[0][cover_url]" class="form-control song-cover-url" placeholder="https://cdn.example.com/covers/image.jpg">
                </div>

                <div class="form-group">
                  <label>Link Video YouTube (Opsional)</label>
                  <input type="url" name="songs[0][youtube_url]" class="form-control song-youtube-url" placeholder="https://youtube.com/watch?v=...">
                </div>

                <div class="form-group">
                  <label>Album (Opsional)</label>
                  <input type="text" name="songs[0][album]" class="form-control song-album" placeholder="contoh: Evolve">
                </div>

                <div class="form-group">
                  <label>Genre (Opsional)</label>
                  <input type="text" name="songs[0][genre]" class="form-control song-genre" placeholder="contoh: Rock, Pop, R&B">
                </div>

                <div class="form-group" style="grid-column: span 2;">
                  <label>Deskripsi / Catatan Rilis (Opsional)</label>
                  <input type="text" name="songs[0][description]" class="form-control song-description" placeholder="Catatan singkat tentang lagu...">
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Actions -->
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 8px; margin-bottom: 20px;">
            <button type="button" class="btn-ghost" onclick="addBulkSongRow()" style="border-color: var(--accent); color: var(--accent); font-weight: 700; padding: 10px 18px;">
              <svg class="icon" viewBox="0 0 24 24" style="width: 16px; height: 16px;">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              <span>+ Tambah Space Lagu Lagi</span>
            </button>
            <div style="font-size: 13px; color: var(--text-muted); font-family: var(--font-mono);">
              Total space lagu: <strong id="bulkSongTotalCount" style="color: var(--accent);">1</strong> lagu
            </div>
          </div>

          <button type="submit" class="btn-primary" id="btnSubmitBulk">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span id="btnSubmitBulkText">Simpan & Terbitkan Semua ke Library (1 Lagu)</span>
          </button>
        </form>

        <!-- YouTube Direct Streaming Form -->
        <form method="POST" action="{{ route('admin.music.store') }}" id="formModeYoutube" style="display: none;">
          @csrf

          <div class="alert alert-info" style="margin-bottom: 18px; font-size: 13px; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5;">
            <svg class="icon" viewBox="0 0 24 24" style="flex-shrink: 0; width: 18px; height: 18px; color: #ef4444;">
              <polygon points="10 8 16 12 10 16 10 8"/>
              <rect x="2" y="4" width="20" height="16" rx="4"/>
            </svg>
            <div>
              <strong>Mode YouTube Streaming (0 MB Storage):</strong> Cukup masukkan link video YouTube. Audio akan otomatis distreaming langsung lewat YouTube Iframe Player resmi tanpa memakan kuota server. Cover thumbnail otomatis diambil dari YouTube!
            </div>
          </div>

          <div class="form-grid">
            <div class="form-group" style="grid-column: span 2;">
              <label for="yt_url">Link Video YouTube (HTTP/HTTPS) *</label>
              <input type="url" name="youtube_url" id="yt_url" class="form-control" placeholder="https://www.youtube.com/watch?v=..." required oninput="handleYoutubeUrlInput(this)">
            </div>

            <div class="form-group">
              <label for="yt_title">Judul Lagu *</label>
              <input type="text" name="title" id="yt_title" class="form-control" placeholder="contoh: Believer" required>
            </div>

            <div class="form-group">
              <label for="yt_artist">Nama Artist / Penyanyi *</label>
              <input type="text" name="artist" id="yt_artist" class="form-control" placeholder="contoh: Imagine Dragons" required>
            </div>

            <div class="form-group">
              <label for="yt_album">Album (Opsional)</label>
              <input type="text" name="album" id="yt_album" class="form-control" placeholder="contoh: Evolve">
            </div>

            <div class="form-group">
              <label for="yt_genre">Genre (Opsional)</label>
              <input type="text" name="genre" id="yt_genre" class="form-control" placeholder="Pop, Rock, R&B">
            </div>

            <div class="form-group" style="grid-column: span 2;">
              <label for="yt_desc">Deskripsi / Catatan Rilis (Opsional)</label>
              <input type="text" name="description" id="yt_desc" class="form-control" placeholder="Catatan singkat tentang lagu...">
            </div>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 8px;">
            <svg class="icon" viewBox="0 0 24 24">
              <polygon points="10 8 16 12 10 16 10 8"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
            <span>Simpan & Terbitkan Lagu YouTube</span>
          </button>
        </form>
      </div>

      <!-- Music List Table -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
              <span>Daftar Lagu di Library ({{ $totalSongs }} tracks)</span>
            </div>
            <p class="section-subtitle">Kelola, edit informasi, atau hapus lagu dari perpustakaan musik:</p>
          </div>

          <!-- Search form -->
          <form method="GET" action="{{ route('admin.dashboard') }}" style="display: flex; gap: 8px;">
            <input type="hidden" name="tab" value="music">
            <input type="text" name="search" value="{{ $search }}" placeholder="Cari judul / artist..." class="form-control" style="width: 220px; height: 36px; font-size: 12px;">
            <button type="submit" class="btn-ghost" style="padding: 0 14px; height: 36px;">Cari</button>
            @if ($search)
              <a href="{{ route('admin.dashboard', ['tab' => 'music']) }}" class="btn-ghost" style="height: 36px;">Reset</a>
            @endif
          </form>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Lagu</th>
                <th>Album</th>
                <th>Genre</th>
                <th>Plays</th>
                <th>Pengunggah</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              @foreach ($songs as $s)
                <tr>
                  <td>
                    <div class="song-cell">
                      <img src="{{ $s->img }}" class="thumb" alt="Cover" onerror="this.src='data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>🎵</text></svg>'">
                      <div>
                        <div class="song-title">{{ $s->title }}</div>
                        <div class="song-artist">{{ $s->artist }}</div>
                      </div>
                    </div>
                  </td>
                  <td>{{ $s->album ?: '—' }}</td>
                  <td>
                    <span class="badge" style="background: rgba(204,242,40,0.1); color: var(--accent);">{{ $s->genre ?: 'Pop' }}</span>
                  </td>
                  <td style="font-family: var(--font-mono); font-size: 11px;">
                    {{ number_format($s->play_count) }}
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted);">
                    {{ $s->uploader_name ?: 'Admin' }}
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button type="button" class="btn-action btn-warning" onclick="openEditModal({{ json_encode($s) }})">
                        <svg class="icon icon-sm" viewBox="0 0 24 24">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        <span>Edit</span>
                      </button>

                      <form method="POST" action="{{ route('admin.music.delete', $s->id) }}" onsubmit="return confirm('Hapus permanen lagu {{ $s->title }} beserta file medianya?')" style="display:inline;">
                        @csrf
                        @method('DELETE')
                        <button type="submit" class="btn-action btn-danger">
                          <svg class="icon icon-sm" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              @endforeach
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div style="margin-top: 16px;">
          {{ $songs->links('admin.partials.pagination-songs', ['itemLabel' => 'lagu']) }}
        </div>
      </div>
    @endif

    <!-- ==================== TAB 4: SETTINGS ==================== -->
    @if ($activeTab === 'settings')
      <div class="form-grid">
        <!-- Theme & Appearance Settings -->
        <div class="section-card" style="grid-column: 1 / -1;">
          <div class="section-head">
            <div>
              <div class="section-title">
                <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
                <span>Tampilan & Tema Administrator</span>
              </div>
              <p class="section-subtitle">Sesuaikan mode pencahayaan (Gelap/Terang) dan warna aksen dashboard agar identik dengan player user:</p>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 20px;">
            <div>
              <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Mode Pencahayaan (Dark / Light Mode)</label>
              <div class="mode-toggle-group">
                <button type="button" class="mode-btn active" id="btnModeDark" data-mode="dark">
                  <svg class="icon-sm" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                  <span>Dark Mode (Gelap)</span>
                </button>
                <button type="button" class="mode-btn" id="btnModeLight" data-mode="light">
                  <svg class="icon-sm" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                  <span>Light Mode (Terang)</span>
                </button>
              </div>
            </div>

            <div>
              <label style="display: block; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Palet Warna Aksen (Identik dengan Player)</label>
              <div class="theme-swatches" id="adminThemeSwatches">
                <button type="button" class="theme-btn active" data-theme="default" title="Acid Lime (Bawaan)" style="background: #ccf228;"></button>
                <button type="button" class="theme-btn" data-theme="purple" title="Electric Violet" style="background: #a855f7;"></button>
                <button type="button" class="theme-btn" data-theme="blue" title="Deep Cobalt" style="background: #3b82f6;"></button>
                <button type="button" class="theme-btn" data-theme="cyberpunk" title="Hot Pink" style="background: #ec4899;"></button>
                <button type="button" class="theme-btn" data-theme="sunset" title="Safety Amber" style="background: #f97316;"></button>
                <button type="button" class="theme-btn" data-theme="ocean" title="Cyan Laser" style="background: #06b6d4;"></button>
              </div>
              <span style="font-size: 11px; color: var(--text-muted); margin-top: 6px; display: inline-block;">Pilihan tema warna langsung mengubah aksen tombol, badge, sorotan tabel, dan grafik analitik secara instan.</span>
            </div>
          </div>
        </div>
        <!-- Update Profile -->
        <div class="section-card">
          <div class="section-head">
            <div>
              <div class="section-title">
                <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Profil Administrator</span>
              </div>
              <p class="section-subtitle">Ubah informasi nama akun admin yang tampil di dashboard:</p>
            </div>
          </div>

          <form method="POST" action="{{ route('admin.profile.update') }}">
            @csrf
            <div class="form-group">
              <label for="admin_name">Nama Lengkap Admin</label>
              <input type="text" name="name" id="admin_name" class="form-control" value="{{ old('name', Auth::user()->name) }}" required>
            </div>

            <div class="form-group">
              <label for="admin_email">Email Admin</label>
              <input type="email" name="email" id="admin_email" class="form-control" value="{{ old('email', Auth::user()->email) }}" required>
            </div>

            <button type="submit" class="btn-primary" style="margin-top: 8px;">
              <span>Simpan Profil</span>
            </button>
          </form>
        </div>

        <!-- Change Password -->
        <div class="section-card">
          <div class="section-head">
            <div>
              <div class="section-title">
                <svg class="icon" style="color: var(--warning);" viewBox="0 0 24 24">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Ganti Password Admin</span>
              </div>
              <p class="section-subtitle">Perbarui kata sandi akun login untuk keamanan:</p>
            </div>
          </div>

          <form method="POST" action="{{ route('admin.password.update') }}">
            @csrf
            <div class="form-group">
              <label for="current_password">Password Saat Ini *</label>
              <div style="position: relative;">
                <input type="password" name="current_password" id="current_password" class="form-control" placeholder="••••••••" required style="padding-right: 42px;">
                <button type="button" onclick="togglePasswordVisibility('current_password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new_password">Password Baru *</label>
              <div style="position: relative;">
                <input type="password" name="new_password" id="new_password" class="form-control" placeholder="Minimal 6 karakter" required style="padding-right: 42px;">
                <button type="button" onclick="togglePasswordVisibility('new_password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new_password_confirmation">Konfirmasi Password Baru *</label>
              <div style="position: relative;">
                <input type="password" name="new_password_confirmation" id="new_password_confirmation" class="form-control" placeholder="Ulangi password baru" required style="padding-right: 42px;">
                <button type="button" onclick="togglePasswordVisibility('new_password_confirmation', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
            <button type="submit" class="btn-primary" style="margin-top: 8px;">
              <span>Ubah Password</span>
            </button>
          </form>
        </div>
      </div>

      <!-- System Information Card -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--success);" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                <line x1="6" y1="6" x2="6.01" y2="6"/>
                <line x1="6" y1="18" x2="6.01" y2="18"/>
              </svg>
              <span>Status Server & Lingkungan Sistem</span>
            </div>
            <p class="section-subtitle">Informasi teknis platform Spotirid:</p>
          </div>
        </div>

        <div class="form-grid">
          <div class="bento-card" style="padding: 16px;">
            <div class="bento-title">Nama Platform</div>
            <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">Spotirid Web Player</div>
          </div>

          <div class="bento-card" style="padding: 16px;">
            <div class="bento-title">Versi PHP Server</div>
            <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">{{ $systemInfo['php_version'] }}</div>
          </div>

          <div class="bento-card" style="padding: 16px;">
            <div class="bento-title">Laravel Framework</div>
            <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">v{{ $systemInfo['laravel_version'] }}</div>
          </div>

          <div class="bento-card" style="padding: 16px;">
            <div class="bento-title">Status Database MySQL</div>
            <div style="font-size: 14px; font-weight: 700; color: #86efac; margin-top: 4px; display: flex; align-items: center; gap: 6px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #22c55e;"></span>
              <span>Tersambung ({{ $systemInfo['db_name'] }})</span>
            </div>
          </div>
        </div>
      </div>
    @endif

    <!-- ==================== TAB 5: KELOLA PENGGUNA ==================== -->
    @if ($activeTab === 'users')
      <div class="bento-grid" style="margin-bottom: 24px;">
        <div class="bento-card">
          <div class="bento-title">Total Pengguna Terdaftar</div>
          <div class="bento-value">{{ $totalUsers }}</div>
          <div class="bento-desc">Akun pengguna aktif di sistem Spotirid</div>
        </div>

        <div class="bento-card">
          <div class="bento-title">Akun Anda Saat Ini</div>
          <div class="bento-value" style="font-size: 18px; color: var(--accent);">{{ Auth::user()->name }}</div>
          <div class="bento-desc">{{ Auth::user()->email }} (Administrator)</div>
        </div>
      </div>

      <!-- Form Tambah User Baru -->
      <div class="section-card" style="margin-bottom: 24px;">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
              <span>Tambah Akun Pengguna Baru</span>
            </div>
            <p class="section-subtitle">Daftarkan akun pengguna baru dengan kredensial login (Email & Password):</p>
          </div>
        </div>

        <form method="POST" action="{{ route('admin.users.store') }}">
          @csrf

          <div class="form-grid">
            <div class="form-group">
              <label for="new_user_name">Nama Lengkap / Username *</label>
              <input type="text" name="name" id="new_user_name" class="form-control" placeholder="contoh: John Doe, Member 1" value="{{ old('name') }}" required>
            </div>

            <div class="form-group">
              <label for="new_user_email">Alamat Email *</label>
              <input type="email" name="email" id="new_user_email" class="form-control" placeholder="contoh: user@example.com" value="{{ old('email') }}" required>
            </div>

            <div class="form-group">
              <label for="new_user_password">Password Login *</label>
              <div style="position: relative;">
                <input type="password" name="password" id="new_user_password" class="form-control" placeholder="Minimal 8 karakter" required minlength="8" style="padding-right: 42px;">
                <button type="button" onclick="togglePasswordVisibility('new_user_password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="new_user_password_confirmation">Konfirmasi Password *</label>
              <div style="position: relative;">
                <input type="password" name="password_confirmation" id="new_user_password_confirmation" class="form-control" placeholder="Ulangi password di atas" required minlength="8" style="padding-right: 42px;">
                <button type="button" onclick="togglePasswordVisibility('new_user_password_confirmation', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
                  <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                </button>
              </div>
            </div>
          </div>

          <button type="submit" class="btn-primary" style="margin-top: 14px;">
            <svg class="icon" viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/>
              <line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            <span>Buat & Daftarkan Pengguna</span>
          </button>
        </form>
      </div>

      <!-- Daftar Pengguna -->
      <div class="section-card">
        <div class="section-head">
          <div>
            <div class="section-title">
              <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span>Daftar Pengguna Terdaftar ({{ $totalUsers }} akun)</span>
            </div>
            <p class="section-subtitle">Kelola seluruh kredensial akun pengguna di sistem Spotirid:</p>
          </div>

          <!-- Search form -->
          <form method="GET" action="{{ route('admin.dashboard') }}" style="display: flex; gap: 8px;">
            <input type="hidden" name="tab" value="users">
            <input type="text" name="user_search" value="{{ $userSearch }}" placeholder="Cari nama / email..." class="form-control" style="width: 220px; height: 36px; font-size: 12px;">
            <button type="submit" class="btn-ghost" style="padding: 0 14px; height: 36px;">Cari</button>
            @if ($userSearch)
              <a href="{{ route('admin.dashboard', ['tab' => 'users']) }}" class="btn-ghost" style="height: 36px;">Reset</a>
            @endif
          </form>
        </div>

        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Pengguna</th>
                <th>Email</th>
                <th>Tanggal Terdaftar</th>
                <th>Status Akun</th>
                <th style="text-align: right;">Aksi</th>
              </tr>
            </thead>
            <tbody>
              @forelse ($users as $u)
                <tr>
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <div class="thumb" style="border-radius: 50%; font-weight: 700; color: var(--accent); background: rgba(204, 242, 40, 0.1);">
                        {{ strtoupper(substr($u->name, 0, 1)) }}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: #fff;">{{ $u->name }}</div>
                        @if ($u->id === Auth::id())
                          <span class="badge" style="background: rgba(34, 197, 94, 0.15); color: #86efac; font-size: 10px;">Akun Anda</span>
                        @endif
                      </div>
                    </div>
                  </td>
                  <td style="font-family: var(--font-mono); font-size: 12px; color: var(--text-muted);">
                    {{ $u->email }}
                  </td>
                  <td style="font-size: 12px; color: var(--text-muted);">
                    {{ $u->created_at ? $u->created_at->format('d M Y, H:i') : '—' }}
                  </td>
                  <td>
                    @if (isset($u->role) && strtolower($u->role) === 'admin')
                      <span class="badge" style="background: rgba(204, 242, 40, 0.15); color: var(--accent);">Administrator</span>
                    @elseif (isset($u->role) && strtolower($u->role) === 'user')
                      <span class="badge" style="background: rgba(255, 255, 255, 0.05); color: #9a9ca6;">Pengguna Biasa</span>
                    @else
                      <span class="badge" style="background: rgba(34, 197, 94, 0.1); color: #86efac;">Aktif</span>
                    @endif
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; align-items: center; gap: 6px;">
                      <button type="button" class="btn-ghost" onclick="openEditUserModal({{ json_encode(['id' => $u->id, 'name' => $u->name, 'email' => $u->email]) }})" style="padding: 5px 12px; font-size: 11px; color: var(--accent); border-color: rgba(204, 242, 40, 0.4);" title="Edit Akun Pengguna">
                        ✏ Edit
                      </button>
                      @if ($u->id !== Auth::id())
                        <form method="POST" action="{{ route('admin.users.delete', $u->id) }}" onsubmit="return confirm('Apakah Anda yakin ingin menghapus akun pengguna \'{{ $u->name }}\'?');" style="display: inline;">
                          @csrf
                          @method('DELETE')
                          <button type="submit" class="btn-ghost" style="color: var(--danger); border-color: rgba(239, 68, 68, 0.3); padding: 5px 12px; font-size: 11px;">
                            Hapus Akun
                          </button>
                        </form>
                      @else
                        <span style="font-size: 11px; color: var(--text-muted); font-style: italic;">Akun Anda</span>
                      @endif
                    </div>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">
                    Tidak ada akun pengguna yang ditemukan.
                  </td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <div style="margin-top: 16px;">
          {{ $users->links() }}
        </div>
      </div>
    @endif
  </main>

  <!-- Edit Song Modal -->
  <div id="editModal" class="modal-backdrop" style="display: none;">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Edit Metadata Lagu</span>
        </h3>
        <button type="button" onclick="closeEditModal()" class="btn-ghost" style="padding: 4px 10px;">✕</button>
      </div>

      <form id="editForm" method="POST" action="" enctype="multipart/form-data">
        @csrf

        <div class="form-group">
          <label for="edit_title">Judul Lagu *</label>
          <input type="text" name="title" id="edit_title" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="edit_artist">Artist *</label>
          <input type="text" name="artist" id="edit_artist" class="form-control" required>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label for="edit_album">Album</label>
            <input type="text" name="album" id="edit_album" class="form-control">
          </div>

          <div class="form-group">
            <label for="edit_genre">Genre</label>
            <input type="text" name="genre" id="edit_genre" class="form-control">
          </div>
        </div>

        <div class="form-group">
          <label for="edit_description">Deskripsi</label>
          <input type="text" name="description" id="edit_description" class="form-control">
        </div>

        <div class="form-group">
          <label for="edit_cover">Ganti Cover Image (Opsional)</label>
          <input type="file" name="cover" id="edit_cover" class="form-control" accept="image/*">
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
          <button type="button" onclick="closeEditModal()" class="btn-ghost">Batal</button>
          <button type="submit" class="btn-primary">Simpan Perubahan</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit User Modal -->
  <div id="editUserModal" class="modal-backdrop" style="display: none;">
    <div class="modal-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
          <svg class="icon" style="color: var(--accent);" viewBox="0 0 24 24">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <span>Edit Akun Pengguna</span>
        </h3>
        <button type="button" onclick="closeEditUserModal()" class="btn-ghost" style="padding: 4px 10px;">✕</button>
      </div>

      <form id="editUserForm" method="POST" action="">
        @csrf

        <div class="form-group">
          <label for="edit_user_name">Nama Lengkap / Username *</label>
          <input type="text" name="name" id="edit_user_name" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="edit_user_email">Alamat Email *</label>
          <input type="email" name="email" id="edit_user_email" class="form-control" required>
        </div>

        <div class="form-group">
          <label for="edit_user_password">Password Baru (Kosongkan jika tidak diubah)</label>
          <div style="position: relative;">
            <input type="password" name="password" id="edit_user_password" class="form-control" placeholder="Minimal 8 karakter (opsional)" minlength="8" style="padding-right: 42px;">
            <button type="button" onclick="togglePasswordVisibility('edit_user_password', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="edit_user_password_confirmation">Konfirmasi Password Baru</label>
          <div style="position: relative;">
            <input type="password" name="password_confirmation" id="edit_user_password_confirmation" class="form-control" placeholder="Ulangi password baru" minlength="8" style="padding-right: 42px;">
            <button type="button" onclick="togglePasswordVisibility('edit_user_password_confirmation', this)" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; padding: 4px;" title="Lihat / Sembunyikan Password">
              <svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
          <button type="button" onclick="closeEditUserModal()" class="btn-ghost">Batal</button>
          <button type="submit" class="btn-primary">Simpan Perubahan User</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Edit & Approve Pending Song Modal -->
  <div id="editPendingSongModal" class="modal-backdrop" style="display: none;">
    <div class="modal-card" style="max-width: 600px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <div>
          <h3 style="font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 8px;">
            <svg class="icon" style="color: var(--warning);" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Edit Metadata & Setujui Lagu</span>
          </h3>
          <p style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            Periksa atau lengkapi informasi lagu sebelum diterbitkan secara resmi:
          </p>
        </div>
        <button type="button" onclick="closeEditPendingSongModal()" class="btn-ghost" style="padding: 4px 10px;">✕</button>
      </div>

      <form id="editPendingSongForm" method="POST" action="">
        @csrf

        <div class="form-grid">
          <div class="form-group" style="grid-column: span 2;">
            <label for="eps_audio_url">Direct Audio URL (HTTP/HTTPS) *</label>
            <input type="url" name="audio_url" id="eps_audio_url" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_title">Judul Lagu *</label>
            <input type="text" name="title" id="eps_title" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_artist">Nama Artist *</label>
            <input type="text" name="artist" id="eps_artist" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_cover_url">Cover Image URL *</label>
            <input type="url" name="cover_url" id="eps_cover_url" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_youtube_url">Link Video YouTube *</label>
            <input type="url" name="youtube_url" id="eps_youtube_url" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_album">Album *</label>
            <input type="text" name="album" id="eps_album" class="form-control" required>
          </div>

          <div class="form-group">
            <label for="eps_genre">Genre *</label>
            <input type="text" name="genre" id="eps_genre" class="form-control" required>
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label for="eps_description">Catatan / Deskripsi Rilis *</label>
            <input type="text" name="description" id="eps_description" class="form-control" required>
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
          <button type="button" onclick="closeEditPendingSongModal()" class="btn-ghost">Batal</button>
          <button type="submit" class="btn-primary" style="background: var(--accent); color: #000;">
            ✓ Simpan & Publikasikan ke Beranda
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    function setMode(mode) {
      const formFile = document.getElementById('formModeFile');
      const formUrl = document.getElementById('formModeUrl');
      const formYt = document.getElementById('formModeYoutube');
      const btnFile = document.getElementById('btnModeFile');
      const btnUrl = document.getElementById('btnModeUrl');
      const btnYt = document.getElementById('btnModeYoutube');
      const audioInput = document.getElementById('audio');

      if (formFile) formFile.style.display = mode === 'file' ? 'block' : 'none';
      if (formUrl) formUrl.style.display = mode === 'url' ? 'block' : 'none';
      if (formYt) formYt.style.display = mode === 'youtube' ? 'block' : 'none';

      if (btnFile) btnFile.classList.toggle('active', mode === 'file');
      if (btnUrl) btnUrl.classList.toggle('active', mode === 'url');
      if (btnYt) btnYt.classList.toggle('active', mode === 'youtube');

      if (audioInput) audioInput.required = mode === 'file';
    }

    function handleYoutubeUrlInput(input) {
      const url = input.value.trim();
      if (!url) return;
      const titleInput = document.getElementById('yt_title');
      const artistInput = document.getElementById('yt_artist');
      // Try to parse basic hints from video title or url if available
    }

    let bulkRowIndex = 0;

    function addBulkSongRow() {
      bulkRowIndex++;
      const container = document.getElementById('bulkSongsContainer');
      const newCard = document.createElement('div');
      newCard.className = 'bulk-song-card';
      newCard.dataset.index = bulkRowIndex;
      newCard.style.cssText = 'background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 18px; margin-bottom: 16px;';
      newCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="badge" style="background: rgba(204, 242, 40, 0.15); color: var(--accent); font-weight: 700; font-family: var(--font-mono); font-size: 11px;">
              #<span class="song-num">0</span>
            </span>
            <span style="font-weight: 700; font-size: 13px; color: #fff;">Space Lagu</span>
          </div>
          <button type="button" class="btn-ghost btn-remove-row" onclick="removeBulkSongRow(this)" style="padding: 4px 10px; font-size: 11px; color: var(--danger); border-color: rgba(239, 68, 68, 0.3);">
            ✕ Hapus
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group" style="grid-column: span 2;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <label style="margin-bottom: 0;">Direct Audio URL (HTTP/HTTPS) *</label>
              <span class="preview-status" style="font-size: 11px; font-family: var(--font-mono); color: var(--text-muted);"></span>
            </div>
            <div style="display: flex; gap: 8px;">
              <input type="url" name="songs[${bulkRowIndex}][audio_url]" class="form-control song-audio-url" placeholder="https://cdn.example.com/audio/Artist - Song.mp3" required onchange="handleAudioUrlChange(this)" style="flex: 1;">
              <button type="button" class="btn-ghost btn-preview-audio" onclick="toggleAudioPreview(this)" title="Test Putar Audio" style="flex-shrink: 0; padding: 0 14px; height: 42px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700;">
                <span class="preview-icon">▶</span>
                <span class="preview-text">Test Putar</span>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>Judul Lagu *</label>
            <input type="text" name="songs[${bulkRowIndex}][title]" class="form-control song-title" placeholder="contoh: Believer" required>
          </div>

          <div class="form-group">
            <label>Nama Artist / Penyanyi *</label>
            <input type="text" name="songs[${bulkRowIndex}][artist]" class="form-control song-artist" placeholder="contoh: Imagine Dragons" required>
          </div>

          <div class="form-group">
            <label>Direct Cover Image URL (Opsional)</label>
            <input type="url" name="songs[${bulkRowIndex}][cover_url]" class="form-control song-cover-url" placeholder="https://cdn.example.com/covers/image.jpg">
          </div>

          <div class="form-group">
            <label>Link Video YouTube (Opsional)</label>
            <input type="url" name="songs[${bulkRowIndex}][youtube_url]" class="form-control song-youtube-url" placeholder="https://youtube.com/watch?v=...">
          </div>

          <div class="form-group">
            <label>Album (Opsional)</label>
            <input type="text" name="songs[${bulkRowIndex}][album]" class="form-control song-album" placeholder="contoh: Evolve">
          </div>

          <div class="form-group">
            <label>Genre (Opsional)</label>
            <input type="text" name="songs[${bulkRowIndex}][genre]" class="form-control song-genre" placeholder="contoh: Rock, Pop, R&B">
          </div>

          <div class="form-group" style="grid-column: span 2;">
            <label>Deskripsi / Catatan Rilis (Opsional)</label>
            <input type="text" name="songs[${bulkRowIndex}][description]" class="form-control song-description" placeholder="Catatan singkat tentang lagu...">
          </div>
        </div>
      `;

      container.appendChild(newCard);
      reindexBulkSongRows();

      const audioInput = newCard.querySelector('.song-audio-url');
      if (audioInput) {
        audioInput.focus();
      }
    }

    function removeBulkSongRow(btn) {
      const card = btn.closest('.bulk-song-card');
      if (card) {
        if (currentPreviewBtn && card.contains(currentPreviewBtn)) {
          if (currentPreviewAudio) {
            currentPreviewAudio.pause();
            currentPreviewAudio = null;
            currentPreviewBtn = null;
          }
        }
        card.remove();
        reindexBulkSongRows();
      }
    }

    function reindexBulkSongRows() {
      const cards = document.querySelectorAll('#bulkSongsContainer .bulk-song-card');
      const total = cards.length;

      cards.forEach((card, idx) => {
        const numSpan = card.querySelector('.song-num');
        if (numSpan) numSpan.textContent = idx + 1;

        const removeBtn = card.querySelector('.btn-remove-row');
        if (removeBtn) {
          removeBtn.style.display = total > 1 ? 'inline-flex' : 'none';
        }

        const fields = card.querySelectorAll('input');
        fields.forEach(input => {
          const name = input.getAttribute('name');
          if (name) {
            input.setAttribute('name', name.replace(/songs\[\d+\]/, `songs[${idx}]`));
          }
        });
      });

      const totalCountEl = document.getElementById('bulkSongTotalCount');
      if (totalCountEl) totalCountEl.textContent = total;

      const submitTextEl = document.getElementById('btnSubmitBulkText');
      if (submitTextEl) {
        submitTextEl.textContent = `Simpan & Terbitkan Semua ke Library (${total} Lagu)`;
      }
    }

    function handleAudioUrlChange(input) {
      const url = input.value.trim();
      if (!url) return;

      const card = input.closest('.bulk-song-card');
      if (!card) return;

      const titleInput = card.querySelector('.song-title');
      const artistInput = card.querySelector('.song-artist');

      if (titleInput && artistInput && (!titleInput.value.trim() || !artistInput.value.trim())) {
        try {
          const pathname = new URL(url).pathname;
          let filename = pathname.substring(pathname.lastIndexOf('/') + 1);
          filename = decodeURIComponent(filename);
          filename = filename.replace(/\.(mp3|wav|flac|m4a|ogg|mp4)$/i, '');

          if (filename.includes(' - ')) {
            const parts = filename.split(' - ');
            if (!artistInput.value.trim() && parts[0]) {
              artistInput.value = parts[0].trim();
            }
            if (!titleInput.value.trim() && parts.slice(1).join(' - ')) {
              titleInput.value = parts.slice(1).join(' - ').trim();
            }
          } else if (!titleInput.value.trim() && filename) {
            titleInput.value = filename.trim();
          }
        } catch (e) {
        }
      }
    }

    // ============================================================
    // AUDIO QUICK PREVIEW CONTROLLER
    // ============================================================
    let currentPreviewAudio = null;
    let currentPreviewBtn = null;

    function toggleAudioPreview(btn) {
      const card = btn.closest('.bulk-song-card');
      if (!card) return;

      const audioInput = card.querySelector('.song-audio-url');
      const statusEl = card.querySelector('.preview-status');
      const iconEl = btn.querySelector('.preview-icon');
      const textEl = btn.querySelector('.preview-text');
      const url = audioInput ? audioInput.value.trim() : '';

      if (!url) {
        if (statusEl) {
          statusEl.textContent = '⚠️ Masukkan link audio dulu!';
          statusEl.style.color = 'var(--danger)';
        }
        if (audioInput) audioInput.focus();
        return;
      }

      // If this button is already playing, pause it
      if (currentPreviewBtn === btn && currentPreviewAudio && !currentPreviewAudio.paused) {
        currentPreviewAudio.pause();
        resetPreviewBtn(btn, statusEl);
        currentPreviewAudio = null;
        currentPreviewBtn = null;
        return;
      }

      // Stop any other currently playing preview
      if (currentPreviewAudio) {
        currentPreviewAudio.pause();
        if (currentPreviewBtn) {
          const prevCard = currentPreviewBtn.closest('.bulk-song-card');
          const prevStatus = prevCard ? prevCard.querySelector('.preview-status') : null;
          resetPreviewBtn(currentPreviewBtn, prevStatus);
        }
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      }

      // Start playing new preview
      if (statusEl) {
        statusEl.textContent = '⏳ Menghubungkan audio...';
        statusEl.style.color = 'var(--accent)';
      }
      if (iconEl) iconEl.textContent = '⏳';
      if (textEl) textEl.textContent = 'Loading...';

      const audio = new Audio();
      audio.src = url;
      currentPreviewAudio = audio;
      currentPreviewBtn = btn;

      audio.oncanplay = function() {
        audio.play().then(() => {
          if (iconEl) iconEl.textContent = '⏸';
          if (textEl) textEl.textContent = 'Stop Putar';
          btn.style.borderColor = 'var(--accent)';
          btn.style.color = 'var(--accent)';
          if (statusEl) {
            statusEl.textContent = '🔊 Sedang memutar preview...';
            statusEl.style.color = 'var(--accent)';
          }
        }).catch(err => {
          resetPreviewBtn(btn, statusEl);
          if (statusEl) {
            statusEl.textContent = '❌ Gagal memutar: format tidak didukung / CORS diblokir server hosting.';
            statusEl.style.color = 'var(--danger)';
          }
          currentPreviewAudio = null;
          currentPreviewBtn = null;
        });
      };

      audio.onerror = function() {
        resetPreviewBtn(btn, statusEl);
        if (statusEl) {
          statusEl.textContent = '❌ Link audio error / 404 Not Found';
          statusEl.style.color = 'var(--danger)';
        }
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      };

      audio.onended = function() {
        resetPreviewBtn(btn, statusEl);
        if (statusEl) {
          statusEl.textContent = '✓ Selesai';
          statusEl.style.color = 'var(--success)';
        }
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      };
    }

    function resetPreviewBtn(btn, statusEl) {
      if (!btn) return;
      const iconEl = btn.querySelector('.preview-icon');
      const textEl = btn.querySelector('.preview-text');
      if (iconEl) iconEl.textContent = '▶';
      if (textEl) textEl.textContent = 'Test Putar';
      btn.style.borderColor = '';
      btn.style.color = '';
      if (statusEl) {
        statusEl.textContent = '';
      }
    }

    function playModerationAudio(url, btn) {
      if (!url) return;
      const iconEl = btn.querySelector('.mod-icon');
      const textEl = btn.querySelector('.mod-label');

      if (currentPreviewBtn === btn && currentPreviewAudio && !currentPreviewAudio.paused) {
        currentPreviewAudio.pause();
        if (iconEl) iconEl.textContent = '▶';
        if (textEl) textEl.textContent = 'Dengar';
        btn.style.color = '';
        currentPreviewAudio = null;
        currentPreviewBtn = null;
        return;
      }

      if (currentPreviewAudio) {
        currentPreviewAudio.pause();
        if (currentPreviewBtn) {
          const prevIcon = currentPreviewBtn.querySelector('.mod-icon') || currentPreviewBtn.querySelector('.preview-icon');
          const prevText = currentPreviewBtn.querySelector('.mod-label') || currentPreviewBtn.querySelector('.preview-text');
          if (prevIcon) prevIcon.textContent = '▶';
          if (prevText) prevText.textContent = prevText.classList?.contains('mod-label') ? 'Dengar' : 'Test Putar';
          currentPreviewBtn.style.color = '';
        }
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      }

      if (iconEl) iconEl.textContent = '⏳';
      if (textEl) textEl.textContent = 'Loading...';

      const audio = new Audio();
      audio.src = url;
      currentPreviewAudio = audio;
      currentPreviewBtn = btn;

      audio.oncanplay = function() {
        audio.play().then(() => {
          if (iconEl) iconEl.textContent = '⏸';
          if (textEl) textEl.textContent = 'Stop';
          btn.style.color = 'var(--accent)';
        }).catch(() => {
          if (iconEl) iconEl.textContent = '▶';
          if (textEl) textEl.textContent = 'Dengar';
          btn.style.color = '';
          currentPreviewAudio = null;
          currentPreviewBtn = null;
        });
      };

      audio.onerror = function() {
        alert('Gagal memutar audio preview: file rusak atau URL tidak dapat diakses.');
        if (iconEl) iconEl.textContent = '▶';
        if (textEl) textEl.textContent = 'Dengar';
        btn.style.color = '';
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      };

      audio.onended = function() {
        if (iconEl) iconEl.textContent = '▶';
        if (textEl) textEl.textContent = 'Dengar';
        btn.style.color = '';
        currentPreviewAudio = null;
        currentPreviewBtn = null;
      };
    }

    function togglePasswordVisibility(inputId, btn) {
      const input = document.getElementById(inputId);
      if (!input) return;
      const isPass = input.type === 'password';
      input.type = isPass ? 'text' : 'password';
      btn.style.color = isPass ? 'var(--accent)' : 'var(--text-muted)';
      btn.innerHTML = isPass
        ? '<svg class="icon" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
        : '<svg class="icon" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }

    function openEditUserModal(user) {
      document.getElementById('editUserForm').action = '{{ url("/admin/users") }}/' + user.id;
      document.getElementById('edit_user_name').value = user.name || '';
      document.getElementById('edit_user_email').value = user.email || '';
      document.getElementById('edit_user_password').value = '';
      document.getElementById('edit_user_password_confirmation').value = '';
      document.getElementById('editUserModal').style.display = 'flex';
    }

    function closeEditUserModal() {
      document.getElementById('editUserModal').style.display = 'none';
    }

    function openEditPendingSongModal(song) {
      document.getElementById('editPendingSongForm').action = '{{ url("/admin/music") }}/' + song.id + '/approve-edit';
      document.getElementById('eps_title').value = song.title || '';
      document.getElementById('eps_artist').value = song.artist || '';
      document.getElementById('eps_audio_url').value = song.audio_file || '';
      document.getElementById('eps_cover_url').value = (song.cover_image && song.cover_image !== 'believer.jpg') ? song.cover_image : '';
      document.getElementById('eps_youtube_url').value = song.youtube_url || '';
      document.getElementById('eps_album').value = song.album || '';
      document.getElementById('eps_genre').value = song.genre || '';
      document.getElementById('eps_description').value = song.description || '';
      document.getElementById('editPendingSongModal').style.display = 'flex';
    }

    function closeEditPendingSongModal() {
      document.getElementById('editPendingSongModal').style.display = 'none';
    }

    function openEditModal(song) {
      document.getElementById('editForm').action = '{{ url("/admin/music") }}/' + song.id;
      document.getElementById('edit_title').value = song.title || '';
      document.getElementById('edit_artist').value = song.artist || '';
      document.getElementById('edit_album').value = song.album || '';
      document.getElementById('edit_genre').value = song.genre || '';
      document.getElementById('edit_description').value = song.description || '';
      document.getElementById('editModal').style.display = 'flex';
    }

    function closeEditModal() {
      document.getElementById('editModal').style.display = 'none';
    }

    // ============================================================
    // VISITOR ANALYTICS CHART CONTROLLER (Chart.js)
    // ============================================================
    const analyticsData = @json($analyticsData ?? []);
    let visitorChartInstance = null;

    function getChartOptions(yTitle, isStacked) {
      return {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: isStacked,
            labels: {
              color: '#9a9ca6',
              font: { family: "'Space Grotesk', monospace", size: 11 },
              boxWidth: 12,
              usePointStyle: true,
            }
          },
          tooltip: {
            backgroundColor: '#202227',
            titleColor: '#fff',
            bodyColor: '#ccf228',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 8,
          }
        },
        scales: {
          x: {
            stacked: isStacked,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9a9ca6', font: { family: "'Space Grotesk', monospace", size: 10 } }
          },
          y: {
            stacked: isStacked,
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9a9ca6', font: { family: "'Space Grotesk', monospace", size: 10 } },
            title: {
              display: !!yTitle,
              text: yTitle,
              color: '#6e717c',
              font: { size: 10, family: "'Space Grotesk', monospace" }
            }
          }
        }
      };
    }

    function switchChart(period) {
      const canvas = document.getElementById('visitorChart');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (visitorChartInstance) {
        visitorChartInstance.destroy();
      }

      document.querySelectorAll('.chart-filter-btn').forEach(b => b.classList.remove('active'));
      const activeBtn = document.getElementById('filter-' + period);
      if (activeBtn) activeBtn.classList.add('active');

      const metaType = document.getElementById('chartMetaType');

      if (period === 'daily') {
        // 1. Harian: 24 Jam (Bar Chart)
        if (metaType) metaType.textContent = 'Format: Bar Chart (24 Jam per Jam)';
        visitorChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: analyticsData.daily?.labels || [],
            datasets: [{
              label: 'Pengunjung Aktif',
              data: analyticsData.daily?.data || [],
              backgroundColor: '#ccf228',
              hoverBackgroundColor: '#dbfa43',
              borderRadius: 6,
              barPercentage: 0.65,
            }]
          },
          options: getChartOptions('Total Pengunjung', false)
        });
      } else if (period === 'weekly') {
        // 2. Mingguan: 7 Hari (Stacked Bar Chart: Unique Visitors + Views)
        if (metaType) metaType.textContent = 'Format: Stacked Bar Chart (7 Hari Mingguan)';
        visitorChartInstance = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: analyticsData.weekly?.labels || [],
            datasets: [
              {
                label: 'Pengunjung Unik',
                data: analyticsData.weekly?.unique || [],
                backgroundColor: '#3b82f6',
                borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 4, bottomRight: 4 },
                barPercentage: 0.55,
              },
              {
                label: 'Tampilan / Sesi Streaming',
                data: analyticsData.weekly?.views || [],
                backgroundColor: '#ccf228',
                borderRadius: { topLeft: 4, topRight: 4, bottomLeft: 0, bottomRight: 0 },
                barPercentage: 0.55,
              }
            ]
          },
          options: getChartOptions('Volume Trafik', true)
        });
      } else if (period === 'monthly') {
        // 3. Bulanan: 4 Minggu (Line Chart)
        if (metaType) metaType.textContent = 'Format: Grafik Garis / Line Chart (4 Minggu)';
        visitorChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: analyticsData.monthly?.labels || [],
            datasets: [{
              label: 'Total Kunjungan Mingguan',
              data: analyticsData.monthly?.data || [],
              borderColor: '#a855f7',
              backgroundColor: 'rgba(168, 85, 247, 0.15)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#a855f7',
              pointBorderColor: '#fff',
              pointRadius: 6,
              pointHoverRadius: 8,
              borderWidth: 3,
            }]
          },
          options: getChartOptions('Pengunjung', false)
        });
      } else if (period === 'yearly') {
        // 4. Tahunan: 12 Bulan (Gradient Area Spline Wave)
        if (metaType) metaType.textContent = 'Format: Gradient Area Wave Chart (12 Bulan Tahunan)';
        visitorChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: analyticsData.yearly?.labels || [],
            datasets: [{
              label: 'Pertumbuhan Trafik Tahunan',
              data: analyticsData.yearly?.data || [],
              borderColor: '#06b6d4',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              fill: true,
              tension: 0.45,
              pointBackgroundColor: '#06b6d4',
              pointBorderColor: '#fff',
              pointRadius: 5,
              pointHoverRadius: 8,
              borderWidth: 3,
            }]
          },
          options: getChartOptions('Akumulasi Sesi', false)
        });
      }
    }

    // Auto initialize daily chart on load
    document.addEventListener('DOMContentLoaded', () => {
      switchChart('daily');
    });

    // ==========================================
    // Admin Theme & Mode Management System
    // ==========================================
    const THEME_KEY = 'spotirid_admin_theme';
    const MODE_KEY = 'spotirid_admin_mode';

    function getCurrentMode() {
      return localStorage.getItem(MODE_KEY) || 'dark';
    }

    function getCurrentTheme() {
      return localStorage.getItem(THEME_KEY) || 'default';
    }

    function setAdminMode(mode) {
      localStorage.setItem(MODE_KEY, mode);
      if (mode === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
      updateModeUI(mode);
      if (typeof currentPeriod !== 'undefined' && currentPeriod) {
        switchChart(currentPeriod);
      }
    }

    function setAdminTheme(theme) {
      localStorage.setItem(THEME_KEY, theme);
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      updateThemeUI(theme);
      if (typeof currentPeriod !== 'undefined' && currentPeriod) {
        switchChart(currentPeriod);
      }
    }

    function updateModeUI(mode) {
      const sunIcon = document.getElementById('quickIconSun');
      const moonIcon = document.getElementById('quickIconMoon');
      const modeLabel = document.getElementById('quickModeLabel');
      const btnDark = document.getElementById('btnModeDark');
      const btnLight = document.getElementById('btnModeLight');

      if (mode === 'light') {
        if (sunIcon) sunIcon.style.display = 'block';
        if (moonIcon) moonIcon.style.display = 'none';
        if (modeLabel) modeLabel.textContent = 'Light';
        if (btnLight) btnLight.classList.add('active');
        if (btnDark) btnDark.classList.remove('active');
      } else {
        if (sunIcon) sunIcon.style.display = 'none';
        if (moonIcon) moonIcon.style.display = 'block';
        if (modeLabel) modeLabel.textContent = 'Dark';
        if (btnDark) btnDark.classList.add('active');
        if (btnLight) btnLight.classList.remove('active');
      }
    }

    function updateThemeUI(theme) {
      document.querySelectorAll('#adminThemeSwatches .theme-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
      });
    }

    const quickToggle = document.getElementById('quickModeToggle');
    if (quickToggle) {
      quickToggle.addEventListener('click', () => {
        const nextMode = getCurrentMode() === 'light' ? 'dark' : 'light';
        setAdminMode(nextMode);
      });
    }

    const btnDark = document.getElementById('btnModeDark');
    if (btnDark) {
      btnDark.addEventListener('click', () => setAdminMode('dark'));
    }
    const btnLight = document.getElementById('btnModeLight');
    if (btnLight) {
      btnLight.addEventListener('click', () => setAdminMode('light'));
    }

    document.querySelectorAll('#adminThemeSwatches .theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setAdminTheme(btn.dataset.theme);
      });
    });

    updateModeUI(getCurrentMode());
    updateThemeUI(getCurrentTheme());
  </script>
</body>
</html>
