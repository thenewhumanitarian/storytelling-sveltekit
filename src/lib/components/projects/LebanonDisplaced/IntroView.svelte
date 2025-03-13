<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

	const { blok, className } = $props();

	console.log(blok);
</script>

<div
	use:storyblokEditable={blok}
	class={`intro-view--wrapper ${className}`}
	style={`
		height: ${blok.screenHeightInPercent || 100}vh;
		height: ${blok.screenHeightInPercent || 100}dvh;
	`}
>
	<div class="intro-title">
		{#if blok.title.length > 0}
			{#each blok.title as item}
				<StoryblokComponent blok={item} />
			{/each}
		{:else}
			<h1>Lebanon Displacement Diaries</h1>
		{/if}
	</div>
	<div class="bottom-left">
		{#each blok.logos as item}
			<StoryblokComponent blok={item} />
		{/each}
	</div>
</div>

<style>
	.intro-view--wrapper {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100vh;
		padding: 2rem;
		margin-top: -6rem;
		background-color: #ebe4cb;
		border-bottom: 6px solid #003d14;
		z-index: 0;
	}

	.intro-title {
		position: absolute;
		top: 8rem;
		left: 2.5rem;
	}
	:global(.storyblok--richtext .intro-title h1) {
		font-size: 3rem !important;
		width: 300px;
		line-height: 1;
	}
	.bottom-left {
		position: absolute;
		bottom: 3rem;
		left: 2.5rem;
	}
</style>
