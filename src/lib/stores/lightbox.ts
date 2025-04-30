import { writable } from 'svelte/store';

export type LightboxItem = {
  src: string;
  type: 'image' | 'video';
  caption: string;
  element?: HTMLElement;
  width?: number;
  height?: number;
};

export const lightboxItems = writable<LightboxItem[]>([]);
export const currentIndex = writable<number | null>(null);

export function registerMediaElement(item: LightboxItem) {
  lightboxItems.update((items) => {
    const normalizedCaption = item.caption?.trim() || '';

    const alreadyExists = items.some(
      (i) => i.src === item.src && (i.caption?.trim() || '') === normalizedCaption
    );

    if (!alreadyExists) {
      return [...items, { ...item, caption: normalizedCaption }];
    }

    return items;
  });
}

export function setIndexFromSrc(src: string) {
  lightboxItems.update((items) => {
    const index = items.findIndex((i) => i.src === src);
    if (index !== -1) {
      currentIndex.set(index);
    }
    return items;
  });
}

export function openLightbox(src: string) {
  if (document.body.classList.contains('is-storyblok-editor')) return;

  // Ensure items are built before setting the index
  lightboxItems.set(buildLightboxItemsFromDOM());

  // Give the DOM a tick (optional safety for new content), then set index
  requestAnimationFrame(() => {
    setIndexFromSrc(src);
  });
}

// Helper moved from Lightbox.svelte
function buildLightboxItemsFromDOM(): LightboxItem[] {
  const elements = Array.from(document.querySelectorAll('[data-lightbox]')) as HTMLElement[];
  const seen = new Set<string>();

  return elements
    .map((el) => {
      const src = el.getAttribute('data-lightbox-src') || '';
      if (!src || seen.has(src)) return null;
      seen.add(src);

      return {
        src,
        type: (el.getAttribute('data-lightbox-type') || 'image') as 'image' | 'video',
        width: parseInt(el.getAttribute('data-lightbox-width') || '0', 10),
        height: parseInt(el.getAttribute('data-lightbox-height') || '0', 10),
        caption: el.getAttribute('data-lightbox-caption') || '',
      };
    })
    .filter(Boolean) as LightboxItem[];
}
