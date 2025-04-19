// src/lib/utils/initStoryblok.ts
import { storyblokInit, apiPlugin } from "@storyblok/svelte";
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from "$env/static/public";

let initialized = false;

export function initStoryblok() {
  if (initialized) return;
  storyblokInit({
    accessToken: PUBLIC_ACCESS_TOKEN,
    use: [apiPlugin],
    apiOptions: {
      https: true,
      cache: { type: "memory" },
      region: PUBLIC_REGION || "eu",
    },
  });
  initialized = true;
}
