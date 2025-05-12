import { serialize } from 'cookie';
export function GET() {
  const cookie = serialize('session', '', {
    path: '/',
    maxAge: 0
  });
  return new Response(null, {
    status: 302,
    headers: {
      'Set-Cookie': cookie,
      'Location': '/login'
    }
  });
}
