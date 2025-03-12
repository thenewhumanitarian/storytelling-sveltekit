// @ts-nocheck
// 001 - Import Access token and region from env variables
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from "$env/static/public";
import { apiPlugin, storyblokInit } from "@storyblok/svelte";

export async function useStoryblok(accessToken = "") {
  storyblokInit({
    accessToken: accessToken === "" ? PUBLIC_ACCESS_TOKEN : accessToken,
    use: [apiPlugin],
    bridge: true,
    components: {
      page: (await import("$lib/components/projects/LebanonDisplaced/Page.svelte")).default,
      detailPage: (await import("$lib/components/projects/LebanonDisplaced/DetailPage.svelte")).default,
      contentWrapper: (await import("$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte")).default,
      introView: (await import("$lib/components/projects/LebanonDisplaced/IntroView.svelte")).default,
      horizontalScrollWrapper: (await import("$lib/components/projects/LebanonDisplaced/HorizontalScrollWrapper.svelte")).default,
      storyGrid: (await import("$lib/components/projects/LebanonDisplaced/StoryGridWrapper.svelte")).default,
      storyGridPanel: (await import("$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte")).default,
      fadeInWrapper: (await import("$lib/components/projects/LebanonDisplaced/FadeIn.svelte")).default,
      mouseoverBox: (await import("$lib/components/projects/LebanonDisplaced/MouseoverBox.svelte")).default,
      richText: (await import("$lib/components/projects/LebanonDisplaced/RichText.svelte")).default,
    },
    apiOptions: {
      https: true,
      cache: {
        type: "memory",
      },
      region: PUBLIC_REGION || 'eu',
    },
  });
}
