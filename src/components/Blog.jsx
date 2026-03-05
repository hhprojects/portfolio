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
