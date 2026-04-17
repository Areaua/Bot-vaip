interface Props {
  onNavigate: (page: string) => void
  cartCount: number
}

export default function Home({ onNavigate, cartCount }: Props) {
  return (
    <div style={{ padding: '16px 16px 80px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38,
            borderRadius: 10,
            border: '2px solid #22C55E',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>⚡</div>
          <div>
            <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VOLT </span>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>VAPE</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={{
            background: '#1a1a1a', border: 'none',
            borderRadius: 10, width: 38, height: 38,
            fontSize: 18, cursor: 'pointer',
          }}>🔔</button>
          <button
            onClick={() => onNavigate('cart')}
            style={{
              background: '#1a1a1a', border: 'none',
              borderRadius: 10, width: 38, height: 38,
              fontSize: 18, cursor: 'pointer',
              position: 'relative',
            }}>
            🛒
            {cartCount > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                background: '#22C55E', color: '#000',
                borderRadius: '50%', width: 18, height: 18,
                fontSize: 11, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {cartCount}
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Hero банер */}
      <div style={{
        borderRadius: 20,
        background: 'radial-gradient(ellipse at 60% 40%, #1a5c1a, #0a2a0a)',
        border: '1px solid #1f4d1f',
        padding: '28px 24px',
        marginBottom: 16,
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(34,197,94,0.15)',
          border: '1px solid rgba(34,197,94,0.3)',
          borderRadius: 20, padding: '4px 12px',
          marginBottom: 14,
        }}>
          <span style={{ fontSize: 13 }}>⚡</span>
          <span style={{ color: '#22C55E', fontSize: 13, fontWeight: 600 }}>VOLT VAPE Store</span>
        </div>

        <h1 style={{ color: '#fff', fontWeight: 800, fontSize: 22, lineHeight: 1.3, marginBottom: 10 }}>
          VOLT VAPE — твій простір смаку
        </h1>
        <p style={{ color: '#86efac', fontSize: 14, marginBottom: 20 }}>
          Преміальні вейпи та аксесуари з доставкою по Україні
        </p>

        <button
          onClick={() => onNavigate('shop')}
          style={{
            background: '#22C55E',
            color: '#000',
            fontWeight: 700,
            fontSize: 15,
            padding: '12px 24px',
            borderRadius: 50,
            border: 'none',
            cursor: 'pointer',
          }}>
          Переглянути каталог →
        </button>
      </div>

      {/* Банер колеса */}
      <div
        onClick={() => onNavigate('wheel')}
        style={{
          borderRadius: 16,
          background: 'linear-gradient(135deg, #0f0f0f, #111d11)',
          border: '1px solid #1a2e1a',
          padding: '18px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: 20,
        }}>
        <div>
          <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>🎡 Колесо призів</p>
          <p style={{ color: '#555', fontSize: 13, marginTop: 4 }}>Крути щодня — вигравай призи!</p>
        </div>
        <div style={{
          background: '#22C55E',
          color: '#000',
          fontWeight: 700,
          fontSize: 13,
          padding: '8px 16px',
          borderRadius: 50,
        }}>
          Крутити
        </div>
      </div>

      {/* Категорії */}
      <h2 style={{ color: '#fff', fontWeight: 700, fontSize: 20, marginBottom: 14 }}>
        Усі товари
      </h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['Всі', 'Pod-системи', 'Рідини', 'Аксесуари'].map((cat, i) => (
          <button
            key={cat}
            onClick={() => onNavigate(`shop:${cat}`)}
            style={{
              background: i === 0 ? '#22C55E' : '#1a1a1a',
              color: i === 0 ? '#000' : '#888',
              border: 'none', borderRadius: 50,
              padding: '8px 18px', fontSize: 14,
              fontWeight: i === 0 ? 700 : 400,
              cursor: 'pointer',
            }}>
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}