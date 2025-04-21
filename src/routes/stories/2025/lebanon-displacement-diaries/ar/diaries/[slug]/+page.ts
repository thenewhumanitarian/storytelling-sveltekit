// src/routes/your/path/+page.ts
import type { PageLoad } from './$types';
import { loadStory } from '$lib/utils/storyblokInit';

export const prerender = true;
export const ssr = true;

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug ?? 'home';

  try {
    const story = await loadStory(slug, 'ar');
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
