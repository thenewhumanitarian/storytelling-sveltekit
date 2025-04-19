import { useStoryblokApi } from "@storyblok/svelte";
import { initStoryblok } from "$lib/utils/storyblokInit";

export const prerender = true;
export const ssr = true;

export async function entries() {
  initStoryblok(); // ✅ only once
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
  initStoryblok(); // ✅ same shared init
  const slug = params.slug ?? "home";
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
