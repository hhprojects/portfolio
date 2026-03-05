import { chromium } from 'playwright'
import { createServer } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import { mkdir } from 'fs/promises'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const server = await createServer({
  root,
  server: { port: 5199 },
  logLevel: 'silent',
})
await server.listen()

const browser = await chromium.launch()
const page = await browser.newPage()
await page.setViewportSize({ width: 1200, height: 630 })
await page.goto('http://localhost:5199/portfolio/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
await page.evaluate(() => {
  document.querySelectorAll('.hero-text, .hero-logo').forEach(el => el.classList.add('visible'))
  const ls = document.querySelector('.loading-screen')
  if (ls) ls.style.display = 'none'
})
await page.waitForTimeout(800)

await mkdir(path.join(root, 'public'), { recursive: true })
await page.screenshot({
  path: path.join(root, 'public', 'og-image.png'),
  clip: { x: 0, y: 0, width: 1200, height: 630 },
})

await browser.close()
await server.close()
console.log('✅ OG image saved to public/og-image.png')
process.exit(0)
