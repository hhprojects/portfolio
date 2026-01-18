import { useState, useEffect, useRef } from 'react'
import './Skills.css'

function Skills() {
  const [selectedCategory, setSelectedCategory] = useState('frontend')
  const sectionRef = useRef(null)

  const skillCategories = [
    {
      id: 'frontend',
      title: 'Frontend',
      icon: '🎨',
      color: '#667eea',
      skills: [
        { name: 'React', level: 80 },
        { name: 'JavaScript/TypeScript', level: 85 },
        { name: 'HTML/CSS', level: 95 },
        { name: 'Tailwind CSS', level: 70 },
        { name: 'Next.js', level: 65 },
      ],
    },
    {
      id: 'backend',
      title: 'Backend',
      icon: '⚙️',
      color: '#52c41a',
      skills: [
        { name: 'Node.js', level: 90 },
        { name: 'FastAPI', level: 70 },
        { name: 'Python (Django/Flask)', level: 85 },
        { name: 'RESTful APIs', level: 90 },
        { name: 'ASP.NET Core', level: 80 },
      ],
    },
    {
      id: 'database',
      title: 'Database',
      icon: '🗄️',
      color: '#faad14',
      skills: [
        { name: 'PostgreSQL', level: 70 },
        { name: 'MySQL', level: 85 },
        { name: 'Redis', level: 60 },
        { name: 'Firebase/Firestore', level: 90 },
      ],
    },
    {
      id: 'devops',
      title: 'DevOps',
      icon: '🚀',
      color: '#f5222d',
      skills: [
        { name: 'Docker', level: 60 },
        { name: 'Git/GitHub', level: 70 },
        { name: 'CI/CD', level: 35 },
        { name: 'AWS', level: 40 },
        { name: 'Linux', level: 60 },
      ],
    },
    {
      id: 'mobile',
      title: 'Mobile',
      icon: '📱',
      color: '#722ed1',
      skills: [
        { name: 'React Native', level: 75 },
        { name: 'Flutter', level: 90 },
        { name: 'iOS Development', level: 0 },
        { name: 'Android Development', level: 80 },
      ],
    },
    {
      id: 'tools',
      title: 'Tools & Other',
      icon: '🛠️',
      color: '#13c2c2',
      skills: [
        { name: 'VS Code', level: 95 },
        { name: 'Figma', level: 70 },
        { name: 'Postman', level: 85 },
        { name: 'Blender', level: 20 },
      ],
    },
  ]

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId)
  }

  const currentCategory = skillCategories.find((cat) => cat.id === selectedCategory)

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
    <section id="skills" className="skills" ref={sectionRef}>
      <div className="skills-container">
        <div className="skills-header">
          <span className="section-number">02</span>
          <h2 className="skills-heading">Skills & Expertise</h2>
        </div>
        <p className="skills-subtitle">
          Technologies and tools I work with to bring ideas to life
        </p>

        <div className="skills-layout">
          {/* Category list */}
          <div className="categories-list">
            {skillCategories.map((category) => (
              <div
                key={category.id}
                className={`category-card ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  {category.icon}
                </div>
                <h3 className="category-title">{category.title}</h3>
              </div>
            ))}
          </div>

          {/* Selected category details */}
          <div className="category-details">
            <div className="details-header">
              <div className="details-icon" style={{ backgroundColor: currentCategory.color }}>
                {currentCategory.icon}
              </div>
              <h3 className="details-title">{currentCategory.title}</h3>
            </div>
            <div className="skills-list">
              {currentCategory.skills.map((skill, index) => (
                <div key={index} className="skill-item">
                  <div className="skill-info">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-percentage">{skill.level}%</span>
                  </div>
                  <div className="skill-bar">
                    <div
                      className="skill-bar-fill"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: currentCategory.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Skills
