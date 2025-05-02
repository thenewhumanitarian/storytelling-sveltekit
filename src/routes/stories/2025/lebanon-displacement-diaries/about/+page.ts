import type { PageLoad } from './$types';
import { loadStaticPage } from '$lib/utils/storyblok';

export const prerender = true;
export const ssr = true;

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
