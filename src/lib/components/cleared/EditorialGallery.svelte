<script lang="ts">
	import { inview } from 'svelte-inview';

	interface GalleryImage {
		src: string;
		alt: string;
		caption?: string;
	}

	interface Props {
		images: GalleryImage[];
	}

	let { images }: Props = $props();
	let visible = $state(false);
</script>

<div
	class="editorial-gallery"
	use:inview={{ rootMargin: '-15% 0px' }}
	oninview_change={(e) => { if (e.detail.inView) visible = true; }}
>
	<div class="gallery-grid" class:layout-2={images.length === 2} class:layout-3={images.length === 3} class:layout-4={images.length >= 4}>
		{#each images as image, i}
			<figure class="gallery-item item-{i}" class:visible style="--delay: {i * 120}ms">
				<img src={image.src} alt={image.alt} loading="lazy" />
				{#if image.caption}
					<figcaption>{image.caption}</figcaption>
				{/if}
			</figure>
		{/each}
	</div>
</div>

<style>
	.editorial-gallery {
		margin: 2.5rem 0;
	}

	.gallery-grid {
		display: grid;
		gap: 0.75rem;
	}

	/* 2-image layout: large + small stacked */
	.gallery-grid.layout-2 {
		grid-template-columns: 1.4fr 1fr;
		grid-template-rows: auto;
	}

	.layout-2 .item-0 {
		grid-row: 1;
	}

	.layout-2 .item-0 img {
		aspect-ratio: 4 / 5;
	}

	.layout-2 .item-1 img {
		aspect-ratio: 3 / 4;
	}

	/* 3-image layout: one tall left, two stacked right */
	.gallery-grid.layout-3 {
		grid-template-columns: 1.2fr 1fr;
		grid-template-rows: 1fr 1fr;
	}

	.layout-3 .item-0 {
		grid-row: 1 / 3;
	}

	.layout-3 .item-0 img {
		aspect-ratio: 3 / 4;
		height: 100%;
	}

	.layout-3 .item-1 img,
	.layout-3 .item-2 img {
		aspect-ratio: 16 / 10;
	}

	/* 4+ image layout: asymmetric mosaic */
	.gallery-grid.layout-4 {
		grid-template-columns: 1fr 1fr 1fr;
		grid-template-rows: auto auto;
	}

	.layout-4 .item-0 {
		grid-column: 1 / 3;
	}

	.layout-4 .item-0 img {
		aspect-ratio: 16 / 10;
	}

	.layout-4 .item-1 img {
		aspect-ratio: 3 / 4;
	}

	.layout-4 .item-2 img {
		aspect-ratio: 4 / 3;
	}

	.layout-4 .item-3 {
		grid-column: 2 / 4;
	}

	.layout-4 .item-3 img {
		aspect-ratio: 16 / 10;
	}

	/* Gallery items */
	.gallery-item {
		margin: 0;
		overflow: hidden;
		border-radius: 3px;
		opacity: 0;
		transform: translateY(16px);
		transition:
			opacity 0.6s ease,
			transform 0.6s ease;
		transition-delay: var(--delay);
	}

	.gallery-item.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.gallery-item img {
		width: 100%;
		object-fit: cover;
		display: block;
	}

	figcaption {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.8rem;
		color: #6b6b6b;
		line-height: 1.4;
		padding: 0.5rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	@media (max-width: 640px) {
		.gallery-grid.layout-2,
		.gallery-grid.layout-3,
		.gallery-grid.layout-4 {
			grid-template-columns: 1fr;
			grid-template-rows: auto;
		}

		.layout-3 .item-0,
		.layout-4 .item-0,
		.layout-4 .item-3 {
			grid-column: auto;
			grid-row: auto;
		}

		.gallery-item img {
			aspect-ratio: 16 / 10 !important;
			height: auto !important;
		}
	}
</style>
