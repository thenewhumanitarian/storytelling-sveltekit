<script lang="ts">
	import placeholderData from '$lib/data/cleared/image-placeholders.json';

	interface Props {
		src: string;
		alt: string;
		sizes?: string;
		loading?: 'lazy' | 'eager';
		class?: string;
		draggable?: boolean;
	}

	let {
		src,
		alt,
		sizes = '100vw',
		loading = 'lazy',
		class: className = '',
		draggable
	}: Props = $props();

	let loaded = $state(false);

	const meta = $derived((placeholderData as Record<string, any>)[src]);
	const basePath = $derived(src.replace(/\.\w+$/, ''));

	const webpSrcset = $derived(() => {
		if (!meta) return '';
		const widths = meta.srcset.split(', ');
		return widths.map((w: string) => `${basePath}-${w}.webp ${w}`).join(', ');
	});

	function onLoad() {
		loaded = true;
	}
</script>

{#if meta}
	<picture class="responsive-image {className}">
		<source type="image/webp" srcset={webpSrcset()} {sizes} />
		<img
			{src}
			{alt}
			width={meta.width}
			height={meta.height}
			{loading}
			{draggable}
			onload={onLoad}
			class:loaded
			style:background-image="url({meta.placeholder})"
			style:background-size="cover"
		/>
	</picture>
{:else}
	<img {src} {alt} {loading} {draggable} class={className} />
{/if}

<style>
	.responsive-image {
		display: block;
		overflow: hidden;
	}

	.responsive-image img {
		width: 100%;
		height: auto;
		display: block;
		filter: blur(20px);
		transform: scale(1.05);
		transition:
			filter 0.5s ease,
			transform 0.5s ease;
	}

	.responsive-image img.loaded {
		filter: blur(0);
		transform: scale(1);
		background-image: none !important;
	}
</style>
