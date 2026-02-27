# react-swipe-stack

Tinder-style swipeable card stack for React. Drag or tap to swipe through cards with smooth animations.

Built with Framer Motion. No CSS framework required — inline styles work everywhere.

## Install

```bash
npm install john-ds-mc/react-swipe-stack framer-motion
```

## Usage

```tsx
import { SwipeStack } from 'react-swipe-stack'

const cards = [
  {
    id: '1',
    title: 'Victorian conversion in Hackney',
    description: 'Spacious 2-bed flat with original features and a private garden.',
    images: ['/photo1.jpg', '/photo2.jpg'],
    badge: '\u00a32,100/mo',
    subtitle: '2 bed \u00b7 1 bath',
  },
  {
    id: '2',
    title: 'Modern studio near Canary Wharf',
    description: 'Brand new build with concierge, gym, and river views.',
    images: ['/photo3.jpg'],
    badge: '\u00a31,650/mo',
    subtitle: 'Studio',
  },
]

function App() {
  return (
    <SwipeStack
      cards={cards}
      onSwipe={(id, direction) => {
        console.log(`Card ${id} swiped ${direction}`)
      }}
      onComplete={() => {
        console.log('All cards swiped!')
      }}
    />
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cards` | `SwipeCard[]` | required | Array of cards to display |
| `onSwipe` | `(id, direction) => void` | - | Called on each swipe |
| `onComplete` | `() => void` | - | Called when all cards are swiped |
| `likeLabel` | `string` | `"YES"` | Text overlay on right swipe |
| `dislikeLabel` | `string` | `"NAH"` | Text overlay on left swipe |
| `swipeThreshold` | `number` | `100` | Min drag distance to trigger swipe |
| `renderBody` | `(card) => ReactNode` | - | Custom card body renderer |
| `renderImage` | `(src, alt) => ReactNode` | - | Custom image renderer (e.g. Next.js Image) |

## Card shape

```ts
interface SwipeCard {
  id: string
  title: string
  description?: string
  images?: string[]    // click left/right to navigate
  badge?: string       // overlay on image (e.g. price)
  subtitle?: string    // shown below title
}
```

## Custom rendering

Use `renderBody` to fully control the card content:

```tsx
<SwipeStack
  cards={cards}
  renderBody={(card) => (
    <div>
      <h2>{card.title}</h2>
      <StarRating value={card.rating} />
      <p>{card.description}</p>
    </div>
  )}
/>
```

Use `renderImage` for framework-specific image components:

```tsx
import Image from 'next/image'

<SwipeStack
  cards={cards}
  renderImage={(src, alt) => (
    <Image src={src} alt={alt} fill style={{ objectFit: 'cover' }} />
  )}
/>
```

## License

MIT
