<script lang="ts">
	/* Svelte, Storyblok and props */
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	/* Own components */
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	// import RichText from '$lib/components/projects/LebanonDisplaced/RichText.svelte';

	// Default row height
	const rowHeight = blok.rowHeight ? blok.rowHeight + 'px' : 'auto';

	// Create state for totalRows and gridTemplateRows
	const state = $state({
		totalRows: 1,
		gridTemplateRows: 'auto',
		columns: blok.columns || 3
	});

	// Use $effect() to compute `totalRows` dynamically based on `colSpan`
	$effect(() => {
		if (!blok.items) return;

		let rowCount = 0;
		let currentRow = 0;

		blok.items.forEach((item: any) => {
			const span = Number(item.colSpan) || 1;
			currentRow += span;

			if (currentRow > state.columns) {
				rowCount++;
				currentRow = span;
			}
		});

		// Calculate how many rows of items
		state.totalRows = rowCount + 1;

		// Conditionally add 'auto' row for title only if blok.text exists
		const hasText = blok.text && blok.text.trim() !== '';
		const rows = hasText
			? `auto ${Array(state.totalRows).fill(rowHeight).join(' ')}`
			: Array(state.totalRows).fill(rowHeight).join(' ');

		state.gridTemplateRows = rows;
	});
</script>

<!-- Desktop Grid -->
<section
	class="story-grid--wrapper desktop"
	style="--grid-rows: {state.gridTemplateRows};"
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<div
		class={`story-grid--container justify-center items-center desktop ${blok.size}`}
		style={`grid-template-columns: repeat(${state.columns}, 1fr); grid-template-rows: ${state.gridTemplateRows};`}
	>
		{#if blok.text && blok.text !== ''}
			<div class={`story-grid--panel panel-title ${blok.textColor}`}>
				<FadeIn yOffset={50} containerClasses={'flex flex-col items-center gap-y-4'}>
					<h3 class={`pb-0 text-center font-serif text-2xl ${blok.textColor || 'text-lebblack'}`}>
						{blok.text}
					</h3>
				</FadeIn>
			</div>
		{/if}
		{#if blok.items}
			{#each blok.items as item, i (item._uid)}
				<StoryblokComponent blok={item} {i} style="grid-column: span {item.colSpan || 1};" />
			{/each}
		{/if}
	</div>
</section>

<!-- Mobile Grid -->
<section
	class="story-grid--wrapper mobile"
	style="--grid-rows: auto;"
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<div class={`story-grid--container mobile ${blok.size}`}>
		{#if blok.text && blok.text !== ''}
			<div class={`story-grid--panel panel-title ${blok.textColor}`}>
				<FadeIn yOffset={50} containerClasses={'flex flex-col items-center gap-y-4'}>
					<h3 class={`pb-0 text-center font-serif text-2xl ${blok.textColor}`}>
						{blok.text}
					</h3>
				</FadeIn>
			</div>
		{/if}
		{#if blok.items}
			{#each blok.items as item, i (item._uid)}
				<StoryblokComponent blok={item} {i} style="grid-column: span 1 !important;" />
			{/each}
		{/if}
	</div>
</section>

<style>
	/* The grid */
	.story-grid--wrapper {
		padding: 0;
		margin: 3rem auto;
	}

	@media screen and (max-width: 640px) {
		.story-grid--wrapper {
			margin: 0 auto;
		}
	}

	.story-grid--wrapper.mobile {
		padding: 0;
		display: none;
	}

	@media screen and (max-width: 750px) {
		.story-grid--wrapper.mobile {
			display: block;
		}

		.story-grid--wrapper.desktop {
			display: none;
		}
	}

	/* Default grid */
	.story-grid--container {
		display: grid;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		/* grid-template-columns: repeat(3, 1fr); */
		grid-template-rows: var(--grid-rows);
		grid-gap: 2rem;
	}

	.story-grid--container.narrow {
		max-width: 650px;
	}

	@media screen and (max-width: 900px) {
		.story-grid--container {
			width: 100%;
			padding: 0 1rem 2rem;
			grid-gap: 2.25rem;
		}
	}

	@media screen and (max-width: 640px) {
		.story-grid--container {
			grid-gap: 1.5rem;
		}
	}

	/* Force one column on mobile */
	.story-grid--container.mobile {
		display: flex;
		flex-direction: column;
	}

	/* General panel (global) class */
	:global(.story-grid--panel) {
		color: inherit;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: cover;
	}

	:global(.story-grid--panel .storyblok--richtext *) {
		margin: 0;
	}

	:global(.story-grid--panel .storyblok--richtext h1) {
		margin-bottom: 0.5rem;
	}

	/* Individual panels */
	.panel-title {
		box-shadow: none;
		color: white;
		grid-column: span 3;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	/* Mobile Grid: Always One Column */
	.story-grid--container.mobile {
		grid-template-columns: 1fr;
		grid-template-rows: auto;
	}

	/* Ensure Every Item Stacks Correctly */
	.story-grid--container.mobile .story-grid--panel {
		grid-column: span 1 !important;
	}
</style>
