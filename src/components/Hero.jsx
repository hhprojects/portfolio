import { useState, useEffect, useRef } from 'react'
import './Hero.css'
import portfolioImage from '../assets/Portfolio Image (With Lighting).png'

function Hero() {
  const [isVisible, setIsVisible] = useState(false)
  const [currentRole, setCurrentRole] = useState(0)
  const heroRef = useRef(null)

  const roles = ['Software Engineer', 'Web Developer', 'Designer']

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '0px',
      }
    )

    if (heroRef.current) {
      observer.observe(heroRef.current)
    }

    return () => {
      if (heroRef.current) {
        observer.unobserve(heroRef.current)
      }
    }
  }, [])

  // Rotate through roles
  useEffect(() => {
    if (!isVisible) return
    
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [isVisible, roles.length])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section id="hero" className="hero" ref={heroRef}>
      {/* Animated background particles */}
      <div className="hero-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}></div>
        ))}
      </div>

      <div className={`hero-logo ${isVisible ? 'visible' : ''}`}>
        <img src={portfolioImage} alt="Portfolio Logo" className="logo-image" />
      </div>
      
      <div className="hero-content">
        <div className={`hero-text ${isVisible ? 'visible' : ''}`}>
          <p className="hero-greeting">Hi, I'm</p>
          <h1 className="hero-title">
            <span className="title-line gradient-text">Han Hua</span>
          </h1>
          <div className="hero-subtitle-container">
            <p className="hero-subtitle">
              I'm a{' '}
              <span className="role-text" key={currentRole}>
                {roles[currentRole]}
              </span>
            </p>
          </div>
          <p className="hero-description">
            Crafting beautiful, functional solutions that bring ideas to life
          </p>
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
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className="scroll-indicator">
        <div className="mouse">
          <div className="wheel"></div>
        </div>
        <p>Scroll Down</p>
      </div>
    </section>
  )
}

export default Hero
