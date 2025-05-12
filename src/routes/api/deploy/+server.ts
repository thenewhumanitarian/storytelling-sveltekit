import { error, json } from '@sveltejs/kit';
import {
  VERCEL_DEPLOY_HOOK,
  VERCEL_TOKEN,
  VERCEL_PROJECT_ID,
  VERCEL_TEAM_ID
} from '$env/static/private';

export async function POST({ cookies }) {
  if (cookies.get('session') !== 'authenticated') {
    throw error(403, 'Unauthorized');
  }

  if (!VERCEL_DEPLOY_HOOK || !VERCEL_TOKEN || !VERCEL_PROJECT_ID || !VERCEL_TEAM_ID) {
    console.error('Missing env variables');
    throw error(500, 'Missing deployment config');
  }

  // 1. Trigger deployment via webhook
  const deployRes = await fetch(VERCEL_DEPLOY_HOOK, { method: 'POST' });
  if (!deployRes.ok) {
    const err = await deployRes.text();
    console.error('Webhook trigger failed:', err);
    throw error(500, 'Failed to trigger deploy');
  }

  // 2. Wait briefly to allow Vercel to register the deployment
  await new Promise((res) => setTimeout(res, 2000));

  // 3. Get latest deployment under team scope
  const deploymentListRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT_ID}&teamId=${VERCEL_TEAM_ID}&limit=1`,
    {
      headers: {
        Authorization: `Bearer ${VERCEL_TOKEN}`
      }
    }
  );

  if (!deploymentListRes.ok) {
    const err = await deploymentListRes.text();
    console.error('Fetching deployment list failed:', err);
    throw error(500, 'Failed to get deployment ID');
  }

  const { deployments } = await deploymentListRes.json();
  const latest = deployments?.[0];

  if (!latest || !latest.uid || !latest.url) {
    console.error('Malformed deployment data:', latest);
    throw error(500, 'Deployment data missing');
  }

  return json({
    success: true,
    deploymentId: latest.uid,
    url: latest.url
  });
}
