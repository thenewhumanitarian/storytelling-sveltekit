<script lang="ts">
	import { inview } from 'svelte-inview';
	import { openLightbox } from '$lib/stores/lightbox';
	import ResponsiveImage from './ResponsiveImage.svelte';

	let visible = $state(false);

	const images = [
		{
			src: '/images/cleared/villages/ashudubi.jpg',
			alt: 'Demolished homes in Ashudubi, Betbari',
			caption: 'Ashudubi, Betbari \u2014 900 homes demolished'
		},
		{
			src: '/images/cleared/villages/charuabakhra.jpg',
			alt: 'Demolished homes in Charuabakhra',
			caption: 'Charuabakhra \u2014 1,000 homes demolished'
		},
		{
			src: '/images/cleared/villages/doloni-pathar.jpg',
			alt: 'Demolished homes in Doloni Pathar',
			caption: 'Doloni Pathar \u2014 700 homes demolished'
		},
		{
			src: '/images/cleared/villages/sontoshpur.jpg',
			alt: 'Demolished homes in Sontoshpur',
			caption: 'Sontoshpur \u2014 440 homes demolished'
		},
		{
			src: '/images/cleared/villages/kandapara.jpg',
			alt: 'Demolished homes in Kandapara Bosti',
			caption: 'Kandapara Bosti \u2014 700 homes demolished'
		},
		{
			src: '/images/cleared/villages/luptachar.jpg',
			alt: 'Demolished homes in Dubapara Luptachar',
			caption: 'Dubapara Luptachar \u2014 522 homes demolished'
		}
	];
</script>

<section
	class="gallery-section"
	use:inview={{ rootMargin: '-20% 0px' }}
	oninview_change={(e) => (visible = e.detail.inView)}
>
	<div class="gallery-content">
		<h2 class="gallery-heading">Across Assam, the bulldozers have left their mark.</h2>
		<p class="gallery-subtitle">We travelled to 20 villages to document what remains.</p>
		<div class="gallery-grid">
			{#each images as image, i}
				<div class="gallery-card" class:visible style="--delay: {i * 80}ms">
					<button
						type="button"
						class="lightbox-trigger"
						data-lightbox
						data-lightbox-src={image.src}
						data-lightbox-type="image"
						data-lightbox-caption={image.caption}
						onclick={() => openLightbox(image.src)}
					>
						<ResponsiveImage src={image.src} alt={image.alt} sizes="(max-width: 640px) 100vw, 320px" />
					</button>
					<p class="image-caption">{image.caption}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.gallery-section {
		background: #f5f0eb;
		padding: 3.5rem 1.5rem;
	}

	@media screen and (max-width: 500px) {
		.gallery-section {
			padding: 1.5rem;
		}
	}

	.gallery-content {
		max-width: 42rem;
		margin: 0 auto;
	}

	.gallery-heading {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.5rem, 3.5vw, 2rem);
		font-weight: 600;
		color: #1a1a1a;
		margin: 0 0 0.75rem 0;
		line-height: 1.4;
	}

	.gallery-subtitle {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1.1rem;
		color: #6b6b6b;
		margin: 0 0 2rem 0;
		line-height: 1.5;
	}

	.gallery-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1.25rem;
	}

	.gallery-card {
		overflow: hidden;
		opacity: 0;
		transform: translateY(20px);
		transition:
		opacity 0.5s ease,
		transform 0.5s ease;
		transition-delay: var(--delay);
		/* border: 1px solid rgba(0, 0, 0, 0.06); */
		/* Marc's note: This is to remove the border radius from the gallery card so it matches TNH design pattern */
		/* border-radius: 4px; */
	}

	.gallery-card.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.lightbox-trigger {
		display: block;
		width: 100%;
		padding: 0;
		border: none;
		background: none;
		cursor: zoom-in;
		overflow: hidden;
	}

	.gallery-card :global(img) {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		display: block;
	}

	/* Marc's note: Aligned with EditorialGallery figcaption for consistency */
	.image-caption {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1rem;
		color: #282828;
		padding: 0.5rem 0.75rem;
		background: rgba(230, 230, 230, 0.8);
		margin: 0;
		line-height: 1.4;
	}

	@media (max-width: 640px) {
		.gallery-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
	}
</style>
