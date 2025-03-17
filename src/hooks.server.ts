import fs from 'fs';
import path from 'path';

export async function handle({ event, resolve }) {
  const { url } = event;
  const pathname = url.pathname;
  const staticDir = path.resolve('static');

  // Try resolving requests to static files
  const filePath = path.join(staticDir, pathname, 'index.html');

  if (fs.existsSync(filePath)) {
    return new Response(fs.readFileSync(filePath), {
      headers: { 'Content-Type': 'text/html' }
    });
  }

  return resolve(event);
}
