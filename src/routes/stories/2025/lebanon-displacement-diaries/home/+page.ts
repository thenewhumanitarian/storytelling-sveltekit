import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';

const visualEditor = PUBLIC_ENABLE_VISUAL_EDITOR === 'true';

export const prerender = !visualEditor;
export const ssr = !visualEditor;

import type { PageLoad } from './$types';
import { loadStaticPage } from '$lib/utils/storyblok';

export const load: PageLoad = async () => {
  try {
    const story = await loadStaticPage('home', 'en');

    return { story };
  } catch (error) {
    console.error('Storyblok fetch error:', error);
    return {
      story: null,
      error: {
        message: 'Failed to load story.'
      }
    };
  }
};
