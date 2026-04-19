import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

interface SpinLog {
  id: number
  createdAt: string
  promoCode?: string
  prize: { label: string; type: string; value: number }
}

interface PromoCode {
  id: number
  code: string
  discount: number
  expiresAt: string
}

interface OrderItem {
  quantity: number
  price: number
  product: { name: string }
}

const STATUS_LABEL: Record<string, string> = {
  PENDING:   '⏳ Нове',
  CONFIRMED: '✅ Підтверджено',
  SHIPPED:   '🚚 Відправлено',
  DELIVERED: '📦 Доставлено',
  CANCELLED: '❌ Скасовано',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING:   '#f59e0b',
  CONFIRMED: '#22C55E',
  SHIPPED:   '#3B82F6',
  DELIVERED: '#86efac',
  CANCELLED: '#ef4444',
}

interface Order {
  id: number
  totalPrice: number
  discount: number
  promoCode?: string
  bonusPointsUsed?: number
  status: string
  deliveryMethod?: string
  deliveryAddress?: string
  createdAt: string
  items: OrderItem[]
}

interface UserProfile {
  id: number
  telegramId: string
  username?: string
  firstName?: string
  bonusBalance: number
  referralCode: string
  spinLogs: SpinLog[]
  promoCodes: PromoCode[]
  orders: Order[]
  referrals: { id: number; username?: string; firstName?: string }[]
}

interface Props {
  telegramId: string
  onNavigate: (page: string) => void
}

const BOT_USERNAME = 'vo1tvape_bot'

export default function Profile({ telegramId, onNavigate }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/users/${telegramId}/profile`)
      .then(r => setProfile(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [telegramId])

  const refLink = `https://t.me/${BOT_USERNAME}?start=ref_${profile?.referralCode ?? ''}`

  const copyRef = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const prizeIcon = (type: string, value: number) => {
    if (type === 'BONUS_POINTS') return `+${value} балів`
    if (type === 'DISCOUNT') return `-${value}%`
    if (type === 'FREE_DELIVERY') return '🚚 Доставка'
    if (type === 'PROMO_CODE') return `-${value}%`
    return '🎁 Приз'
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#555', fontSize: 16 }}>Завантаження...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Профіль недоступний</p>
        <button className="btn" onClick={() => onNavigate('home')} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 50, padding: '12px 28px', fontWeight: 700, cursor: 'pointer' }}>
          На головну
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '16px 16px 100px', background: '#0D0D0D', minHeight: '100vh' }}>

      {/* Шапка */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div className="logo-icon" style={{ width: 38, height: 38, borderRadius: 10, border: '2px solid #22C55E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
        <div>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>VOLT </span>
          <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>Профіль</span>
        </div>
      </div>

      {/* Аватар та ім'я */}
      <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: '20px 16px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, #22C55E, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#000' }}>
          {(profile.firstName?.[0] ?? profile.username?.[0] ?? '?').toUpperCase()}
        </div>
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{profile.firstName ?? profile.username ?? 'Гравець'}</p>
          <p style={{ color: '#555', fontSize: 12 }}>ID: {profile.telegramId}</p>
        </div>
      </div>

      {/* Бонусний баланс */}
      <div style={{ background: 'linear-gradient(135deg, #0a2a0a, #111d11)', borderRadius: 16, border: '1px solid #1a4d1a', padding: '16px 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ color: '#86efac', fontSize: 13, marginBottom: 4 }}>Бонусний баланс</p>
          <p style={{ color: '#22C55E', fontWeight: 800, fontSize: 28 }}>{profile.bonusBalance}</p>
          <p style={{ color: '#555', fontSize: 12 }}>балів</p>
        </div>
        <span style={{ fontSize: 40 }}>⭐</span>
      </div>

      {/* Реферальна система */}
      <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 12 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>🔗 Реферальне посилання</p>
        <p style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>Запросіть друга — отримайте +50 балів та +1 спін.</p>
        <div style={{ background: '#0D0D0D', borderRadius: 10, padding: '10px 12px', marginBottom: 8, wordBreak: 'break-all' }}>
          <p style={{ color: '#86efac', fontSize: 12 }}>{refLink}</p>
        </div>
        <button className="btn" onClick={copyRef} style={{ background: copied ? '#166534' : '#22C55E', color: copied ? '#86efac' : '#000', border: 'none', borderRadius: 10, padding: '10px 0', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%', transition: 'all 0.2s' }}>
          {copied ? '✓ Скопійовано!' : 'Копіювати посилання'}
        </button>
        {profile.referrals.length > 0 && (
          <p style={{ color: '#555', fontSize: 12, marginTop: 8 }}>
            Запрошено: {profile.referrals.length} друг{profile.referrals.length > 1 ? 'ів' : 'а'}
          </p>
        )}
      </div>

      {/* Активні промокоди */}
      {profile.promoCodes.length > 0 && (
        <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 12 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🎟 Мої промокоди</p>
          {profile.promoCodes.map(p => (
            <div key={p.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: '10px 14px', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #22C55E33' }}>
              <div>
                <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 14, fontFamily: 'monospace' }}>{p.code}</p>
                <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>до {new Date(p.expiresAt).toLocaleDateString('uk-UA')}</p>
              </div>
              <span style={{ background: '#22C55E', color: '#000', fontWeight: 700, fontSize: 13, padding: '4px 10px', borderRadius: 50 }}>-{p.discount}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Останні замовлення */}
      {profile.orders?.length > 0 && (
        <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 12 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📦 Мої замовлення</p>
          {profile.orders.map(order => (
            <div key={order.id} style={{ background: '#1a1a1a', borderRadius: 10, padding: '12px 14px', marginBottom: 8, border: `1px solid ${STATUS_COLOR[order.status] ?? '#2a2a2a'}22` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <span style={{ background: (STATUS_COLOR[order.status] ?? '#555') + '22', color: STATUS_COLOR[order.status] ?? '#555', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 50 }}>
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                  <p style={{ color: '#555', fontSize: 11, marginTop: 4 }}>
                    {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 15 }}>{order.totalPrice} ₴</span>
              </div>
              {order.items.map((item, i) => (
                <p key={i} style={{ color: '#ccc', fontSize: 12, lineHeight: 1.7 }}>
                  {item.product.name} × {item.quantity}
                </p>
              ))}
              <div style={{ display: 'flex', gap: 10, marginTop: 6, flexWrap: 'wrap' }}>
                {order.discount > 0 && <span style={{ color: '#86efac', fontSize: 11 }}>Знижка {order.discount}%</span>}
                {(order.bonusPointsUsed ?? 0) > 0 && <span style={{ color: '#86efac', fontSize: 11 }}>⭐ -{order.bonusPointsUsed} балів</span>}
                {order.deliveryMethod && <span style={{ color: '#555', fontSize: 11 }}>🚚 {order.deliveryMethod.replace('NOVA_POSHTA','Нова Пошта').replace('UKRPOSHTA','Укрпошта').replace('COURIER','Кур\'єр').replace('PICKUP','Самовивіз')}</span>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Історія спінів */}
      {profile.spinLogs.length > 0 && (
        <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: '16px', marginBottom: 12 }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>🎡 Останні спіни</p>
          {profile.spinLogs.map(log => (
            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1a1a1a' }}>
              <div>
                <p style={{ color: '#fff', fontSize: 13 }}>{log.prize.label}</p>
                <p style={{ color: '#555', fontSize: 11 }}>
                  {new Date(log.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <span style={{ color: '#22C55E', fontWeight: 700, fontSize: 13 }}>{prizeIcon(log.prize.type, log.prize.value)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Кнопка магазину */}
      <button className="btn" onClick={() => onNavigate('shop')} style={{ background: '#22C55E', color: '#000', border: 'none', borderRadius: 50, padding: '16px 0', fontWeight: 700, fontSize: 16, cursor: 'pointer', width: '100%', boxShadow: '0 0 20px rgba(34,197,94,0.4)' }}>
        🛍 Перейти до магазину
      </button>
    </div>
  )
}
