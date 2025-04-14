<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	let alignClass = 'align-center'; // Default

	if (blok.align === 'left') {
		alignClass = 'align-left';
	} else if (blok.align === 'right') {
		alignClass = 'align-right';
	}
</script>

<div class="inline-image-wrapper" use:storyblokEditable={blok}>
	{#if blok?.media?.filename}
		<figure class={`${alignClass} media-element`}>
			<img src={blok.media.filename} alt={blok.media.alt} />
			{#if blok.caption}
				<figcaption>{blok.caption}</figcaption>
			{/if}
		</figure>
	{/if}
</div>

<style>
	.inline-image-wrapper {
		clear: both;
		margin: 1rem 0;
	}

	figure {
		display: flex;
		flex-direction: column;
	}

	figure img {
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	figcaption {
		margin: 0.25rem 0;
		color: #282828;
		padding: 0 0.75rem;
	}

	.align-left {
		float: left;
		width: 50%;
		margin-left: -25%;
		margin-right: 2.5%;
	}

	.align-left figcaption {
		text-align: right;
	}

	.align-right {
		float: right;
		width: 50%;
		margin-right: -25%;
		margin-left: 2.5%;
	}

	.align-center {
		margin: 0 auto;
		width: 100%;
	}

	@media screen and (max-width: 945px) {
		.inline-image-wrapper {
			margin: 1rem auto;
		}
		.align-left,
		.align-right,
		.align-center {
			float: none;
			margin: 2rem auto;
			width: 100%;
			max-width: 100%;
		}
	}
</style>
