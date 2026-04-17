import { useState, useRef, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'
const TELEGRAM_ID = '123456789'

const PRIZES = [
  { label: 'Знижка 5%',   color: '#1a3d1a', borderColor: '#22c55e' },
  { label: 'Знижка 10%',  color: '#1e4d1e', borderColor: '#22c55e' },
  { label: '50 бонусів',  color: '#1a3d1a', borderColor: '#22c55e' },
  { label: '100 бонусів', color: '#1e4d1e', borderColor: '#22c55e' },
  { label: 'Доставка',    color: '#1a3d1a', borderColor: '#22c55e' },
  { label: '-15%',        color: '#1e4d1e', borderColor: '#22c55e' },
  { label: '-25%',        color: '#1a3d1a', borderColor: '#22c55e' },
  { label: '200 бонусів', color: '#1e4d1e', borderColor: '#22c55e' },
  { label: '25 бонусів',  color: '#1a3d1a', borderColor: '#22c55e' },
  { label: '🎯 Chaser',   color: '#0d2d0d', borderColor: '#39FF14' },
]

export default function WheelGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rotationRef = useRef(0)
  const [spinning, setSpinning] = useState(false)
  const [prize, setPrize] = useState<any>(null)

  const drawWheel = (rot: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const size = canvas.width
    const cx = size / 2
    const cy = size / 2
    const radius = cx - 8
    const seg = (2 * Math.PI) / PRIZES.length

    ctx.clearRect(0, 0, size, size)

    // Внешнее свечение
    const grd = ctx.createRadialGradient(cx, cy, radius - 20, cx, cy, radius + 8)
    grd.addColorStop(0, 'rgba(34,197,94,0.15)')
    grd.addColorStop(1, 'rgba(34,197,94,0)')
    ctx.beginPath()
    ctx.arc(cx, cy, radius + 8, 0, 2 * Math.PI)
    ctx.fillStyle = grd
    ctx.fill()

    PRIZES.forEach((p, i) => {
  const start = i * seg + rot
  const end = start + seg

  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.arc(cx, cy, radius, start, end)
  ctx.closePath()
  ctx.fillStyle = p.color
  ctx.fill()
  ctx.strokeStyle = '#39FF14'
  ctx.lineWidth = 1.5
  ctx.stroke()

  // Текст — завжди читається
  ctx.save()
  ctx.translate(cx, cy)
  const midAngle = start + seg / 2
  ctx.rotate(midAngle)

  // Визначаємо чи текст на лівій половині
  const normalizedAngle = ((midAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  const isLeftSide = normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2

  if (isLeftSide) {
    ctx.rotate(Math.PI)
    ctx.textAlign = 'left'
  } else {
    ctx.textAlign = 'right'
  }

  ctx.fillStyle = i === 9 ? '#39FF14' : '#86efac'
  ctx.font = `${i === 9 ? 'bold' : 'normal'} 12px sans-serif`
  ctx.fillText(p.label, isLeftSide ? -(radius - 8) : radius - 8, 4)
  ctx.restore()
})

    // Внешнее кольцо
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = '#39FF14'
    ctx.lineWidth = 3
    ctx.stroke()

    // Центральный круг
    ctx.beginPath()
    ctx.arc(cx, cy, 38, 0, 2 * Math.PI)
    ctx.fillStyle = '#0D0D0D'
    ctx.fill()
    ctx.strokeStyle = '#39FF14'
    ctx.lineWidth = 2.5
    ctx.stroke()

    // Молния ⚡
    ctx.font = 'bold 26px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚡', cx, cy)
  }

  useEffect(() => {
    drawWheel(0)
  }, [])

  const handleSpin = async () => {
    if (spinning) return
    setSpinning(true)
    setPrize(null)

    try {
      const res = await axios.post(`${API_URL}/spin`, {
        telegramId: TELEGRAM_ID,
      })
      const result = res.data

      const totalRotation = (5 + Math.random() * 3) * 2 * Math.PI
      const start = performance.now()
      const duration = 4500
      const startRot = rotationRef.current

      const animate = (now: number) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const ease = 1 - Math.pow(1 - progress, 4)
        const current = startRot + totalRotation * ease
        rotationRef.current = current
        drawWheel(current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setSpinning(false)
          setPrize(result.prize)
        }
      }

      requestAnimationFrame(animate)
    } catch (err: any) {
      setSpinning(false)
      alert(err.response?.data?.message || 'Помилка')
    }
  }

  if (prize) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at 50% 30%, #0a2a0a 0%, #0D0D0D 65%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        gap: '24px',
      }}>
        {/* Заголовок */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22 }}>⚡</span>
          <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
        </div>

        <p style={{ color: '#888', fontSize: 15 }}>Твій приз:</p>

        {/* Круг с призом */}
        <div style={{
          width: 200, height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #1e5c1e, #0a1f0a)',
          border: '3px solid #39FF14',
          boxShadow: '0 0 40px rgba(57,255,20,0.4), 0 0 80px rgba(34,197,94,0.2)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'prizeAppear 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          <div style={{ color: '#39FF14', fontWeight: 800, fontSize: 36, lineHeight: 1 }}>
            {prize.type === 'BONUS_POINTS' ? `+${prize.value}` :
             prize.type === 'DISCOUNT' ? `-${prize.value}%` :
             prize.type === 'FREE_DELIVERY' ? '🚚' :
             prize.type === 'PROMO_CODE' ? `-${prize.value}%` : '🎁'}
          </div>
          <div style={{ color: '#86efac', fontSize: 13, marginTop: 6, textAlign: 'center', padding: '0 16px' }}>
            {prize.type === 'BONUS_POINTS' ? 'бонусів' :
             prize.type === 'DISCOUNT' ? 'знижка' :
             prize.type === 'FREE_DELIVERY' ? 'безкоштовна доставка' :
             prize.type === 'PROMO_CODE' ? 'промокод' : 'Chaser 10мл'}
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 24 }}>Вітаємо!</p>
          <p style={{ color: '#888', marginTop: 6, fontSize: 15 }}>{prize.label}</p>
        </div>

        {/* Кнопки */}
        <button onClick={() => setPrize(null)} style={{
          background: '#22C55E',
          color: '#000',
          fontWeight: 700,
          fontSize: 17,
          padding: '15px 0',
          borderRadius: 50,
          border: 'none',
          cursor: 'pointer',
          width: '100%',
          maxWidth: 320,
          boxShadow: '0 0 20px rgba(34,197,94,0.5)',
        }}>
          Застосувати знижку
        </button>

        <button onClick={() => setPrize(null)} style={{
          background: 'none',
          border: 'none',
          color: '#555',
          cursor: 'pointer',
          fontSize: 14,
        }}>
          Повернутись назад
        </button>

        <style>{`
          @keyframes prizeAppear {
            from { transform: scale(0.3); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 30%, #0a2a0a 0%, #0D0D0D 65%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      gap: '20px',
    }}>
      {/* Заголовок */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
      </div>

      <p style={{ color: '#888', fontSize: 15, textAlign: 'center' }}>
        Крути щодня та вигравай знижки і суперприз!
      </p>

      {/* Стрелка + колесо */}
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute',
          top: -18,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '13px solid transparent',
          borderRight: '13px solid transparent',
          borderTop: '26px solid #39FF14',
          filter: 'drop-shadow(0 0 6px #39FF14)',
          zIndex: 10,
        }} />
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{ borderRadius: '50%', display: 'block' }}
        />
      </div>

      {/* Кнопка */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        style={{
          background: spinning ? '#166534' : '#22C55E',
          color: spinning ? '#86efac' : '#000',
          fontWeight: 700,
          fontSize: 18,
          padding: '16px 0',
          borderRadius: 50,
          border: 'none',
          cursor: spinning ? 'not-allowed' : 'pointer',
          width: '100%',
          maxWidth: 320,
          boxShadow: spinning ? 'none' : '0 0 24px rgba(34,197,94,0.6)',
          transition: 'all 0.3s',
        }}>
        {spinning ? 'Крутиться...' : 'Крутити колесо'}
      </button>
    </div>
  )
}