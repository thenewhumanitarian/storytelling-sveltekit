<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		blok: any; // Todo: Define type here
	}

	let { blok = {} }: Props = $props();
</script>

<div
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class="media-element cursor-pointer"
>
	<FadeIn isAbsolute={true} blurAmount={10} duration={1000} yOffset={0} xOffset={-50}>
		<!-- Videos -->
		{#if blok.media?.filename.includes('.mp4')}
			<video class="absolute h-full w-full object-contain p-0" autoplay loop muted playsinline>
				<source src={`${blok.media.filename}`} type="video/mp4" />
			</video>
		{/if}

		<!-- Images -->
		{#if blok.media?.filename.includes('.jpg') || blok.media?.filename.includes('.png')}
			<img
				src={`${blok.media.filename}`}
				alt={`${blok.media.alt}`}
				class="h-full w-auto object-contain p-0"
			/>
		{/if}
	</FadeIn>
</div>

<style>
	.media-element img, .media-element video {
		--w: 200px; /* image width */
		--r: 1; /* image ratio */
		/* control the tape dimension (adjust to understand) */
		--l: 45px;
		--s: 20px;

		--_d: calc(var(--s) + var(--l));
		width: var(--w);
		padding: calc(var(--_d) / 2);
		box-sizing: border-box;
		aspect-ratio: var(--r);
		object-fit: cover;
		--_g: calc(100% - var(--w) / 2) /
			calc(var(--w) * (1 + 1 / var(--r)) - 2 * (var(--s) + var(--_d)));
		background: repeating-conic-gradient(from 45deg, #0000 0 25%, #0005 0 50%) var(--_g);
		-webkit-mask: repeating-conic-gradient(from 45deg, #000 0 25%, #0005 0 50%) var(--_g);
		clip-path: polygon(
			var(--l) 0,
			var(--_d) var(--s),
			calc(100% - var(--_d)) var(--s),
			calc(100% - var(--l)) 0,
			100% var(--l),
			calc(100% - var(--s)) var(--_d),
			calc(100% - var(--s)) calc(100% - var(--_d)),
			100% calc(100% - var(--l)),
			calc(100% - var(--l)) 100%,
			calc(100% - var(--_d)) calc(100% - var(--s)),
			var(--_d) calc(100% - var(--s)),
			var(--l) 100%,
			0 calc(100% - var(--l)),
			var(--s) calc(100% - var(--_d)),
			var(--s) var(--_d),
			0 var(--l)
		);
	}
</style>
