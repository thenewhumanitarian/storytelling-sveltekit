<script lang="ts">
	/* Storyblok and props */
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	/* Own components */
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import StoryGridPanel from '$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte';
	import RichText from '$lib/components/projects/LebanonDisplaced/RichText.svelte';

	const panelsArray = [
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-002.svg',
			boxShadow: false
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-001.svg',
			boxShadow: true
		},
		{
			text: '“I should probably get up–things to do.”',
			boxShadow: false,
			gridColumn: 'auto',
			textAlign: 'right'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-003.svg',
			boxShadow: true
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-004.sÈvg',
			boxShadow: true
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-005.svg',
			boxShadow: true,
			gridColumn: 'auto'
		},
		{
			text: '“Naaah.”',
			boxShadow: false,
			gridColumn: 'span 2',
			textAlign: 'center'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-007.svg',
			boxShadow: true,
			gridColumn: 'span 2'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-008.svg',
			boxShadow: true
		}
	];
</script>

<section
	class="story-grid--wrapper"
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<section class="story-grid--container">
		<div class="story-grid--panel panel-title">
			{#if blok.text}
				<FadeIn yOffset={50} containerClasses={'flex flex-col items-center gap-y-4'}>
					<RichText
						{blok}
						className={'text-center prose-h1:text-5xl prose-h1:font-pacifico prose-h1:pb-4'}
					/>
				</FadeIn>
			{/if}
		</div>

		{#if blok.items}
			{#each blok.items as item, i (item._uid)}
				<StoryblokComponent blok={item} {i} />
			{/each}
		{/if}

		{#each panelsArray as panel, i}
			<StoryGridPanel
				{i}
				bgImage={panel.image}
				text={panel.text}
				boxShadow={panel.boxShadow}
				gridColumn={panel.gridColumn}
				textAlign={panel.textAlign}
			/>
		{/each}
	</section>
</section>

<style>
	/* The grid */
	.story-grid--wrapper {
		padding: 4rem 0 2rem 0;
	}
	:global(.story-grid--container) {
		display: grid;
		width: 100%;
		max-width: 770px;
		margin: 0 auto;
		grid-template-columns: 1fr;
		grid-template-rows: auto 200px 200px auto 200px 200px 200px auto 200px 200px auto;
		grid-gap: 25px;
	}

	/* General panel (global) class */
	:global(.story-grid--panel) {
		color: white;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: cover;
		box-shadow: 0 0px 0px 5px #251b19;
	}
	:global(.story-grid--panel p) {
		font-family: 'Pacifico', cursive;
		font-size: 1.6rem;
		line-height: 1.25;
	}

	/* Individual panels */
	.panel-title {
		box-shadow: none;
		color: white;
	}

	@media only screen and (min-width: 400px) {
		.story-grid--container {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto 200px auto 200px 200px auto 200px auto;
		}
		.panel-title {
			grid-column: span 2;
		}
	}

	@media only screen and (min-width: 600px) {
		.story-grid--container {
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto 200px 200px auto 200px auto;
		}
		.panel-title {
			grid-column: span 3;
		}
	}
</style>
