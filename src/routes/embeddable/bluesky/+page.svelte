<!--
  Embeds the Bluesky profile for @newhumanitarian.bsky.social using the bsky-embed web component.
  See: https://bsky.app/profile/newhumanitarian.bsky.social
-->

<script>
	import { onMount } from 'svelte';
	// Dynamically import the Bluesky embed web component on mount.
	onMount(async () => {
		// @ts-expect-error: No type definitions for bsky-embed web component
		await import('bsky-embed/dist/bsky-embed.es.js');
		// Dynamic height for SharePoint embedding
		const resize = () => {
			window.parent.postMessage({
				type: 'resize',
				height: document.body.scrollHeight
			}, '*');
		};
		window.addEventListener('load', resize);
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
