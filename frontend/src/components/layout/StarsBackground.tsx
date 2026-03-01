import { useMemo } from 'react'

const STAR_COUNT = 40

export default function StarsBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: STAR_COUNT }, (_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * 12
      const duration = 6 + Math.random() * 8
      const size = Math.random() > 0.7 ? 2 : 1
      const opacity = 0.15 + Math.random() * 0.35
      return { id: i, left, delay, duration, size, opacity }
    })
  }, [])

  return (
    <div className="stars-bg" aria-hidden="true">
      {stars.map((s) => (
        <div
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}
