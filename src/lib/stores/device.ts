import { readable } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a reactive store that tracks whether the viewport matches a mobile breakpoint.
 * SSR-safe: returns `false` on the server and only activates media query listeners in the browser.
 */
function createIsMobileStore(breakpoint = 640) {
  return readable(false, (set) => {
    // Skip media query setup during SSR
    if (!browser) return;

    const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);

    const update = () => set(mediaQuery.matches);
    mediaQuery.addEventListener('change', update);

    update(); // Set initial value

    return () => {
      mediaQuery.removeEventListener('change', update);
    };
  });
}

export const isMobile = createIsMobileStore();
