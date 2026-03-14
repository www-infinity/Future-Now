/**
 * Infinity Media & Page Hosting Engine — Core JS
 * Handles upload simulation, filtering, gallery rendering, and AI builder UI.
 */

'use strict';

/* ── Configuration ── */
/** Repository identifier used for GitHub API calls — update if repo is renamed. */
const GITHUB_REPO = 'www-infinity/Future-Now';

/* ── Utility ── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function showToast(msg, color = 'var(--accent-green)') {
  let t = $('#toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.borderColor = color;
  t.style.color = color;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ── Storage helpers (localStorage) ── */
const STORAGE_KEY = 'infinity_media_metadata';

function loadMetadata() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveMetadata(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function addEntry(entry) {
  const data = loadMetadata();
  data.unshift(entry);
  saveMetadata(data);
  return entry;
}

/* ── ID generator ── */
function generateFileId(type) {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `${type.slice(0, 3)}_${date}_${rand}`;
}

/* ── AI status assignment (simulated) ── */
function assignAIStatus(fileName) {
  const lower = fileName.toLowerCase();
  if (lower.includes('test') || lower.includes('draft')) return 'review';
  if (lower.includes('block') || lower.includes('bad')) return 'blocked';
  return 'approved';
}

/* ── File type detection ── */
function detectType(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const videos = ['mp4', 'webm', 'mov', 'avi'];
  const pages = ['html', 'htm'];
  const docs = ['md', 'txt', 'pdf'];
  if (images.includes(ext)) return 'image';
  if (videos.includes(ext)) return 'video';
  if (pages.includes(ext)) return 'html';
  if (ext === 'zip') return 'zip';
  if (docs.includes(ext)) return 'document';
  return 'upload';
}

function typeToFolder(type) {
  const map = { image: '/media/images', video: '/media/videos', html: '/media/html', zip: '/media/uploads', document: '/media/uploads', upload: '/media/uploads' };
  return map[type] || '/media/uploads';
}

function typeEmoji(type) {
  const map = { image: '🖼️', video: '🎬', html: '🌐', zip: '📦', document: '📄', upload: '📁' };
  return map[type] || '📁';
}

/* ── Flux Capacitor Canvas Animation ── */
function initFluxCapacitor() {
  const canvas = document.getElementById('flux-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, t = 0, animId;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width || window.innerWidth;
    H = canvas.height = rect.height || 520;
  }

  window.addEventListener('resize', () => { resize(); });
  resize();

  /* Stars */
  const stars = Array.from({ length: 220 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.4 + 0.3,
    speed: Math.random() * 0.00015 + 0.00004,
    opacity: Math.random() * 0.6 + 0.2
  }));

  function drawStars() {
    stars.forEach(s => {
      const x = s.x * W;
      const y = s.y * H;
      const flicker = 0.7 + 0.3 * Math.sin(t * 2.3 + s.x * 50);
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${s.opacity * flicker})`;
      ctx.fill();
      s.x -= s.speed;
      if (s.x < 0) { s.x = 1; s.y = Math.random(); }
    });
  }

  /* Perspective grid */
  function drawGrid() {
    const vpX = W / 2;
    const vpY = H * 0.58;
    const lines = 12;
    ctx.save();
    ctx.globalAlpha = 0.07 + 0.03 * Math.sin(t * 0.8);
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;

    for (let i = 0; i <= lines; i++) {
      const x = (W / lines) * i;
      ctx.beginPath();
      ctx.moveTo(x, H);
      ctx.lineTo(vpX, vpY);
      ctx.stroke();
    }
    for (let j = 1; j <= 7; j++) {
      const prog = j / 7;
      const y = vpY + (H - vpY) * prog;
      const halfW = (W * prog) / 2;
      ctx.beginPath();
      ctx.moveTo(vpX - halfW, y);
      ctx.lineTo(vpX + halfW, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  /* Flux Capacitor Y-shape */
  function drawFluxCapacitor() {
    const cx = W / 2;
    const cy = H * 0.44;
    const size = Math.min(W * 0.22, H * 0.35, 160);

    const pulse = (Math.sin(t * 2.8) + 1) / 2;
    const energyAlpha = 0.3 + pulse * 0.7;

    /* Endpoints of Y */
    const topX  = cx;
    const topY  = cy - size;
    const leftX  = cx - size * 0.82;
    const leftY  = cy + size * 0.46;
    const rightX = cx + size * 0.82;
    const rightY = cy + size * 0.46;

    /* Radial glow behind Y */
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 1.4);
    grd.addColorStop(0, `rgba(0,229,255,${0.10 * energyAlpha})`);
    grd.addColorStop(0.5, `rgba(162,89,255,${0.05 * energyAlpha})`);
    grd.addColorStop(1, 'rgba(0,229,255,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, size * 1.4, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    /* Draw one glowing arm */
    function drawArm(x1, y1, x2, y2, beadPhase) {
      const lg = ctx.createLinearGradient(x1, y1, x2, y2);
      lg.addColorStop(0, 'rgba(0,229,255,0.9)');
      lg.addColorStop(1, 'rgba(162,89,255,0.9)');

      /* Outer glow layer */
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = `rgba(0,229,255,${0.12 + 0.08 * pulse})`;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.restore();

      /* Core line */
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.stroke();

      /* Energy bead */
      const bp = ((t * 1.8 + beadPhase) % 1);
      const bx = x1 + (x2 - x1) * bp;
      const by = y1 + (y2 - y1) * bp;
      ctx.save();
      ctx.beginPath();
      ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.restore();
    }

    drawArm(cx, cy, topX,   topY,   0.00);
    drawArm(cx, cy, leftX,  leftY,  0.33);
    drawArm(cx, cy, rightX, rightY, 0.66);

    /* Junction node */
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, 7 + pulse * 3, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.7 + pulse * 0.3})`;
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 30 + pulse * 20;
    ctx.fill();
    ctx.restore();

    /* End nodes */
    [[topX, topY, '#00e5ff'], [leftX, leftY, '#a259ff'], [rightX, rightY, '#00ff88']].forEach(([x, y, c]) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, 5 + pulse * 2, 0, Math.PI * 2);
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = 14 + pulse * 10;
      ctx.fill();
      ctx.restore();
    });

    /* Spark particles around junction */
    for (let i = 0; i < 6; i++) {
      const angle = (t * 2.5 + i * (Math.PI / 3)) % (Math.PI * 2);
      const dist  = (size * 0.18) + (size * 0.08) * Math.sin(t * 4 + i);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const sa = 0.4 + 0.6 * Math.sin(t * 5 + i * 1.2);
      ctx.save();
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${sa})`;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);

    /* Deep space background */
    const bg = ctx.createRadialGradient(W / 2, H * 0.3, 0, W / 2, H * 0.3, H * 0.9);
    bg.addColorStop(0,   'rgba(8,0,32,0.98)');
    bg.addColorStop(0.5, 'rgba(4,4,18,0.98)');
    bg.addColorStop(1,   'rgba(2,2,10,0.98)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawGrid();
    drawStars();
    drawFluxCapacitor();

    t += 0.016;
    animId = requestAnimationFrame(animate);
  }

  animate();
}

/* ── Upload Handler ── */
function initUploadPage() {
  const zone = $('#drop-zone');
  const fileInput = $('#file-input');
  const browseBtn = $('#browse-btn');
  const progressSection = $('#progress-section');
  const uploadList = $('#upload-list');
  const submitBtn = $('#submit-upload');
  const titleInput = $('#upload-title');
  const categoryInput = $('#upload-category');
  const tagsInput = $('#upload-tags');

  if (!zone) return;

  // Drag & drop
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });

  zone.addEventListener('click', () => fileInput && fileInput.click());
  browseBtn && browseBtn.addEventListener('click', (e) => { e.stopPropagation(); fileInput && fileInput.click(); });
  fileInput && fileInput.addEventListener('change', () => handleFiles(fileInput.files));

  submitBtn && submitBtn.addEventListener('click', processUploads);

  function handleFiles(files) {
    if (!files || files.length === 0) return;
    progressSection.style.display = 'block';
    uploadList.innerHTML = '';

    Array.from(files).forEach(file => {
      const type = detectType(file);
      const li = document.createElement('div');
      li.className = 'upload-item';
      li.dataset.file = file.name;
      li.dataset.type = type;
      li.innerHTML = `
        <span class="upload-item-icon">${typeEmoji(type)}</span>
        <span class="upload-item-name">${file.name}</span>
        <span class="upload-item-size">${formatBytes(file.size)}</span>
        <span class="badge badge-review" id="status-${CSS.escape(file.name)}">⏳ Scanning</span>
      `;
      uploadList.appendChild(li);

      // Simulate AI scan
      setTimeout(() => {
        const status = assignAIStatus(file.name);
        const statusEl = li.querySelector('.badge');
        statusEl.className = `badge badge-${status}`;
        statusEl.textContent = status === 'approved' ? '✅ Approved' : status === 'review' ? '🔍 Review' : '🚫 Blocked';
        li.dataset.status = status;
      }, 600 + Math.random() * 800);
    });
  }

  function processUploads() {
    const items = $$('.upload-item', uploadList);
    if (items.length === 0) { showToast('No files selected', 'var(--accent-orange)'); return; }

    let count = 0;
    items.forEach(item => {
      if (item.dataset.status === 'blocked') return;
      const type = item.dataset.type;
      const entry = {
        file_id: generateFileId(type),
        type,
        title: titleInput.value.trim() || item.dataset.file.replace(/\.[^.]+$/, ''),
        file_name: item.dataset.file,
        category: categoryInput.value,
        tags: tagsInput.value.split(',').map(t => t.trim()).filter(Boolean),
        uploader: 'local_user',
        folder: typeToFolder(type),
        status: item.dataset.status || 'approved',
        timestamp: new Date().toISOString(),
        size_display: item.querySelector('.upload-item-size').textContent
      };
      addEntry(entry);
      count++;
    });

    if (count > 0) {
      showToast(`✅ ${count} file${count > 1 ? 's' : ''} uploaded to media library`);
      setTimeout(() => { uploadList.innerHTML = ''; progressSection.style.display = 'none'; }, 1500);
    } else {
      showToast('⚠️ No files passed AI screening', 'var(--accent-yellow)');
    }
  }

  function formatBytes(b) {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  }
}

/* ── Gallery Page ── */
function initGalleryPage(filterType) {
  const container = $('#gallery-grid');
  const searchInput = $('#gallery-search');
  const filterTags = $$('.filter-tag');
  if (!container) return;

  let allData = loadMetadata();
  let currentFilter = filterType || 'all';
  let currentSearch = '';

  function render() {
    let items = allData;
    if (currentFilter !== 'all') items = items.filter(i => i.type === currentFilter);
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q)) ||
        (i.category || '').toLowerCase().includes(q)
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon">📭</span>
          <h3>No media found</h3>
          <p>Upload files to see them here, or adjust your search.</p>
          <a href="/upload.html" class="btn btn-primary" style="margin-top:1rem">Upload Media</a>
        </div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="media-card" title="${item.file_name || item.title}">
        <div class="card-thumb">${typeEmoji(item.type)}</div>
        <div class="card-body">
          <div class="card-title">${item.title}</div>
          <div class="card-meta">
            <span>${item.category || item.type}</span>
            <span class="badge badge-${item.status}">${item.status}</span>
          </div>
          <div class="card-meta" style="margin-top:0.3rem; font-size:0.7rem; color:var(--text-muted)">
            ${new Date(item.timestamp).toLocaleDateString()}
          </div>
        </div>
      </div>`).join('');
  }

  searchInput && searchInput.addEventListener('input', (e) => { currentSearch = e.target.value; render(); });
  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      currentFilter = tag.dataset.filter || 'all';
      render();
    });
  });

  render();
}

/* ── Library Page ── */
function initLibraryPage() {
  const container = $('#library-grid');
  if (!container) return;

  const CATEGORIES = ['fantasy', 'retro games', 'coins', 'gemstones', 'Mario', 'Zelda', 'AI art', 'tokens'];
  const allData = loadMetadata();

  const filterTags = $$('.filter-tag');
  const searchInput = $('#library-search');
  let activeCategory = 'all';
  let searchQuery = '';

  function render() {
    let items = allData.filter(i => i.status !== 'blocked');
    if (activeCategory !== 'all') {
      items = items.filter(i =>
        (i.category || '').toLowerCase() === activeCategory.toLowerCase() ||
        (i.tags || []).some(t => t.toLowerCase() === activeCategory.toLowerCase())
      );
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i =>
        i.title.toLowerCase().includes(q) ||
        (i.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <span class="empty-icon">📚</span>
          <h3>No assets in this category</h3>
          <p>Upload media to build your asset library.</p>
        </div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="media-card">
        <div class="card-thumb">${typeEmoji(item.type)}</div>
        <div class="card-body">
          <div class="card-title">${item.title}</div>
          <div class="card-meta">
            <span>${item.folder || typeToFolder(item.type)}</span>
          </div>
          <div style="margin-top:0.4rem; display:flex; flex-wrap:wrap; gap:0.3rem">
            ${(item.tags || []).map(t => `<span class="filter-tag" style="cursor:default;padding:0.2rem 0.5rem;font-size:0.65rem;">${t}</span>`).join('')}
          </div>
        </div>
      </div>`).join('');
  }

  filterTags.forEach(tag => {
    tag.addEventListener('click', () => {
      filterTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      activeCategory = tag.dataset.filter || 'all';
      render();
    });
  });

  searchInput && searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; render(); });
  render();
}

/* ── Device Admin Fingerprint ── */
/**
 * Returns a stable, session-persistent device fingerprint used as the
 * admin/owner ID for pages built on this device. Stored in localStorage.
 */
/**
 * Returns a stable device identifier stored in localStorage.
 * NOTE: This is a convenience identifier, not a security mechanism.
 * It persists across page loads on the same device/browser profile but can
 * be cleared by the user or spoofed. Do not rely on it for authentication.
 */
function getDeviceAdminId() {
  const ADMIN_KEY = 'infinity_admin_id';
  let id = localStorage.getItem(ADMIN_KEY);
  if (!id) {
    const parts = [
      navigator.userAgent.length.toString(16),
      screen.width.toString(16),
      screen.height.toString(16),
      (navigator.hardwareConcurrency || 2).toString(16),
      Date.now().toString(36),
      Math.random().toString(36).slice(2, 8)
    ];
    id = '∞-' + parts.join('-').toUpperCase().slice(0, 36);
    localStorage.setItem(ADMIN_KEY, id);
  }
  return id;
}

/* ── Hamburger Nav Toggle ── */
function initHamburgerNav() {
  const toggle = document.getElementById('nav-toggle');
  const links  = document.getElementById('nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  // Close menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ── AI Site Builder ── */

/**
 * Generate full themed HTML for a built page.
 * Returns an HTML string ready to be displayed or committed.
 */
function generateSiteHTML(prompt, tmpl, slugName, adminId) {
  const safeTitle = prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 80);
  const accent   = tmpl.accent;
  const accentDim = accent + 'bb';
  const theme    = tmpl.theme;
  const desc     = tmpl.desc;
  const builtAt  = new Date().toUTCString();
  const safeAdmin = (adminId || 'unknown').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeTitle} — Infinity Pages</title>
  <meta name="description" content="${desc.replace(/"/g, '&quot;')}">
  <meta name="generator" content="Infinity AI Website Builder">
  <meta name="infinity:admin" content="${safeAdmin}">
  <style>
    :root { --accent: ${accent}; --accent-dim: ${accentDim}; }
    *{margin:0;padding:0;box-sizing:border-box;}
    body{background:#04040e;color:#e8e8ff;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh;}
    nav{background:rgba(3,3,18,.96);border-bottom:1px solid rgba(0,229,255,.18);padding:.75rem 1.5rem;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(20px);}
    .brand{color:var(--accent);font-weight:800;font-size:1.1rem;text-decoration:none;}
    .back{color:#8888aa;text-decoration:none;font-size:.82rem;border:1px solid #22225a;padding:.3rem .7rem;border-radius:6px;transition:.2s;}
    .back:hover{color:var(--accent);border-color:var(--accent);}
    .warning-bar{background:rgba(255,68,85,.08);border-bottom:1px solid rgba(255,68,85,.25);padding:.6rem 1.5rem;font-size:.75rem;color:#ff8899;text-align:center;}
    .warning-bar strong{color:#ff4455;}
    .hero{min-height:65vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:3rem 1.5rem;background:radial-gradient(ellipse 80% 50% at 50% 0%,rgba(0,229,255,.07) 0%,transparent 60%);}
    .hero-icon{font-size:4.5rem;margin-bottom:1.25rem;filter:drop-shadow(0 0 20px var(--accent));}
    .hero h1{font-size:clamp(1.8rem,6vw,3.5rem);font-weight:900;color:var(--accent);text-shadow:0 0 40px ${accent}66;margin-bottom:.85rem;line-height:1.1;}
    .hero p{color:#8888aa;font-size:1rem;max-width:520px;margin:0 auto 2rem;font-style:italic;}
    .badge-built{display:inline-flex;align-items:center;gap:.5rem;padding:.4rem 1rem;border:1px solid ${accent}55;border-radius:999px;color:${accent}aa;font-size:.78rem;background:${accent}0f;margin-bottom:.5rem;}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;max-width:1100px;margin:0 auto;padding:3rem 1.5rem;}
    .card{background:#0d0d24;border:1px solid #14143a;border-radius:12px;padding:1.5rem;transition:.2s;position:relative;overflow:hidden;}
    .card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,${accent}55,transparent);opacity:0;transition:.2s;}
    .card:hover{border-color:${accent}66;transform:translateY(-3px);box-shadow:0 8px 30px ${accent}18;}
    .card:hover::before{opacity:1;}
    .card-icon{font-size:2.25rem;margin-bottom:.65rem;display:block;}
    .card h3{color:var(--accent);font-size:1rem;margin-bottom:.4rem;}
    .card p{color:#8888aa;font-size:.85rem;line-height:1.6;}
    .admin-info{background:rgba(0,229,255,.04);border:1px solid rgba(0,229,255,.15);border-radius:8px;padding:.75rem 1rem;font-size:.72rem;color:#6699aa;margin-top:.5rem;word-break:break-all;}
    footer{background:#06060f;border-top:1px solid #14143a;padding:1.75rem;text-align:center;color:#4a4a6a;font-size:.78rem;margin-top:3rem;}
    footer a{color:#8888aa;text-decoration:none;}
    footer a:hover{color:var(--accent);}
    @media(max-width:600px){.grid{padding:1.5rem 1rem;}.hero{padding:2.5rem 1rem;}}
  </style>
</head>
<body>
  <nav>
    <a href="../../index.html" class="brand">∞ Infinity Pages</a>
    <a href="../../pages/" class="back">← All Pages</a>
  </nav>

  <div class="warning-bar" role="alert">
    <strong>⚠️ Infinity System Notice:</strong>
    Law enforcement &amp; federal agencies may access device data through the Infinity infrastructure.
    The admin &amp; content owner of this page is permanently recorded.
  </div>

  <section class="hero">
    <div class="hero-icon">${tmpl.icon || '⚡'}</div>
    <h1>${safeTitle}</h1>
    <p>${desc}</p>
    <div class="badge-built">🤖 Generated by Infinity AI Website Builder</div>
    <div class="badge-built" style="margin-top:.3rem;font-size:.72rem;opacity:.7">
      🔐 Admin ID: ${safeAdmin}
    </div>
  </section>

  <div class="grid">
    <div class="card">
      <span class="card-icon">🌐</span>
      <h3>About This Site</h3>
      <p>Built with the Infinity AI Website Builder from the prompt: <em>"${safeTitle}"</em>. Powered by the Infinity Engine.</p>
    </div>
    <div class="card">
      <span class="card-icon">🖼️</span>
      <h3>Media Library</h3>
      <p>Assets sourced from the Infinity shared media library at <code>/library</code> and <code>/media/images</code>. Upload media to enrich this page.</p>
    </div>
    <div class="card">
      <span class="card-icon">⚙️</span>
      <h3>Theme: ${theme}</h3>
      <p>This page uses the <strong>${theme}</strong> visual theme with dynamic Infinity Engine styling.</p>
    </div>
    <div class="card">
      <span class="card-icon">📡</span>
      <h3>Live on GitHub Pages</h3>
      <p>Served at <code>https://www-infinity.github.io/${GITHUB_REPO}/pages/${slugName}/</code> via GitHub Pages static hosting.</p>
    </div>
    <div class="card">
      <span class="card-icon">🔐</span>
      <h3>Admin &amp; Ownership</h3>
      <p>The device that created this page is its admin and content owner. This is tracked by the Infinity system.</p>
      <div class="admin-info">Admin Device ID: <strong>${safeAdmin}</strong><br>Built: ${builtAt}</div>
    </div>
    <div class="card">
      <span class="card-icon">₿</span>
      <h3>Bitcoin Radio</h3>
      <p>Tune into the Infinity Bitcoin Radio — blockchain-powered channel selection. <a href="../../bitcoin-radio.html" style="color:var(--accent)">Open Radio →</a></p>
    </div>
  </div>

  <footer>
    <p>
      ⚡ ${safeTitle}
      &nbsp;|&nbsp; Built by <a href="../../builder.html">Infinity AI Website Builder</a>
      &nbsp;·&nbsp; <a href="../../pages/">All Pages</a>
      &nbsp;·&nbsp; <a href="../../index.html">∞ Infinity Engine</a>
    </p>
    <p style="margin-top:.4rem;font-size:.7rem;opacity:.5">Generated ${builtAt} &nbsp;·&nbsp; Admin: ${safeAdmin}</p>
  </footer>
</body>
</html>`;
}

/**
 * Commit a generated page to GitHub via the Contents API.
 * Requires a Personal Access Token with repo/contents write scope
 * stored by the user in the builder's token field.
 * The token is kept only in the current browser session (sessionStorage).
 */

/** UTF-8-safe base64 encoding for the GitHub Contents API. */
function encodeBase64UTF8(str) {
  return btoa(
    Array.from(new TextEncoder().encode(str), b => String.fromCharCode(b)).join('')
  );
}

async function commitPageViaAPI(slugName, html, token) {
  const repoPath = `pages/${slugName}/index.html`;
  const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${repoPath}`;

  // Check if file already exists (need its SHA to update it)
  let sha = null;
  try {
    const existing = await fetch(apiUrl, {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github+json' }
    });
    if (existing.ok) {
      const data = await existing.json();
      sha = data.sha;
    }
    // A non-OK response (e.g. 404) simply means the file doesn't exist yet — that's expected.
  } catch (networkErr) {
    // Network error during the existence check — log and proceed without sha
    console.warn('[infinity] GitHub API pre-flight check failed:', networkErr);
  }

  const body = {
    message: `🤖 AI Builder: add page ${slugName}`,
    content: encodeBase64UTF8(html),
    ...(sha ? { sha } : {})
  };

  const res = await fetch(apiUrl, {
    method: 'PUT',
    headers: {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return res;
}

function initAIBuilder() {
  const promptInput = $('#ai-prompt');
  const buildBtn = $('#ai-build-btn');
  const output = $('#ai-output');
  if (!buildBtn) return;

  // Show admin device ID in panel
  const adminIdEl = document.getElementById('device-admin-id');
  const adminId = getDeviceAdminId();
  if (adminIdEl) adminIdEl.textContent = adminId;

  const TEMPLATES = {
    zelda:   { name: 'zelda_tribute',  theme: 'Zelda Fan Site',   accent: '#ffd700', icon: '🗡️', desc: 'A legendary tribute to The Legend of Zelda universe.' },
    mario:   { name: 'mario_world',    theme: 'Mario World',      accent: '#ff4444', icon: '🍄', desc: 'Jump into the Mushroom Kingdom.' },
    bitcoin: { name: 'bitcoin_hub',    theme: 'Bitcoin Hub',      accent: '#f7931a', icon: '₿',  desc: 'Explore the world of Bitcoin and crypto.' },
    radio:   { name: 'bitcoin_radio',  theme: 'Bitcoin Radio',    accent: '#a259ff', icon: '📻', desc: 'Blockchain-powered virtual radio channel selector.' },
    infinity:{ name: 'infinity_flux',  theme: 'Infinity Flux',    accent: '#00e5ff', icon: '⚡', desc: 'A Flux Capacitor-powered Infinity Engine showcase.' },
    default: { name: 'new_site',       theme: 'New Project',      accent: '#a259ff', icon: '🌐', desc: 'A fresh Infinity-powered web page.' }
  };

  /**
   * Append a log line to the build output panel.
   * type: 'step' | 'code' | 'warn'
   */
  function logLine(text, type = 'step') {
    const p = document.createElement('p');
    p.className = 'log-line' + (type === 'code' ? ' log-code' : type === 'warn' ? ' log-warn' : '');
    p.textContent = text;
    output.appendChild(p);
    output.scrollTop = output.scrollHeight;
    return p;
  }

  /**
   * Emits a sequence of code lines from the HTML string to the log,
   * one line at a time with a small delay to show the engine "writing".
   */
  async function streamCodeToLog(html) {
    const lines = html.split('\n');
    const MAX_LINES = 60; // show up to 60 lines
    const step = Math.max(1, Math.floor(lines.length / MAX_LINES));
    let count = 0;
    for (let i = 0; i < lines.length && count < MAX_LINES; i += step, count++) {
      logLine(lines[i] || '', 'code');
      // Small async pause every 8 lines so UI doesn't freeze
      if (count % 8 === 0) await new Promise(r => setTimeout(r, 0));
    }
    if (lines.length > MAX_LINES * step) {
      logLine(`  … (${lines.length} total lines) …`, 'code');
    }
  }

  buildBtn.addEventListener('click', async () => {
    const prompt = (promptInput.value || '').trim().toLowerCase();
    if (!prompt) { showToast('Enter a prompt first', 'var(--accent-orange)'); return; }

    buildBtn.disabled = true;
    buildBtn.textContent = '⚙️ Building…';
    output.style.display = 'block';
    output.innerHTML = '';

    const tmplKey = Object.keys(TEMPLATES).find(k => k !== 'default' && prompt.includes(k)) || 'default';
    const tmpl = TEMPLATES[tmplKey];
    const slugName = prompt.replace(/[^a-z0-9]+/g, '_').slice(0, 30);
    const pagePath = `pages/${slugName}/`;

    logLine('🤖 Infinity AI Engine initialising…');
    await new Promise(r => setTimeout(r, 180));

    logLine(`📁 Creating folder: ${pagePath}`);
    await new Promise(r => setTimeout(r, 220));

    logLine(`🎨 Applying theme: ${tmpl.theme} (accent ${tmpl.accent})`);
    await new Promise(r => setTimeout(r, 200));

    logLine('📝 Writing <!DOCTYPE html> …');
    await new Promise(r => setTimeout(r, 160));

    logLine('🖼️  Linking gallery assets from /library and /media/images…');
    await new Promise(r => setTimeout(r, 200));

    logLine(`🔐 Embedding admin device ID: ${adminId}`);
    await new Promise(r => setTimeout(r, 200));

    logLine('✨ Applying Infinity Flux Capacitor visuals…');
    await new Promise(r => setTimeout(r, 200));

    logLine('⚙️ Writing CSS — layout, cards, hero, responsive…');
    await new Promise(r => setTimeout(r, 200));

    logLine('📡 Injecting GitHub Pages live URL…');
    await new Promise(r => setTimeout(r, 200));

    // Generate the actual HTML content
    const html = generateSiteHTML(prompt, tmpl, slugName, adminId);

    logLine('─────────────────────────────────────');
    logLine('📄 Generated HTML source (showing all lines written):');
    await new Promise(r => setTimeout(r, 100));

    // Stream actual code to log
    await streamCodeToLog(html);

    logLine('─────────────────────────────────────');
    logLine(`✅ index.html complete — ${html.length.toLocaleString()} bytes, ${html.split('\n').length} lines`);

    const blob = new Blob([html], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);

    // Metadata entry
    addEntry({
      file_id: generateFileId('page'),
      type: 'html',
      title: prompt,
      file_name: 'index.html',
      category: 'AI Generated',
      tags: ['ai-built', 'page'],
      uploader: 'ai_engine',
      admin_id: adminId,
      folder: pagePath,
      status: 'approved',
      timestamp: new Date().toISOString(),
      url: pagePath
    });

    buildBtn.disabled = false;
    buildBtn.textContent = '🚀 Build & Commit';

    // "Preview Page" — opens generated HTML in new tab (no 404!)
    const viewLink = document.createElement('a');
    viewLink.href = blobUrl;
    viewLink.target = '_blank';
    viewLink.rel = 'noopener';
    viewLink.className = 'btn btn-primary';
    viewLink.style.cssText = 'margin-top:.75rem;display:inline-flex;margin-right:.5rem';
    viewLink.textContent = '🌐 Preview Page';
    output.appendChild(viewLink);

    // "Download HTML" button
    const dlLink = document.createElement('a');
    dlLink.href = blobUrl;
    dlLink.download = 'index.html';
    dlLink.className = 'btn btn-secondary';
    dlLink.style.cssText = 'margin-top:.75rem;display:inline-flex;margin-right:.5rem';
    dlLink.textContent = '⬇️ Download HTML';
    output.appendChild(dlLink);

    // Optional: commit via GitHub API if token is provided
    const tokenInput = document.getElementById('ghp-token');
    const token = tokenInput ? tokenInput.value.trim() : '';
    if (token) {
      const statusLine = logLine('🔐 Committing to GitHub via GHP_TOKEN…');

      try {
        const res = await commitPageViaAPI(slugName, html, token);
        if (res.ok) {
          statusLine.textContent = `✅ Committed! Live at: https://www-infinity.github.io/Future-Now/${pagePath}`;

          const liveLink = document.createElement('a');
          liveLink.href = `https://www-infinity.github.io/Future-Now/${pagePath}`;
          liveLink.target = '_blank';
          liveLink.rel = 'noopener';
          liveLink.className = 'btn btn-purple';
          liveLink.style.cssText = 'margin-top:.75rem;display:inline-flex;';
          liveLink.textContent = '🚀 View Live Site';
          output.appendChild(liveLink);
        } else {
          const err = await res.json().catch(() => ({}));
          statusLine.textContent = `⚠️ GitHub commit failed: ${err.message || res.status}. Check your token.`;
        }
      } catch (e) {
        logLine(`⚠️ Could not reach GitHub API: ${e.message}`, 'warn');
      }
    } else {
      logLine('ℹ️  No token provided — page not committed. Enter a GHP token above to auto-commit.', 'warn');
    }

    showToast('🚀 Site built: ' + pagePath);
  });
}

/* ── Bitcoin Radio ── */

/**
 * Uses the latest Bitcoin block hash as deterministic entropy to select
 * a virtual radio channel from the 16-channel wheel.
 * Falls back to a local PRNG seed if the blockchain API is unreachable.
 */
const RADIO_CHANNELS = [
  { icon: '🎷', name: 'Jazz',          desc: 'Smooth jazz & soul from the blockchain' },
  { icon: '🎨', name: 'Masterpiece',   desc: 'Classical & orchestral compositions' },
  { icon: '🍄', name: 'Police Scanner',desc: 'Public safety chatter (simulated)' },
  { icon: '😎', name: 'Cool',          desc: 'Laid-back beats & chill vibes' },
  { icon: '🛸', name: 'Alien',         desc: 'Electroacoustic & otherworldly soundscapes' },
  { icon: '👌', name: 'Top Notch',     desc: 'Curated premium audio streams' },
  { icon: '⭐', name: 'Trendy',        desc: 'What\'s hot right now in the metaverse' },
  { icon: '💃', name: 'Dance',         desc: 'High-BPM electronic & EDM' },
  { icon: '♥️', name: 'Love',          desc: 'R&B, soul & romantic vibes' },
  { icon: '🧱', name: 'Military Comms',desc: 'Simulated tactical chatter & field ops' },
  { icon: '🟨', name: 'News',          desc: 'Live headlines & breaking developments' },
  { icon: '🟦', name: 'Conversation',  desc: 'Ham radio & conversation channels' },
  { icon: '🟥', name: 'Shortwave',     desc: 'Shortwave & international broadcasts' },
  { icon: '🟪', name: 'FM',            desc: 'Classic FM station simulation' },
  { icon: '🟩', name: 'AM',            desc: 'Amplitude modulation & talk radio' },
  { icon: '⬜', name: 'Digital Live',  desc: 'Real-time Bitcoin transaction sonification' }
];

async function fetchBitcoinSeed() {
  try {
    const res = await fetch('https://blockchain.info/latestblock', {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout?.(5000)
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    const data = await res.json();
    return { hash: data.hash || '', height: data.height || 0, source: 'blockchain' };
  } catch {
    // Fallback: use current time + random as seed string
    const fallback = Date.now().toString(16) + Math.random().toString(16).slice(2);
    return { hash: fallback, height: 0, source: 'local-prng' };
  }
}

function hashToChannelIndex(hash) {
  // Sum all hex character values then mod by channel count
  let total = 0;
  for (let i = 0; i < hash.length; i++) {
    total += parseInt(hash[i], 16) || 0;
  }
  return total % RADIO_CHANNELS.length;
}

function initBitcoinRadio() {
  const display    = document.getElementById('slot-display');
  const chanName   = document.getElementById('slot-channel-name');
  const chanDesc   = document.getElementById('slot-channel-desc');
  const seedEl     = document.getElementById('slot-seed');
  const spinBtn    = document.getElementById('spin-btn');
  const statusEl   = document.getElementById('radio-status');
  const channelBtns = document.querySelectorAll('.radio-channel-btn');
  if (!spinBtn || !display) return;

  let spinning = false;

  function setChannel(idx) {
    const ch = RADIO_CHANNELS[idx];
    if (display)  display.textContent  = ch.icon;
    if (chanName) chanName.textContent = ch.name;
    if (chanDesc) chanDesc.textContent = ch.desc;
    channelBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
  }

  // Manual channel click
  channelBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (!spinning) setChannel(i);
    });
  });

  async function spin() {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    spinBtn.textContent = '⏳ Fetching block…';
    if (statusEl) statusEl.textContent = '📡 Connecting to Bitcoin blockchain…';

    // Animate slot machine
    if (display) display.classList.add('spinning');
    let frame = 0;
    const spinInterval = setInterval(() => {
      const rndIdx = Math.floor(Math.random() * RADIO_CHANNELS.length);
      if (display)  display.textContent  = RADIO_CHANNELS[rndIdx].icon;
      if (chanName) chanName.textContent = RADIO_CHANNELS[rndIdx].name;
      frame++;
    }, 80);

    const seed = await fetchBitcoinSeed();
    const idx  = hashToChannelIndex(seed.hash);

    // Let it spin a bit longer
    await new Promise(r => setTimeout(r, 900));
    clearInterval(spinInterval);
    if (display) display.classList.remove('spinning');

    setChannel(idx);

    if (seedEl) {
      seedEl.textContent = seed.source === 'blockchain'
        ? `₿ Block hash: ${seed.hash.slice(0, 24)}… (height ${seed.height})`
        : `⚡ Local entropy seed: ${seed.hash.slice(0, 24)}…`;
    }
    if (statusEl) {
      statusEl.textContent = seed.source === 'blockchain'
        ? `✅ Channel selected by Bitcoin block #${seed.height}`
        : '⚡ Channel selected by local entropy (blockchain unreachable)';
    }

    spinning = false;
    spinBtn.disabled = false;
    spinBtn.textContent = '🎰 Spin';
  }

  spinBtn.addEventListener('click', spin);

  // Auto-spin on page load
  spin();
}

/* ── Dashboard Stats ── */
function initDashboard() {
  const data = loadMetadata();
  const setEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setEl('stat-total', data.length);
  setEl('stat-images', data.filter(d => d.type === 'image').length);
  setEl('stat-videos', data.filter(d => d.type === 'video').length);
  setEl('stat-pages', data.filter(d => d.type === 'html').length);
  setEl('stat-approved', data.filter(d => d.status === 'approved').length);
  setEl('stat-review', data.filter(d => d.status === 'review').length);

  // Recent uploads table
  const tbody = document.getElementById('recent-uploads');
  if (tbody) {
    const recent = data.slice(0, 8);
    if (recent.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem">No uploads yet — <a href="/upload.html" style="color:var(--accent-cyan)">upload media</a> to get started.</td></tr>';
    } else {
      tbody.innerHTML = recent.map(r => `
        <tr>
          <td>${typeEmoji(r.type)} ${r.file_id}</td>
          <td>${r.title}</td>
          <td>${r.type}</td>
          <td><span class="badge badge-${r.status}">${r.status}</span></td>
          <td>${new Date(r.timestamp).toLocaleDateString()}</td>
        </tr>`).join('');
    }
  }
}

/* ── Auto-init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Hamburger nav
  initHamburgerNav();

  // Set active nav link
  const current = window.location.pathname.split('/').filter(Boolean)[0] || '';
  $$('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(current) && current) a.classList.add('active');
  });

  // Page detection
  const body = document.body.dataset.page;
  if (body === 'dashboard') { initDashboard(); initFluxCapacitor(); }
  if (body === 'upload') initUploadPage();
  if (body === 'gallery') initGalleryPage(document.body.dataset.filter || 'all');
  if (body === 'library') initLibraryPage();
  if (body === 'builder') initAIBuilder();
  if (body === 'bitcoin-radio') initBitcoinRadio();
});
