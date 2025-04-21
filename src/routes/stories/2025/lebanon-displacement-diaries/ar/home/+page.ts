import type { PageLoad } from './$types';
import { useStoryblokApi } from '@storyblok/svelte';
import { initStoryblok } from '$lib/utils/storyblok';

export const prerender = true;
export const ssr = true;

export const load: PageLoad = async () => {
  initStoryblok(); // Ensure SB is ready

  const api = await useStoryblokApi();
  const isDev = process.env.NODE_ENV === 'development';
  const version = isDev ? 'draft' : 'published';

  try {
    const res = await api.get(`cdn/stories/home`, {
      version,
      language: 'ar'
    });

    return {
      story: res.data.story
    };
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
