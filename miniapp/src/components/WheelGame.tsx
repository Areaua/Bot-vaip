import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const PRIZES = [
  { label: 'Знижка 5%',            color: '#1a3d1a' },
  { label: 'Знижка 10%',           color: '#1e4d1e' },
  { label: '50 бонусів',           color: '#1a3d1a' },
  { label: '100 бонусів',          color: '#1e4d1e' },
  { label: 'Безкоштовна доставка', color: '#1a3d1a' },
  { label: 'Промокод -15%',        color: '#1e4d1e' },
  { label: 'Промокод -25%',        color: '#1a3d1a' },
  { label: 'Подвійні бонуси',      color: '#1e4d1e' },
  { label: '25 бонусів',           color: '#1a3d1a' },
  { label: '🎯 Chaser',            color: '#0d2d0d' },
]

interface Props { telegramId: string; onDone?: () => void }

function prizeIcon(type: string, value: number) {
  if (type === 'BONUS_POINTS') return `+${value}`
  if (type === 'DISCOUNT')     return `-${value}%`
  if (type === 'FREE_DELIVERY') return '🚚'
  if (type === 'PROMO_CODE')   return `-${value}%`
  return '🎁'
}

function prizeLabel(type: string) {
  if (type === 'BONUS_POINTS') return 'бонусів'
  if (type === 'DISCOUNT')     return 'знижка'
  if (type === 'FREE_DELIVERY') return 'безкоштовна доставка'
  if (type === 'PROMO_CODE')   return 'промокод'
  return 'Chaser 10мл'
}

export default function WheelGame({ telegramId, onDone }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const rotRef     = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [prize,    setPrize]    = useState<any>(null)
  const [promoCode, setPromoCode] = useState<string | null>(null)
  const [copied,   setCopied]   = useState(false)
  const [canSpin,  setCanSpin]  = useState<boolean | null>(null)
  const [collecting, setCollecting] = useState(false)

  // ── малювання колеса ──────────────────────────────────────────
  const draw = (rot: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    const logical = 300
    if (canvas.width !== logical * dpr) {
      canvas.width  = logical * dpr
      canvas.height = logical * dpr
      canvas.style.width  = `${logical}px`
      canvas.style.height = `${logical}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const sz = logical, cx = sz / 2, cy = sz / 2
    const r  = cx - 8
    const seg = (2 * Math.PI) / PRIZES.length

    ctx.clearRect(0, 0, sz, sz)

    // glow
    const grd = ctx.createRadialGradient(cx, cy, r - 20, cx, cy, r + 8)
    grd.addColorStop(0, 'rgba(34,197,94,0.15)')
    grd.addColorStop(1, 'rgba(34,197,94,0)')
    ctx.beginPath(); ctx.arc(cx, cy, r + 8, 0, 2 * Math.PI)
    ctx.fillStyle = grd; ctx.fill()

    PRIZES.forEach((p, i) => {
      const start = i * seg + rot, end = start + seg
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.arc(cx, cy, r, start, end); ctx.closePath()
      ctx.fillStyle = p.color; ctx.fill()
      ctx.strokeStyle = '#39FF14'; ctx.lineWidth = 1.5; ctx.stroke()

      ctx.save(); ctx.translate(cx, cy)
      const mid = start + seg / 2; ctx.rotate(mid)
      const norm = ((mid % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
      const left = norm > Math.PI / 2 && norm < 1.5 * Math.PI
      if (left) { ctx.rotate(Math.PI); ctx.textAlign = 'left' }
      else       { ctx.textAlign = 'right' }
      ctx.fillStyle = i === 9 ? '#39FF14' : '#86efac'
      ctx.font = `${i === 9 ? 'bold' : 'normal'} 12px sans-serif`
      ctx.fillText(p.label, left ? -(r - 8) : r - 8, 4)
      ctx.restore()
    })

    ctx.beginPath(); ctx.arc(cx, cy, r, 0, 2 * Math.PI)
    ctx.strokeStyle = '#39FF14'; ctx.lineWidth = 3; ctx.stroke()

    ctx.beginPath(); ctx.arc(cx, cy, 38, 0, 2 * Math.PI)
    ctx.fillStyle = '#0D0D0D'; ctx.fill()
    ctx.strokeStyle = '#39FF14'; ctx.lineWidth = 2.5; ctx.stroke()

    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⚡', cx, cy)
  }

  // при mount та після повернення з екрану призу
  useEffect(() => { draw(rotRef.current) }, [])
  useEffect(() => {
    if (!prize) requestAnimationFrame(() => draw(rotRef.current))
  }, [prize])

  useEffect(() => {
    axios.get(`${API_URL}/spin/status`, { params: { telegramId } })
      .then(r  => setCanSpin(r.data.canSpin))
      .catch(() => setCanSpin(true))
  }, [telegramId])

  // ── спін ────────────────────────────────────────────────────
  const handleSpin = async () => {
    if (spinning || canSpin === false) return
    setSpinning(true)

    try {
      const res    = await axios.post(`${API_URL}/spin`, { telegramId })
      const result = res.data
      const seg    = (2 * Math.PI) / PRIZES.length
      const idx    = result.segmentIndex ?? 0
      const target = -Math.PI / 2 - idx * seg - seg / 2
      const cur    = rotRef.current
      const cycles = Math.ceil((cur + 5 * 2 * Math.PI - target) / (2 * Math.PI))
      const final  = target + cycles * 2 * Math.PI
      const total  = final - cur

      const t0 = performance.now(), dur = 4500
      const animate = (now: number) => {
        const p   = Math.min((now - t0) / dur, 1)
        const e   = 1 - Math.pow(1 - p, 4)
        rotRef.current = cur + total * e
        draw(rotRef.current)
        if (p < 1) requestAnimationFrame(animate)
        else { setSpinning(false); setCanSpin(false); setPrize(result.prize); setPromoCode(result.promoCode ?? null) }
      }
      requestAnimationFrame(animate)
    } catch (err: any) {
      setSpinning(false)
      alert(err.response?.data?.message || 'Помилка')
    }
  }

  // ── збір бонусу з анімацією ──────────────────────────────────
  const handleCollect = () => {
    setCollecting(true)
    setTimeout(() => { setPrize(null); setCollecting(false); onDone?.() }, 900)
  }

  // ── рендер: завжди малюємо колесо, приз — overlay ───────────
  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'radial-gradient(ellipse at 50% 30%, #0a2a0a 0%, #0D0D0D 65%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 24px 90px', gap: '20px', overflowY: 'auto' }}>

      {/* ── Колесо (завжди в DOM) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
      </div>

      {canSpin === false && !prize ? (
        <div style={{ background: '#111', borderRadius: 14, border: '1px solid #1f1f1f', padding: '10px 20px', textAlign: 'center' }}>
          <p style={{ color: '#888', fontSize: 14 }}>⏰ Наступний спін завтра</p>
        </div>
      ) : !prize ? (
        <p style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>Крути щодня та вигравай знижки і суперприз!</p>
      ) : <div style={{ height: 22 }} />}

      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '13px solid transparent', borderRight: '13px solid transparent', borderTop: '26px solid #39FF14', filter: 'drop-shadow(0 0 6px #39FF14)', zIndex: 10 }} />
        <canvas ref={canvasRef} style={{ borderRadius: '50%', display: 'block', width: 300, height: 300 }} />
      </div>

      <button
        onClick={handleSpin}
        disabled={spinning || canSpin === false || !!prize}
        className={canSpin === true && !spinning && !prize ? 'btn spin-btn-ready' : 'btn'}
        style={{ background: spinning || canSpin === false || prize ? '#166534' : '#22C55E', color: spinning || canSpin === false || prize ? '#86efac' : '#000', fontWeight: 700, fontSize: 18, padding: '16px 0', borderRadius: 50, border: 'none', cursor: spinning || canSpin === false || prize ? 'not-allowed' : 'pointer', width: '100%', maxWidth: 320, transition: 'all 0.3s' }}>
        {spinning ? 'Крутиться...' : canSpin === false ? 'Вже використано сьогодні' : 'Крутити колесо'}
      </button>

      {/* ── Overlay призу ── */}
      {prize && (
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, #0a2a0a 0%, #0D0D0D 90%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 24 }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>⚡</span>
            <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
          </div>

          <p style={{ color: '#888', fontSize: 15 }}>Твій приз:</p>

          {/* Коло з призом */}
          <div style={{ position: 'relative' }}>
            <div style={{ width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle at 40% 35%, #1e5c1e, #0a1f0a)', border: '3px solid #39FF14', boxShadow: '0 0 40px rgba(57,255,20,0.4), 0 0 80px rgba(34,197,94,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'prizeAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards' }}>
              <div style={{ color: '#39FF14', fontWeight: 800, fontSize: 36, lineHeight: 1 }}>
                {prizeIcon(prize.type, prize.value)}
              </div>
              <div style={{ color: '#86efac', fontSize: 13, marginTop: 6, textAlign: 'center', padding: '0 16px' }}>
                {prizeLabel(prize.type)}
              </div>
            </div>

            {/* Літаючий текст */}
            {collecting && (
              <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', color: '#39FF14', fontWeight: 800, fontSize: 28, whiteSpace: 'nowrap', animation: 'floatUp 0.9s ease-out forwards', pointerEvents: 'none' }}>
                {prize.type === 'BONUS_POINTS' ? `+${prize.value} балів` :
                 prize.type === 'DISCOUNT' || prize.type === 'PROMO_CODE' ? `🎟 -${prize.value}%` :
                 prize.type === 'FREE_DELIVERY' ? '🚚 Доставка' : '🎁'}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>Вітаємо!</p>
            <p style={{ color: '#888', marginTop: 6, fontSize: 15 }}>{prize.label}</p>
          </div>

          {/* Промокод — показуємо код та кнопку копіювати */}
          {promoCode && (
            <div style={{ width: '100%', maxWidth: 320, background: '#0a2a0a', borderRadius: 14, border: '1px solid #22C55E', padding: '14px 16px' }}>
              <p style={{ color: '#86efac', fontSize: 12, marginBottom: 8 }}>🎟 Твій промокод — застосуй у магазині:</p>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#39FF14', fontWeight: 800, fontSize: 20, flex: 1, letterSpacing: 2 }}>{promoCode}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(promoCode); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ background: copied ? '#166534' : '#22C55E', color: '#000', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {copied ? '✓ Скопійовано' : 'Копіювати'}
                </button>
              </div>
              <p style={{ color: '#555', fontSize: 11, marginTop: 8 }}>Промокод також збережено у профілі</p>
            </div>
          )}

          <button
            className="btn spin-btn-ready"
            onClick={handleCollect}
            disabled={collecting}
            style={{ background: '#22C55E', color: '#000', fontWeight: 700, fontSize: 17, padding: '15px 0', borderRadius: 50, border: 'none', cursor: 'pointer', width: '100%', maxWidth: 320, opacity: collecting ? 0.7 : 1 }}>
            {collecting ? '✓ Отримано!' : prize.type === 'BONUS_POINTS' ? `Отримати +${prize.value} балів` : promoCode ? 'До магазину →' : 'Отримати приз'}
          </button>

          <button className="btn" onClick={() => setPrize(null)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 14 }}>
            Повернутись до колеса
          </button>
        </div>
      )}

      <style>{`
        @keyframes prizeAppear {
          from { transform: scale(0.3); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
        @keyframes floatUp {
          0%   { transform: translateX(-50%) translateY(0);     opacity: 1; }
          100% { transform: translateX(-50%) translateY(-140px); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
