import { useStoryblok } from "$lib/utils/storyblok";
import { useStoryblokApi } from "@storyblok/svelte";

export const prerender = false; // ❌ Disable prerendering for dynamic routes
export const ssr = true; // ✅ Enable Server-Side Rendering

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const slug = params.slug ?? "home";
  await useStoryblok();
  const storyblokApi = await useStoryblokApi();

  try {
    const response = await storyblokApi.get(`cdn/stories/diaries/${slug}`, {
      version: "draft",
      language: "ar"  // Request the Arabic version
    });

    // console.log("Storyblok API response:", response.data);

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
