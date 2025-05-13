import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';

import type { PageLoad } from './$types';
import { loadStaticPage } from '$lib/utils/storyblok';

export const prerender = PUBLIC_ENABLE_VISUAL_EDITOR !== 'true';
export const ssr = PUBLIC_ENABLE_VISUAL_EDITOR !== 'true';

export const load: PageLoad = async () => {
  try {
    const story = await loadStaticPage('about', 'en');

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
