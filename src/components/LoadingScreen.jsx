import './LoadingScreen.css'

function LoadingScreen({ loaded }) {
  return (
    <div className={`loading-screen${loaded ? ' fade-out' : ''}`}>
      <div className="sprite-container">
        <div className="sprite-pixel" />
      </div>
      <p className="loading-name">HAN HUA</p>
      <div className="loading-bar-wrap">
        <div className="loading-bar" />
      </div>
    </div>
  )
}

export default LoadingScreen
