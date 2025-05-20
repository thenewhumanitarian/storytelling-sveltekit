<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';

	const { blok } = $props();
</script>

<div
	class="pull-quote-container group font-serif font-bold text-lebblack"
	use:storyblokEditable={blok}
>
	{#if blok.image?.filename}
		<div class="pull-quote-image--wrapper before z-50 bg-grass">
			<div class="pull-quote-image--container">
				<img
					class="pull-quote-image before"
					src={`${blok.image.filename}/m/60x0`}
					alt={blok.image.alt || 'Small illustration as part of the pull quote.'}
				/>
			</div>
		</div>
		<div class="pull-quote-image--wrapper after z-50 bg-grass">
			<div class="pull-quote-image--container">
				<img
					class="pull-quote-image after rotate-20 -translate-y-0.5 scale-x-[-1]"
					src={`${blok.image.filename}/m/60x0`}
					alt={blok.image.alt || 'Small illustration as part of the pull quote.'}
				/>
			</div>
		</div>
	{/if}
	<blockquote
		class={`border-[0.5px] border-lebblack bg-grass text-center ${blok.name ? 'has-name' : ''}`}
	>
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
		margin: 2rem auto;
	}

	blockquote {
		position: relative;
		font-size: 1.75rem;
		line-height: 1.25;
		padding: 1.1rem 0;
		margin: 0;
		z-index: 1;
		font-weight: 300;
		margin: 0;
		font-weight: bold;
		background-size: cover;
		border-left: none;
		border-right: none;
	}

	blockquote p {
		margin-top: 1.5rem;
		margin-bottom: 1.5rem !important;
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
			/* margin: 1rem -2rem; */
		}
	}

	@media screen and (max-width: 640px) {
		blockquote {
			font-size: 1.25rem;
			line-height: 1.2;
			margin: 0;
			padding: 2rem 0;
		}
	}

	blockquote:before,
	blockquote:after {
		position: absolute;
		font-size: 6rem;
		height: 1.5rem;
		color: #636845;
		font-family: 'GT Sectra Fine', sans-serif;
	}

	blockquote:before {
		/* content: '“'; */
		left: 0.25rem;
		top: -1rem;
	}

	blockquote:after {
		/* content: '”'; */
		right: 0.25rem;
		bottom: 2.4rem;
	}

	@media screen and (max-width: 850px) {
		blockquote {
			padding: 0.25rem 0 0.5rem 0;
		}
		blockquote:before,
		blockquote:after {
			font-size: 6rem;
			height: 1rem;
		}
		blockquote:before {
			left: 0.25rem;
			top: -2.75rem;
			color: #636845;
		}
		blockquote:after {
			right: 0.25rem;
			bottom: 1rem;
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
	}

	.pull-quote-image {
		width: 2rem;
	}

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

	:global(.arabic blockquote) {
		font-family: 'Geeza Pro', serif;
	}
</style>
