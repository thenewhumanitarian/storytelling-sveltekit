import { PUBLIC_ENABLE_VISUAL_EDITOR } from '$env/static/public';

import type { PageLoad, EntryGenerator } from './$types';
import { loadStory, fetchAllStorySlugs, loadAllStoriesExcept } from '$lib/utils/storyblok';

export const prerender = PUBLIC_ENABLE_VISUAL_EDITOR !== 'true';
export const ssr = PUBLIC_ENABLE_VISUAL_EDITOR !== 'true';

export const entries: EntryGenerator = async () => {
  const slugs = await fetchAllStorySlugs('ar');
  return slugs.map((slug) => ({ slug }));
};

export const load: PageLoad = async ({ params }) => {
  const slug = params.slug;

  try {
    const story = await loadStory(slug, 'ar');
    const relatedDiaries = await loadAllStoriesExcept(slug, 'ar');
    return { story, relatedDiaries };
  } catch (error) {
    console.error('Storyblok fetch error:', error);
    return {
      story: null,
      error: {
        message: 'فشل تحميل القصة.' // Arabic for "Failed to load story."
      }
    };
  }
};
