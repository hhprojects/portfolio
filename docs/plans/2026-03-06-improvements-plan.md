# Portfolio Improvements — Implementation Plan
**Date:** 2026-03-06  
**Design doc:** `2026-03-06-improvements-design.md`  
**Status:** Ready to execute

---

## Overview

Four features, executed in this order:
1. **SEO & Meta Tags** — fast win, no component changes
2. **OG Image** — Playwright screenshot, commit static asset
3. **Resume Button** — add third CTA to Hero
4. **Loading Screen** — CSS pixel art Han sprite + fade logic
5. **Blog Section** — markdown parsing, Blog/BlogPost components, Navbar wiring

Commit after every task. Each task is independently verifiable.

---

## Task 1 — SEO & Meta Tags

**File:** `index.html`

Replace the entire `<head>` block with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/portfolio/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Primary SEO -->
    <title>Han Hua — Web Developer</title>
    <meta name="description" content="Web developer based in Singapore. Building clean, interactive web experiences." />

    <!-- OpenGraph -->
    <meta property="og:title" content="Han Hua — Web Developer" />
    <meta property="og:description" content="Web developer based in Singapore. Building clean, interactive web experiences." />
    <meta property="og:image" content="https://hhprojects.github.io/portfolio/og-image.png" />
    <meta property="og:url" content="https://hhprojects.github.io/portfolio/" />
    <meta property="og:type" content="website" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Han Hua — Web Developer" />
    <meta name="twitter:description" content="Web developer based in Singapore." />
    <meta name="twitter:image" content="https://hhprojects.github.io/portfolio/og-image.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

**Verification:**
```bash
grep -c "og:title" index.html   # → 1
grep "twitter:card" index.html  # → present
```

**Commit:**
```bash
git add index.html
git commit -m "feat: add SEO and OpenGraph meta tags"
```

---

## Task 2 — OG Image (Playwright Screenshot)

**Goal:** Generate `public/og-image.png` (1200×630px, hero section screenshot).

### 2a — Install Playwright

```bash
cd /home/hh-pi/projects/portfolio
npm install -D playwright
npx playwright install chromium
```

### 2b — Create screenshot script

**File:** `scripts/generate-og.mjs`

```js
import { chromium } from 'playwright'
import { createServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

// Build first, then serve dist statically
// This script serves the dev server for convenience
const server = await createServer({
  root,
  server: { port: 5199 },
  logLevel: 'silent',
})
await server.listen()

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1200, height: 630 })

await page.goto('http://localhost:5199/', { waitUntil: 'networkidle' })

// Wait for hero animations to trigger (IntersectionObserver fires on load)
await page.waitForTimeout(2000)

// Force hero text visible (bypass IntersectionObserver)
await page.evaluate(() => {
  document.querySelectorAll('.hero-text, .hero-logo').forEach(el => {
    el.classList.add('visible')
  })
  // Hide loading screen if present
  const ls = document.querySelector('.loading-screen')
  if (ls) ls.style.display = 'none'
})
await page.waitForTimeout(800)

// Screenshot full viewport (hero fills 100vh)
await page.screenshot({
  path: path.join(root, 'public', 'og-image.png'),
  clip: { x: 0, y: 0, width: 1200, height: 630 },
})

await browser.close()
await server.close()
console.log('✅ OG image saved to public/og-image.png')
```

### 2c — Run the script

```bash
cd /home/hh-pi/projects/portfolio
node scripts/generate-og.mjs
```

**Verification:**
```bash
ls -lh public/og-image.png   # → file exists, >10KB
file public/og-image.png      # → PNG image data, 1200 x 630
```

**Commit:**
```bash
git add public/og-image.png scripts/generate-og.mjs package.json package-lock.json
git commit -m "feat: add OG image + Playwright screenshot script"
```

---

## Task 3 — Resume Download Button in Hero

### 3a — Create placeholder PDF

```bash
touch /home/hh-pi/projects/portfolio/public/resume.pdf
```

(Han replaces this with the real PDF later. The button always shows.)

### 3b — Update `src/components/Hero.jsx`

Find the `<div className="hero-cta">` block and add a third button as an anchor:

**Find:**
```jsx
          <div className="hero-cta">
            <button 
              className="cta-button primary"
              onClick={() => scrollToSection('projects')}
            >
              View My Work
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => scrollToSection('contact')}
            >
              Get In Touch
            </button>
          </div>
```

**Replace with:**
```jsx
          <div className="hero-cta">
            <button 
              className="cta-button primary"
              onClick={() => scrollToSection('projects')}
            >
              View My Work
            </button>
            <button 
              className="cta-button secondary"
              onClick={() => scrollToSection('contact')}
            >
              Get In Touch
            </button>
            <a
              className="cta-button ghost"
              href="/portfolio/resume.pdf"
              download="Han_Hua_Resume.pdf"
            >
              📄 Resume
            </a>
          </div>
```

### 3c — Update `src/components/Hero.css`

Add after `.cta-button.secondary:hover { ... }`:

```css
.cta-button.ghost {
  background: transparent;
  color: rgba(255, 255, 255, 0.75);
  border: 2px solid rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
}

.cta-button.ghost:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.3);
  color: #ffffff;
  transform: translateY(-2px);
}
```

**Verification:**
```bash
npm run dev
# Open http://localhost:5173/portfolio/ — three buttons visible in hero
# Click "📄 Resume" → browser downloads resume.pdf
```

**Commit:**
```bash
git add src/components/Hero.jsx src/components/Hero.css public/resume.pdf
git commit -m "feat: add resume download button to Hero"
```

---

## Task 4 — Loading Screen

### 4a — Create `src/components/LoadingScreen.css`

**File:** `src/components/LoadingScreen.css`

```css
/* Loading Screen */
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: #0d0d0d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  transition: opacity 0.4s ease;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

/* ─── Pixel Sprite ─────────────────────────────────────────────────── */
/*
  12 × 18 pixel grid, each pixel = 4px.
  Container = 48px × 72px, scaled 3× → 144px × 216px visible.

  Layout (. = transparent):
  Row 0:  . . . H H H H H H . . .
  Row 1:  . . H H H H H H H H . .
  Row 2:  . H H S S S S S S H H .
  Row 3:  . H S S e S S e S S H .
  Row 4:  . H S S S S S S S S H .
  Row 5:  . . H H H S S H H H . .
  Row 6:  . . . S S S S S S . . .
  Row 7:  . T T T T T T T T T T .
  Row 8:  T T T T T T T T T T T T
  Row 9:  T T T T T T T T T T T T
  Row 10: A T T T T T T T T T T A
  Row 11: A T T T T T T T T T T A
  Row 12: . . P P P P P P P P . .
  Row 13: . . P P P P P P P P . .
  Row 14: . . P P . . . . P P . .
  Row 15: . . P P . . . . P P . .
  Row 16: . . B B . . . . B B . .
  Row 17: . . B B . . . . B B . .

  H=hair #2d1b00  S=skin #ffcba4  e=eye #1a1a1a
  T=shirt #00b4d8  A=arm/skin  P=pants #1e3a5f  B=boots #333
*/

.sprite-container {
  width: 48px;
  height: 72px;
  transform: scale(3);
  transform-origin: top center;
  /* Account for scale — add margin so it doesn't overlap text */
  margin-bottom: calc(72px * 2);
  animation: breathe 2.4s ease-in-out infinite;
  image-rendering: pixelated;
}

@keyframes breathe {
  0%, 100% { transform: scale(3) translateY(0px); }
  50%       { transform: scale(3) translateY(-2px); }
}

/* The single 4×4 anchor div — all other pixels via box-shadow */
.sprite-pixel {
  width: 4px;
  height: 4px;
  background: transparent;
  box-shadow:
    /* Hair - #2d1b00 */
    12px 0px 0 #2d1b00, 16px 0px 0 #2d1b00, 20px 0px 0 #2d1b00, 24px 0px 0 #2d1b00, 28px 0px 0 #2d1b00, 32px 0px 0 #2d1b00,
    8px 4px 0 #2d1b00, 12px 4px 0 #2d1b00, 16px 4px 0 #2d1b00, 20px 4px 0 #2d1b00, 24px 4px 0 #2d1b00, 28px 4px 0 #2d1b00, 32px 4px 0 #2d1b00, 36px 4px 0 #2d1b00,
    4px 8px 0 #2d1b00, 8px 8px 0 #2d1b00, 36px 8px 0 #2d1b00, 40px 8px 0 #2d1b00,
    4px 12px 0 #2d1b00, 40px 12px 0 #2d1b00,
    4px 16px 0 #2d1b00, 40px 16px 0 #2d1b00,
    8px 20px 0 #2d1b00, 12px 20px 0 #2d1b00, 16px 20px 0 #2d1b00, 32px 20px 0 #2d1b00, 36px 20px 0 #2d1b00, 40px 20px 0 #2d1b00,
    /* Skin - #ffcba4 */
    12px 8px 0 #ffcba4, 16px 8px 0 #ffcba4, 20px 8px 0 #ffcba4, 24px 8px 0 #ffcba4, 28px 8px 0 #ffcba4, 32px 8px 0 #ffcba4,
    8px 12px 0 #ffcba4, 12px 12px 0 #ffcba4, 20px 12px 0 #ffcba4, 24px 12px 0 #ffcba4, 28px 12px 0 #ffcba4, 32px 12px 0 #ffcba4, 36px 12px 0 #ffcba4,
    8px 16px 0 #ffcba4, 12px 16px 0 #ffcba4, 16px 16px 0 #ffcba4, 20px 16px 0 #ffcba4, 24px 16px 0 #ffcba4, 28px 16px 0 #ffcba4, 32px 16px 0 #ffcba4, 36px 16px 0 #ffcba4,
    20px 20px 0 #ffcba4, 24px 20px 0 #ffcba4,
    12px 24px 0 #ffcba4, 16px 24px 0 #ffcba4, 20px 24px 0 #ffcba4, 24px 24px 0 #ffcba4, 28px 24px 0 #ffcba4, 32px 24px 0 #ffcba4,
    /* Arms - skin color */
    0px 40px 0 #ffcba4, 44px 40px 0 #ffcba4,
    0px 44px 0 #ffcba4, 44px 44px 0 #ffcba4,
    /* Eyes - #1a1a1a */
    16px 12px 0 #1a1a1a, 28px 12px 0 #1a1a1a,
    /* Shirt - #00b4d8 */
    4px 28px 0 #00b4d8, 8px 28px 0 #00b4d8, 12px 28px 0 #00b4d8, 16px 28px 0 #00b4d8, 20px 28px 0 #00b4d8, 24px 28px 0 #00b4d8, 28px 28px 0 #00b4d8, 32px 28px 0 #00b4d8, 36px 28px 0 #00b4d8, 40px 28px 0 #00b4d8,
    0px 32px 0 #00b4d8, 4px 32px 0 #00b4d8, 8px 32px 0 #00b4d8, 12px 32px 0 #00b4d8, 16px 32px 0 #00b4d8, 20px 32px 0 #00b4d8, 24px 32px 0 #00b4d8, 28px 32px 0 #00b4d8, 32px 32px 0 #00b4d8, 36px 32px 0 #00b4d8, 40px 32px 0 #00b4d8, 44px 32px 0 #00b4d8,
    0px 36px 0 #00b4d8, 4px 36px 0 #00b4d8, 8px 36px 0 #00b4d8, 12px 36px 0 #00b4d8, 16px 36px 0 #00b4d8, 20px 36px 0 #00b4d8, 24px 36px 0 #00b4d8, 28px 36px 0 #00b4d8, 32px 36px 0 #00b4d8, 36px 36px 0 #00b4d8, 40px 36px 0 #00b4d8, 44px 36px 0 #00b4d8,
    4px 40px 0 #00b4d8, 8px 40px 0 #00b4d8, 12px 40px 0 #00b4d8, 16px 40px 0 #00b4d8, 20px 40px 0 #00b4d8, 24px 40px 0 #00b4d8, 28px 40px 0 #00b4d8, 32px 40px 0 #00b4d8, 36px 40px 0 #00b4d8, 40px 40px 0 #00b4d8,
    4px 44px 0 #00b4d8, 8px 44px 0 #00b4d8, 12px 44px 0 #00b4d8, 16px 44px 0 #00b4d8, 20px 44px 0 #00b4d8, 24px 44px 0 #00b4d8, 28px 44px 0 #00b4d8, 32px 44px 0 #00b4d8, 36px 44px 0 #00b4d8, 40px 44px 0 #00b4d8,
    /* Pants - #1e3a5f */
    8px 48px 0 #1e3a5f, 12px 48px 0 #1e3a5f, 16px 48px 0 #1e3a5f, 20px 48px 0 #1e3a5f, 24px 48px 0 #1e3a5f, 28px 48px 0 #1e3a5f, 32px 48px 0 #1e3a5f, 36px 48px 0 #1e3a5f,
    8px 52px 0 #1e3a5f, 12px 52px 0 #1e3a5f, 16px 52px 0 #1e3a5f, 20px 52px 0 #1e3a5f, 24px 52px 0 #1e3a5f, 28px 52px 0 #1e3a5f, 32px 52px 0 #1e3a5f, 36px 52px 0 #1e3a5f,
    8px 56px 0 #1e3a5f, 12px 56px 0 #1e3a5f, 32px 56px 0 #1e3a5f, 36px 56px 0 #1e3a5f,
    8px 60px 0 #1e3a5f, 12px 60px 0 #1e3a5f, 32px 60px 0 #1e3a5f, 36px 60px 0 #1e3a5f,
    /* Boots - #333333 */
    8px 64px 0 #333333, 12px 64px 0 #333333, 32px 64px 0 #333333, 36px 64px 0 #333333,
    8px 68px 0 #333333, 12px 68px 0 #333333, 32px 68px 0 #333333, 36px 68px 0 #333333;
}

/* ─── Name text ────────────────────────────────────────────────────── */
.loading-name {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.25em;
  font-weight: 300;
  font-family: system-ui, sans-serif;
}

/* ─── Pulse bar ────────────────────────────────────────────────────── */
.loading-bar-wrap {
  width: 80px;
  height: 2px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.loading-bar {
  height: 100%;
  width: 100%;
  background: linear-gradient(90deg, #00b4d8, #7e22ce);
  border-radius: 2px;
  animation: pulse-bar 1.6s ease-in-out infinite;
  transform-origin: left;
}

@keyframes pulse-bar {
  0%, 100% { transform: scaleX(0.15); opacity: 0.4; }
  50%       { transform: scaleX(1);    opacity: 1; }
}
```

### 4b — Create `src/components/LoadingScreen.jsx`

**File:** `src/components/LoadingScreen.jsx`

```jsx
import './LoadingScreen.css'

function LoadingScreen({ loaded }) {
  return (
    <div className={`loading-screen${loaded ? ' fade-out' : ''}`}>
      <div className="sprite-container">
        <div className="sprite-pixel" />
      </div>
      <p className="loading-name">HAN HUA</p>
      <div className="loading-bar-wrap">
        <div className="loading-bar" />
      </div>
    </div>
  )
}

export default LoadingScreen
```

### 4c — Update `src/App.jsx`

```jsx
import { useState, useEffect } from 'react'
import './App.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Blog from './components/Blog'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'

function App() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Fire immediately if already loaded (e.g. fast connection / cached)
    if (document.readyState === 'complete') {
      // Short delay so the sprite renders for at least one breath cycle
      const t = setTimeout(() => setLoaded(true), 600)
      return () => clearTimeout(t)
    }
    const onLoad = () => setTimeout(() => setLoaded(true), 600)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return (
    <>
      <LoadingScreen loaded={loaded} />
      <Navbar />
      <Hero />
      <About />
      <Skills />
      <Blog />
      <Projects />
      <Contact />
      <Footer />
    </>
  )
}

export default App
```

**Verification:**
```bash
npm run dev
# Open http://localhost:5173/portfolio/
# → Dark screen with pixel sprite breathing + "HAN HUA" text + pulsing bar
# → Fades out after ~600ms (in dev, window.onload fires fast)
# → Hold throttle in DevTools Network to see longer loading
```

**Commit:**
```bash
git add src/components/LoadingScreen.jsx src/components/LoadingScreen.css src/App.jsx
git commit -m "feat: add loading screen with pixel art Han sprite"
```

---

## Task 5 — Blog Infrastructure

### 5a — Install dependencies

```bash
cd /home/hh-pi/projects/portfolio
npm install gray-matter marked
```

### 5b — Create posts directory with placeholder

```bash
mkdir -p src/posts
touch src/posts/.gitkeep
```

### 5c — Create a sample post for testing

**File:** `src/posts/2026-03-06-hello-world.md`

```markdown
---
title: "Hello, World"
date: "2026-03-06"
tags: ["meta", "first-post"]
summary: "First post — testing the blog pipeline."
---

## Welcome

This is a test post to verify the markdown pipeline works end-to-end.

### What's working

- Frontmatter parsed with `gray-matter`
- Markdown rendered with `marked`
- Vite glob import for zero-build-time overhead

```js
// Example code block
const greeting = 'Hello, World!'
console.log(greeting)
```

More posts coming soon.
```

### 5d — Create `src/hooks/usePosts.js`

**File:** `src/hooks/usePosts.js`

```js
import matter from 'gray-matter'
import { marked } from 'marked'

// Eager glob import of all markdown files in src/posts/
// Each value is the raw file string (via ?raw query)
const rawFiles = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

export function usePosts() {
  const posts = Object.entries(rawFiles)
    .filter(([, raw]) => typeof raw === 'string' && raw.trim().length > 0)
    .map(([filePath, raw]) => {
      const { data, content } = matter(raw)
      // Derive slug from filename: "2026-03-06-hello-world.md" → "2026-03-06-hello-world"
      const slug = filePath.split('/').pop().replace(/\.md$/, '')
      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        tags: Array.isArray(data.tags) ? data.tags : [],
        summary: data.summary || '',
        html: marked.parse(content),
      }
    })

  // Sort newest first
  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  return posts
}
```

**Verification:**
```bash
# Quick import check — should not throw
node -e "import('./src/hooks/usePosts.js').then(m => console.log('ok')).catch(e => console.error(e))"
# (will fail in CJS, that's fine — it's an ESM module. Real check is in browser.)
```

**Commit:**
```bash
git add package.json package-lock.json src/posts/.gitkeep src/posts/2026-03-06-hello-world.md src/hooks/usePosts.js
git commit -m "feat: add blog post infrastructure (gray-matter + marked + usePosts hook)"
```

---

## Task 6 — Blog & BlogPost Components

### 6a — Create `src/components/Blog.css`

**File:** `src/components/Blog.css`

```css
/* Blog section */
.blog {
  padding: 6rem 2rem;
  background: #111827;
  min-height: 60vh;
}

.blog-container {
  max-width: 1100px;
  margin: 0 auto;
}

.blog-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.blog-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
}

.blog-subtitle {
  color: #9ca3af;
  font-size: 1.1rem;
  margin: 0;
}

/* Accent line under title */
.blog-title-accent {
  display: block;
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #00b4d8, #7e22ce);
  margin: 1rem auto 0;
  border-radius: 2px;
}

/* Empty state */
.blog-empty {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.blog-empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  display: block;
}

.blog-empty p {
  font-size: 1.1rem;
  margin: 0;
}

/* Card grid */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
}

/* Post card */
.blog-card {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 12px;
  padding: 1.75rem;
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.blog-card:hover {
  transform: translateY(-3px);
  border-color: #00b4d8;
  box-shadow: 0 8px 30px rgba(0, 180, 216, 0.1);
}

.blog-card-date {
  font-size: 0.8rem;
  color: #6b7280;
  letter-spacing: 0.05em;
  margin: 0 0 0.75rem 0;
  text-transform: uppercase;
}

.blog-card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: #f3f4f6;
  margin: 0 0 0.75rem 0;
  line-height: 1.4;
}

.blog-card-summary {
  font-size: 0.95rem;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0 0 1.25rem 0;
}

.blog-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.blog-tag {
  background: rgba(0, 180, 216, 0.1);
  color: #00b4d8;
  border: 1px solid rgba(0, 180, 216, 0.2);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Read more hint */
.blog-card-read-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  color: #00b4d8;
  font-size: 0.85rem;
  font-weight: 600;
  margin-top: 1rem;
}

/* Responsive */
@media (max-width: 640px) {
  .blog-title { font-size: 2rem; }
  .blog-grid { grid-template-columns: 1fr; }
}
```

### 6b — Create `src/components/Blog.jsx`

**File:** `src/components/Blog.jsx`

```jsx
import { useState } from 'react'
import './Blog.css'
import { usePosts } from '../hooks/usePosts'
import BlogPost from './BlogPost'

function Blog() {
  const posts = usePosts()
  const [activePost, setActivePost] = useState(null)

  return (
    <section id="blog" className="blog">
      <div className="blog-container">
        <div className="blog-header">
          <h2 className="blog-title">Blog</h2>
          <span className="blog-title-accent" />
          <p className="blog-subtitle">Thoughts on code, design, and whatever else.</p>
        </div>

        {posts.length === 0 ? (
          <div className="blog-empty">
            <span className="blog-empty-icon">✍️</span>
            <p>Posts coming soon — check back later.</p>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="blog-card"
                onClick={() => setActivePost(post)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && setActivePost(post)}
              >
                <p className="blog-card-date">{post.date}</p>
                <h3 className="blog-card-title">{post.title}</h3>
                {post.summary && (
                  <p className="blog-card-summary">{post.summary}</p>
                )}
                {post.tags.length > 0 && (
                  <div className="blog-card-tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="blog-tag">{tag}</span>
                    ))}
                  </div>
                )}
                <span className="blog-card-read-more">Read more →</span>
              </article>
            ))}
          </div>
        )}
      </div>

      {activePost && (
        <BlogPost post={activePost} onBack={() => setActivePost(null)} />
      )}
    </section>
  )
}

export default Blog
```

### 6c — Create `src/components/BlogPost.css`

**File:** `src/components/BlogPost.css`

```css
/* BlogPost full-screen overlay */
.blog-post-overlay {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: #0d111a;
  overflow-y: auto;
  animation: slide-in 0.25s ease-out;
}

@keyframes slide-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.blog-post-inner {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 2rem 6rem;
}

/* Back button */
.blog-post-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 2.5rem;
  transition: color 0.15s;
}

.blog-post-back:hover {
  color: #ffffff;
  border: none;
}

/* Post header */
.blog-post-date {
  font-size: 0.8rem;
  color: #6b7280;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0 0 0.75rem 0;
}

.blog-post-title {
  font-size: 2.2rem;
  font-weight: 800;
  color: #f9fafb;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.blog-post-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
}

.blog-post-tag {
  background: rgba(0, 180, 216, 0.1);
  color: #00b4d8;
  border: 1px solid rgba(0, 180, 216, 0.2);
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 500;
}

.blog-post-divider {
  border: none;
  border-top: 1px solid #1f2937;
  margin: 0 0 2.5rem 0;
}

/* Markdown content */
.blog-post-content {
  color: #d1d5db;
  line-height: 1.8;
  font-size: 1.05rem;
}

.blog-post-content h1,
.blog-post-content h2,
.blog-post-content h3,
.blog-post-content h4 {
  color: #f3f4f6;
  margin: 2rem 0 0.75rem;
  font-weight: 700;
}

.blog-post-content h2 { font-size: 1.5rem; }
.blog-post-content h3 { font-size: 1.2rem; }

.blog-post-content p { margin: 0 0 1.25rem 0; }

.blog-post-content a {
  color: #00b4d8;
  text-decoration: underline;
}

.blog-post-content code {
  background: #1f2937;
  border: 1px solid #374151;
  border-radius: 4px;
  padding: 0.15em 0.4em;
  font-size: 0.88em;
  font-family: 'Fira Code', monospace;
  color: #e2e8f0;
}

.blog-post-content pre {
  background: #1a2235;
  border: 1px solid #374151;
  border-radius: 8px;
  padding: 1.25rem;
  overflow-x: auto;
  margin: 1.5rem 0;
}

.blog-post-content pre code {
  background: none;
  border: none;
  padding: 0;
  font-size: 0.9rem;
}

.blog-post-content ul,
.blog-post-content ol {
  padding-left: 1.5rem;
  margin: 0 0 1.25rem 0;
}

.blog-post-content li { margin-bottom: 0.4rem; }

.blog-post-content blockquote {
  border-left: 3px solid #00b4d8;
  margin: 1.5rem 0;
  padding: 0.75rem 1.25rem;
  background: rgba(0, 180, 216, 0.05);
  color: #9ca3af;
  font-style: italic;
}

/* Responsive */
@media (max-width: 640px) {
  .blog-post-inner { padding: 1.5rem 1.25rem 4rem; }
  .blog-post-title { font-size: 1.6rem; }
}
```

### 6d — Create `src/components/BlogPost.jsx`

**File:** `src/components/BlogPost.jsx`

```jsx
import { useEffect } from 'react'
import './BlogPost.css'

function BlogPost({ post, onBack }) {
  // Close on ESC key
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack() }
    window.addEventListener('keydown', onKey)
    // Prevent background scroll
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onBack])

  return (
    <div className="blog-post-overlay" role="dialog" aria-modal="true">
      <div className="blog-post-inner">
        <button className="blog-post-back" onClick={onBack}>
          ← Back to Blog
        </button>

        <p className="blog-post-date">{post.date}</p>
        <h1 className="blog-post-title">{post.title}</h1>

        {post.tags.length > 0 && (
          <div className="blog-post-tags">
            {post.tags.map((tag) => (
              <span key={tag} className="blog-post-tag">{tag}</span>
            ))}
          </div>
        )}

        <hr className="blog-post-divider" />

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: post.html }}
        />
      </div>
    </div>
  )
}

export default BlogPost
```

**Verification:**
```bash
npm run dev
# → Blog section visible with sample post card
# → Click card → full-screen overlay with rendered markdown
# → ESC or Back button → returns to card list
# → Delete src/posts/2026-03-06-hello-world.md → section shows "Posts coming soon"
```

**Commit:**
```bash
git add src/components/Blog.jsx src/components/Blog.css src/components/BlogPost.jsx src/components/BlogPost.css
git commit -m "feat: add Blog and BlogPost components"
```

---

## Task 7 — Navbar + App Wiring

### 7a — Update `src/components/Navbar.jsx`

Add `'blog'` between `'skills'` and `'projects'` in the `navItems` array, and include it in the `sections` scroll tracker.

**Find:**
```js
  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ]
```

**Replace with:**
```js
  const navItems = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'blog', label: 'Blog' },
    { id: 'projects', label: 'Projects' },
    { id: 'contact', label: 'Contact' }
  ]
```

Also update the scroll-position tracker. **Find:**
```js
      const sections = ['hero', 'about', 'skills', 'projects', 'contact']
```

**Replace with:**
```js
      const sections = ['hero', 'about', 'skills', 'blog', 'projects', 'contact']
```

### 7b — Verify `src/App.jsx`

`App.jsx` was updated in Task 4 to include `<Blog />` between `<Skills />` and `<Projects />`. Confirm it's in place:

```bash
grep -n "Blog" src/App.jsx
# → import Blog from './components/Blog'
# → <Blog />
```

**Verification:**
```bash
npm run dev
# → Navbar shows: About | Skills | Blog | Projects | Contact
# → Clicking "Blog" scrolls to the blog section
# → Active highlight updates correctly as user scrolls
```

**Commit:**
```bash
git add src/components/Navbar.jsx
git commit -m "feat: add Blog to navbar"
```

---

## Task 8 — Build Check & Deploy

### 8a — Production build

```bash
cd /home/hh-pi/projects/portfolio
npm run build
```

Check for errors. Common issues:
- `gray-matter` / `marked` not resolving → verify they're in `dependencies` (not `devDependencies`)
- Vite glob `?raw` not working → check Vite version supports it (Vite 7 ✓)

### 8b — Preview production build

```bash
npm run preview
# Open http://localhost:4173/portfolio/
# Verify:
# ✓ Loading screen appears then fades
# ✓ Navbar has Blog link
# ✓ Hero has Resume button (downloads resume.pdf)
# ✓ Blog section shows posts (or empty state)
# ✓ Blog post overlay works
# ✓ No console errors
```

### 8c — Final commit & deploy

```bash
git add -A
git commit -m "chore: verify production build"
gh auth setup-git
git push
npm run deploy
```

---

## File Change Summary

| File | Action |
|---|---|
| `index.html` | Add SEO + OG meta tags |
| `public/og-image.png` | New — Playwright screenshot |
| `public/resume.pdf` | New — placeholder (Han adds real PDF) |
| `scripts/generate-og.mjs` | New — OG screenshot script |
| `src/App.jsx` | Add `loaded` state + LoadingScreen + Blog |
| `src/components/LoadingScreen.jsx` | New |
| `src/components/LoadingScreen.css` | New — pixel art sprite + breathing animation |
| `src/components/Hero.jsx` | Add Resume download button |
| `src/components/Hero.css` | Add `.cta-button.ghost` styles |
| `src/components/Navbar.jsx` | Add Blog nav item |
| `src/components/Blog.jsx` | New |
| `src/components/Blog.css` | New |
| `src/components/BlogPost.jsx` | New |
| `src/components/BlogPost.css` | New |
| `src/hooks/usePosts.js` | New — markdown loader hook |
| `src/posts/.gitkeep` | New — empty posts dir |
| `src/posts/2026-03-06-hello-world.md` | New — test post (delete before prod) |
| `package.json` | Add `gray-matter`, `marked`, `playwright` (dev) |

---

## Commit Order Recap

```
feat: add SEO and OpenGraph meta tags
feat: add OG image + Playwright screenshot script
feat: add resume download button to Hero
feat: add loading screen with pixel art Han sprite
feat: add blog post infrastructure (gray-matter + marked + usePosts hook)
feat: add Blog and BlogPost components
feat: add Blog to navbar
chore: verify production build
```
