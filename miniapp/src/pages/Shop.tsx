import { useState } from 'react'

const CATEGORIES = ['Всі', 'Pod-системи', 'Рідини', 'Аксесуари']

const PRODUCTS = [
  { id: 1, name: 'LOST MARY 4000', category: 'Pod-системи', price: 380, emoji: '💨', badge: 'Хіт' },
  { id: 2, name: 'Elf Bar 1500', category: 'Pod-системи', price: 280, emoji: '⚡', badge: null },
  { id: 3, name: 'Chaser Salt 30мл', category: 'Рідини', price: 180, emoji: '🧪', badge: 'Новинка' },
  { id: 4, name: 'Fruit Mix 60мл', category: 'Рідини', price: 220, emoji: '🍓', badge: null },
  { id: 5, name: 'Coil для Pod', category: 'Аксесуари', price: 120, emoji: '🔧', badge: null },
  { id: 6, name: 'Кабель USB-C', category: 'Аксесуари', price: 80, emoji: '🔌', badge: null },
]

interface Props {
  onNavigate: (page: string) => void
}

export default function Shop({ onNavigate }: Props) {
  const [category, setCategory] = useState('Всі')
  const [search, setSearch] = useState('')

  const filtered = PRODUCTS.filter(p => {
    const matchCat = category === 'Всі' || p.category === category
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '16px 16px 80px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <button
          onClick={() => onNavigate('home')}
          style={{ background: '#1a1a1a', border: 'none', borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: 'pointer' }}>
          ←
        </button>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 18 }}>Магазин</span>
        </div>
      </div>

      {/* Пошук */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#1a1a1a',
        borderRadius: 14, padding: '10px 16px',
        marginBottom: 16,
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
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
      }}>
        {filtered.map(product => (
          <div key={product.id} style={{
            background: '#111',
            borderRadius: 16,
            border: '1px solid #1f1f1f',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}>
            {/* Картинка */}
            <div style={{
              background: 'linear-gradient(135deg, #0a2a0a, #111d11)',
              height: 120,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 48,
              position: 'relative',
            }}>
              {product.emoji}
              {product.badge && (
                <div style={{
                  position: 'absolute', top: 8, right: 8,
                  background: product.badge === 'Хіт' ? '#22C55E' : '#3B82F6',
                  color: '#000',
                  fontSize: 10, fontWeight: 700,
                  padding: '3px 8px', borderRadius: 50,
                }}>
                  {product.badge}
                </div>
              )}
            </div>

            {/* Інфо */}
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
                <button style={{
                  background: '#22C55E',
                  border: 'none', borderRadius: 8,
                  width: 28, height: 28,
                  fontSize: 16, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}