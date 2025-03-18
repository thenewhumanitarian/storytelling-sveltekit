<script lang="ts">
	/* Svelte, Storyblok and props */
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	/* Own components */
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import RichText from '$lib/components/projects/LebanonDisplaced/RichText.svelte';

	// Default row height
	const rowHeight = blok.rowHeight ? blok.rowHeight + 'px' : '200px';

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

			// Move to the next row if the current row exceeds columns
			if (currentRow > state.columns) {
				rowCount++;
				currentRow = span;
			}
		});

		// Update state with computed values
		state.totalRows = rowCount + 1; // Adding 1 for any remaining panels
		state.gridTemplateRows = `auto ${Array(state.totalRows).fill(rowHeight).join(' ')} auto`;
	});
</script>

<!-- Desktop Grid -->
<section
	class="story-grid--wrapper hidden sm:block"
	style="--grid-rows: {state.gridTemplateRows};"
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<div class="story-grid--container">
		<div class={`story-grid--panel panel-title ${blok.textColor}`}>
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
				<StoryblokComponent blok={item} {i} style="grid-column: span {item.colSpan || 1};" />
			{/each}
		{/if}
	</div>
</section>

<!-- Mobile Grid -->
<section
	class="story-grid--wrapper mobile sm:hidden"
	style="--grid-rows: auto;"
	use:storyblokEditable={blok && blok._editable ? blok : undefined}
>
	<div class="story-grid--container mobile">
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
				<StoryblokComponent blok={item} {i} style="grid-column: span 1 !important;" />
			{/each}
		{/if}
	</div>
</section>

<style>
	/* The grid */
	.story-grid--wrapper {
		padding: 0;
		margin: -2rem auto -1rem auto;
	}

	.story-grid--wrapper.mobile {
		padding: 2rem 0;
	}

	/* Default grid */
	.story-grid--container {
		display: grid;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: var(--grid-rows);
		grid-gap: 25px;
	}

	@media screen and (max-width: 900px) {
		.story-grid--container {
			width: 80%;
		}
	}

	/* Force one column on mobile */
	.story-grid--container.mobile {
		grid-template-columns: 1fr !important;
		grid-template-rows: auto !important;
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
		padding-bottom: 1rem;
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
