import { useState, useEffect, useRef } from 'react'
import './Projects.css'
import portfolioImage from '../assets/portfolio.jpg'

function Projects() {
  const [currentProject, setCurrentProject] = useState(null)
  const sectionRef = useRef(null)

  const projects = [
    {
      id: 1,
      title: 'Portfolio Website',
      year: '2026',
      description: 'Personal portfolio website showcasing projects and skills. Features smooth animations, responsive design, and dark mode.',
      tech: ['React', 'CSS'],
      image: portfolioImage,
      link: 'https://github.com/hhprojects/portfolio',
      demo: 'https://demo.com',
    },
  ]

  useEffect(() => {
    if (projects.length > 0) {
      setCurrentProject(projects[0])
    }
  }, [])

  const handleProjectHover = (project) => {
    setCurrentProject(project)
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
              <div className="preview-image">
                <img src={currentProject.image} alt={currentProject.title} />
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
                  <a href={currentProject.demo} target="_blank" rel="noopener noreferrer" className="preview-link primary">
                    Live Demo
                  </a>
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
              onMouseEnter={() => handleProjectHover(project)}
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
