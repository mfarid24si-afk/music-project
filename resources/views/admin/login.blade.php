<!DOCTYPE html>
<html lang="id" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login - Spotirid</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ccf228' stroke-width='2'><rect x='3' y='11' width='18' height='11' rx='2' ry='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
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
      --text-main: #f3f3f5;
      --text-muted: #9a9ca6;
      --font-body: 'Hanken Grotesk', -apple-system, sans-serif;
      --font-mono: 'Space Grotesk', monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: radial-gradient(circle at 50% 20%, #1a1c22 0%, var(--bg-primary) 70%);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    .login-container {
      width: 100%;
      max-width: 440px;
      animation: fadeSlideUp 0.4s ease-out;
    }
    .brand-header {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      background: rgba(204, 242, 40, 0.1);
      border: 1px solid var(--border-accent);
      border-radius: 50px;
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .brand-badge svg {
      width: 12px;
      height: 12px;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #fff;
    }
    .brand-subtitle {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
    }
    .card {
      background: var(--bg-surface);
      border: 1px solid var(--border-subtle);
      border-radius: 20px;
      padding: 32px 28px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.45);
    }
    .form-group {
      margin-bottom: 18px;
    }
    .form-label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-main);
      margin-bottom: 6px;
      text-transform: uppercase;
      font-family: var(--font-mono);
      letter-spacing: 0.5px;
    }
    .form-input {
      width: 100%;
      height: 44px;
      padding: 0 14px;
      background: var(--bg-elevated);
      border: 1px solid var(--border-subtle);
      border-radius: 10px;
      color: #fff;
      font-size: 14px;
      font-family: var(--font-body);
      transition: all 0.2s ease;
      outline: none;
    }
    .form-input:focus {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--accent-glow);
    }
    .checkbox-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 22px;
      font-size: 12px;
      color: var(--text-muted);
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }
    .btn-submit {
      width: 100%;
      height: 48px;
      background: var(--accent);
      color: #000;
      border: none;
      border-radius: 50px;
      font-size: 14px;
      font-weight: 800;
      font-family: var(--font-body);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 8px 24px var(--accent-glow);
    }
    .btn-submit:hover {
      background: var(--accent-hover);
      transform: translateY(-1px);
    }
    .btn-submit:active {
      transform: translateY(1px);
    }
    .btn-submit svg {
      width: 16px;
      height: 16px;
    }
    .alert {
      padding: 12px 14px;
      border-radius: 10px;
      font-size: 13px;
      line-height: 1.4;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .alert svg {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
    .alert-error {
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
    }
    .alert-info {
      background: rgba(59, 130, 246, 0.12);
      border: 1px solid rgba(59, 130, 246, 0.3);
      color: #93c5fd;
    }
    .back-home {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      margin-top: 24px;
      font-size: 13px;
      color: var(--text-muted);
      text-decoration: none;
      transition: color 0.2s ease;
    }
    .back-home:hover {
      color: #fff;
    }
    .back-home svg {
      width: 14px;
      height: 14px;
    }
    @keyframes fadeSlideUp {
      from { opacity: 0; transform: translateY(14px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
</head>
<body>
  <div class="login-container">
    <div class="brand-header">
      <div class="brand-badge">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span>Administrator Portal</span>
      </div>
      <h1 class="brand-title">Spotirid</h1>
      <p class="brand-subtitle">Pusat Manajemen Musik & Moderasi Playlist</p>
    </div>

    <div class="card">
      @if (session('error'))
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ session('error') }}</span>
        </div>
      @endif

      @if (session('info'))
        <div class="alert alert-info">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>{{ session('info') }}</span>
        </div>
      @endif

      @if ($errors->any())
        <div class="alert alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <div>
            @foreach ($errors->all() as $err)
              <div>• {{ $err }}</div>
            @endforeach
          </div>
        </div>
      @endif

      <form method="POST" action="{{ url('/admin/login') }}">
        @csrf

        <div class="form-group">
          <label class="form-label" for="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            class="form-input"
            value="{{ old('email') }}"
            placeholder="contoh: admin@domain.com"
            required
            autofocus
          >
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            class="form-input"
            placeholder="••••••••"
            required
          >
        </div>

        <div class="checkbox-row">
          <label class="checkbox-label">
            <input type="checkbox" name="remember" value="1">
            <span>Ingat saya di perangkat ini</span>
          </label>
        </div>

        <button type="submit" class="btn-submit">
          <span>Masuk ke Dashboard</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </form>
    </div>

    <a href="{{ url('/') }}" class="back-home">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </svg>
      <span>Kembali ke Beranda Musik</span>
    </a>
  </div>
</body>
</html>
