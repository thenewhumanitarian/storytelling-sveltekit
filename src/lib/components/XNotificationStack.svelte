<script lang="ts">
	import XNotification from './XNotification.svelte';

	interface Tweet {
		id: string;
		text: string;
		date: string;
		link: string;
	}

	// Default tweets - 3 most impactful, truncated for mobile readability
	const defaultTweets: Tweet[] = [
		{
			id: '2008539054044823637',
			text: 'Mess Around and Find Out! You don\'t encroach on our lands, our culture and then cry victim when the JCBs arrive. The eviction drive will spare no one.',
			date: 'Jan 6, 2026',
			link: 'https://x.com/himantabiswa/status/2008539054044823637'
		},
		{
			id: '1966415643126972911',
			text: 'We will hunt down every illegal infiltrator and send them back to their origins. Assam is NOT your breeding ground.',
			date: 'Sep 12, 2025',
			link: 'https://x.com/himantabiswa/status/1966415643126972911'
		},
		{
			id: '1944386602626699579',
			text: 'There is a concerted effort to change the demography of our constituencies.',
			date: 'Jul 13, 2025',
			link: 'https://x.com/himantabiswa/status/1944386602626699579'
		}
	];

	interface Props {
		tweets?: Tweet[];
		autoTrigger?: boolean;
		triggerDelay?: number;
		externalTrigger?: boolean;
		onAnimationComplete?: () => void;
	}

	let {
		tweets = defaultTweets,
		autoTrigger = true,
		triggerDelay = 500,
		externalTrigger = false,
		onAnimationComplete
	}: Props = $props();

	let animationStarted = $state(false);

	$effect(() => {
		if ((externalTrigger || (autoTrigger && !externalTrigger)) && !animationStarted) {
			const totalDuration = (tweets.length - 1) * 3 * 200 + 500;
			const timerId = setTimeout(() => {
				animationStarted = true;
			}, triggerDelay);
			let completionTimerId: ReturnType<typeof setTimeout> | undefined;
			if (onAnimationComplete) {
				completionTimerId = setTimeout(onAnimationComplete, triggerDelay + totalDuration);
			}
			return () => {
				clearTimeout(timerId);
				if (completionTimerId) clearTimeout(completionTimerId);
			};
		}
	});
</script>

<div class="x-notification-stack">
	{#each tweets as tweet, index}
		<XNotification {tweet} {index} {animationStarted} />
	{/each}
</div>

<style>
	.x-notification-stack {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 24px 16px;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
	}
</style>
