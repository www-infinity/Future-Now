# Future-Now — Infinity Media & Page Hosting Engine

The future is in our grasp. From helium diodes and gallium flux capacitors to hydrogen storage and energy potentials to silver nitrate & gold supplement healthcare.

---

## ∞ Infinity Media & Page Hosting Engine

A central service that stores and serves images, videos, uploaded files, full HTML pages, and AI-generated websites. It acts as the **media backbone** for all Infinity projects.

### Live Site

> **GitHub Pages:** `https://www-infinity.github.io/Future-Now/`

---

## Core Features

| Feature | Description |
|---|---|
| **Media Upload** | Upload images, videos, HTML, ZIP, Markdown — AI scans every file |
| **AI Content Filtering** | Assigns `approved` / `review` / `blocked` status automatically |
| **Gallery System** | Auto-generated galleries for images, videos, and AI art |
| **HTML Page Hosting** | Upload full web pages served at `/pages/project_name/` |
| **AI Website Builder** | Generate complete sites from a text prompt |
| **Asset Library** | Reusable media organised by category (fantasy, coins, Zelda, Mario…) |
| **Import Engine** | Import assets from other Infinity repos into `/library/imported` |

---

## Directory Structure

```
/
├── index.html              # Dashboard
├── upload.html             # Media upload & import interface
├── builder.html            # AI Website Builder
├── metadata.json           # Upload metadata registry
│
├── css/infinity.css        # Shared design system
├── js/infinity.js          # Core engine logic
│
├── gallery/
│   ├── index.html          # All media gallery
│   ├── images.html         # Images gallery
│   └── videos.html         # Videos gallery
│
├── library/
│   ├── index.html          # Asset library browser
│   └── imported/           # Assets imported from other repos
│
├── media/
│   ├── images/             # Uploaded images (JPG, PNG, GIF, WEBP)
│   ├── videos/             # Uploaded videos (MP4, WebM)
│   ├── uploads/            # ZIP files and documents
│   ├── html/               # Uploaded HTML files
│   └── review_queue/       # Files pending AI review
│
└── pages/
    ├── index.html          # Hosted pages directory
    └── zelda_tribute/      # Example AI-generated page
        └── index.html
```

---

## Upload Metadata Schema

Every uploaded file gets a metadata record:

```json
{
  "file_id": "img_20260313_001",
  "type": "image",
  "title": "zelda_concept_art",
  "category": "fantasy",
  "tags": ["zelda", "concept", "art"],
  "uploader": "wallet_id",
  "folder": "/media/images",
  "status": "approved",
  "timestamp": "2026-03-13T00:00:00Z"
}
```

---

## AI Website Builder

Generate complete websites from a prompt:

```
build_site("Zelda fan site")
```

The AI automatically:
1. Creates `/pages/zelda_fan_site/` folder
2. Generates HTML structure
3. Inserts images from the library
4. Links gallery assets
5. Publishes via GitHub Pages

---

## Page Publishing

```bash
git add .
git commit -m "New hosted page"
git push
```

GitHub Pages instantly serves the result at:
```
https://www-infinity.github.io/Future-Now/pages/your_site/
```

---

## Example Pages

- **Zelda Tribute** — `/pages/zelda_tribute/` — AI-generated Zelda fan site
