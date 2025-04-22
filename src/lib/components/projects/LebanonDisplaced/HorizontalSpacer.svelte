<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div style={`height: ${blok.height};`} use:storyblokEditable={blok}></div>
