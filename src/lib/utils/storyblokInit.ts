import { storyblokInit, apiPlugin, useStoryblokApi } from '@storyblok/svelte';
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from '$env/static/public';

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

let initialized = false;

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
