import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(307, '/stories/2025/lebanon-displacement-diaries/home');
}
