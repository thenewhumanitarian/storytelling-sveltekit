import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Only run this logic in runtime requests (not during prerendering)
  if (!event.route.id?.startsWith('/_')) {
    const urlString = event.url.toString();
    const isEditor =
      urlString.includes('_storyblok') || urlString.includes('editor=true');

    if (isEditor) {
      event.locals.isEditor = true;
      // optionally set headers or cookies for client JS
    }
  }

  const response = await resolve(event);

  // fallback for missing trailing slash HTML pages in static mode
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
