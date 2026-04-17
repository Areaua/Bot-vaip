import { useState } from 'react'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Checkout from './pages/Checkout'
import WheelGame from './components/WheelGame'
import BottomNav from './components/BottomNav'

const PRODUCTS = [
  { id: 1, name: 'LOST MARY 4000',   price: 380, emoji: '💨' },
  { id: 2, name: 'Elf Bar 1500',     price: 280, emoji: '⚡' },
  { id: 3, name: 'Chaser Salt 30мл', price: 180, emoji: '🧪' },
  { id: 4, name: 'Fruit Mix 60мл',   price: 220, emoji: '🍓' },
  { id: 5, name: 'Coil для Pod',     price: 120, emoji: '🔧' },
  { id: 6, name: 'Кабель USB-C',     price: 80,  emoji: '🔌' },
]

function App() {
  const [page, setPage] = useState('home')
  const [cart, setCart] = useState<{ [key: number]: number }>({})
  const [initCategory, setInitCategory] = useState('Всі')

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = PRODUCTS.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0)
  const cartItems = PRODUCTS
    .filter(p => cart[p.id] > 0)
    .map(p => ({ ...p, qty: cart[p.id] }))

  const handleNavigate = (target: string) => {
    if (target.startsWith('shop:')) {
      setInitCategory(target.replace('shop:', ''))
      setPage('shop')
    } else {
      setPage(target)
    }
  }

  const handleOrder = () => {
    setCart({})
    setPage('home')
    alert('Замовлення оформлено! Менеджер звяжеться з вами.')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      {page === 'home'     && <Home onNavigate={handleNavigate} cartCount={cartCount} />}
      {page === 'wheel'    && <WheelGame />}
      {page === 'shop'     && <Shop onNavigate={handleNavigate} cart={cart} setCart={setCart} initCategory={initCategory} />}
      {page === 'checkout' && <Checkout items={cartItems} total={cartTotal} onBack={() => setPage('shop')} onOrder={handleOrder} />}
      {page === 'cart'     && <Checkout items={cartItems} total={cartTotal} onBack={() => setPage('home')} onOrder={handleOrder} />}
      {page === 'profile'  && <div style={{ padding: 20, color: '#fff' }}>Profile — coming soon</div>}
      <BottomNav active={page} onChange={handleNavigate} />
    </div>
  )
}

export default App