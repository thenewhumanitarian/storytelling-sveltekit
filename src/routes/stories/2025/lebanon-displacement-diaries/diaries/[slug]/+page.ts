import { useStoryblokApi } from "@storyblok/svelte";
import { useStoryblok } from "$lib/utils/storyblok";
import { PUBLIC_ACCESS_TOKEN, PUBLIC_REGION } from "$env/static/public";
import { apiPlugin, storyblokInit } from "@storyblok/svelte";

export const prerender = true;
export const ssr = true;

/** You must call storyblokInit before calling useStoryblokApi */
function initStoryblok() {
  storyblokInit({
    accessToken: PUBLIC_ACCESS_TOKEN,
    use: [apiPlugin],
    apiOptions: {
      https: true,
      cache: { type: "memory" },
      region: PUBLIC_REGION || "eu",
    },
  });
}

export async function entries() {
  initStoryblok(); // no await needed
  const api = await useStoryblokApi();
  const res = await api.get("cdn/stories", {
    starts_with: "diaries/",
    version: "published",
  });

  return res.data.stories.map((story: any) => ({
    slug: story.slug.replace("diaries/", ""),
  }));
}

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const slug = params.slug ?? "home";
  useStoryblok(); // your own utility (should call storyblokInit)

  const api = await useStoryblokApi();

  try {
    const res = await api.get(`cdn/stories/diaries/${slug}`, {
      version: "published",
    });

    return {
      story: res.data.story || null,
      error: false,
    };
  } catch (error) {
    console.error("Storyblok API error:", error);
    return {
      story: null,
      error,
    };
  }
}
