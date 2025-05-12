import { error, json } from '@sveltejs/kit';
import { VERCEL_TOKEN } from '$env/static/private';

export async function GET({ params }) {
  const { id } = params;

  const res = await fetch(`https://api.vercel.com/v6/deployments/${id}`, {
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`
    }
  });

  if (!res.ok) {
    console.error(await res.text());
    throw error(500, 'Failed to fetch deployment status');
  }

  const data = await res.json();

  return json({
    state: data.state ?? 'unknown',
    url: data.url ?? ''
  });
}
