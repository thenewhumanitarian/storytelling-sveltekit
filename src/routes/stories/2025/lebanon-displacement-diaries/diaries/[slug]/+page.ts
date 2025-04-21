import type { PageLoad, EntryGenerator } from './$types';
import { loadStory } from '$lib/utils/storyblokInit';
import { fetchAllStorySlugs } from '$lib/utils/storyblok';

export const prerender = true;

export const entries: EntryGenerator = async () => {
  const slugs = await fetchAllStorySlugs('en');
  return slugs.map((slug) => ({ slug }));
};

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug;

  try {
    const story = await loadStory(slug, 'en');
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
