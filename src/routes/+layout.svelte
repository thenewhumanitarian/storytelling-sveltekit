<script lang="ts">
	import '../tailwind.css';
	import '../app.css';
	import { onMount } from 'svelte';

	// import '@iframe-resizer/child';
	// export let data;

	onMount(async () => {
		// Dynamically load the script
		const script = document.createElement('script');
		script.src = '/scripts/iframeResizer.contentWindow.min.js';
		script.defer = true;
		document.body.appendChild(script);
	});
</script>

<div data-iframe-height={true}>
	<slot />
</div>
