import { useState, useEffect, useRef } from 'react'
import './About.css'
import ordImage from '../assets/ord.jpg'
import shangriLaImage from '../assets/shangri-la.jpg'
import dogCafeImage from '../assets/dog-cafe.jpg'
import snowMountainImage from '../assets/snow-mountain.jpg'

function About() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const sectionRef = useRef(null)

  const carouselImages = [
    ordImage,
    shangriLaImage,
    dogCafeImage,
    snowMountainImage,
  ]

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [carouselImages.length])

  // Intersection Observer for scroll-triggered animations
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

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <section id="about" className="about" ref={sectionRef}>
      <div className="about-container">
        <div className="about-header">
          <span className="section-number">01</span>
          <h2 className="about-heading">About Me</h2>
        </div>

        <div className="about-content">
          {/* Carousel */}
          <div className="about-carousel">
            <div className="carousel-container">
              <div
                className="carousel-track"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselImages.map((image, index) => (
                  <div key={index} className="carousel-slide">
                    <img src={image} alt={`About ${index + 1}`} />
                  </div>
                ))}
              </div>

              {/* Navigation arrows */}
              <button 
                className="carousel-btn prev" 
                onClick={prevSlide} 
                aria-label="Previous slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </button>
              <button 
                className="carousel-btn next" 
                onClick={nextSlide} 
                aria-label="Next slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </button>

              {/* Dots indicator */}
              <div className="carousel-dots">
                {carouselImages.map((_, index) => (
                  <button
                    key={index}
                    className={`dot ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Text description */}
          <div className="about-text">
            <h3 className="about-subheading">Hi, I'm Han Hua</h3>
            <p className="about-description">
              I'm a Computer Science student passionate about creating beautiful and functional digital experiences.
              With a focus on modern web/mobile technologies, I specialize in building responsive, user-friendly
              applications that solve real-world problems.
            </p>
            <p className="about-description">
              Outside of tech, I enjoy staying active and playing a variety of sports including hiking, mid-distance running,
              basketball, and bowling. I also love to travel and explore new places - it's always exciting 
              to discover fresh perspectives and experiences wherever I go.
            </p>
            <p className="about-description">
              During the weekends, you can find me exploring developing new skillsets, working on personal projects, 
              or solving problems on leetcode. I believe in continuous learning and always seek opportunities to grow
              both professionally and personally.
            </p>

            {/* Highlights */}
            <div className="about-highlights">
              <div className="highlight-item">
                <div className="highlight-number">10+</div>
                <div className="highlight-label">Projects Built</div>
              </div>
              <div className="highlight-item">
                <div className="highlight-number">4.0</div>
                <div className="highlight-label">GPA</div>
              </div>
              <div className="highlight-item">
                <div className="highlight-number">3+</div>
                <div className="highlight-label">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About
