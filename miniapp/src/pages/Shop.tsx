import { useState } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CAT_LABEL: Record<string, string> = { LIQUID: 'Рідини', DISPOSABLE: 'Одноразки', ACCESSORY: 'Аксесуари' }
const CAT_EMOJI: Record<string, string> = { LIQUID: '🧪', DISPOSABLE: '💨', ACCESSORY: '🔧' }
const DISPLAY_CATS = ['Всі', 'Рідини', 'Одноразки', 'Аксесуари']
const DISPLAY_TO_API: Record<string, string> = { 'Рідини': 'LIQUID', 'Одноразки': 'DISPOSABLE', 'Аксесуари': 'ACCESSORY' }

interface Props {
  onNavigate: (page: string) => void
  cart: { [key: number]: number }
  setCart: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  initCategory?: string
  telegramId: string
  products: any[]
}

export default function Shop({ onNavigate, cart, setCart, initCategory = 'Всі', telegramId, products }: Props) {
  const [category, setCategory] = useState(initCategory)
  const [search, setSearch] = useState('')
  const [promo, setPromo] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [discount, setDiscount] = useState(0)

  const addToCart = (id: number) => setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  const removeFromCart = (id: number) => setCart(prev => {
    const next = { ...prev }
    if (next[id] > 1) next[id]--
    else delete next[id]
    return next
  })

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = products.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0)

  const checkPromo = async () => {
    try {
      const r = await axios.post(`${API_URL}/promo/check`, { code: promo, telegramId })
      setDiscount(r.data.discount)
      setPromoStatus('ok')
    } catch {
      setPromoStatus('error')
    }
  }

  const filtered = products.filter(p => {
    const matchCat = category === 'Всі' || p.category === DISPLAY_TO_API[category]
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch && p.inStock !== false
  })

  return (
    <div style={{ padding: '16px 16px 140px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button className="btn" onClick={() => onNavigate('home')} style={{ background: '#1a1a1a', border: 'none', borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: 'pointer', color: '#fff' }}>←</button>
        <div className="logo-icon" style={{ width: 32, height: 32, borderRadius: 8, border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 18 }}>Магазин</span>
        </div>
        {cartCount > 0 && (
          <button className="btn" onClick={() => onNavigate('cart')} style={{ marginLeft: 'auto', background: '#22C55E', color: '#000', border: 'none', borderRadius: 20, padding: '4px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            🛒 {cartCount}
          </button>
        )}
      </div>

      {/* Пошук */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1a1a1a', borderRadius: 14, padding: '10px 16px', marginBottom: 16, border: '1px solid #2a2a2a' }}>
        <span style={{ color: '#555', fontSize: 16 }}>🔍</span>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Пошук товарів..." style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15, width: '100%' }} />
      </div>

      {/* Промокод */}
      <div style={{ background: '#1a1a1a', borderRadius: 14, border: `1px solid ${promoStatus === 'ok' ? '#22C55E' : promoStatus === 'error' ? '#ef4444' : '#2a2a2a'}`, padding: '10px 16px', display: 'flex', gap: 10, marginBottom: promoStatus === 'idle' ? 16 : 8 }}>
        <input value={promo} onChange={e => { setPromo(e.target.value); setPromoStatus('idle') }} placeholder="Промокод..." style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 14, flex: 1 }} />
        <button className="btn" onClick={checkPromo} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>Застосувати</button>
      </div>
      {promoStatus === 'ok'    && <p style={{ color: '#22C55E', fontSize: 13, marginBottom: 12 }}>✅ Промокод застосовано! Знижка {discount}%</p>}
      {promoStatus === 'error' && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>❌ Невірний або використаний промокод</p>}

      {/* Категорії */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {DISPLAY_CATS.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className="btn" style={{ background: category === cat ? '#22C55E' : '#1a1a1a', color: category === cat ? '#000' : '#888', border: 'none', borderRadius: 50, padding: '8px 18px', fontSize: 14, fontWeight: category === cat ? 700 : 400, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Товари */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(product => (
          <div key={product.id} style={{ background: '#111', borderRadius: 16, border: cart[product.id] ? '1px solid #22C55E' : '1px solid #1f1f1f', overflow: 'hidden', transition: 'border-color 0.2s' }}>
            <div style={{ background: 'linear-gradient(135deg, #0a2a0a, #111d11)', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {product.imageUrl
                ? <img src={`${API_URL}${product.imageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span style={{ fontSize: 48 }}>{CAT_EMOJI[product.category] ?? '📦'}</span>
              }
              {cart[product.id] > 0 && (
                <div style={{ position: 'absolute', top: 8, left: 8, background: '#22C55E', color: '#000', fontSize: 11, fontWeight: 700, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cart[product.id]}
                </div>
              )}
            </div>
            <div style={{ padding: '10px 12px' }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{product.name}</p>
              <p style={{ color: '#555', fontSize: 11, marginBottom: 10 }}>{CAT_LABEL[product.category] ?? product.category}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>{product.price} ₴</span>
                {cart[product.id] > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button onClick={() => removeFromCart(product.id)} className="btn" style={{ background: '#1f1f1f', border: 'none', borderRadius: 8, width: 26, height: 26, fontSize: 16, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{cart[product.id]}</span>
                    <button onClick={() => addToCart(product.id)} className="btn" style={{ background: '#22C55E', border: 'none', borderRadius: 8, width: 26, height: 26, fontSize: 16, cursor: 'pointer', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(product.id)} style={{ background: '#22C55E', border: 'none', borderRadius: 8, width: 28, height: 28, fontSize: 18, cursor: 'pointer', color: '#000', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Корзина */}
      {cartCount > 0 && (
        <div style={{ position: 'fixed', bottom: 70, left: 16, right: 16, background: '#22C55E', borderRadius: 16, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 99, boxShadow: '0 0 30px rgba(34,197,94,0.5)' }}>
          <div>
            <p style={{ color: '#000', fontWeight: 700, fontSize: 15 }}>🛒 {cartCount} товар{cartCount > 1 ? 'и' : ''}</p>
            <p style={{ color: '#065f46', fontSize: 12 }}>Разом: {cartTotal} ₴</p>
          </div>
          <button className="btn" onClick={() => onNavigate('checkout')} style={{ background: '#000', color: '#22C55E', border: 'none', borderRadius: 12, padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            Замовити →
          </button>
        </div>
      )}
    </div>
  )
}
