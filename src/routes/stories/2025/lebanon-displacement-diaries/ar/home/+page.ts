import type { PageLoad } from './$types';
import { loadStaticPage } from '$lib/utils/storyblokInit';

export const prerender = true;
export const ssr = true;

export const load: PageLoad = async () => {
  const slug = 'home';

  try {
    const story = await loadStaticPage(slug, 'ar');
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
