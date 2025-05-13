import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // 🧠 Detect if this is a Storyblok Visual Editor request
  const isStoryblokEditor =
    event.url.searchParams.has('_storyblok') ||
    event.url.searchParams.has('editor') ||
    event.url.pathname.includes('/__storyblok');

  // 🛑 Disable caching for Storyblok preview requests
  if (isStoryblokEditor) {
    event.setHeaders({
      'cache-control': 'no-store'
    });
  }

  const response = await resolve(event);

  // ✅ 404 fallback: attempt to serve index.html for directory-style routes
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
