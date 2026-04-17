import { useState } from 'react'
import Home from './pages/Home'
import WheelGame from './components/WheelGame'
import BottomNav from './components/BottomNav'

function App() {
  const [page, setPage] = useState('home')

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      {page === 'home'  && <Home onNavigate={setPage} />}
      {page === 'wheel' && <WheelGame />}
      {page === 'shop'  && <div style={{ padding: 20, color: '#fff' }}>Shop — coming soon</div>}
      {page === 'profile' && <div style={{ padding: 20, color: '#fff' }}>Profile — coming soon</div>}
      <BottomNav active={page} onChange={setPage} />
    </div>
  )
}

export default App