import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // ✅ Only use searchParams logic when not prerendering
  if (!event.isPrerendering) {
    const url = event.url;
    const isStoryblokEditor =
      url.searchParams.has('_storyblok') ||
      url.searchParams.has('editor') ||
      url.pathname.includes('__storyblok');

    if (isStoryblokEditor) {
      event.setHeaders({
        'cache-control': 'no-store'
      });
    }
  }

  const response = await resolve(event);

  // ✅ This fallback is fine to keep during prerender
  if (response.status === 404 && event.url.pathname.endsWith('/')) {
    try {
      const staticPath = event.url.pathname + 'index.html';
      const fallbackResponse = await event.fetch(staticPath);

      if (fallbackResponse.ok) {
        return new Response(await fallbackResponse.text(), {
          headers: { 'Content-Type': 'text/html' }
        });
      }
    } catch (err) {
      console.error('Error fetching static file:', err);
    }
  }

  return response;
};
