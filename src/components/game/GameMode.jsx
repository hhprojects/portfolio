import './GameMode.css'

function GameMode({ onExit }) {
  return (
    <div className="game-mode-root" style={{background:'#0d0d0d', color:'white', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'1rem'}}>
      <p style={{fontSize:'2rem'}}>🎮 Game Mode</p>
      <p style={{color:'#888'}}>Loading...</p>
      <button onClick={onExit} style={{background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.3)', color:'white', padding:'0.5rem 1rem', borderRadius:'6px', cursor:'pointer'}}>
        Exit (ESC)
      </button>
    </div>
  )
}

export default GameMode
