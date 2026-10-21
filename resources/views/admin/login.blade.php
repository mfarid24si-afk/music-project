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
    html.light { filter: none; }
    html[data-theme="acid-lime"] { --accent: #ccf228; --accent-hover: #dbfa43; --accent-glow: rgba(204,242,40,0.22); --border-accent: rgba(204,242,40,0.35); }
    html[data-theme="cyberpunk"] { --accent: #ff3b9d; --accent-hover: #ff5fb0; --accent-glow: rgba(255,59,157,0.28); --border-accent: rgba(255,59,157,0.4); }
    html[data-theme="ocean"] { --accent: #22d3ee; --accent-hover: #38e8ff; --accent-glow: rgba(34,211,238,0.28); --border-accent: rgba(34,211,238,0.4); }
    html[data-theme="violet"] { --accent: #a78bfa; --accent-hover: #b99bff; --accent-glow: rgba(167,139,250,0.28); --border-accent: rgba(167,139,250,0.4); }
    html[data-theme="sunset"] { --accent: #fb923c; --accent-hover: #ff9f4a; --accent-glow: rgba(251,146,60,0.28); --border-accent: rgba(251,146,60,0.4); }
    html[data-theme="emerald"] { --accent: #34d399; --accent-hover: #4adeaa; --accent-glow: rgba(52,211,153,0.28); --border-accent: rgba(52,211,153,0.4); }
    html.light {
      --bg-primary: #f8f9fb;
      --bg-surface: #ffffff;
      --bg-elevated: #f6f7fa;
      --border-subtle: rgba(15,15,20,0.08);
      --text-main: #15151a;
      --text-muted: #5f616d;
    }
    body {
      background: radial-gradient(circle at 50% 20%, rgba(255,255,255,0.02) 0%, var(--bg-primary) 70%);
      color: var(--text-main);
      font-family: var(--font-body);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      position: relative;
      overflow: hidden;
    }
    .studio-atmosphere {
      position: fixed;
      inset: 0;
      z-index: -1;
      pointer-events: none;
      background-image: radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 60px 60px;
      mix-blend-mode: screen;
      opacity: 0.25;
    }
    .aurora {
      position: fixed;
      filter: blur(140px);
      opacity: 0.35;
      pointer-events: none;
      z-index: -1;
    }
    .aurora-one { width: 520px; height: 520px; left: 10%; top: 10%; background: radial-gradient(circle, var(--accent-glow), transparent 70%); animation: auroraMove 18s ease-in-out infinite; }
    .aurora-two { width: 620px; height: 620px; right: 12%; bottom: 12%; background: radial-gradient(circle, var(--accent-glow), transparent 70%); animation: auroraMove 22s ease-in-out infinite reverse; }
    @keyframes auroraMove { 0%,100%{ transform: translate(0,0) scale(1); } 50%{ transform: translate(40px,-30px) scale(1.08); } }
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
      background: color-mix(in oklab, var(--bg-surface) 92%, transparent);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      box-shadow: 0 16px 36px -12px rgba(0,0,0,0.35), inset 0 1px 0 0 rgba(255,255,255,0.1);
      padding: 32px 30px 28px;
      transform-style: preserve-3d;
      will-change: transform;
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
    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      width: 100%;
    }
    .password-wrapper .form-input {
      padding-right: 44px;
    }
    .toggle-password-btn {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s, background 0.2s;
    }
    .toggle-password-btn:hover {
      color: var(--accent);
      background: rgba(255, 255, 255, 0.06);
    }
    .toggle-password-btn svg {
      width: 18px;
      height: 18px;
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
        background: radial-gradient(120% 120% at 50% 0%, #fff 0%, var(--accent) 55%, var(--accent-hover) 100%);
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
        transition: transform 160ms ease, box-shadow 200ms ease;
        box-shadow: 0 8px 24px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.4);
        position: relative;
        overflow: hidden;
      }
      .btn-submit::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
        transform: translateX(-120%);
      }
      .btn-submit:hover { background: var(--accent-hover); box-shadow: 0 12px 30px var(--accent-glow); }
      .btn-submit:hover::after { animation: shimmer 900ms ease; }
      .btn-submit:active { transform: scale(0.98); }
      @keyframes shimmer { to { transform: translateX(120%); } }
    .btn-submit::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
      transform: translateX(-120%);
    }
    .btn-submit:hover {
      background: var(--accent-hover);
      box-shadow: 0 12px 30px var(--accent-glow);
    }
    .btn-submit:hover::after { animation: shimmer 900ms ease; }
    .btn-submit:active {
      transform: scale(0.98);
    }
    @keyframes shimmer { to { transform: translateX(120%); } }
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
    <div class="studio-atmosphere"></div>
    <div class="aurora aurora-one"></div>
    <div class="aurora aurora-two"></div>
    <script>
      (function(){
        const t = localStorage.getItem('spotify_ultra_theme') || localStorage.getItem('spotirid_admin_theme') || 'default';
        const m = localStorage.getItem('spotify_ultra_color_mode') || localStorage.getItem('spotirid_admin_mode') || 'dark';
        if(t!=='default') document.documentElement.setAttribute('data-theme', t);
        if(m==='light'){ document.documentElement.classList.add('light'); document.documentElement.classList.remove('dark'); }
        else { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
        try{ localStorage.setItem('spotify_ultra_theme',t); localStorage.setItem('spotirid_admin_theme',t); localStorage.setItem('spotify_ultra_color_mode',m); localStorage.setItem('spotirid_admin_mode',m);}catch(e){}
      })();
    </script>
  <div class="login-container" id="loginTilt">
      <div class="brand-header">
        <div class="brand-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          <span>Administrator Portal</span>
        </div>
        <h1 class="brand-title" style="display:flex;align-items:center;justify-content:center;gap:10px;">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="animation:spin 14s linear infinite;filter:drop-shadow(0 0 12px var(--accent-glow));">
            <circle cx="12" cy="12" r="8" stroke="var(--accent)" stroke-width="1.2" opacity="0.9"/>
            <circle cx="12" cy="12" r="4" stroke="var(--accent)" stroke-width="1.2" opacity="0.7"/>
            <circle cx="12" cy="12" r="1.2" fill="var(--accent)"/>
            <path d="M12 4v2M12 18v2M4 12h2M18 12h2" stroke="var(--accent)" stroke-width="1.2" opacity="0.6"/>
          </svg>
          Spotirid Admin
        </h1>
        <p class="brand-subtitle">Studio Control Room</p>
        <style>@keyframes spin{to{transform:rotate(360deg);}}</style>
      </div>

      <div class="card">
        <script>
          (function(){
            const card=document.currentScript.parentElement;
            if(!card) return;
            const clamp=(v,m,M)=>Math.max(m,Math.min(M,v));
            card.addEventListener('mousemove',e=>{
              const r=card.getBoundingClientRect();
              const x=(e.clientX-r.left)/r.width-.5;
              const y=(e.clientY-r.top)/r.height-.5;
              card.style.transition='transform 70ms ease';
              card.style.transform='perspective(900px) rotateX('+clamp(-y*4,-4,4)+'deg) rotateY('+clamp(x*4,-4,4)+'deg) translateZ(8px)';
            });
            card.addEventListener('mouseleave',()=>{
              card.style.transition='transform 260ms ease';
              card.style.transform='perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
            });
          })();
        </script>
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
          <div class="password-wrapper">
            <input
              type="password"
              id="password"
              name="password"
              class="form-input"
              placeholder="••••••••"
              required
            >
            <button
              type="button"
              id="togglePasswordBtn"
              class="toggle-password-btn"
              title="Tampilkan / Sembunyikan Password"
              aria-label="Tampilkan password"
            >
              <svg id="eyeIconOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg id="eyeIconClosed" style="display: none;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
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
  <script>
    (function() {
      const passwordInput = document.getElementById('password');
      const toggleBtn = document.getElementById('togglePasswordBtn');
      const eyeOpen = document.getElementById('eyeIconOpen');
      const eyeClosed = document.getElementById('eyeIconClosed');

      if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener('click', function(e) {
          e.preventDefault();
          const isPassword = passwordInput.getAttribute('type') === 'password';
          if (isPassword) {
            passwordInput.setAttribute('type', 'text');
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
            toggleBtn.setAttribute('title', 'Sembunyikan Password');
          } else {
            passwordInput.setAttribute('type', 'password');
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
            toggleBtn.setAttribute('title', 'Tampilkan Password');
          }
          passwordInput.focus();
        });
      }
    })();
  </script>
</body>
</html>
