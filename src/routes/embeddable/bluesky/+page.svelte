<script>
	import { onMount } from 'svelte';

	onMount(async () => {
		// Dynamically import the Bluesky web component
		await import('bsky-embed/dist/bsky-embed.es.js');

		const resize = () => {
			window.parent.postMessage(
				{
					type: 'resize',
					height: document.documentElement.scrollHeight
				},
				'*'
			);
		};

		// Trigger resize after content has rendered
		setTimeout(resize, 100); // debounce in case of layout shift
		window.addEventListener('resize', resize);
	});
</script>

<!--
  Accessible Bluesky embed for @newhumanitarian.bsky.social.
  Renders a feed of the latest 5 posts with load more enabled.
-->
<bsky-embed
	username="newhumanitarian.bsky.social"
	limit="3"
	load-more="true"
	aria-label="Latest posts from The New Humanitarian on Bluesky"
></bsky-embed>
