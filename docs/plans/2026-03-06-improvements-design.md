# Portfolio Improvements Design
**Date:** 2026-03-06  
**Status:** Approved

---

## 1. Loading Screen

### Behaviour
- Renders immediately on page load, covers full viewport
- Disappears (fade out 400ms) once `window.onload` fires
- Never shown again during client-side navigation

### Visual
- Dark background (`#0d0d0d`)
- Small Han pixel sprite (idle breathing animation) centered
- "Han Hua" text below sprite
- Thin progress/pulse bar beneath text
- Pure CSS animation — no JS dependencies

### Implementation
- `LoadingScreen.jsx` + `LoadingScreen.css`
- `App.jsx` sets `loaded` state on `window.onload`, conditionally renders `<LoadingScreen />`
- Sprite reuses pixel art from game mode (Han idle frames)

---

## 2. SEO & Meta Tags

### Tags to add (all in `index.html`)
```html
<!-- Primary -->
<title>Han Hua — Web Developer</title>
<meta name="description" content="Web developer based in Singapore. Building clean, interactive web experiences." />

<!-- OpenGraph (link previews on Slack, iMessage, Discord, etc.) -->
<meta property="og:title" content="Han Hua — Web Developer" />
<meta property="og:description" content="Web developer based in Singapore. Building clean, interactive web experiences." />
<meta property="og:image" content="https://hhprojects.github.io/portfolio/og-image.png" />
<meta property="og:url" content="https://hhprojects.github.io/portfolio/" />
<meta property="og:type" content="website" />

<!-- Twitter card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Han Hua — Web Developer" />
<meta name="twitter:description" content="Web developer based in Singapore." />
<meta name="twitter:image" content="https://hhprojects.github.io/portfolio/og-image.png" />
```

### OG Image
- Static 1200×630px screenshot of the portfolio hero section
- Saved as `public/og-image.png`
- Generated once with Playwright, committed to repo

---

## 3. CV Download Button

### Placement
- Hero section, third button alongside "View My Work" and "Get In Touch"
- Label: `📄 Resume`
- Style: ghost/outline variant (distinct from primary CTAs)

### Implementation
- `<a href="/portfolio/resume.pdf" download>📄 Resume</a>`
- PDF lives at `public/resume.pdf` — Han drops file in, it's live
- If no PDF exists yet, button is hidden (conditional on file presence — handled by just not committing the button until PDF is ready, or show it always and Han adds PDF when ready)
- Opens as download, not new tab

---

## 4. Blog Section

### Structure
```
src/
  posts/
    YYYY-MM-DD-post-title.md   ← Han's markdown files go here
  components/
    Blog.jsx
    Blog.css
    BlogPost.jsx               ← full post view
    BlogPost.css
```

### Markdown Frontmatter Format
```markdown
---
title: "My First Post"
date: "2026-03-06"
tags: ["react", "building"]
summary: "A short summary shown on the card."
---

Full post content in markdown here...
```

### Dependencies
- `gray-matter` — parse frontmatter
- `marked` — render markdown to HTML
- `vite-plugin-markdown` or manual Vite glob import (`import.meta.glob`)

### Blog Section UI
- New nav item: "Blog" between Skills and Projects
- Section shows post cards: title, date, tags, summary
- Cards sorted by date descending
- **Empty state:** "Posts coming soon — check back later." (no broken UI)
- Clicking a card → sets `activePost` state → renders `<BlogPost />` full-screen overlay
- Back button / ESC returns to blog card list

### BlogPost View
- Full-width readable layout (max 720px centered)
- Markdown rendered as styled HTML (headings, code blocks, lists)
- Post title, date, tags at top
- Back arrow top-left

### No routing needed
- All state managed in React (`activePost: null | postObject`)
- URL doesn't change — keep it simple for a static site

---

## Out of Scope
- Comments
- Search
- RSS feed
- Pagination (show all posts, max ~20 before this matters)
- CMS / admin UI (Han edits markdown files directly)
- Mobile game controls (documented in game mode design for future)
- Analytics (add Plausible later when actively sharing)

---

## File Changes Summary

| File | Change |
|------|--------|
| `index.html` | Add SEO/OG meta tags |
| `public/og-image.png` | New — OG image screenshot |
| `public/resume.pdf` | New — Han adds when ready |
| `src/App.jsx` | Add `loaded` state for loading screen |
| `src/components/LoadingScreen.jsx` | New |
| `src/components/LoadingScreen.css` | New |
| `src/components/Blog.jsx` | New |
| `src/components/Blog.css` | New |
| `src/components/BlogPost.jsx` | New |
| `src/components/BlogPost.css` | New |
| `src/components/Hero.jsx` | Add Resume download button |
| `src/components/Navbar.jsx` | Add Blog nav item |
| `src/posts/` | New directory — Han's markdown files |
| `package.json` | Add `gray-matter`, `marked` |
