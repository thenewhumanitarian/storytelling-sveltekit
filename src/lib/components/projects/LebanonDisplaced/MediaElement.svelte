<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		blok: any; // Todo: Define type here
	}

	let { blok = {} }: Props = $props();
</script>

<div use:storyblokEditable={blok && blok._editable ? blok : undefined}>
	<FadeIn isAbsolute={true} blurAmount={10} duration={1000} yOffset={0} xOffset={-50}>
		<img
			src={`${blok.media.filename}`}
			class="absolute h-full w-full object-contain pb-10 pl-8 pr-8 pt-12"
			alt={`${blok.media.alt}`}
		/>
	</FadeIn>
</div>
