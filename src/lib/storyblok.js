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
      feature: (await import("$lib/../components/Feature.svelte")).default,
      grid: (await import("$lib/../components/Grid.svelte")).default,
      page: (await import("$lib/../components/Page.svelte")).default,
      teaser: (await import("$lib/../components/Teaser.svelte")).default,
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
