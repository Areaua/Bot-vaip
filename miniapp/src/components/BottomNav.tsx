interface Props {
  active: string
  onChange: (page: string) => void
}

export default function BottomNav({ active, onChange }: Props) {
  const items = [
    { id: 'home',  icon: '🏠', label: 'Головна' },
    { id: 'wheel', icon: '🎡', label: 'Колесо'  },
    { id: 'shop',  icon: '🛍️', label: 'Магазин' },
    { id: 'profile', icon: '👤', label: 'Профіль' },
  ]

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: '#111',
      borderTop: '1px solid #1f1f1f',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '8px 0 12px',
      zIndex: 100,
    }}>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 4,
            padding: '4px 16px',
          }}>
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          <span style={{
            fontSize: 11,
            color: active === item.id ? '#22C55E' : '#555',
            fontWeight: active === item.id ? 700 : 400,
            transition: 'color 0.2s',
          }}>
            {item.label}
          </span>
          {active === item.id && (
            <div style={{
              width: 4, height: 4,
              borderRadius: '50%',
              background: '#22C55E',
              boxShadow: '0 0 6px #22C55E',
            }} />
          )}
        </button>
      ))}
    </div>
  )
}