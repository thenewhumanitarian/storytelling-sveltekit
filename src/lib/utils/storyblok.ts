// Import the getContext function from Svelte
import { getContext } from 'svelte';

// Import the readable and derived functions from Svelte
import { readable, derived } from 'svelte/store';

// Import the storyblokEditable function from Storyblok
import { storyblokEditable, useStoryblokApi, apiPlugin, storyblokInit } from '@storyblok/svelte';

// Static imports are safe for prerendering
import Page from '$lib/components/projects/LebanonDisplaced/Page.svelte';
import DetailPage from '$lib/components/projects/LebanonDisplaced/DetailPage.svelte';
import ContentWrapper from '$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte';
import IntroView from '$lib/components/projects/LebanonDisplaced/IntroView.svelte';
import IntroObject from '$lib/components/projects/LebanonDisplaced/IntroObject.svelte';
import HorizontalScrollWrapper from '$lib/components/projects/LebanonDisplaced/HorizontalScrollWrapper.svelte';
import StoryGrid from '$lib/components/projects/LebanonDisplaced/StoryGridWrapper.svelte';
import StoryGridPanel from '$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte';
import FadeIn from '$lib/components/projects/LebanonDisplaced/FadeIn.svelte';
import MouseoverBox from '$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte';
import RichText from '$lib/components/projects/LebanonDisplaced/RichText.svelte';
import MediaElement from '$lib/components/projects/LebanonDisplaced/MediaElement.svelte';
import SoundCite from '$lib/components/projects/LebanonDisplaced/SoundCite.svelte';
import InlineImage from '$lib/components/projects/LebanonDisplaced/InlineImage.svelte';

// Import Access token and region from env variables
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from "$env/static/public";

let initialized = false; // Flag to check if Storyblok is initialized

// Initialize Storyblok with the provided access token and components
export function initStoryblok() {
  if (initialized) return;
  initialized = true;

  storyblokInit({
    accessToken: PUBLIC_ACCESS_TOKEN,
    use: [apiPlugin],
    bridge: false, // disable bridge for SSR
    apiOptions: {
      https: true,
      region: PUBLIC_REGION || 'eu'
    },
    components: {
      page: Page,
      detailPage: DetailPage,
      contentWrapper: ContentWrapper,
      introView: IntroView,
      introObject: IntroObject,
      horizontalScrollWrapper: HorizontalScrollWrapper,
      storyGrid: StoryGrid,
      storyGridPanel: StoryGridPanel,
      fadeInWrapper: FadeIn,
      mouseoverBox: MouseoverBox,
      richText: RichText,
      mediaElement: MediaElement,
      soundCite: SoundCite,
      inlineImage: InlineImage
    }
  });
}

export async function loadStory(slug: string, lang: string = 'en') {
  initStoryblok(); // make sure it's initialized
  const api = await useStoryblokApi();

  const version = process.env.NODE_ENV === 'development' ? 'draft' : 'published';
  const res = await api.get(`cdn/stories/diaries/${slug}`, {
    version,
    language: lang || 'en',
  });

  return res.data.story;
}

export async function loadStaticPage(slug: string, lang: string = 'en') {
  initStoryblok(); // ensure Storyblok is initialized once
  const api = await useStoryblokApi();

  const isDev = process.env.NODE_ENV === 'development';
  const version = isDev ? 'draft' : 'published';

  const res = await api.get(`cdn/stories/${slug}`, {
    version,
    language: lang || 'en',
  });

  return res.data.story;
}

export async function useStoryblok({ bridge = false } = {}) {
  const isClient = typeof window !== 'undefined';

  if (!isClient) {
    storyblokInit({
      accessToken: PUBLIC_ACCESS_TOKEN,
      use: [apiPlugin],
      bridge: false,
      components: {
        page: (await import("$lib/components/projects/LebanonDisplaced/Page.svelte")).default,
        detailPage: (await import("$lib/components/projects/LebanonDisplaced/DetailPage.svelte")).default,
        contentWrapper: (await import("$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte")).default,
        introView: (await import("$lib/components/projects/LebanonDisplaced/IntroView.svelte")).default,
        introObject: (await import("$lib/components/projects/LebanonDisplaced/IntroObject.svelte")).default,
        horizontalScrollWrapper: (await import("$lib/components/projects/LebanonDisplaced/HorizontalScrollWrapper.svelte")).default,
        storyGrid: (await import("$lib/components/projects/LebanonDisplaced/StoryGridWrapper.svelte")).default,
        storyGridPanel: (await import("$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte")).default,
        fadeInWrapper: (await import("$lib/components/projects/LebanonDisplaced/FadeIn.svelte")).default,
        mouseoverBox: (await import("$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte")).default,
        richText: (await import("$lib/components/projects/LebanonDisplaced/RichText.svelte")).default,
        mediaElement: (await import("$lib/components/projects/LebanonDisplaced/MediaElement.svelte")).default,
        soundCite: (await import("$lib/components/projects/LebanonDisplaced/SoundCite.svelte")).default,
        inlineImage: (await import("$lib/components/projects/LebanonDisplaced/InlineImage.svelte")).default,
      },
      apiOptions: {
        https: true,
        cache: { type: "memory" },
        region: PUBLIC_REGION || 'eu',
      }
    });
  } else if (!window.__storyblokInitialized) {
    storyblokInit({
      accessToken: PUBLIC_ACCESS_TOKEN,
      use: [apiPlugin],
      bridge,
      components: {
        page: (await import("$lib/components/projects/LebanonDisplaced/Page.svelte")).default,
        detailPage: (await import("$lib/components/projects/LebanonDisplaced/DetailPage.svelte")).default,
        contentWrapper: (await import("$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte")).default,
        introView: (await import("$lib/components/projects/LebanonDisplaced/IntroView.svelte")).default,
        introObject: (await import("$lib/components/projects/LebanonDisplaced/IntroObject.svelte")).default,
        horizontalScrollWrapper: (await import("$lib/components/projects/LebanonDisplaced/HorizontalScrollWrapper.svelte")).default,
        storyGrid: (await import("$lib/components/projects/LebanonDisplaced/StoryGridWrapper.svelte")).default,
        storyGridPanel: (await import("$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte")).default,
        fadeInWrapper: (await import("$lib/components/projects/LebanonDisplaced/FadeIn.svelte")).default,
        mouseoverBox: (await import("$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte")).default,
        richText: (await import("$lib/components/projects/LebanonDisplaced/RichText.svelte")).default,
        mediaElement: (await import("$lib/components/projects/LebanonDisplaced/MediaElement.svelte")).default,
        soundCite: (await import("$lib/components/projects/LebanonDisplaced/SoundCite.svelte")).default,
        inlineImage: (await import("$lib/components/projects/LebanonDisplaced/InlineImage.svelte")).default,
      },
      apiOptions: {
        https: true,
        cache: { type: "memory" },
        region: PUBLIC_REGION || 'eu',
      }
    });
    window.__storyblokInitialized = true;
  }
}

// Optional reinit for editor context
export async function reinitStoryblok() {
  if (typeof window !== 'undefined') {
    window.__storyblokInitialized = false;
    await useStoryblok({ bridge: true });
  }
}

export function lang() {
  return getContext('lang') as string;
}

// Create a readable store from context (context is available only inside component)
export function createLangStore() {
  const langValue = lang();
  return readable(langValue);
}

export function isArabic() {
  return lang() === 'ar';
}

export function isEnglish() {
  return lang() === 'en';
}

export function createIsRtlStore() {
  return derived(createLangStore(), ($lang) => $lang === 'ar');
}

export function clientOnlyEditable(node: HTMLElement, blok: any) {
  if (typeof window === 'undefined') return;
  return storyblokEditable(node, blok);
}

// This function fetches all story slugs from Storyblok
export async function fetchAllStorySlugs(lang: string = 'en') {
  // 🧠 Ensure Storyblok is initialized before calling useStoryblokApi
  initStoryblok();

  const api = await useStoryblokApi();
  const res = await api.get('cdn/stories', {
    version: 'published',
    starts_with: 'diaries/',
    language: lang,
    per_page: 100,
  });

  interface Story {
    slug: string;
  }

  interface FetchAllStorySlugsResponse {
    data: {
      stories: Story[];
    };
  }

  const typedRes = res as FetchAllStorySlugsResponse;
  return typedRes.data.stories.map((story) => story.slug.replace(/^diaries\//, ''));
}
