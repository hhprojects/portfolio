import { useState, useEffect, useRef } from 'react'
import './Projects.css'
import portfolioImage from '../assets/projects/portfolio/portfolio.jpg'
import create_event from '../assets/projects/muse/create_event.jpg'
import create_task from '../assets/projects/muse/create_task.jpg'
import dark_board from '../assets/projects/muse/dark_board.jpg'
import dark_calendar from '../assets/projects/muse/dark_calendar.jpg'
import light_board from '../assets/projects/muse/light_board.jpg'
import light_calendar from '../assets/projects/muse/light_calendar.jpg'

function Projects() {
  const [currentProject, setCurrentProject] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const sectionRef = useRef(null)

  const projects = [
    {
      id: 1,
      title: 'Portfolio Website',
      year: '2026',
      description: 'Personal portfolio website showcasing projects and skills. Features smooth animations, responsive design, and dark mode.',
      tech: ['React', 'CSS'],
      images: [portfolioImage],
      link: 'https://github.com/hhprojects/portfolio',
      demo: 'hhproject.github.io/portfolio',
    },
    {
      id: 2,
      title: 'Muse - Workflow Dashboard',
      year: '2026',
      description: 'A full-stack dashboard application for workflow management. Features containerized backend and frontend services with Docker support.',
      tech: ['TypeScript', 'CSS', 'Docker'],
      images: [create_event, create_task, dark_board, dark_calendar, light_board, light_calendar],
      link: 'https://github.com/hhprojects/workflow-dashboard',
    },
  ]

  useEffect(() => {
    if (projects.length > 0) {
      setCurrentProject(projects[0])
    }
  }, [])

  const handleProjectSelect = (project) => {
    setCurrentProject(project)
    setCurrentSlide(0)
  }

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!currentProject?.images?.length) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentProject.images.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [currentProject?.id, currentProject?.images?.length])

  const goToSlide = (index) => setCurrentSlide(index)
  const nextSlide = () => {
    if (!currentProject?.images?.length) return
    setCurrentSlide((prev) => (prev + 1) % currentProject.images.length)
  }
  const prevSlide = () => {
    if (!currentProject?.images?.length) return
    setCurrentSlide((prev) => (prev - 1 + currentProject.images.length) % currentProject.images.length)
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
    <section id="projects" className="projects" ref={sectionRef}>
      <div className="projects-container">
        <div className="projects-header">
          <span className="section-number">03</span>
          <h2 className="projects-heading">Featured Projects</h2>
        </div>
        <p className="projects-subtitle">
          A selection of my recent work and personal projects
        </p>

        {/* Project preview area */}
        <div className="project-preview">
          {currentProject ? (
            <div className="preview-content">
              <div className="preview-carousel">
                <div className="carousel-container">
                  <div
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                  >
                    {currentProject.images.map((image, index) => (
                      <div key={index} className="carousel-slide">
                        <img src={image} alt={`${currentProject.title} ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                  {currentProject.images.length > 1 && (
                    <>
                      <button
                        className="carousel-btn prev"
                        onClick={prevSlide}
                        aria-label="Previous slide"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        className="carousel-btn next"
                        onClick={nextSlide}
                        aria-label="Next slide"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                      <div className="carousel-dots">
                        {currentProject.images.map((_, index) => (
                          <button
                            key={index}
                            className={`dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Go to slide ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="preview-details">
                <h3 className="preview-title">{currentProject.title}</h3>
                <p className="preview-description">{currentProject.description}</p>
                <div className="preview-tech">
                  {currentProject.tech.map((tech, index) => (
                    <span key={index} className="tech-tag">{tech}</span>
                  ))}
                </div>
                <div className="preview-links">
                  <a href={currentProject.link} target="_blank" rel="noopener noreferrer" className="preview-link">
                    View Code
                  </a>
                  {currentProject.demo && (
                    <a href={currentProject.demo} target="_blank" rel="noopener noreferrer" className="preview-link primary">
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-placeholder">
              <p>Loading projects...</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="timeline">
          <div className="timeline-line"></div>
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`timeline-item ${currentProject?.id === project.id ? 'active' : ''}`}
              onClick={() => handleProjectSelect(project)}
              onMouseEnter={() => handleProjectSelect(project)}
              style={{ '--item-index': index }}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content">
                <div className="timeline-year">{project.year}</div>
                <div className="timeline-title">{project.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Projects
