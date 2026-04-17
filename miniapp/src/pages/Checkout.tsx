interface CartItem {
  id: number
  name: string
  price: number
  emoji: string
  qty: number
}

interface Props {
  items: CartItem[]
  total: number
  onBack: () => void
  onOrder: () => void
}

export default function Checkout({ items, total, onBack, onOrder }: Props) {
  if (items.length === 0) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0D0D0D',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 16, padding: 24,
      }}>
        <span style={{ fontSize: 64 }}>🛒</span>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Кошик порожній</p>
        <p style={{ color: '#555', fontSize: 14 }}>Додайте товари з магазину</p>
        <button onClick={onBack} style={{
          background: '#22C55E', color: '#000',
          border: 'none', borderRadius: 50,
          padding: '14px 32px', fontWeight: 700,
          fontSize: 16, cursor: 'pointer', marginTop: 8,
        }}>
          До магазину
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 100px', background: '#0D0D0D', minHeight: '100vh' }}>
      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{
          background: '#1a1a1a', border: 'none',
          borderRadius: 10, width: 38, height: 38,
          fontSize: 18, cursor: 'pointer', color: '#fff',
        }}>←</button>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Кошик</span>
      </div>

      {/* Товари */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {items.map(item => (
          <div key={item.id} style={{
            background: '#111', borderRadius: 14,
            border: '1px solid #1f1f1f',
            padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontSize: 32 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.name}</p>
              <p style={{ color: '#555', fontSize: 12 }}>{item.qty} шт × {item.price} ₴</p>
            </div>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>
              {item.qty * item.price} ₴
            </span>
          </div>
        ))}
      </div>

      {/* Промокод */}
      <div style={{
        background: '#111', borderRadius: 14,
        border: '1px solid #1f1f1f',
        padding: '12px 16px',
        display: 'flex', gap: 10,
        marginBottom: 20,
      }}>
        <input
          placeholder="Промокод..."
          style={{
            background: 'none', border: 'none', outline: 'none',
            color: '#fff', fontSize: 14, flex: 1,
          }}
        />
        <button style={{
          background: '#22C55E', color: '#000',
          border: 'none', borderRadius: 8,
          padding: '6px 14px', fontWeight: 700,
          fontSize: 13, cursor: 'pointer',
        }}>
          Застосувати
        </button>
      </div>

      {/* Підсумок */}
      <div style={{
        background: '#111', borderRadius: 14,
        border: '1px solid #1f1f1f',
        padding: '16px', marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Товари</span>
          <span style={{ color: '#fff' }}>{total} ₴</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Доставка</span>
          <span style={{ color: '#22C55E' }}>Безкоштовно</span>
        </div>
        <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 700 }}>Разом</span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 18 }}>{total} ₴</span>
        </div>
      </div>

      {/* Кнопка */}
      <button onClick={onOrder} style={{
        background: '#22C55E', color: '#000',
        border: 'none', borderRadius: 50,
        padding: '16px 0', fontWeight: 700,
        fontSize: 18, cursor: 'pointer',
        width: '100%',
        boxShadow: '0 0 24px rgba(34,197,94,0.5)',
      }}>
        Оформити замовлення →
      </button>
    </div>
  )
}