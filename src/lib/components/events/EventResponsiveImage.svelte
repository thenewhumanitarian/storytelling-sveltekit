<script lang="ts">
	import placeholderData from '$lib/data/events/image-placeholders.json';

	interface ImageMeta {
		placeholder: string;
		width: number;
		height: number;
		srcset: string;
	}

	interface Props {
		src: string;
		alt: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		class?: string;
		imgClass?: string;
		fetchpriority?: 'high' | 'low' | 'auto';
		reserveSpace?: boolean;
	}

	let {
		src,
		alt,
		sizes = '100vw',
		loading = 'lazy',
		class: className = '',
		imgClass = '',
		fetchpriority,
		reserveSpace = true
	}: Props = $props();

	let loaded = $state(false);

	const meta = $derived((placeholderData as Record<string, ImageMeta>)[src]);
	const basePath = $derived(src.replace(/\.(png|jpe?g|webp)$/i, ''));

	const webpSrcset = $derived.by(() => {
		if (!meta) return '';
		return meta.srcset
			.split(', ')
			.map((width) => `${basePath}-${width}.webp ${width}`)
			.join(', ');
	});

	const fallbackSrc = $derived(
		meta ? `${basePath}-${meta.width}w.webp` : src
	);

	const aspectRatio = $derived(meta ? `${meta.width} / ${meta.height}` : undefined);

	function onLoad() {
		loaded = true;
	}
</script>

{#if meta}
	<picture
		class="event-blur-image block overflow-hidden {className}"
		style:aspect-ratio={reserveSpace && aspectRatio ? aspectRatio : undefined}
	>
		<source type="image/webp" srcset={webpSrcset} {sizes} />
		<img
			src={fallbackSrc}
			{alt}
			width={meta.width}
			height={meta.height}
			{loading}
			{fetchpriority}
			onload={onLoad}
			class="h-full w-full object-cover {imgClass}"
			class:loaded
			style:background-image="url({meta.placeholder})"
			style:background-size="cover"
			style:background-position="center"
		/>
	</picture>
{:else}
	<img {src} {alt} {loading} {fetchpriority} class="block h-auto w-full {className} {imgClass}" />
{/if}

<style>
	.event-blur-image img {
		display: block;
		filter: blur(18px);
		transform: scale(1.04);
		transition:
			filter 0.45s ease,
			transform 0.45s ease;
	}

	.event-blur-image img.loaded {
		filter: blur(0);
		transform: scale(1);
		background-image: none !important;
	}

	@media (prefers-reduced-motion: reduce) {
		.event-blur-image img {
			filter: none;
			transform: none;
			transition: none;
		}
	}
</style>
