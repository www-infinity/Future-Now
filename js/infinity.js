/**
 * Infinity Media & Page Hosting Engine — Core JS
 * Handles upload simulation, filtering, gallery rendering, and AI builder UI.
 */

'use strict';

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

/* ── AI Site Builder ── */
function initAIBuilder() {
  const promptInput = $('#ai-prompt');
  const buildBtn = $('#ai-build-btn');
  const output = $('#ai-output');
  if (!buildBtn) return;

  const TEMPLATES = {
    zelda: { name: 'zelda_tribute', theme: 'Zelda Fan Site', accent: '#ffd700', desc: 'A legendary tribute to The Legend of Zelda universe.' },
    mario: { name: 'mario_world', theme: 'Mario World', accent: '#ff4444', desc: 'Jump into the Mushroom Kingdom.' },
    bitcoin: { name: 'bitcoin_hub', theme: 'Bitcoin Hub', accent: '#f7931a', desc: 'Explore the world of Bitcoin and crypto.' },
    default: { name: 'new_site', theme: 'New Project', accent: '#00e5ff', desc: 'A fresh Infinity-powered web page.' }
  };

  buildBtn.addEventListener('click', () => {
    const prompt = (promptInput.value || '').trim().toLowerCase();
    if (!prompt) { showToast('Enter a prompt first', 'var(--accent-orange)'); return; }

    buildBtn.disabled = true;
    buildBtn.textContent = '⚙️ Building…';
    output.style.display = 'block';
    output.innerHTML = '<p class="log-line">🤖 AI Engine starting…</p>';

    const tmpl = Object.keys(TEMPLATES).find(k => prompt.includes(k)) ? TEMPLATES[Object.keys(TEMPLATES).find(k => prompt.includes(k))] : TEMPLATES.default;
    const slugName = prompt.replace(/[^a-z0-9]+/g, '_').slice(0, 30) || tmpl.name;
    const pagePath = `/pages/${slugName}/`;

    const steps = [
      '📁 Creating page folder: ' + pagePath,
      '🎨 Generating HTML structure…',
      '🖼️  Linking gallery assets from /library…',
      '✨ Applying ' + tmpl.theme + ' theme…',
      '🔗 Injecting asset references…',
      '📝 Writing index.html…',
      '✅ Page published at ' + pagePath
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        const line = document.createElement('p');
        line.className = 'log-line';
        line.textContent = steps[i];
        output.appendChild(line);
        output.scrollTop = output.scrollHeight;
        i++;
      } else {
        clearInterval(interval);
        buildBtn.disabled = false;
        buildBtn.textContent = '🚀 Build Site';

        // Record in metadata
        addEntry({
          file_id: generateFileId('page'),
          type: 'html',
          title: prompt,
          file_name: 'index.html',
          category: 'AI Generated',
          tags: ['ai-built', 'page'],
          uploader: 'ai_engine',
          folder: pagePath,
          status: 'approved',
          timestamp: new Date().toISOString(),
          url: pagePath
        });

        const link = document.createElement('a');
        link.href = pagePath;
        link.className = 'btn btn-primary';
        link.style.marginTop = '0.75rem';
        link.style.display = 'inline-flex';
        link.textContent = '🌐 View Page';
        output.appendChild(link);
        showToast('🚀 Site built: ' + pagePath);
      }
    }, 420);
  });
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
  // Set active nav link
  const current = window.location.pathname.split('/').filter(Boolean)[0] || '';
  $$('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href.includes(current) && current) a.classList.add('active');
  });

  // Page detection
  const body = document.body.dataset.page;
  if (body === 'dashboard') initDashboard();
  if (body === 'upload') initUploadPage();
  if (body === 'gallery') initGalleryPage(document.body.dataset.filter || 'all');
  if (body === 'library') initLibraryPage();
  if (body === 'builder') initAIBuilder();
});
