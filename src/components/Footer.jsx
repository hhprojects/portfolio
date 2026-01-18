import { useEffect, useRef } from 'react'
import './Footer.css'

function Footer() {
  const currentYear = new Date().getFullYear()
  const sectionRef = useRef(null)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

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
    <footer className="footer" ref={sectionRef}>
      <div className="footer-container">
        {/* Copyright */}
        <div className="footer-left">
          <p className="copyright">
            © {currentYear} <span className="name">hh.dev</span>. All rights reserved.
          </p>
        </div>

        {/* Back to top */}
        <button className="back-to-top" onClick={scrollToTop} aria-label="Back to top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      </div>
    </footer>
  )
}

export default Footer
