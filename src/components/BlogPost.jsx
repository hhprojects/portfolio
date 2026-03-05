import { useEffect } from 'react'
import './BlogPost.css'

function BlogPost({ post, onBack }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onBack() }
    window.addEventListener('keydown', onKey)
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
