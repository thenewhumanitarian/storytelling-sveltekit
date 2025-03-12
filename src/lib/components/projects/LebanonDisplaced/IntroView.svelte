<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

	const { blok, className } = $props();
</script>

<div use:storyblokEditable={blok} class={`intro-view--wrapper ${className}`}>
	<div class="top-left">
		<h1>Lebanon Displacement Diaries</h1>
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
		height: calc(100dvh - 6rem);
		background-color: #ebe4cb;
		padding: 2rem;
		box-shadow: 10px 10px 10px rgba(0,0,0,0.5);
		border-bottom: 6px solid #003D14;
	}
	.top-left {
		position: absolute;
		top: 1rem;
		left: 2.5rem;
	}
	.top-left h1 {
		font-size: 3rem;
		width: 300px;
		line-height: 1;
	}
	.bottom-left {
		position: absolute;
		bottom: 3rem;
		left: 2.5rem;
	}
</style>
