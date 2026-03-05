import { useState, useRef } from 'react'
import './App.css'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Projects from './components/Projects'
import Contact from './components/Contact'
import Footer from './components/Footer'
import GameMode from './components/game/GameMode'

function App() {
  const [gameMode, setGameMode] = useState(false)
  const scrollPosRef = useRef(0)

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
      <Navbar />
      <Hero onPlay={handlePlay} />
      <About />
      <Skills />
      <Projects />
      <Contact />
      <Footer />
      {gameMode && <GameMode onExit={handleExit} />}
    </>
  )
}

export default App
