<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<script type="text/javascript" src="/scripts/iframeResizer.contentWindow.min.js"></script>
</svelte:head>

<main data-iframe-height={true}>
	{@render children()}
</main>
