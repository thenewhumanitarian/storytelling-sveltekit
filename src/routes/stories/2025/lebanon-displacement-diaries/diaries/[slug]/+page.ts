import { useStoryblok } from "$lib/utils/storyblok";
import { useStoryblokApi } from "@storyblok/svelte";

export const prerender = true;
export const ssr = true;

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const slug = params.slug ?? "home";
  useStoryblok(); // No await — ensure sync init

  const storyblokApi = await useStoryblokApi();

  try {
    const response = await storyblokApi.get(`cdn/stories/diaries/${slug}`, {
      version: "published", // ✅ For production/static builds
    });

    return {
      story: response.data.story || null,
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
