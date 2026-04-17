import { useState } from 'react'

const CATEGORIES = ['Всі', 'Pod-системи', 'Рідини', 'Аксесуари']

const PRODUCTS = [
  { id: 1, name: 'LOST MARY 4000',   category: 'Pod-системи', price: 380, emoji: '💨', badge: 'Хіт' },
  { id: 2, name: 'Elf Bar 1500',     category: 'Pod-системи', price: 280, emoji: '⚡', badge: null },
  { id: 3, name: 'Chaser Salt 30мл', category: 'Рідини',      price: 180, emoji: '🧪', badge: 'Новинка' },
  { id: 4, name: 'Fruit Mix 60мл',   category: 'Рідини',      price: 220, emoji: '🍓', badge: null },
  { id: 5, name: 'Coil для Pod',     category: 'Аксесуари',   price: 120, emoji: '🔧', badge: null },
  { id: 6, name: 'Кабель USB-C',     category: 'Аксесуари',   price: 80,  emoji: '🔌', badge: null },
]

interface Props {
  onNavigate: (page: string) => void
  cart: { [key: number]: number }
  setCart: React.Dispatch<React.SetStateAction<{ [key: number]: number }>>
  initCategory?: string
}

export default function Shop({ onNavigate, cart, setCart, initCategory = 'Всі' }: Props) {
  const [category, setCategory] = useState(initCategory)
  const [search, setSearch] = useState('')
  const [promo, setPromo] = useState('')
  const [promoStatus, setPromoStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [discount, setDiscount] = useState(0)

  const addToCart = (id: number) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }))
  }

  const removeFromCart = (id: number) => {
    setCart(prev => {
      const next = { ...prev }
      if (next[id] > 1) next[id]--
      else delete next[id]
      return next
    })
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0)
  const cartTotal = PRODUCTS.reduce((sum, p) => sum + (cart[p.id] || 0) * p.price, 0)

  const checkPromo = async () => {
    try {
      const res = await fetch('http://localhost:3000/promo/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promo, telegramId: '123456789' }),
      })
      const data = await res.json()
      if (res.ok) {
        setDiscount(data.discount)
        setPromoStatus('ok')
      } else {
        setPromoStatus('error')
      }
    } catch {
      setPromoStatus('error')
    }
  }

  const filtered = PRODUCTS.filter(p => {
    const matchCat = category === 'Всі' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '16px 16px 140px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: '#1a1a1a', border: 'none',
            borderRadius: 10, width: 38, height: 38,
            fontSize: 18, cursor: 'pointer', color: '#fff',
          }}>
          ←
        </button>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 18 }}>Магазин</span>
        </div>
        {cartCount > 0 && (
          <div
            onClick={() => onNavigate('cart')}
            style={{
              marginLeft: 'auto',
              background: '#22C55E', color: '#000',
              borderRadius: 20, padding: '4px 12px',
              fontWeight: 700, fontSize: 13, cursor: 'pointer',
            }}>
            🛒 {cartCount}
          </div>
        )}
      </div>

      {/* Пошук */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#1a1a1a', borderRadius: 14,
        padding: '10px 16px', marginBottom: 16,
        border: '1px solid #2a2a2a',
      }}>
        <span style={{ color: '#555', fontSize: 16 }}>🔍</span>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Пошук товарів..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: 15, width: '100%',
          }}
        />
      </div>

      {/* Промокод */}
      <div style={{
        background: '#1a1a1a', borderRadius: 14,
        border: `1px solid ${promoStatus === 'ok' ? '#22C55E' : promoStatus === 'error' ? '#ef4444' : '#2a2a2a'}`,
        padding: '10px 16px', display: 'flex', gap: 10,
        marginBottom: promoStatus === 'idle' ? 16 : 8,
      }}>
        <input
          value={promo}
          onChange={e => { setPromo(e.target.value); setPromoStatus('idle') }}
          placeholder="Промокод..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14, flex: 1,
          }}
        />
        <button onClick={checkPromo} style={{
          background: '#22C55E', color: '#000',
          border: 'none', borderRadius: 8,
          padding: '6px 14px', fontWeight: 700,
          fontSize: 13, cursor: 'pointer',
        }}>
          Застосувати
        </button>
      </div>
      {promoStatus === 'ok' && (
        <p style={{ color: '#22C55E', fontSize: 13, marginBottom: 12 }}>
          ✅ Промокод застосовано! Знижка {discount}%
        </p>
      )}
      {promoStatus === 'error' && (
        <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 12 }}>
          ❌ Невірний або використаний промокод
        </p>
      )}

      {/* Категорії */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              background: category === cat ? '#22C55E' : '#1a1a1a',
              color: category === cat ? '#000' : '#888',
              border: 'none', borderRadius: 50,
              padding: '8px 18px', fontSize: 14,
              fontWeight: category === cat ? 700 : 400,
              cursor: 'pointer', whiteSpace: 'nowrap',
              transition: 'all 0.2s',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Товари */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {filtered.map(product => (
          <div key={product.id} style={{
            background: '#111', borderRadius: 16,
            border: cart[product.id] ? '1px solid #22C55E' : '1px solid #1f1f1f',
            overflow: 'hidden', transition: 'border-color 0.2s',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #0a2a0a, #111d11)',
              height: 120,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48, position: 'relative',
            }}>
              {product.emoji}
              {product.badge && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: product.badge === 'Хіт' ? '#22C55E' : '#3B82F6',
                  color: '#000', fontSize: 10, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 50,
                }}>
                  {product.badge}
                </div>
              )}
              {cart[product.id] > 0 && (
                <div style={{
                  position: 'absolute', top: 8, left: 8,
                  background: '#22C55E', color: '#000',
                  fontSize: 11, fontWeight: 700,
                  width: 22, height: 22, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {cart[product.id]}
                </div>
              )}
            </div>

            <div style={{ padding: '10px 12px' }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
                {product.name}
              </p>
              <p style={{ color: '#555', fontSize: 11, marginBottom: 10 }}>
                {product.category}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>
                  {product.price} ₴
                </span>
                {cart[product.id] > 0 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      style={{
                        background: '#1f1f1f', border: 'none', borderRadius: 8,
                        width: 26, height: 26, fontSize: 16,
                        cursor: 'pointer', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>−</button>
                    <span style={{ color: '#fff', fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: 'center' }}>
                      {cart[product.id]}
                    </span>
                    <button
                      onClick={() => addToCart(product.id)}
                      style={{
                        background: '#22C55E', border: 'none', borderRadius: 8,
                        width: 26, height: 26, fontSize: 16,
                        cursor: 'pointer', color: '#000', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>+</button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(product.id)}
                    style={{
                      background: '#22C55E', border: 'none', borderRadius: 8,
                      width: 28, height: 28, fontSize: 18,
                      cursor: 'pointer', color: '#000', fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Корзина */}
      {cartCount > 0 && (
        <div style={{
          position: 'fixed', bottom: 70, left: 16, right: 16,
          background: '#22C55E', borderRadius: 16,
          padding: '14px 20px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          zIndex: 99, boxShadow: '0 0 30px rgba(34,197,94,0.5)',
        }}>
          <div>
            <p style={{ color: '#000', fontWeight: 700, fontSize: 15 }}>
              🛒 {cartCount} товар{cartCount > 1 ? 'и' : ''}
            </p>
            <p style={{ color: '#065f46', fontSize: 12 }}>Разом: {cartTotal} ₴</p>
          </div>
          <button
            onClick={() => onNavigate('checkout')}
            style={{
              background: '#000', color: '#22C55E',
              border: 'none', borderRadius: 12,
              padding: '10px 20px', fontWeight: 700,
              fontSize: 14, cursor: 'pointer',
            }}>
            Замовити →
          </button>
        </div>
      )}
    </div>
  )
}