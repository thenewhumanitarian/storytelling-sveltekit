<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	import { onMount } from 'svelte';

	import { lightboxItems, currentIndex, registerMediaElement } from '$lib/stores/lightbox';

	onMount(() => {
		if (blok?.media?.filename) {
			registerMediaElement({
				src: blok.media.filename,
				type: blok.media.filename.includes('.mp4') ? 'video' : 'image'
			});
		}
	});

	function openLightbox() {
		// console.log('Clicked on media element');

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

	console.log(blok);
</script>

<button
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
	class="media-element"
	onclick={openLightbox}
>
	<div class="media-wrapper">
		{#if blok.media?.filename.includes('.mp4')}
			<video class="bg-brown" src={blok.media.filename} autoplay loop muted playsinline />
		{:else}
			<img class="bg-brown" src={blok.media.filename} alt={blok.media.alt} />
		{/if}
	</div>
</button>

<style>
	.media-element {
	cursor: pointer;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	padding: 0;
	background: none;
	border: none;
}

.media-wrapper {
	--w: 175px;
	--r: 1;
	--l: 45px;
	--s: 20px;
	--_d: calc(var(--s) + var(--l));

	width: var(--w);
	height: var(--w); /* Force square container */
	padding: calc(var(--_d) / 2);
	box-sizing: border-box;
	position: relative;

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

.media-wrapper img,
.media-wrapper video {
	width: 100%;
	height: 100%;
	object-fit: contain; /* preserves aspect ratio */
	display: block;
	padding: 0.5rem;
}
</style>
