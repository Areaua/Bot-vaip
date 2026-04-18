import { useState } from 'react'

interface CartItem {
  id: number
  name: string
  price: number
  emoji: string
  qty: number
}

export interface DeliveryInfo {
  customerName: string
  phone: string
  deliveryMethod: string
  deliveryAddress: string
  comment: string
}

interface Props {
  items: CartItem[]
  total: number
  onBack: () => void
  onOrder: (bonusPoints: number, delivery: DeliveryInfo) => void
  bonusBalance: number
}

const DELIVERY_METHODS = [
  { id: 'NOVA_POSHTA', label: '🚀 Нова Пошта' },
  { id: 'UKRPOSHTA',   label: '📮 Укрпошта' },
  { id: 'COURIER',     label: '🛵 Кур\'єр' },
  { id: 'PICKUP',      label: '🏪 Самовивіз' },
]

const inp: React.CSSProperties = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
  borderRadius: 10, padding: '11px 14px', color: '#fff', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
}

export default function Checkout({ items, total, onBack, onOrder, bonusBalance }: Props) {
  const [useBonus, setUseBonus] = useState(false)
  const [delivery, setDelivery] = useState<DeliveryInfo>({
    customerName: '', phone: '', deliveryMethod: 'NOVA_POSHTA',
    deliveryAddress: '', comment: '',
  })
  const [errors, setErrors] = useState<Partial<DeliveryInfo>>({})

  const set = (field: keyof DeliveryInfo, value: string) => {
    setDelivery(d => ({ ...d, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  const maxBonus  = Math.min(bonusBalance, Math.floor(total * 0.5))
  const bonusDiscount = useBonus ? maxBonus : 0
  const finalTotal = total - bonusDiscount
  const willEarn  = Math.floor(finalTotal / 10)

  const validate = () => {
    const e: Partial<DeliveryInfo> = {}
    if (!delivery.customerName.trim()) e.customerName = "Введіть ім'я"
    if (!/^\+?[\d\s\-]{10,13}$/.test(delivery.phone.trim())) e.phone = 'Невірний номер'
    if (delivery.deliveryMethod !== 'PICKUP' && !delivery.deliveryAddress.trim())
      e.deliveryAddress = 'Введіть адресу'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = () => {
    if (validate()) onOrder(bonusDiscount, delivery)
  }

  const addressLabel = delivery.deliveryMethod === 'NOVA_POSHTA' ? 'Місто та номер відділення'
    : delivery.deliveryMethod === 'UKRPOSHTA' ? 'Місто та поштовий індекс'
    : delivery.deliveryMethod === 'COURIER'   ? 'Місто, вулиця, будинок, квартира'
    : ''

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
    <div style={{ padding: '16px 16px 110px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button className="btn" onClick={onBack} style={{ background: '#1a1a1a', border: 'none', borderRadius: 10, width: 38, height: 38, fontSize: 18, cursor: 'pointer', color: '#fff' }}>←</button>
        <div className="logo-icon" style={{ width: 32, height: 32, borderRadius: 8, border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⚡</div>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>Оформлення</span>
        </div>
      </div>

      {/* Товари */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#111', borderRadius: 12, border: '1px solid #1f1f1f', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>{item.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>{item.name}</p>
              <p style={{ color: '#555', fontSize: 11 }}>{item.qty} шт × {item.price} ₴</p>
            </div>
            <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 14 }}>{item.qty * item.price} ₴</span>
          </div>
        ))}
      </div>

      {/* Форма доставки */}
      <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: 16, marginBottom: 14 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 14 }}>📦 Дані для доставки</p>

        {/* Ім'я */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 5 }}>Ім'я та прізвище *</p>
          <input
            value={delivery.customerName}
            onChange={e => set('customerName', e.target.value)}
            placeholder="Іван Петренко"
            style={{ ...inp, borderColor: errors.customerName ? '#ef4444' : '#2a2a2a' }}
          />
          {errors.customerName && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>{errors.customerName}</p>}
        </div>

        {/* Телефон */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 5 }}>Номер телефону *</p>
          <input
            value={delivery.phone}
            onChange={e => set('phone', e.target.value)}
            placeholder="+380 XX XXX XX XX"
            type="tel"
            style={{ ...inp, borderColor: errors.phone ? '#ef4444' : '#2a2a2a' }}
          />
          {errors.phone && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>{errors.phone}</p>}
        </div>

        {/* Спосіб доставки */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 8 }}>Спосіб доставки *</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {DELIVERY_METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => set('deliveryMethod', m.id)}
                style={{
                  background: delivery.deliveryMethod === m.id ? '#0a2a0a' : '#1a1a1a',
                  border: `1px solid ${delivery.deliveryMethod === m.id ? '#22C55E' : '#2a2a2a'}`,
                  borderRadius: 10, padding: '10px 8px', color: delivery.deliveryMethod === m.id ? '#22C55E' : '#888',
                  fontSize: 13, fontWeight: delivery.deliveryMethod === m.id ? 700 : 400,
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                }}>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Адреса (не для самовивозу) */}
        {delivery.deliveryMethod !== 'PICKUP' && (
          <div style={{ marginBottom: 10 }}>
            <p style={{ color: '#555', fontSize: 12, marginBottom: 5 }}>{addressLabel} *</p>
            <input
              value={delivery.deliveryAddress}
              onChange={e => set('deliveryAddress', e.target.value)}
              placeholder={
                delivery.deliveryMethod === 'NOVA_POSHTA' ? 'Київ, відділення №5'
                : delivery.deliveryMethod === 'UKRPOSHTA' ? 'Київ, 01001'
                : 'вул. Хрещатик, 1, кв. 10'
              }
              style={{ ...inp, borderColor: errors.deliveryAddress ? '#ef4444' : '#2a2a2a' }}
            />
            {errors.deliveryAddress && <p style={{ color: '#ef4444', fontSize: 11, marginTop: 3 }}>{errors.deliveryAddress}</p>}
          </div>
        )}

        {/* Коментар */}
        <div>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 5 }}>Коментар до замовлення</p>
          <textarea
            value={delivery.comment}
            onChange={e => set('comment', e.target.value)}
            placeholder="Будь-які побажання..."
            rows={2}
            style={{ ...inp, resize: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Бонусні бали */}
      {bonusBalance > 0 && (
        <div
          onClick={() => setUseBonus(v => !v)}
          style={{ background: useBonus ? '#0a2a0a' : '#111', borderRadius: 14, border: `1px solid ${useBonus ? '#22C55E' : '#1f1f1f'}`, padding: '14px 16px', marginBottom: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.2s' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>⭐ Бонусні бали</p>
            <p style={{ color: '#555', fontSize: 12, marginTop: 2 }}>У вас {bonusBalance} балів · -{maxBonus} ₴ знижка</p>
          </div>
          <div style={{ width: 24, height: 24, borderRadius: '50%', border: `2px solid ${useBonus ? '#22C55E' : '#333'}`, background: useBonus ? '#22C55E' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
            {useBonus && <span style={{ color: '#000', fontSize: 14, fontWeight: 700 }}>✓</span>}
          </div>
        </div>
      )}

      {/* Підсумок */}
      <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 16 }}>
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

      <button className="btn" onClick={submit} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 50, padding: '16px 0', fontWeight: 700, fontSize: 18, cursor: 'pointer', width: '100%', boxShadow: '0 0 24px rgba(34,197,94,0.5)' }}>
        Оформити замовлення →
      </button>
    </div>
  )
}
