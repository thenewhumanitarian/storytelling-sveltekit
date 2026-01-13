<script>
	import { inview } from 'svelte-inview';

	let visible = $state(false);

	const images = [
		{
			src: '/images/cleared/villages/ashudubi.jpg',
			alt: 'Ashudubi, Betbari - 900 homes demolished'
		},
		{
			src: '/images/cleared/villages/charuabakhra.jpg',
			alt: 'Charuabakhra - 1,000 homes demolished'
		},
		{
			src: '/images/cleared/villages/doloni-pathar.jpg',
			alt: 'Doloni Pathar - 700 homes demolished'
		},
		{
			src: '/images/cleared/villages/sontoshpur.jpg',
			alt: 'Sontoshpur - 440 homes demolished'
		},
		{
			src: '/images/cleared/villages/kandapara.jpg',
			alt: 'Kandapara Bosti - 700 homes demolished'
		},
		{
			src: '/images/cleared/villages/luptachar.jpg',
			alt: 'Dubapara Luptachar - 522 homes demolished'
		}
	];
</script>

<div
	class="gallery-container"
	class:visible
	use:inview={{ rootMargin: '-20% 0px' }}
	oninview_change={(e) => (visible = e.detail.inView)}
>
	<div class="gallery-grid">
		{#each images as image, i}
			<div class="gallery-image" style="--delay: {i * 100}ms">
				<img src={image.src} alt={image.alt} loading="lazy" />
			</div>
		{/each}
	</div>
	<div class="gallery-text">
		<p class="gallery-text-main">Across Assam, the bulldozers have left their mark.</p>
		<p class="gallery-text-sub">We traveled to 20 villages to document what remains.</p>
	</div>
</div>

<style>
	.gallery-container {
		position: relative;
		width: 100%;
		height: 100vh;
		background: #0a0a0a;
		margin-bottom: 15vh;
	}

	.gallery-grid {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: 1rem;
		padding: 2rem;
	}

	.gallery-image {
		position: relative;
		overflow: hidden;
		border-radius: 4px;
		opacity: 0;
		transform: translateY(30px);
		transition:
			opacity 0.6s ease,
			transform 0.6s ease;
		transition-delay: var(--delay);
	}

	.gallery-container.visible .gallery-image {
		opacity: 1;
		transform: translateY(0);
	}

	.gallery-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.gallery-text {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 2;
		pointer-events: none;
		text-align: center;
		padding: 2rem;
		opacity: 0;
		transition: opacity 0.8s ease 0.4s;
	}

	.gallery-container.visible .gallery-text {
		opacity: 1;
	}

	.gallery-text-main {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.5rem, 4vw, 2.5rem);
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 1.5rem 0;
		max-width: 650px;
		line-height: 1.5;
		background: rgba(0, 0, 0, 0.75);
		padding: 1.25rem 2rem;
		border-radius: 4px;
	}

	.gallery-text-sub {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(1rem, 2vw, 1.25rem);
		color: rgba(255, 255, 255, 0.95);
		margin: 0;
		line-height: 1.6;
		background: rgba(0, 0, 0, 0.75);
		padding: 0.75rem 1.5rem;
		border-radius: 4px;
	}

	@media (max-width: 768px) {
		.gallery-grid {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(3, 1fr);
			gap: 0.5rem;
			padding: 1rem;
		}

		.gallery-text-main {
			font-size: 1.5rem;
			padding: 1rem 1.25rem;
		}

		.gallery-text-sub {
			font-size: 1rem;
			padding: 0.5rem 1rem;
		}
	}
</style>
