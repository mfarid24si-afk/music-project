<?php
$appBase = rtrim(dirname($_SERVER['SCRIPT_NAME'] ?? '/'), '/\\');
$appBase = ($appBase === '' || $appBase === '.') ? '/' : $appBase.'/';
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Settings - Spotirid</title>
  <link rel="stylesheet" href="style.css">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL@20..48,100..700,0..1&display=swap" rel="stylesheet">
  <style>
    body{overflow-y:auto;height:auto;min-height:100vh;background:var(--bg-primary);font-family:var(--font)}
    .settings-page{max-width:760px;margin:0 auto;padding:32px 24px 120px;animation:fadeSlideUp .4s ease}
    .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;flex-wrap:wrap;gap:12px}
    .page-header h1{font-size:28px;font-weight:700}
    .header-actions{display:flex;gap:10px}
    .header-actions a{color:var(--text-secondary);text-decoration:none;font-size:14px;display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:50px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.08);transition:all var(--transition-base)}
    .header-actions a:hover{background:rgba(255,255,255,0.12);color:var(--text-primary)}
    .settings-card{background:var(--bg-secondary);border:1px solid rgba(255,255,255,0.06);border-radius:var(--radius-lg);margin-bottom:20px;overflow:hidden}
    .card-head{display:flex;align-items:center;gap:12px;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.06)}
    .card-head .card-icon{width:38px;height:38px;border-radius:var(--radius-md);background:rgba(29,185,84,0.12);color:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .card-head .card-icon .material-symbols-outlined{font-size:20px}
    .card-head h2{font-size:17px;font-weight:700;margin:0}
    .card-head p{font-size:12px;color:var(--text-muted);margin:2px 0 0}
    .card-body{padding:20px 24px;display:flex;flex-direction:column;gap:18px}
    .setting-row{display:flex;align-items:center;justify-content:space-between;gap:16px}
    .setting-info{min-width:0}
    .setting-info .s-label{font-size:14px;font-weight:600;color:var(--text-primary)}
    .setting-info .s-desc{font-size:12px;color:var(--text-muted);margin-top:2px}
    .setting-row .set-control{margin-left:auto}
    .full-row{display:flex;flex-direction:column;gap:8px}
    .full-row label{font-size:12px;font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:.5px}
    .full-row input[type="text"],.full-row input[type="url"]{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);outline:none;color:var(--text-primary);padding:10px 14px;border-radius:var(--radius-sm);font-size:14px;font-family:var(--font);transition:all var(--transition-fast);width:100%}
    .full-row input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-glow)}
    .range-wrap{display:flex;align-items:center;gap:14px;width:100%}
    input[type="range"]{flex:1;accent-color:var(--accent)}
    .range-val{min-width:48px;text-align:right;font-size:13px;font-weight:700;color:var(--text-primary);font-variant-numeric:tabular-nums}
    /* Toggle switch */
    .switch{position:relative;width:46px;height:26px;flex-shrink:0;cursor:pointer}
    .switch input{opacity:0;width:0;height:0}
    .slider-sw{position:absolute;inset:0;background:rgba(255,255,255,0.12);border-radius:50px;transition:all var(--transition-base)}
    .slider-sw:before{content:"";position:absolute;width:20px;height:20px;border-radius:50%;background:#fff;top:3px;left:3px;transition:all var(--transition-base)}
    .switch input:checked + .slider-sw{background:var(--accent)}
    .switch input:checked + .slider-sw:before{transform:translateX(20px)}
    .theme-grid{display:flex;gap:12px;flex-wrap:wrap}
    .theme-btn{width:38px;height:38px;border-radius:var(--radius-full);border:2px solid rgba(255,255,255,0.14);background:var(--dot,#ccf228);cursor:pointer;transition:all var(--transition-fast);padding:0}
    .theme-btn:hover{transform:scale(1.1)}
    .theme-btn.active{border-color:#fff;box-shadow:0 0 0 3px rgba(255,255,255,0.25)}
    .hint-box{font-size:12px;color:var(--text-muted);padding:12px 14px;background:rgba(255,255,255,0.04);border-radius:var(--radius-sm);line-height:1.5}
    .avatar-preview{display:flex;align-items:center;gap:12px}
    .avatar-preview .avatar-lg{width:52px;height:52px;border-radius:var(--radius-full);background:linear-gradient(135deg,var(--accent),#0a0a0a);color:#000;font-weight:800;font-size:18px;display:flex;align-items:center;justify-content:center;flex-shrink:0;border:2px solid rgba(255,255,255,0.12)}
    .btn-save{background:var(--accent);color:#000;border:none;padding:12px 32px;border-radius:50px;font-size:14px;font-weight:700;font-family:var(--font);cursor:pointer;transition:all var(--transition-base);display:flex;align-items:center;gap:8px}
    .btn-save:hover{background:var(--accent-hover);transform:translateY(-2px)}
    .toast-container{position:fixed;top:20px;right:20px;z-index:1000;display:flex;flex-direction:column;gap:8px;pointer-events:none}
    .toast{background:rgba(30,30,30,0.95);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.08);padding:12px 20px;border-radius:10px;color:#fff;font-size:13px;font-weight:500;box-shadow:0 8px 32px rgba(0,0,0,0.4);animation:toastIn .3s ease,toastOut .3s ease 2.5s forwards;pointer-events:all}
    .toast.success{border-left:3px solid #1db954}
    .toast.info{border-left:3px solid #3498db}
    @keyframes toastIn{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:translateX(0)}}
    @keyframes toastOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(40px)}}
    @keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @media(max-width:640px){
      .settings-page{padding:20px 16px 100px}
      .setting-row{flex-direction:column;align-items:flex-start}
      .setting-row .set-control{margin-left:0}
      .range-wrap{width:100%}
    }
  </style>
</head>
<body>
  <div class="toast-container" id="toastContainer"></div>

  <div class="settings-page">
    <div class="page-header">
      <h1>⚙️ Settings</h1>
      <div class="header-actions">
        <a href="<?= $appBase ?>admin/login">🔐 Admin Portal</a>
        <a href="<?= $appBase ?>">← Beranda Player</a>
      </div>
    </div>

    <!-- ========== GENERAL ========== -->
    <div class="settings-card">
      <div class="card-head">
        <div class="card-icon"><span class="material-symbols-outlined">settings</span></div>
        <div>
          <h2>General</h2>
          <p>Identity & appearance of this player</p>
        </div>
      </div>
      <div class="card-body">
        <div class="full-row">
          <label for="appNameInput">App Name</label>
          <input type="text" id="appNameInput" placeholder="Spotirid" maxlength="40">
          <span class="hint-box">Menentukan nama aplikasi yang tampil di judul tab & brand sidebar player.</span>
        </div>
        <div class="full-row">
          <label>Theme</label>
          <div class="theme-grid" id="themeGrid">
            <button type="button" class="theme-btn active" data-theme="default" title="Acid Lime" style="--dot:#ccf228"></button>
            <button type="button" class="theme-btn" data-theme="purple" title="Electric Violet" style="--dot:#a855f7"></button>
            <button type="button" class="theme-btn" data-theme="blue" title="Deep Cobalt" style="--dot:#3b82f6"></button>
            <button type="button" class="theme-btn" data-theme="cyberpunk" title="Hot Pink" style="--dot:#ec4899"></button>
            <button type="button" class="theme-btn" data-theme="sunset" title="Safety Amber" style="--dot:#f97316"></button>
            <button type="button" class="theme-btn" data-theme="ocean" title="Cyan Laser" style="--dot:#06b6d4"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== PLAYBACK ========== -->
    <div class="settings-card">
      <div class="card-head">
        <div class="card-icon"><span class="material-symbols-outlined">equalizer</span></div>
        <div>
          <h2>Playback</h2>
          <p>Default audio behavior for the player</p>
        </div>
      </div>
      <div class="card-body">
        <div class="full-row">
          <label>Default Volume</label>
          <div class="range-wrap">
            <input type="range" id="volumeRange" min="0" max="100" value="80">
            <span class="range-val" id="volumeVal">80%</span>
          </div>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="s-label">Autoplay next song</div>
            <div class="s-desc">Lanjut memutar lagu berikutnya otomatis saat lagu selesai.</div>
          </div>
          <div class="set-control switch">
            <input type="checkbox" id="autoplayToggle">
            <span class="slider-sw"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========== ACCOUNT / PROFILE ========== -->
    <div class="settings-card">
      <div class="card-head">
        <div class="card-icon"><span class="material-symbols-outlined">account_circle</span></div>
        <div>
          <h2>Profile</h2>
          <p>Informasi profil yang ditampilkan di player ini</p>
        </div>
      </div>
      <div class="card-body">
        <div class="full-row">
          <label for="profileNameInput">Display Name</label>
          <div class="avatar-preview">
            <div class="avatar-lg" id="avatarPreview">AD</div>
            <input type="text" id="profileNameInput" placeholder="Admin" maxlength="30">
          </div>
          <span class="hint-box">Nama yang tampil pada logo profil (sidebar & top bar) player. Sistem ini tidak memiliki akun/login; pengaturan ini hanya menyimpan tampilan profil lokal.</span>
        </div>
        <div class="setting-row">
          <div class="setting-info">
            <div class="s-label">Status akun</div>
            <div class="s-desc">Player ini berjalan tanpa sistem akun. Semua data (playlist, favorit, settings) disimpan lokal di browser.</div>
          </div>
          <span class="set-control" style="font-size:12px;color:var(--text-muted);font-weight:600;">—</span>
        </div>
      </div>
    </div>

    <button class="btn-save" id="saveBtn">
      <span class="material-symbols-outlined">check</span> Save Settings
    </button>
  </div>

  <script>
    var LS = {
      APP_NAME: 'spotify_ultra_app_name',
      THEME: 'spotify_ultra_theme',
      THEME_LEGACY: 'spotify_theme',
      VOLUME: 'spotify_ultra_volume',
      AUTOPLAY: 'spotify_ultra_autoplay',
      PROFILE_NAME: 'spotify_ultra_profile_name'
    };
    var DEFAULT_THEME = 'default';

    function lsGet(key, fallback) {
      try {
        var v = localStorage.getItem(key);
        return v !== null ? v : fallback;
      } catch (e) { return fallback; }
    }
    function lsSet(key, val) {
      try { localStorage.setItem(key, val); } catch (e) {}
    }

    // ============ LOAD ============
    var appNameInput = document.getElementById('appNameInput');
    var profileNameInput = document.getElementById('profileNameInput');
    var volumeRange = document.getElementById('volumeRange');
    var volumeVal = document.getElementById('volumeVal');
    var autoplayToggle = document.getElementById('autoplayToggle');
    var avatarPreview = document.getElementById('avatarPreview');
    var themeBtns = document.querySelectorAll('#themeGrid .theme-btn');

    appNameInput.value = lsGet(LS.APP_NAME, 'Spotirid');
    profileNameInput.value = lsGet(LS.PROFILE_NAME, 'Admin');

    var savedVol = parseFloat(lsGet(LS.VOLUME, '0.8'));
    if (isNaN(savedVol)) savedVol = 0.8;
    var volPct = Math.round(savedVol * 100);
    volumeRange.value = volPct;
    volumeVal.textContent = volPct + '%';

    autoplayToggle.checked = lsGet(LS.AUTOPLAY, 'true') === 'true';

    function updateAvatar() {
      var name = profileNameInput.value.trim();
      if (!name) { avatarPreview.textContent = 'AD'; return; }
      var parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
      avatarPreview.textContent = parts.map(function(p) { return p.charAt(0).toUpperCase(); }).join('');
    }
    updateAvatar();
    profileNameInput.addEventListener('input', updateAvatar);

    // Theme: apply saved + live preview
    var savedTheme = lsGet(LS.THEME, lsGet(LS.THEME_LEGACY, DEFAULT_THEME));
    function applyTheme(theme) {
      currentTheme = theme;
      if (theme === 'default') {
        document.documentElement.removeAttribute('data-theme');
      } else {
        document.documentElement.setAttribute('data-theme', theme);
      }
      themeBtns.forEach(function(b) { b.classList.toggle('active', b.dataset.theme === theme); });
    }
    var currentTheme = DEFAULT_THEME;
    themeBtns.forEach(function(b) {
      b.addEventListener('click', function() {
        applyTheme(this.dataset.theme);
        document.documentElement.style.transition = 'background var(--transition-slow)';
      });
    });
    applyTheme(savedTheme);

    var autoplayToggleSwitch = document.getElementById('autoplayToggle');
    autoplayToggleSwitch.addEventListener('change', function() {
      showToast(autoplayToggle.checked ? '▶ Autoplay: ON' : '⏸ Autoplay: OFF', 'info');
    });

    // Volume live label
    volumeRange.addEventListener('input', function() {
      volumeVal.textContent = volumeRange.value + '%';
    });

    // ============ SAVE ============
    document.getElementById('saveBtn').addEventListener('click', function() {
      var appName = appNameInput.value.trim() || 'Spotirid';
      var profileName = profileNameInput.value.trim() || 'Admin';
      var vol = (parseInt(volumeRange.value, 10) || 80) / 100;
      lsSet(LS.APP_NAME, appName);
      lsSet(LS.PROFILE_NAME, profileName);
      lsSet(LS.VOLUME, String(vol));
      lsSet(LS.AUTOPLAY, autoplayToggle.checked ? 'true' : 'false');
      lsSet(LS.THEME, currentTheme);
      // Update document title sebagai feedback langsung
      document.title = appName + ' - High-Fidelity Streaming';
      showToast('✅ Settings disimpan & diterapkan', 'success');
    });

    // ============ TOAST ============
    function showToast(msg, type) {
      var container = document.getElementById('toastContainer');
      if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        container.id = 'toastContainer';
        document.body.appendChild(container);
      }
      var t = document.createElement('div');
      t.className = 'toast ' + type;
      t.textContent = msg;
      container.appendChild(t);
      setTimeout(function() { if (t.parentNode) t.remove(); }, 3000);
    }
  </script>
</body>
</html>