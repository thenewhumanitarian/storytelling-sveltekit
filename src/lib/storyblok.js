// @ts-nocheck
// 001 - Import Access token and region from env variables
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from "$env/static/public";
import { apiPlugin, storyblokInit } from "@storyblok/svelte";

export async function useStoryblok(accessToken = "") {
  // 002 - Calling the storyblokInit from storyblok/svelte package
  storyblokInit({
    // 003 - Loading and using the access token
    accessToken: accessToken === "" ? PUBLIC_ACCESS_TOKEN : accessToken,
    // 004 - Using `apiPlugin` provided by Storyblok SDK to connect to API
    use: [apiPlugin],
    bridge: true,
    // 005 - Listing all the components
    components: {
      page: (await import("$lib/components/projects/LebanonDisplaced/Page.svelte")).default,
      contentWrapper: (await import("$lib/components/projects/LebanonDisplaced/ContentWrapper.svelte")).default,
      richText: (await import("$lib/components/projects/LebanonDisplaced/RichText.svelte")).default,
    },
    apiOptions: {
      https: true,
      cache: {
        type: "memory",
      },
      region: PUBLIC_REGION, // "us" if your space is in US region
    },
  });
}
