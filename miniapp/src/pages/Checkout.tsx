import { useState } from 'react'

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
  onOrder: (bonusPoints: number) => void
  bonusBalance: number
}

export default function Checkout({ items, total, onBack, onOrder, bonusBalance }: Props) {
  const [useBonus, setUseBonus] = useState(false)

  const maxBonus = Math.min(bonusBalance, Math.floor(total * 0.5))
  const bonusDiscount = useBonus ? maxBonus : 0
  const finalTotal = total - bonusDiscount
  const willEarn = Math.floor(finalTotal / 10)

  if (items.length === 0) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <span style={{ fontSize: 64 }}>🛒</span>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>Кошик порожній</p>
        <p style={{ color: '#555', fontSize: 14 }}>Додайте товари з магазину</p>
        <button className="btn" onClick={onBack} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 50, padding: '14px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', marginTop: 8 }}>
          До магазину →
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 100px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button className="btn" onClick={onBack} style={{ background: '#1a1a1a', border: 'none', borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: 'pointer', color: '#fff' }}>←</button>
        <div className="logo-icon" style={{ width: 32, height: 32, borderRadius: 8, border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>Кошик</span>
        </div>
      </div>

      {/* Товари */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 32 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{item.name}</p>
              <p style={{ color: '#555', fontSize: 12 }}>{item.qty} шт × {item.price} ₴</p>
            </div>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>{item.qty * item.price} ₴</span>
          </div>
        ))}
      </div>

      {/* Бонусні бали */}
      {bonusBalance > 0 && (
        <div
          onClick={() => setUseBonus(v => !v)}
          style={{ background: useBonus ? '#0a2a0a' : '#111', borderRadius: 14, border: `1px solid ${useBonus ? '#22C55E' : '#1f1f1f'}`, padding: '14px 16px', marginBottom: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>⭐ Бонусні бали</p>
            <p style={{ color: '#555', fontSize: 12, marginTop: 2 }}>
              У вас {bonusBalance} балів · -{maxBonus} ₴ знижка
            </p>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${useBonus ? '#22C55E' : '#333'}`, background: useBonus ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {useBonus && <span style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>✓</span>}
          </div>
        </div>
      )}

      {/* Підсумок */}
      <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Товари</span>
          <span style={{ color: '#fff' }}>{total} ₴</span>
        </div>
        {bonusDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ color: '#86efac' }}>⭐ Бонуси</span>
            <span style={{ color: '#22C55E' }}>-{bonusDiscount} ₴</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ color: '#888' }}>Доставка</span>
          <span style={{ color: '#22C55E' }}>Безкоштовно</span>
        </div>
        <div style={{ borderTop: '1px solid #1f1f1f', paddingTop: 10, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#fff', fontWeight: 700 }}>Разом</span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 18 }}>{finalTotal} ₴</span>
        </div>
        {willEarn > 0 && (
          <div style={{ marginTop: 10, background: '#0a1a0a', borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 14 }}>⭐</span>
            <span style={{ color: '#86efac', fontSize: 13 }}>Нарахується <b style={{ color: '#22C55E' }}>+{willEarn} балів</b> за це замовлення</span>
          </div>
        )}
      </div>

      {/* Оформити */}
      <button className="btn" onClick={() => onOrder(bonusDiscount)} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 50, padding: '16px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%', boxShadow: '0 0 24px rgba(34,197,94,0.5)' }}>
        Оформити замовлення →
      </button>

      {bonusDiscount === 0 && bonusBalance > 0 && (
        <p style={{ color: '#555', fontSize: 12, textAlign: 'center', marginTop: 10 }}>
          Натисніть на блок вище, щоб застосувати {bonusBalance} балів
        </p>
      )}
    </div>
  )
}
