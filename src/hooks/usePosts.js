import { marked } from 'marked'

const rawFiles = import.meta.glob('../posts/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
})

function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { data: {}, content: raw }
  const data = {}
  for (const line of match[1].split('\n')) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const val = line.slice(colon + 1).trim()
    if (val.startsWith('[') && val.endsWith(']')) {
      data[key] = val.slice(1, -1).split(',').map(s => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
    } else {
      data[key] = val.replace(/^['"]|['"]$/g, '')
    }
  }
  return { data, content: match[2] }
}

export function usePosts() {
  const posts = Object.entries(rawFiles)
    .filter(([, raw]) => typeof raw === 'string' && raw.trim().length > 0)
    .map(([filePath, raw]) => {
      const { data, content } = parseFrontMatter(raw)
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

  posts.sort((a, b) => new Date(b.date) - new Date(a.date))
  return posts
}
