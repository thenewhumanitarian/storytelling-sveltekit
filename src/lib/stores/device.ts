import { readable } from 'svelte/store';

function createIsMobileStore(breakpoint = 640) {
  return readable(false, (set) => {
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
