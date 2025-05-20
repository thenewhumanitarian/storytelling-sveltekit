import { redirect } from '@sveltejs/kit';

export function load() {
  throw redirect(307, '/stories/2025/05/22/lebanon-displacement-diaries/home');
}
