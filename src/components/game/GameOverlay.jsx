import React from 'react'
import { GL_PROJECTS } from './rooms'

const _glPopupAssets = import.meta.glob('../../../assets/projects/**/*.{jpg,jpeg,png}', { eager: true })
function glPopupImgUrl(imgPath) {
  const key = `../../../assets/projects/${imgPath}`
  const mod = _glPopupAssets[key]
  return mod ? mod.default : ''
}

export default function GameOverlay({ overlayState, onDismiss }) {
  const { interactLabel, popup } = overlayState

  return (
    <div className="game-overlay" style={{ pointerEvents: popup ? 'all' : 'none' }}>
      {interactLabel && !popup && (
        <div className="interact-prompt">
          <span className="interact-key">{interactLabel.split(' ')[0]}</span>
          <span className="interact-text"> {interactLabel.split(' ').slice(1).join(' ')}</span>
        </div>
      )}

      {popup && (
        <div className="popup-backdrop" onClick={onDismiss}>
          <div className="popup-card" onClick={e => e.stopPropagation()}>
            <button className="popup-close" onClick={onDismiss}>✕</button>
            <PopupContent action={popup} />
          </div>
        </div>
      )}
    </div>
  )
}

function PopupContent({ action }) {
  switch (action) {
    case 'about':
      return (
        <div className="popup-body">
          <h2 className="popup-title">👋 About Me</h2>
          <div className="popup-section">
            <p>Hi! I'm <strong>Han Hua</strong> — a Software Engineer, Web Developer, and Designer based in Singapore.</p>
            <p>I craft beautiful, functional solutions that bring ideas to life. I love working across the full stack, from pixel-perfect UIs to scalable backend systems.</p>
            <p>When I'm not coding, you'll find me exploring new tech, gaming, or designing something just for fun — like this game mode.</p>
          </div>
          <div className="popup-tags">
            {['React', 'TypeScript', 'Python', 'Node.js', 'Design Systems'].map(t => (
              <span key={t} className="popup-tag">{t}</span>
            ))}
          </div>
        </div>
      )

    case 'funfact':
      return (
        <div className="popup-body">
          <h2 className="popup-title">🎲 Fun Fact</h2>
          <div className="popup-section">
            <p className="popup-big-text">I built this portfolio game mode from scratch — pixel art and all. 🎮</p>
            <p>WASD to move, E to interact, ESC to return to the normal portfolio.</p>
          </div>
        </div>
      )

    case 'skills':
    case 'techstack':
      return (
        <div className="popup-body">
          <h2 className="popup-title">⚡ Skills</h2>
          <div className="popup-section">
            <p className="popup-subtitle">Languages & Frameworks</p>
            <div className="popup-tags">
              {['JavaScript', 'TypeScript', 'Python', 'React', 'Next.js', 'Node.js', 'Express', 'FastAPI'].map(t => (
                <span key={t} className="popup-tag">{t}</span>
              ))}
            </div>
            <p className="popup-subtitle">Tools & Platforms</p>
            <div className="popup-tags">
              {['Git', 'Docker', 'PostgreSQL', 'Redis', 'AWS', 'Vite', 'Tailwind CSS', 'Figma'].map(t => (
                <span key={t} className="popup-tag tag-secondary">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )

    case 'project1':
    case 'project2':
    case 'project3':
    case 'project4': {
      const p = GL_PROJECTS.find(proj => proj.action === action)
      if (!p) return <div className="popup-body"><p>Project not found.</p></div>
      return (
        <div className="popup-body">
          <img className="popup-project-img" src={glPopupImgUrl(p.imgPath)} alt={p.title} />
          <h2 className="popup-title">{p.title}</h2>
          <div className="popup-section"><p>{p.description}</p></div>
        </div>
      )
    }

    case 'contact':
      return (
        <div className="popup-body">
          <h2 className="popup-title">📬 Get In Touch</h2>
          <div className="popup-section"><p>Have a project in mind? Want to work together? Drop me a message!</p></div>
          <form className="popup-form" onSubmit={(e) => { e.preventDefault(); alert('Thanks for your message!') }}>
            <input className="popup-input" type="text" placeholder="Your Name" required />
            <input className="popup-input" type="email" placeholder="Your Email" required />
            <textarea className="popup-textarea" placeholder="Your Message" rows={4} required />
            <button className="popup-submit" type="submit">Send Message 🚀</button>
          </form>
        </div>
      )

    default:
      return <div className="popup-body"><p>Nothing here yet.</p></div>
  }
}
