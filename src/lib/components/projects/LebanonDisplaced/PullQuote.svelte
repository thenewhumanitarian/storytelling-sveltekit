<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div
	class="pull-quote-container group font-serif font-bold text-lebblack"
	use:storyblokEditable={blok}
>
	{#if blok.image?.filename}
		<div class="pull-quote-image--wrapper before bg-grass z-50">
			<div class="pull-quote-image--container">
				<img
					class="pull-quote-image before"
					src={`${blok.image.filename}/m/60x0`}
					alt={blok.image.alt || 'Small illustration as part of the pull quote.'}
				/>
			</div>
		</div>
		<div class="pull-quote-image--wrapper after bg-grass z-50">
			<div class="pull-quote-image--container">
				<img
					class="pull-quote-image after"
					src={`${blok.image.filename}/m/60x0`}
					alt={blok.image.alt || 'Small illustration as part of the pull quote.'}
				/>
			</div>
		</div>
	{/if}
	<blockquote class={`border-[0.5px] border-[0.5px] border-lebblack bg-grass ${blok.name ? 'has-name' : ''}`}>
		<p>
			{blok.text}
		</p>
	</blockquote>
	{#if blok.name}
		<p class="pull-quote--name absolute bottom-12 w-full">{blok.name}</p>
	{/if}
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
		margin: 0 -15%;
	}

	blockquote p {
		margin-top: 1.5rem;
		margin-bottom: 1.5rem;
		font-size: 1.6rem;
	}

	.pull-quote--name {
		font-family: 'Roboto', sans-serif;
		font-weight: 400;
		font-size: 1rem;
	}

	blockquote.has-name {
		padding-bottom: 4.5rem;
	}

	@media screen and (max-width: 850px) {
		blockquote {
			font-size: 1.5rem;
			line-height: 1.15;
			margin: 1rem -2rem;
		}
	}

	@media screen and (max-width: 640px) {
		blockquote {
			font-size: 1.25rem;
			line-height: 1.2;
			margin: 1rem -5%;
			padding: 2rem;
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
		left: 0.25rem;
		top: -1rem;
	}

	blockquote:after {
		content: '”';
		right: 0.25rem;
		bottom: 2.4rem;
	}

	@media screen and (max-width: 850px) {
		blockquote:before,
		blockquote:after {
			font-size: 6rem;
			height: 1rem;
		}
		blockquote:before {
			left: 0.25rem;
			top: -1.5rem;
			color: #636845;
		}
		blockquote:after {
			right: 0.25rem;
			bottom: 2.15rem;
			color: #636845;
		}
	}

	.pull-quote-image--wrapper {
		position: absolute;
		width: auto;
		height: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.25rem;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		/* border: 0.5px solid #282828; */
	}

	.pull-quote-image {
		width: 2rem;
		position: relative;
		opacity: 0.8;
		will-change: opacity, width, filter;
		transition: all 1s;
		/* filter: blur(1px); */
		transition-behavior: cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* .pull-quote-image.after {
		transition-delay: 0.2s;
	} */

	.pull-quote-container:hover .pull-quote-image {
		opacity: 1;
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
</style>
