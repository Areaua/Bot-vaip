import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import Home from './pages/Home'
import Shop from './pages/Shop'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import WheelGame from './components/WheelGame'
import BottomNav from './components/BottomNav'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CAT_EMOJI: Record<string, string> = { LIQUID: '🧪', DISPOSABLE: '💨', ACCESSORY: '🔧' }

function getTelegramId(): string {
  const tg = (window as any).Telegram?.WebApp
  const userId = tg?.initDataUnsafe?.user?.id
  return userId ? String(userId) : '123456789'
}

function MainApp() {
  const [page, setPage] = useState('home')
  const [telegramId] = useState<string>(getTelegramId)

  // Корзина прив'язана до telegramId — різні акаунти на одному пристрої не перетинаються
  const cartKey = `volt_cart_${telegramId}`
  const [cart, setCart] = useState<{ [key: number]: number }>(() => {
    try { return JSON.parse(localStorage.getItem(cartKey) || '{}') } catch { return {} }
  })
  const [initCategory, setInitCategory] = useState('Всі')
  const [products, setProducts] = useState<any[]>([])
  const [bonusBalance, setBonusBalance] = useState(0)

  useEffect(() => { localStorage.setItem(cartKey, JSON.stringify(cart)) }, [cart, cartKey])

  const fetchBalance = useCallback(() => {
    axios.post(`${API_URL}/users/daily-bonus`, { telegramId })
      .then(r => { if (r.data?.bonusBalance !== undefined) setBonusBalance(r.data.bonusBalance) })
      .catch(() => {})
  }, [telegramId])

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) tg.expand()

    const startParam: string | undefined = tg?.initDataUnsafe?.start_param
    const referralCode = startParam?.startsWith('ref_') ? startParam.slice(4) : undefined

    axios.post(`${API_URL}/users/register`, {
      telegramId,
      username: tg?.initDataUnsafe?.user?.username,
      firstName: tg?.initDataUnsafe?.user?.first_name,
      referralCode,
    }).then(r => {
      if (r.data?.bonusBalance !== undefined) setBonusBalance(r.data.bonusBalance)
    }).catch(() => {})

    fetchBalance()
    axios.get(`${API_URL}/products`).then(r => setProducts(r.data)).catch(() => {})
  }, [telegramId, fetchBalance])

  // Оновлюємо баланс коли виходимо з колеса або профілю
  useEffect(() => {
    if (page === 'shop' || page === 'home') {
      axios.get(`${API_URL}/users/balance`, { params: { telegramId } })
        .then(r => { if (r.data?.bonusBalance !== undefined) setBonusBalance(r.data.bonusBalance) })
        .catch(() => {})
    }
  }, [page, telegramId])

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0)
  const cartItems = products
    .filter(p => cart[p.id] > 0)
    .map(p => ({ ...p, qty: cart[p.id], emoji: CAT_EMOJI[p.category] ?? '📦' }))

  const handleNavigate = (target: string) => {
    if (target.startsWith('shop:')) {
      setInitCategory(target.replace('shop:', ''))
      setPage('shop')
    } else {
      setPage(target)
    }
  }

  const handleOrder = (bonusPoints: number, delivery: { customerName: string; phone: string; deliveryMethod: string; deliveryAddress: string; comment: string }) => {
    const items = cartItems.map(i => ({ productId: i.id, quantity: i.qty }))
    axios.post(`${API_URL}/orders`, { telegramId, items, bonusPoints, delivery })
      .then(() => { fetchBalance() })
      .catch(() => {})
    setCart({})
    localStorage.removeItem(cartKey)
    setPage('home')
    alert('Замовлення оформлено! Менеджер звяжеться з вами.')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D' }}>
      {page === 'home'     && <Home onNavigate={handleNavigate} cartCount={cartCount} />}
      {page === 'wheel'    && <WheelGame telegramId={telegramId} onDone={() => { fetchBalance(); setPage('home') }} />}
      {page === 'shop'     && <Shop onNavigate={handleNavigate} cart={cart} setCart={setCart} initCategory={initCategory} telegramId={telegramId} products={products} />}
      {page === 'checkout' && <Checkout items={cartItems} total={cartTotal} onBack={() => setPage('shop')} onOrder={handleOrder} bonusBalance={bonusBalance} />}
      {page === 'cart'     && <Checkout items={cartItems} total={cartTotal} onBack={() => setPage('shop')} onOrder={handleOrder} bonusBalance={bonusBalance} />}
      {page === 'profile'  && <Profile telegramId={telegramId} onNavigate={handleNavigate} />}
      <BottomNav active={page} onChange={handleNavigate} />
    </div>
  )
}

function App() {
  const isAdmin = new URLSearchParams(window.location.search).has('admin')
  return isAdmin ? <Admin /> : <MainApp />
}

export default App
