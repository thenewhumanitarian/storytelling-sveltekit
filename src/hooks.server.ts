export async function handle({ event, resolve }) {
  const response = await resolve(event);

  // If a 404 occurs and the path ends with a slash, try fetching an `index.html`
  if (response.status === 404 && event.url.pathname.endsWith('/')) {
    try {
      // Use `event.fetch()` to properly fetch static files
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
}
