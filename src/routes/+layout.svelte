<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<main data-iframe-height={true}>
	{@render children()}
</main>

<script src="/scripts/iframeResizer.contentWindow.min.js" defer></script>
