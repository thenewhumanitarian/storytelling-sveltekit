import { writable } from 'svelte/store';

export type LightboxItem = {
  src: string;
  type: 'image' | 'video';
};

export const lightboxItems = writable<LightboxItem[]>([]);
export const currentIndex = writable<number | null>(null);
