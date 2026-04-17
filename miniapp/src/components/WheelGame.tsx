import { useState, useRef } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:3000'

const PRIZES = [
  { label: 'Знижка 5%',   color: '#1a4a1a' },
  { label: 'Знижка 10%',  color: '#1e5c1e' },
  { label: '50 бонусів',  color: '#1a4a1a' },
  { label: '100 бонусів', color: '#1e5c1e' },
  { label: 'Доставка',    color: '#1a4a1a' },
  { label: '-15%',        color: '#1e5c1e' },
  { label: '-25%',        color: '#1a4a1a' },
  { label: '200 бонусів', color: '#1e5c1e' },
  { label: '25 бонусів',  color: '#1a4a1a' },
  { label: '🎯 Chaser',   color: '#0d3d0d' },
]

const TELEGRAM_ID = '123456789' // потом заменим на реальный

export default function WheelGame() {
  const [spinning, setSpinning] = useState(false)
  const [prize, setPrize] = useState<any>(null)
  const [rotation, setRotation] = useState(0)
  const wheelRef = useRef<HTMLCanvasElement>(null)

  const drawWheel = (canvas: HTMLCanvasElement, currentRotation: number) => {
    const ctx = canvas.getContext('2d')!
    const size = canvas.width
    const center = size / 2
    const radius = center - 10
    const segmentAngle = (2 * Math.PI) / PRIZES.length

    ctx.clearRect(0, 0, size, size)

    PRIZES.forEach((p, i) => {
      const startAngle = i * segmentAngle + currentRotation
      const endAngle = startAngle + segmentAngle

      // Сегмент
      ctx.beginPath()
      ctx.moveTo(center, center)
      ctx.arc(center, center, radius, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = p.color
      ctx.fill()
      ctx.strokeStyle = '#39FF14'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Текст
      ctx.save()
      ctx.translate(center, center)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#39FF14'
      ctx.font = 'bold 13px sans-serif'
      ctx.fillText(p.label, radius - 10, 5)
      ctx.restore()
    })

    // Центральное кольцо
    ctx.beginPath()
    ctx.arc(center, center, 36, 0, 2 * Math.PI)
    ctx.fillStyle = '#0D0D0D'
    ctx.fill()
    ctx.strokeStyle = '#39FF14'
    ctx.lineWidth = 3
    ctx.stroke()

    // Молния в центре
    ctx.fillStyle = '#39FF14'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('⚡', center, center)

    // Внешнее кольцо
    ctx.beginPath()
    ctx.arc(center, center, radius, 0, 2 * Math.PI)
    ctx.strokeStyle = '#39FF14'
    ctx.lineWidth = 3
    ctx.stroke()
  }

  const canvasRef = (canvas: HTMLCanvasElement | null) => {
    if (canvas) {
      (wheelRef as any).current = canvas
      drawWheel(canvas, 0)
    }
  }

  const handleSpin = async () => {
    if (spinning) return
    setSpinning(true)
    setPrize(null)

    try {
      const res = await axios.post(`${API_URL}/spin`, {
        telegramId: TELEGRAM_ID,
      })

      const result = res.data
      const canvas = wheelRef.current!

      // Анімація — 5+ обертів + рандомний кут
      const spins = 5 + Math.random() * 3
      const targetDeg = spins * 360 + Math.random() * 360
      const targetRad = (targetDeg * Math.PI) / 180

      let start: number | null = null
      const duration = 4000

      const animate = (timestamp: number) => {
        if (!start) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        // Easing
        const ease = 1 - Math.pow(1 - progress, 4)
        const current = rotation + targetRad * ease

        drawWheel(canvas, current)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setRotation(current % (2 * Math.PI))
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
      <div className="flex flex-col items-center justify-center min-h-screen p-6"
           style={{ background: 'radial-gradient(ellipse at center, #0a2a0a 0%, #0D0D0D 70%)' }}>
        <div className="prize-card flex flex-col items-center gap-6">
          {/* Иконка молнии */}
          <div className="flex items-center gap-2">
            <span style={{ color: '#39FF14', fontSize: 24 }}>⚡</span>
            <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
          </div>

          <p style={{ color: '#aaa' }}>Твій приз:</p>

          {/* Приз */}
          <div className="flex items-center justify-center"
               style={{
                 width: 180, height: 180,
                 borderRadius: '50%',
                 background: 'radial-gradient(circle, #1a5c1a, #0a2a0a)',
                 border: '3px solid #39FF14',
                 boxShadow: '0 0 40px #22C55E',
               }}>
            <div className="text-center">
              <div style={{ color: '#39FF14', fontWeight: 800, fontSize: 32 }}>
                {prize.type === 'BONUS_POINTS' ? `+${prize.value}` : 
                 prize.type === 'DISCOUNT' ? `-${prize.value}%` :
                 prize.type === 'FREE_DELIVERY' ? '🚚' :
                 prize.type === 'PROMO_CODE' ? `-${prize.value}%` : '🎁'}
              </div>
              <div style={{ color: '#86efac', fontSize: 13, marginTop: 4 }}>
                {prize.type === 'BONUS_POINTS' ? 'бонусів' :
                 prize.type === 'DISCOUNT' ? 'знижка' :
                 prize.type === 'FREE_DELIVERY' ? 'доставка' :
                 prize.type === 'PROMO_CODE' ? 'промокод' : 'Chaser 10мл'}
              </div>
            </div>
          </div>

          <div className="text-center">
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 22 }}>Вітаємо!</p>
            <p style={{ color: '#aaa', marginTop: 4 }}>{prize.label}</p>
          </div>

          <button
            onClick={() => setPrize(null)}
            style={{
              background: '#22C55E',
              color: '#000',
              fontWeight: 700,
              fontSize: 16,
              padding: '14px 40px',
              borderRadius: 50,
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              maxWidth: 300,
            }}>
            Застосувати знижку
          </button>

          <button
            onClick={() => setPrize(null)}
            style={{ color: '#666', background: 'none', border: 'none', cursor: 'pointer' }}>
            Повернутись назад
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6"
         style={{ background: 'radial-gradient(ellipse at center, #0a2a0a 0%, #0D0D0D 70%)' }}>

      {/* Заголовок */}
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: '#39FF14', fontSize: 24 }}>⚡</span>
        <span style={{ color: '#39FF14', fontWeight: 700, fontSize: 20 }}>Колесо призів</span>
      </div>

      <p style={{ color: '#aaa', marginBottom: 32, textAlign: 'center' }}>
        Крути щодня та вигравай знижки і суперприз!
      </p>

      {/* Колесо */}
      <div style={{ position: 'relative', marginBottom: 32 }}>
        {/* Стрелка */}
        <div style={{
          position: 'absolute', top: -16, left: '50%',
          transform: 'translateX(-50%)',
          width: 0, height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderTop: '24px solid #39FF14',
          zIndex: 10,
          filter: 'drop-shadow(0 0 8px #39FF14)',
        }} />

        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          style={{
            borderRadius: '50%',
            boxShadow: spinning
              ? '0 0 60px #22C55E, 0 0 120px #15803D'
              : '0 0 30px #15803D',
            transition: 'box-shadow 0.3s',
          }}
        />
      </div>

      {/* Кнопка */}
      <button
        onClick={handleSpin}
        disabled={spinning}
        style={{
          background: spinning ? '#15803D' : '#22C55E',
          color: '#000',
          fontWeight: 700,
          fontSize: 18,
          padding: '16px 48px',
          borderRadius: 50,
          border: 'none',
          cursor: spinning ? 'not-allowed' : 'pointer',
          width: '100%',
          maxWidth: 300,
          boxShadow: spinning ? 'none' : '0 0 20px #22C55E',
          transition: 'all 0.3s',
        }}>
        {spinning ? 'Крутиться...' : 'Крутити колесо'}
      </button>
    </div>
  )
}