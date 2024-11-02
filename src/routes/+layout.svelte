<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	import '@iframe-resizer/child'

	export let data;

	onMount(async () => {
		// Dynamically load the script
		const script = document.createElement('script');
		script.src = '/scripts/iframeResizer.contentWindow.min.js';
		script.defer = true;
		document.body.appendChild(script);
	});
</script>

<main>
	<slot />
</main>
