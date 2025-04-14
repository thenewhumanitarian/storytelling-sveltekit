import { writable } from 'svelte/store';

export type LightboxItem = {
  src: string;
  type: 'image' | 'video';
};

export const lightboxItems = writable<LightboxItem[]>([]);
export const currentIndex = writable<number | null>(null);

export function registerMediaElement(item: LightboxItem) {
  lightboxItems.update((items) => {
    // Avoid duplicates
    if (!items.some((i) => i.src === item.src)) {
      return [...items, item];
    }
    return items;
  });
  // console.log('[Lightbox] Registered media:', item.src);
}
