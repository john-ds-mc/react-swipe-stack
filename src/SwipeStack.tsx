'use client'

import { useEffect, useState, type CSSProperties, type ReactNode } from 'react'
import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion'

/**
 * A single card in the swipe stack.
 */
export interface SwipeCard {
  /** Unique identifier */
  id: string
  /** Card title */
  title: string
  /** Card description */
  description?: string
  /** Image URLs (click left/right to navigate) */
  images?: string[]
  /** Badge text shown over the image (e.g. price) */
  badge?: string
  /** Extra metadata rendered below the title */
  subtitle?: string
}

export interface SwipeStackProps {
  /** Array of cards to display */
  cards: SwipeCard[]
  /** Called when a card is swiped */
  onSwipe?: (id: string, direction: 'left' | 'right') => void
  /** Called when all cards have been swiped */
  onComplete?: () => void
  /** Text shown on right swipe (default: "YES") */
  likeLabel?: string
  /** Text shown on left swipe (default: "NAH") */
  dislikeLabel?: string
  /** Minimum drag distance to trigger a swipe (default: 100) */
  swipeThreshold?: number
  /** Custom card body renderer — overrides default title/description layout */
  renderBody?: (card: SwipeCard) => ReactNode
  /** Custom image renderer — overrides default img tag */
  renderImage?: (src: string, alt: string) => ReactNode
}

const baseStyles: Record<string, CSSProperties> = {
  wrapper: { maxWidth: 384, margin: '0 auto' },
  container: { position: 'relative', height: 520, marginBottom: 24 },
  backCard: {
    position: 'absolute', inset: 0, background: '#fff', borderRadius: 16,
    border: '1px solid #e5e1db', transform: 'scale(0.97) translateY(8px)',
  },
  card: {
    position: 'absolute', inset: 0, background: '#fff', borderRadius: 16,
    border: '1px solid #e5e1db', overflow: 'hidden', cursor: 'grab',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  imageArea: {
    position: 'relative', height: '60%', background: '#f5f3ef', userSelect: 'none',
  },
  image: { width: '100%', height: '100%', objectFit: 'cover' as const, display: 'block' },
  noImage: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100%', color: '#999', fontSize: 14,
  },
  badge: {
    position: 'absolute', bottom: 12, right: 12,
    background: 'rgba(26,26,26,0.8)', color: '#faf9f6', backdropFilter: 'blur(4px)',
    padding: '4px 12px', borderRadius: 999, fontSize: 14, fontWeight: 600,
  },
  dots: {
    position: 'absolute', bottom: 12, left: 0, right: 0,
    display: 'flex', justifyContent: 'center', gap: 4, pointerEvents: 'none',
  },
  dot: { width: 6, height: 6, borderRadius: '50%', transition: 'all 0.2s' },
  dotActive: { background: '#fff', transform: 'scale(1.25)' },
  dotInactive: { background: 'rgba(255,255,255,0.5)' },
  body: { padding: 20, height: '40%', overflowY: 'auto' as const },
  title: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 12 },
  description: { fontSize: 14, color: '#555', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' },
  overlay: { position: 'absolute', top: 80, fontSize: 48, fontWeight: 700 },
  likeOverlay: { left: 24, color: '#2d936c', transform: 'rotate(-15deg)' },
  dislikeOverlay: { right: 24, color: '#e74c3c', transform: 'rotate(15deg)' },
  buttons: { display: 'flex', justifyContent: 'center', gap: 20 },
  button: {
    width: 56, height: 56, borderRadius: '50%', background: '#fff',
    border: '2px solid #e5e1db', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  counter: { textAlign: 'center', fontSize: 14, color: '#999', marginTop: 16 },
}

export function SwipeStack({
  cards,
  onSwipe,
  onComplete,
  likeLabel = 'YES',
  dislikeLabel = 'NAH',
  swipeThreshold = 100,
  renderBody,
  renderImage,
}: SwipeStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [imageIndex, setImageIndex] = useState(0)

  const currentCard = cards[currentIndex]
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-15, 15])
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5])
  const yesOpacity = useTransform(x, [0, swipeThreshold], [0, 1])
  const noOpacity = useTransform(x, [-swipeThreshold, 0], [1, 0])

  useEffect(() => { setImageIndex(0) }, [currentIndex])

  useEffect(() => {
    if (cards.length > 0 && currentIndex >= cards.length) onComplete?.()
  }, [currentIndex, cards.length, onComplete])

  if (!currentCard) return null

  const images = currentCard.images ?? []

  const advance = (dir: 'left' | 'right') => {
    setDirection(dir)
    onSwipe?.(currentCard.id, dir)
    setTimeout(() => {
      setCurrentIndex(i => i + 1)
      setDirection(null)
      x.set(0)
    }, 300)
  }

  const handleDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > swipeThreshold) {
      advance(info.offset.x > 0 ? 'right' : 'left')
    } else {
      x.set(0)
    }
  }

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return
    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    setImageIndex(i => clickX > rect.width / 2 ? (i + 1) % images.length : (i - 1 + images.length) % images.length)
  }

  return (
    <div style={baseStyles.wrapper}>
      <div style={baseStyles.container}>
        {cards[currentIndex + 1] && <div style={baseStyles.backCard} />}

        <motion.div
          style={{ ...baseStyles.card, x, rotate, opacity } as never}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={direction ? { x: direction === 'right' ? 500 : -500, opacity: 0 } : {}}
        >
          <div style={baseStyles.imageArea} onClick={handleImageClick}>
            {images.length > 0 ? (
              renderImage ? renderImage(images[imageIndex], currentCard.title) : (
                <img src={images[imageIndex]} alt={currentCard.title} style={baseStyles.image} draggable={false} />
              )
            ) : (
              <div style={baseStyles.noImage}>No image</div>
            )}

            {currentCard.badge && <div style={baseStyles.badge}>{currentCard.badge}</div>}

            {images.length > 1 && (
              <div style={baseStyles.dots}>
                {images.map((_, i) => (
                  <div key={i} style={{ ...baseStyles.dot, ...(i === imageIndex ? baseStyles.dotActive : baseStyles.dotInactive) }} />
                ))}
              </div>
            )}
          </div>

          <div style={baseStyles.body}>
            {renderBody ? renderBody(currentCard) : (
              <>
                <div style={baseStyles.title}>{currentCard.title}</div>
                {currentCard.subtitle && <div style={baseStyles.subtitle}>{currentCard.subtitle}</div>}
                {currentCard.description && <p style={baseStyles.description}>{currentCard.description}</p>}
              </>
            )}
          </div>

          <motion.div style={{ ...baseStyles.overlay, ...baseStyles.likeOverlay, opacity: yesOpacity } as never}>
            {likeLabel}
          </motion.div>
          <motion.div style={{ ...baseStyles.overlay, ...baseStyles.dislikeOverlay, opacity: noOpacity } as never}>
            {dislikeLabel}
          </motion.div>
        </motion.div>
      </div>

      <div style={baseStyles.buttons}>
        <button style={baseStyles.button} onClick={() => advance('left')} aria-label="Dislike">
          <svg width="24" height="24" fill="none" stroke="#e74c3c" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <button style={baseStyles.button} onClick={() => advance('right')} aria-label="Like">
          <svg width="24" height="24" fill="none" stroke="#2d936c" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div style={baseStyles.counter}>
        {currentIndex + 1} / {cards.length}
      </div>
    </div>
  )
}
