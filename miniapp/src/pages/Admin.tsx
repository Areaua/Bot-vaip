import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const CATEGORIES = ['LIQUID', 'DISPOSABLE', 'ACCESSORY']
const CAT_LABEL: Record<string, string> = { LIQUID: 'Рідини', DISPOSABLE: 'Одноразки', ACCESSORY: 'Аксесуари' }

type Tab = 'stats' | 'products' | 'wheel' | 'users' | 'orders' | 'grant'

function api(key: string) {
  return axios.create({ baseURL: API, headers: { 'x-admin-key': key } })
}

// ─── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }: { onLogin: (key: string) => void }) {
  const [key, setKey] = useState('')
  const [error, setError] = useState(false)

  const submit = async () => {
    try {
      await api(key).get('/admin/stats')
      localStorage.setItem('admin_key', key)
      onLogin(key)
    } catch {
      setError(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: 36 }}>⚡</span>
          <h1 style={{ color: '#22C55E', fontWeight: 800, fontSize: 22, marginTop: 8 }}>VOLT VAPE Admin</h1>
        </div>
        <div style={{ background: '#111', borderRadius: 16, border: '1px solid #1f1f1f', padding: 24 }}>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 12 }}>Адмін-ключ</p>
          <input
            type="password"
            value={key}
            onChange={e => { setKey(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Введіть ключ..."
            style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${error ? '#ef4444' : '#2a2a2a'}`, borderRadius: 10, padding: '12px 14px', color: '#fff', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 6 }}>Невірний ключ</p>}
          <button onClick={submit} style={{ marginTop: 16, width: '100%', background: '#22C55E', color: '#000', border: 'none', borderRadius: 10, padding: '13px 0', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            Увійти
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function StatsTab({ adminKey }: { adminKey: string }) {
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    api(adminKey).get('/admin/stats').then(r => setStats(r.data)).catch(() => {})
  }, [adminKey])

  if (!stats) return <Loader />

  const cards = [
    { label: 'Користувачів', value: stats.totalUsers, icon: '👥' },
    { label: 'Спінів всього', value: stats.totalSpins, icon: '🎡' },
    { label: 'Замовлень', value: stats.totalOrders, icon: '📦' },
    { label: 'Джекпотів', value: stats.jackpotWins, icon: '🎯' },
    { label: 'Виручка (₴)', value: stats.revenue, icon: '💰' },
    { label: 'Конверсія', value: `${stats.conversionPercent}%`, icon: '📊' },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {cards.map(c => (
        <div key={c.label} style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: '16px 14px' }}>
          <p style={{ fontSize: 24, marginBottom: 6 }}>{c.icon}</p>
          <p style={{ color: '#22C55E', fontWeight: 800, fontSize: 22 }}>{c.value}</p>
          <p style={{ color: '#555', fontSize: 12, marginTop: 2 }}>{c.label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Products ─────────────────────────────────────────────────────────────────
function ProductsTab({ adminKey }: { adminKey: string }) {
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState({ name: '', category: 'LIQUID', price: '', description: '', imageUrl: '' })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [editing, setEditing] = useState<any>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api(adminKey).get('/admin/products').then(r => setProducts(r.data)).catch(() => {})
  }, [adminKey])

  useEffect(() => { load() }, [load])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const resetForm = () => {
    setForm({ name: '', category: 'LIQUID', price: '', description: '', imageUrl: '' })
    setImageFile(null)
    setImagePreview('')
    setEditing(null)
  }

  const save = async () => {
    if (!form.name || !form.price) return
    setSaving(true)
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        const r = await api(adminKey).post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        imageUrl = r.data.url
      }
      const data = { ...form, price: parseInt(form.price), imageUrl }
      if (editing) {
        await api(adminKey).put(`/admin/products/${editing.id}`, data)
      } else {
        await api(adminKey).post('/admin/products', data)
      }
      resetForm()
      load()
    } finally { setSaving(false) }
  }

  const del = async (id: number) => {
    if (!confirm('Видалити товар?')) return
    await api(adminKey).delete(`/admin/products/${id}`)
    load()
  }

  const startEdit = (p: any) => {
    setEditing(p)
    setForm({ name: p.name, category: p.category, price: String(p.price), description: p.description ?? '', imageUrl: p.imageUrl ?? '' })
    setImageFile(null)
    setImagePreview(p.imageUrl ? (p.imageUrl.startsWith('data:') ? p.imageUrl : `${API}${p.imageUrl}`) : '')
  }

  const toggleStock = async (p: any) => {
    await api(adminKey).put(`/admin/products/${p.id}`, { inStock: !p.inStock })
    load()
  }

  return (
    <div>
      {/* Форма */}
      <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: 16, marginBottom: 16 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
          {editing ? '✏️ Редагування' : '➕ Новий товар'}
        </p>
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Назва" style={inputStyle} />
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={{ ...inputStyle, marginTop: 8 }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
        </select>
        <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Ціна (₴)" type="number" style={{ ...inputStyle, marginTop: 8 }} />
        <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Опис (необов'язково)" style={{ ...inputStyle, marginTop: 8 }} />

        {/* Фото з галереї */}
        <div style={{ marginTop: 10 }}>
          <p style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>Фото товару</p>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <div style={{ background: '#1a1a1a', border: '1px dashed #3a3a3a', borderRadius: 10, padding: '10px 16px', color: '#888', fontSize: 13, flex: 1, textAlign: 'center' }}>
              📷 Обрати з галереї
            </div>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
          {imagePreview && (
            <div style={{ marginTop: 8, position: 'relative', display: 'inline-block' }}>
              <img src={imagePreview} alt="preview" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10, border: '1px solid #2a2a2a' }} />
              <button onClick={() => { setImageFile(null); setImagePreview(''); setForm(f => ({ ...f, imageUrl: '' })) }} style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', border: 'none', borderRadius: '50%', width: 20, height: 20, color: '#fff', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={save} disabled={saving} style={btnGreen}>{saving ? '...' : editing ? 'Зберегти' : 'Додати'}</button>
          {editing && <button onClick={resetForm} style={btnGray}>Скасувати</button>}
        </div>
      </div>

      {/* Список */}
      {products.map(p => (
        <div key={p.id} style={{ background: '#111', borderRadius: 12, border: '1px solid #1f1f1f', padding: '12px 14px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          {p.imageUrl && <img src={p.imageUrl.startsWith('data:') ? p.imageUrl : `${API}${p.imageUrl}`} alt={p.name} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />}
          <div style={{ flex: 1 }}>
            <p style={{ color: p.inStock ? '#fff' : '#555', fontWeight: 600, fontSize: 14 }}>{p.name}</p>
            <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>{CAT_LABEL[p.category]} · {p.price} ₴ · {p.inStock ? '✅ В наявності' : '❌ Немає'}</p>
          </div>
          <button onClick={() => toggleStock(p)} style={{ ...btnGray, fontSize: 11, padding: '5px 10px' }}>{p.inStock ? 'Сховати' : 'Показати'}</button>
          <button onClick={() => startEdit(p)} style={{ ...btnGray, fontSize: 11, padding: '5px 10px' }}>✏️</button>
          <button onClick={() => del(p.id)} style={{ ...btnRed, fontSize: 11, padding: '5px 10px' }}>🗑</button>
        </div>
      ))}
    </div>
  )
}

// ─── Orders ───────────────────────────────────────────────────────────────────
const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_LABEL: Record<string, string> = {
  PENDING: '⏳ Нове',
  CONFIRMED: '✅ Підтверджено',
  SHIPPED: '🚚 Відправлено',
  DELIVERED: '📦 Доставлено',
  CANCELLED: '❌ Скасовано',
}
const STATUS_COLOR: Record<string, string> = {
  PENDING: '#f59e0b',
  CONFIRMED: '#22C55E',
  SHIPPED: '#3B82F6',
  DELIVERED: '#86efac',
  CANCELLED: '#ef4444',
}

function OrdersTab({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [filterStatus, setFilterStatus] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page) })
    if (filterStatus) params.set('status', filterStatus)
    api(adminKey).get(`/admin/orders?${params}`).then(r => setData(r.data)).catch(() => {})
  }, [adminKey, page, filterStatus])

  useEffect(() => { load() }, [load])

  const changeStatus = async (orderId: number, status: string) => {
    setUpdatingId(orderId)
    try {
      await api(adminKey).put(`/admin/orders/${orderId}/status`, { status })
      load()
    } finally { setUpdatingId(null) }
  }

  if (!data) return <Loader />

  return (
    <div>
      {/* Фільтр по статусу */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 4 }}>
        {['', ...ORDER_STATUSES].map(s => (
          <button key={s} onClick={() => { setFilterStatus(s); setPage(1) }} style={{ ...( filterStatus === s ? btnGreen : btnGray), whiteSpace: 'nowrap', padding: '6px 12px', fontSize: 12 }}>
            {s ? STATUS_LABEL[s] : '📋 Всі'}
          </button>
        ))}
      </div>

      <p style={{ color: '#555', fontSize: 12, marginBottom: 10 }}>Всього: {data.total} замовлень</p>

      {data.orders.map((order: any) => (
        <div key={order.id} style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', marginBottom: 10, overflow: 'hidden' }}>

          {/* Шапка замовлення */}
          <div onClick={() => setExpanded(expanded === order.id ? null : order.id)} style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ color: '#555', fontSize: 11 }}>#{order.id}</span>
                <span style={{ background: STATUS_COLOR[order.status] + '22', color: STATUS_COLOR[order.status], fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 50 }}>
                  {STATUS_LABEL[order.status]}
                </span>
              </div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>
                {order.user.firstName ?? order.user.username ?? `ID ${order.user.telegramId}`}
              </p>
              <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>
                {new Date(order.createdAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 16 }}>{order.totalPrice} ₴</p>
              {order.bonusPointsUsed > 0 && <p style={{ color: '#86efac', fontSize: 11 }}>-{order.bonusPointsUsed} балів</p>}
            </div>
            <span style={{ color: '#444', fontSize: 16 }}>{expanded === order.id ? '▲' : '▼'}</span>
          </div>

          {/* Деталі */}
          {expanded === order.id && (
            <div style={{ borderTop: '1px solid #1a1a1a', padding: '12px 14px' }}>
              {/* Товари */}
              <div style={{ marginBottom: 12 }}>
                {order.items.map((item: any, i: number) => (
                  <p key={i} style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8 }}>
                    {item.product.name} × {item.quantity} — <span style={{ color: '#22C55E' }}>{item.quantity * item.price} ₴</span>
                  </p>
                ))}
                {order.promoCode && <p style={{ color: '#86efac', fontSize: 12, marginTop: 4 }}>Промокод: {order.promoCode} (-{order.discount}%)</p>}
                {order.bonusPointsUsed > 0 && <p style={{ color: '#86efac', fontSize: 12 }}>Бонуси: -{order.bonusPointsUsed} балів</p>}
              </div>

              {/* Доставка */}
              {order.customerName && (
                <div style={{ background: '#0a0a0a', borderRadius: 10, padding: '10px 12px', marginBottom: 12 }}>
                  <p style={{ color: '#555', fontSize: 11, marginBottom: 6 }}>ДАНІ ДОСТАВКИ</p>
                  <p style={{ color: '#fff', fontSize: 13 }}>👤 {order.customerName}</p>
                  <p style={{ color: '#ccc', fontSize: 13 }}>📞 {order.phone}</p>
                  <p style={{ color: '#ccc', fontSize: 13 }}>🚚 {order.deliveryMethod?.replace('NOVA_POSHTA','Нова Пошта').replace('UKRPOSHTA','Укрпошта').replace('COURIER','Кур\'єр').replace('PICKUP','Самовивіз')}</p>
                  {order.deliveryAddress && <p style={{ color: '#ccc', fontSize: 13 }}>📍 {order.deliveryAddress}</p>}
                  {order.comment && <p style={{ color: '#888', fontSize: 12, marginTop: 4, fontStyle: 'italic' }}>💬 {order.comment}</p>}
                </div>
              )}

              {/* Зміна статусу */}
              <p style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>Змінити статус:</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ORDER_STATUSES.filter(s => s !== order.status).map(s => (
                  <button
                    key={s}
                    disabled={updatingId === order.id}
                    onClick={() => changeStatus(order.id, s)}
                    style={{ background: STATUS_COLOR[s] + '22', color: STATUS_COLOR[s], border: `1px solid ${STATUS_COLOR[s]}44`, borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {STATUS_LABEL[s]}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnGray}>← Назад</button>
        <span style={{ color: '#555', fontSize: 13, alignSelf: 'center' }}>Стор. {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.orders.length < 20} style={btnGray}>Далі →</button>
      </div>
    </div>
  )
}

// ─── Wheel ────────────────────────────────────────────────────────────────────
function WheelTab({ adminKey }: { adminKey: string }) {
  const [prizes, setPrizes] = useState<any[]>([])
  const [editing, setEditing] = useState<Record<number, any>>({})
  const [saving, setSaving] = useState<number | null>(null)

  const load = useCallback(() => {
    api(adminKey).get('/admin/prizes').then(r => setPrizes(r.data)).catch(() => {})
  }, [adminKey])

  useEffect(() => { load() }, [load])

  const edit = (id: number, field: string, value: any) => {
    setEditing(e => ({ ...e, [id]: { ...e[id], [field]: value } }))
  }

  const save = async (prize: any) => {
    setSaving(prize.id)
    const patch = editing[prize.id] ?? {}
    await api(adminKey).put(`/admin/prizes/${prize.id}`, {
      probability: parseFloat(patch.probability ?? prize.probability),
      value: parseInt(patch.value ?? prize.value),
      isActive: patch.isActive ?? prize.isActive,
    })
    setSaving(null)
    load()
  }

  const totalProb = prizes.reduce((s, p) => s + p.probability, 0)

  return (
    <div>
      <div style={{ background: '#1a2a1a', borderRadius: 10, padding: '10px 14px', marginBottom: 12, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: '#86efac', fontSize: 13 }}>Сума ймовірностей</span>
        <span style={{ color: totalProb.toFixed(3) === '1.000' ? '#22C55E' : '#ef4444', fontWeight: 700, fontSize: 13 }}>{(totalProb * 100).toFixed(2)}%</span>
      </div>

      {prizes.map(p => {
        const patch = editing[p.id] ?? {}
        return (
          <div key={p.id} style={{ background: '#111', borderRadius: 12, border: '1px solid #1f1f1f', padding: '12px 14px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ color: p.isActive ? '#fff' : '#444', fontWeight: 600, fontSize: 14 }}>{p.label}</p>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <span style={{ color: '#555', fontSize: 12 }}>Активний</span>
                <input type="checkbox" checked={patch.isActive ?? p.isActive} onChange={e => edit(p.id, 'isActive', e.target.checked)} />
              </label>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>Ймовірність (0–1)</p>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  max="1"
                  value={patch.probability ?? p.probability}
                  onChange={e => edit(p.id, 'probability', e.target.value)}
                  style={{ ...inputStyle, fontSize: 13, padding: '8px 10px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>Значення</p>
                <input
                  type="number"
                  value={patch.value ?? p.value}
                  onChange={e => edit(p.id, 'value', e.target.value)}
                  style={{ ...inputStyle, fontSize: 13, padding: '8px 10px' }}
                />
              </div>
              <button onClick={() => save(p)} disabled={saving === p.id} style={{ ...btnGreen, marginTop: 18, padding: '8px 14px', fontSize: 13 }}>
                {saving === p.id ? '...' : '💾'}
              </button>
            </div>
            <p style={{ color: '#555', fontSize: 11, marginTop: 6 }}>
              {p.type} · {(p.probability * 100).toFixed(2)}% шанс
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ─── Users ────────────────────────────────────────────────────────────────────
function UsersTab({ adminKey }: { adminKey: string }) {
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    api(adminKey).get(`/admin/users?page=${page}`).then(r => setData(r.data)).catch(() => {})
  }, [adminKey, page])

  if (!data) return <Loader />

  return (
    <div>
      <p style={{ color: '#555', fontSize: 12, marginBottom: 12 }}>Всього: {data.total} користувачів</p>
      {data.users.map((u: any) => (
        <div key={u.id} style={{ background: '#111', borderRadius: 12, border: '1px solid #1f1f1f', padding: '12px 14px', marginBottom: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{u.firstName ?? u.username ?? 'Без імені'}</p>
              <p style={{ color: '#555', fontSize: 11, marginTop: 2 }}>ID: {u.telegramId}</p>
            </div>
            <span style={{ background: '#1a3d1a', color: '#22C55E', fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 50 }}>
              {u.bonusBalance} б
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span style={{ color: '#555', fontSize: 12 }}>🎡 {u._count.spinLogs} спінів</span>
            <span style={{ color: '#555', fontSize: 12 }}>📦 {u._count.orders} замовлень</span>
            <span style={{ color: '#555', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('uk-UA')}</span>
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 12 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={btnGray}>← Назад</button>
        <span style={{ color: '#555', fontSize: 13, alignSelf: 'center' }}>Стор. {page}</span>
        <button onClick={() => setPage(p => p + 1)} disabled={data.users.length < 20} style={btnGray}>Далі →</button>
      </div>
    </div>
  )
}

// ─── Grant ────────────────────────────────────────────────────────────────────
function GrantTab({ adminKey }: { adminKey: string }) {
  const [telegramId, setTelegramId] = useState('')
  const [type, setType] = useState<'promo' | 'bonus'>('promo')
  const [value, setValue] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!telegramId || !value) return
    setLoading(true)
    setResult(null)
    setError('')
    try {
      const endpoint = type === 'promo' ? '/admin/grant/promo' : '/admin/grant/bonus'
      const body = type === 'promo'
        ? { telegramId, discount: parseInt(value) }
        : { telegramId, points: parseInt(value) }
      const r = await api(adminKey).post(endpoint, body)
      setResult(r.data)
    } catch (e: any) {
      setError(e.response?.data?.message ?? 'Помилка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: 16 }}>
        <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, marginBottom: 16 }}>🎁 Видати нагороду</p>

        <p style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>Telegram ID користувача</p>
        <input value={telegramId} onChange={e => setTelegramId(e.target.value)} placeholder="123456789" style={inputStyle} />

        <p style={{ color: '#555', fontSize: 12, margin: '12px 0 6px' }}>Тип нагороди</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          {(['promo', 'bonus'] as const).map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 13, background: type === t ? '#22C55E' : '#1a1a1a', color: type === t ? '#000' : '#888' }}>
              {t === 'promo' ? '🎟 Промокод' : '⭐ Бонуси'}
            </button>
          ))}
        </div>

        <p style={{ color: '#555', fontSize: 12, marginBottom: 6 }}>
          {type === 'promo' ? 'Знижка (%)' : 'Кількість балів'}
        </p>
        <input value={value} onChange={e => setValue(e.target.value)} placeholder={type === 'promo' ? '10' : '100'} type="number" style={inputStyle} />

        <button onClick={submit} disabled={loading} style={{ ...btnGreen, marginTop: 16, width: '100%' }}>
          {loading ? 'Відправка...' : 'Видати'}
        </button>

        {result && (
          <div style={{ marginTop: 12, background: '#0a2a0a', borderRadius: 10, padding: '10px 14px', border: '1px solid #22C55E' }}>
            <p style={{ color: '#22C55E', fontWeight: 700, fontSize: 13 }}>✅ Успішно!</p>
            {result.code && <p style={{ color: '#86efac', fontSize: 12, marginTop: 4 }}>Код: <b>{result.code}</b></p>}
            {result.bonusBalance !== undefined && <p style={{ color: '#86efac', fontSize: 12, marginTop: 4 }}>Баланс: {result.bonusBalance} балів</p>}
          </div>
        )}
        {error && <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>❌ {error}</p>}
      </div>
    </div>
  )
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
  borderRadius: 10, padding: '10px 12px', color: '#fff', fontSize: 14,
  outline: 'none', boxSizing: 'border-box',
}
const btnGreen: React.CSSProperties = {
  background: '#22C55E', color: '#000', border: 'none', borderRadius: 10,
  padding: '10px 20px', fontWeight: 700, fontSize: 14, cursor: 'pointer',
}
const btnGray: React.CSSProperties = {
  background: '#1a1a1a', color: '#888', border: 'none', borderRadius: 10,
  padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
}
const btnRed: React.CSSProperties = {
  background: '#2a0a0a', color: '#ef4444', border: 'none', borderRadius: 10,
  padding: '10px 16px', fontWeight: 600, fontSize: 14, cursor: 'pointer',
}

function Loader() {
  return <p style={{ color: '#555', fontSize: 14, textAlign: 'center', padding: 32 }}>Завантаження...</p>
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Admin() {
  const [adminKey, setAdminKey] = useState<string | null>(() => localStorage.getItem('admin_key'))
  const [tab, setTab] = useState<Tab>('stats')

  if (!adminKey) return <Login onLogin={setAdminKey} />

  const tabs: { id: Tab; label: string }[] = [
    { id: 'stats',    label: '📊 Стат' },
    { id: 'products', label: '🛍 Товари' },
    { id: 'orders',   label: '📦 Замовл.' },
    { id: 'wheel',    label: '🎡 Колесо' },
    { id: 'users',    label: '👥 Юзери' },
    { id: 'grant',    label: '🎁 Видати' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0D0D0D', padding: '16px 16px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={{ color: '#22C55E', fontWeight: 800, fontSize: 16 }}>VOLT Admin</span>
        </div>
        <button onClick={() => { localStorage.removeItem('admin_key'); setAdminKey(null) }} style={{ ...btnGray, fontSize: 12, padding: '6px 12px' }}>
          Вийти
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...( tab === t.id ? btnGreen : btnGray), whiteSpace: 'nowrap', padding: '8px 14px', fontSize: 13 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'stats'    && <StatsTab    adminKey={adminKey} />}
      {tab === 'products' && <ProductsTab adminKey={adminKey} />}
      {tab === 'orders'   && <OrdersTab   adminKey={adminKey} />}
      {tab === 'wheel'    && <WheelTab    adminKey={adminKey} />}
      {tab === 'users'    && <UsersTab    adminKey={adminKey} />}
      {tab === 'grant'    && <GrantTab    adminKey={adminKey} />}
    </div>
  )
}
