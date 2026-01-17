import { Canvas } from '@react-three/fiber'
import { OrbitControls, Box } from '@react-three/drei'
import { useRef } from 'react'
import './App.css'

function RotatingBox() {
  const meshRef = useRef()

  return (
    <Box ref={meshRef} args={[2, 2, 2]}>
      <meshStandardMaterial color="hotpink" />
    </Box>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RotatingBox />
        <OrbitControls />
      </Canvas>
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white' }}>
        <h1>Portfolio</h1>
        <p>React + ThreeJS + GitHub Pages</p>
      </div>
    </div>
  )
}

export default App
