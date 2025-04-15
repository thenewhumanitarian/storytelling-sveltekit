<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	const { blok } = $props();
</script>

<div
	class="pull-quote-container group border-b-[0.5px] border-t-[0.5px] border-lebgreen font-serif font-bold text-lebblack"
	use:storyblokEditable={blok}
>
	{#if blok.image?.filename}
		<div class="pull-quote-image--wrapper before bg-grass group-hover:bg-brown">
			<div class="pull-quote-image--container">
				<img class="pull-quote-image before" src={blok.image.filename} alt={blok.image.alt || ''} />
			</div>
		</div>
		<div class="pull-quote-image--wrapper after bg-grass group-hover:bg-brown">
			<div class="pull-quote-image--container">
				<img class="pull-quote-image after" src={blok.image.filename} alt={blok.image.alt || ''} />
			</div>
		</div>
	{/if}
	<blockquote>
		{blok.text}
	</blockquote>
</div>

<style>
	.pull-quote-container {
		position: relative;
		text-align: center;
		margin: 3rem auto;
	}

	blockquote {
		position: relative;
		font-size: 1.75rem;
		line-height: 1.25;
		padding: 1.5rem;
		margin: 0;
		z-index: 1;
		font-weight: 300;
		margin: 1rem -15%;
	}

	@media screen and (max-width: 850px) {
		blockquote {
			font-size: 1.5rem;
			line-height: 1.15;
			margin: 1rem 0;
		}
	}

	@media screen and (max-width: 640px) {
		blockquote {
			font-size: 1.25rem;
			line-height: 1.2;
			margin: 1rem -5%;
		}
	}

	blockquote:before,
	blockquote:after {
		position: absolute;
		font-size: 6rem;
		height: 1.5rem;
		color: #636845;
	}

	blockquote:before {
		content: '“';
		left: -1rem;
		top: -1.5rem;
	}

	blockquote:after {
		content: '”';
		right: 0;
		bottom: 2rem;
	}

	@media screen and (max-width: 850px) {
		blockquote:before,
		blockquote:after {
			font-size: 6rem;
			height: 1rem;
		}
		blockquote:before {
			left: -0.25rem;
			top: -0.5rem;
		}
		blockquote:after {
			right: -0.25rem;
			bottom: 3rem;
		}
	}

	.pull-quote-image--wrapper {
		position: absolute;
		width: auto;
		height: auto;
		border: 0.5px solid #282828;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
	}

	.pull-quote-image {
		width: 1.4rem;
		position: relative;
		/* filter: blur(5px); */
		opacity: 0.6;
		will-change: opacity, width, filter;
		transition: all 0.8s;
		transition-behavior: cubic-bezier(0.4, 0, 0.2, 1);
	}

	.pull-quote-image.after {
		transition-delay: 0.2s;
	}

	.pull-quote-container:hover .pull-quote-image {
		opacity: 0.8;
		width: 1.4rem;
		filter: none;
	}

	.pull-quote-image--wrapper.before {
		top: 0;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.pull-quote-image--wrapper.after {
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 50%);
	}

	.pull-quote-container:hover img {
		animation: floatEffect 3s ease-in-out infinite;
	}

	@keyframes floatEffect {
		0% {
			transform: translateY(-0.5px);
			scale: 1;
		}
		50% {
			transform: translateY(0.5px);
			scale: 1.015;
		}
		100% {
			scale: 1;
			transform: translateY(-0.5px);
		}
	}
</style>
