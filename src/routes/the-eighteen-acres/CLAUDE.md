# The 18 Acres - Article Components

## X Notification Component

A reusable animated notification component that simulates X.com (Twitter) notification cards.

### Location
- **Single notification**: `src/lib/components/XNotification.svelte`
- **Stack container**: `src/lib/components/XNotificationStack.svelte`

### Usage

```svelte
<script>
  import XNotificationStack from '$lib/components/XNotificationStack.svelte';

  let triggered = $state(false);
</script>

<XNotificationStack
  autoTrigger={false}
  triggerDelay={200}
  externalTrigger={triggered}
/>
```

### Props

**XNotificationStack:**
- `tweets` - Array of tweet objects (defaults to 3 curated tweets)
- `autoTrigger` - Start animation on mount (default: true)
- `triggerDelay` - Delay before animation starts in ms (default: 500)
- `externalTrigger` - Boolean to trigger animation externally
- `onAnimationComplete` - Callback when all animations finish

**XNotification:**
- `tweet` - Object with `id`, `text`, `date`, `link`
- `index` - Position in stack (used for stagger timing)
- `animationStarted` - Boolean controlling visibility

### Animation

CSS-based fade-in + slide-up with staggered timing:
- Each card animates 0.6s after the previous
- Uses `cubic-bezier(0.165, 0.84, 0.44, 1)` easing
- Transforms from `translateY(50px)` to `translateY(0)`

### Tweet Data

Default tweets are from `data/hiswanta-tweets.csv`. Current selection (truncated for mobile):
1. "Mess Around and Find Out..." (Jan 6, 2026)
2. "Assam is NOT your breeding ground" (Sep 12, 2025)
3. "Concerted effort to change demography" (Jul 13, 2025)

To customize, pass a `tweets` prop with array of `{id, text, date, link}` objects.
