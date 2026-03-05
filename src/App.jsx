import { useState, useEffect, useRef } from 'react'
import './App.css'
import LoadingScreen from './components/LoadingScreen'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Blog from './components/Blog'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import GameMode from './components/game/GameMode'

function App() {
  const [loaded, setLoaded] = useState(false)
  const [gameMode, setGameMode] = useState(false)
  const scrollPosRef = useRef(0)

  useEffect(() => {
    if (document.readyState === 'complete') {
      const t = setTimeout(() => setLoaded(true), 600)
      return () => clearTimeout(t)
    }
    const onLoad = () => setTimeout(() => setLoaded(true), 600)
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])

  const handlePlay = () => {
    scrollPosRef.current = window.scrollY
    setGameMode(true)
  }

  const handleExit = () => {
    setGameMode(false)
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollPosRef.current, behavior: 'instant' })
    })
  }

  return (
    <>
      <LoadingScreen loaded={loaded} />
      <Navbar />
      <Hero onPlay={handlePlay} />
      <About />
      <Skills />
      <Blog />
      <Projects />
      <Contact />
      <Footer />
      {gameMode && <GameMode onExit={handleExit} />}
    </>
  )
}

export default App
