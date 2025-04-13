<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	function openLightbox() {
		console.log('Clicked on media element');

		lightboxItems.update((items) => {
			const currentSrc = blok.media.filename;
			const type = blok.media.filename.includes('.mp4') ? 'video' : 'image';

			let index = items.findIndex((i) => i.src === currentSrc);
			if (index === -1) {
				index = items.length;
				items.push({ src: currentSrc, type });
			}
			currentIndex.set(index);
			return items;
		});
	}

	interface Props {
		blok: any; // Todo: Define type here
	}

	let { blok = {} }: Props = $props();
</script>

<button
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class="media-element relative flex cursor-pointer items-center justify-center"
	onclick={openLightbox}
>
	<!-- Videos -->
	{#if blok.media?.filename.includes('.mp4')}
		<video class="aspect-square" autoplay loop muted playsinline>
			<source src={`${blok.media.filename}`} type="video/mp4" />
		</video>
	{/if}

	<!-- Images -->
	{#if blok.media?.filename.includes('.jpg') || blok.media?.filename.includes('.png')}
		<img src={`${blok.media.filename}`} alt={`${blok.media.alt}`} class="aspect-square" />
	{/if}
</button>

<style>
	.media-element img,
	.media-element video {
		--w: 175px; /* image width */
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
