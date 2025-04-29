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
  console.log(item)
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
