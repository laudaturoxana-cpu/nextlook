'use client'

import { useEffect, useState } from 'react'

interface Particle {
  id: number
  left: string
  delay: string
  duration: string
  size: number
  type: 'gold' | 'olive'
}

export default function GoldParticles({ count = 20 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 4}s`,
      duration: `${3 + Math.random() * 2}s`,
      size: 2 + Math.random() * 2,
      // Mix of gold and olive particles (roughly 60% gold, 40% olive)
      type: Math.random() > 0.4 ? 'gold' : 'olive' as 'gold' | 'olive',
    }))
    setParticles(newParticles)
  }, [count])

  return (
    <div className="gold-particles">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className={particle.type === 'gold' ? 'gold-particle' : 'olive-particle'}
          style={{
            left: particle.left,
            bottom: 0,
            animationDelay: particle.delay,
            animationDuration: particle.duration,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  )
}
