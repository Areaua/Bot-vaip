import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CAT_NAV: Record<string, string> = {
  LIQUID: 'Рідини',
  DISPOSABLE: 'Одноразки',
  ACCESSORY: 'Аксесуари',
}

interface Product {
  id: number
  name: string
  price: number
  emoji: string
  badge: string
  category: string
  imageUrl?: string
}

interface Props {
  onNavigate: (page: string) => void
  cartCount: number
}

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const imgSrc = product.imageUrl
    ? (product.imageUrl.startsWith('data:') ? product.imageUrl : `${API_URL}${product.imageUrl}`)
    : null
  return (
    <div onClick={onClick} className="btn" style={{ minWidth: 130, background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', overflow: 'hidden', cursor: 'pointer' }}>
      <div style={{ background: 'linear-gradient(135deg, #0a2a0a, #111d11)', height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, position: 'relative', overflow: 'hidden' }}>
        {imgSrc
          ? <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{product.emoji}</span>
        }
        <div style={{ position: 'absolute', top: 6, right: 6, background: product.badge === 'Хіт' ? '#22C55E' : '#3B82F6', color: '#000', fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 50 }}>
          {product.badge}
        </div>
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{ color: '#fff', fontWeight: 600, fontSize: 12, marginBottom: 4, lineHeight: 1.3 }}>{product.name}</p>
        <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 14 }}>{product.price} ₴</p>
      </div>
    </div>
  )
}

export default function Home({ onNavigate, cartCount }: Props) {
  const [hits, setHits] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])

  useEffect(() => {
    axios.get(`${API_URL}/products/featured`)
      .then(r => {
        setHits(r.data.hits ?? [])
        setNewArrivals(r.data.newArrivals ?? [])
      })
      .catch(() => {})
  }, [])

  return (
    <div style={{ padding: '16px 16px 90px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="logo-icon" style={{ width: 38, height: 38, borderRadius: 10, border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
          <div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VOLT </span>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>VAPE</span>
          </div>
        </div>
        <button className="btn" onClick={() => onNavigate('cart')} style={{ background: '#1a1a1a', border: 'none', borderRadius: 10, width: 38, height: 38, fontSize: 18, position: 'relative' }}>
          🛒
          {cartCount > 0 && (
            <div style={{ position: 'absolute', top: -4, right: -4, background: '#22C55E', color: '#000', borderRadius: '50%', width: 18, height: 18, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {cartCount}
            </div>
          )}
        </button>
      </div>

      {/* Hero */}
      <div style={{ borderRadius: 20, background: 'radial-gradient(ellipse at 60% 40%, #1a5c1a, #0a2a0a)', border: '1px solid #1f4d1f', padding: '28px 24px', marginBottom: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>VOLT VAPE Store</span>
        </div>
        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, lineHeight: 1.3, marginBottom: 10 }}>
          VOLT VAPE — твій простір смаку
        </h1>
        <p style={{ color: '#86efac', fontSize: 14, marginBottom: 20 }}>
          Преміальні вейпи та аксесуари з доставкою по Україні
        </p>
        <button className="btn" onClick={() => onNavigate('shop')} style={{ background: '#22C55E', color: '#000', fontWeight: 700, fontSize: 15, padding: '12px 24px', borderRadius: 50, border: 'none' }}>
          Переглянути каталог →
        </button>
      </div>

      {/* Банер колеса */}
      <div className="btn" onClick={() => onNavigate('wheel')} style={{ borderRadius: 16, background: 'linear-gradient(135deg, #0f0f0f, #111d11)', border: '1px solid #1a2e1a', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>🎡 Колесо призів</p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Крути щодня — вигравай призи!</p>
        </div>
        <div style={{ background: '#22C55E', color: '#000', fontWeight: 700, fontSize: 13, padding: '8px 16px', borderRadius: 50 }}>Крутити</div>
      </div>

      {/* Хіт продажів */}
      {hits.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>🔥 Хіт продажів</h2>
            <button className="btn" onClick={() => onNavigate('shop')} style={{ background: 'none', border: 'none', color: '#22C55E', fontSize: 13, fontWeight: 600 }}>Всі →</button>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 12, paddingBottom: 4 }}>
            {hits.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => onNavigate(`shop:${CAT_NAV[p.category] ?? 'Всі'}`)} />
            ))}
          </div>
        </div>
      )}

      {/* Новинки */}
      {newArrivals.length > 0 && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>✨ Новинки</h2>
            <button className="btn" onClick={() => onNavigate('shop')} style={{ background: 'none', border: 'none', color: '#3B82F6', fontSize: 13, fontWeight: 600 }}>Всі →</button>
          </div>
          <div className="scroll-x" style={{ display: 'flex', gap: 12, paddingBottom: 4 }}>
            {newArrivals.map(p => (
              <ProductCard key={p.id} product={p} onClick={() => onNavigate(`shop:${CAT_NAV[p.category] ?? 'Всі'}`)} />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
