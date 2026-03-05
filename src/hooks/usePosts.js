import matter from 'gray-matter'
import { marked } from 'marked'

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
