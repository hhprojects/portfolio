import { useState, useEffect, useRef } from 'react'
import './Blog.css'
import { usePosts } from '../hooks/usePosts'
import BlogPost from './BlogPost'

function Blog() {
  const posts = usePosts()
  const [activePost, setActivePost] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in')
          } else {
            entry.target.classList.remove('animate-in')
          }
        })
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="blog" className="blog" ref={sectionRef}>
      <div className="blog-container">
        <div className="blog-header">
          <span className="section-number">04</span>
          <h2 className="blog-heading">Blog</h2>
        </div>
        <p className="blog-subtitle">Thoughts on code, design, and whatever else.</p>

        {posts.length === 0 ? (
          <div className="blog-empty">
            <div className="blog-empty-icon">✍️</div>
            <p className="blog-empty-text">Posts coming soon — check back later.</p>
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
                <span className="blog-card-date">{post.date}</span>
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
