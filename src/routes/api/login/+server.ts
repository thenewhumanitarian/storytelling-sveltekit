import { error } from '@sveltejs/kit';
import { serialize } from 'cookie';
import { LOGIN_USERNAME, LOGIN_PASSWORD } from '$env/static/private';

export async function POST({ request }) {
  const body = await request.json();
  const { username, password } = body;

  console.log('Login submitted:', body);

  console.log('Server sees ENV:', {
    user: LOGIN_USERNAME,
    pass: LOGIN_PASSWORD
  });

  if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
    // Set cookie
    const cookie = serialize('session', 'authenticated', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 2 // 2 hours
    });
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Set-Cookie': cookie }
    });
  }

  throw error(401, 'Invalid credentials');
}
