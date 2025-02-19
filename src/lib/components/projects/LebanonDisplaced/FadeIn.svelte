<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';

	import { fly, blur } from 'svelte/transition';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, Options } from 'svelte-inview';

	interface Props {
		blok: {
			delay?: string;
			duration?: string;
			xOffset?: string;
			yOffset?: string;
			blurAmount?: string;
			inViewOffset?: string;
			items?: Array<{ _uid: string; component: string }>;
		};
	}

	let {
		blok = {
			delay: '0',
			duration: '500',
			xOffset: '0',
			yOffset: '0',
			blurAmount: '0',
			inViewOffset: '0',
			items: []
		}
	}: Props = $props();

	// ✅ Convert string values to numbers and ensure non-negative values
	const delay = blok.delay ? Math.max(parseInt(blok.delay, 10), 0) : 0;
	const duration = blok.duration ? Math.max(parseInt(blok.duration, 10), 100) : 500; // ✅ Ensure duration is at least 100ms
	const xOffset = blok.xOffset ? parseInt(blok.xOffset, 10) : 0;
	const yOffset = blok.yOffset ? parseInt(blok.yOffset, 10) : 0;
	const blurAmount = blok.blurAmount ? Math.max(parseInt(blok.blurAmount, 10), 0) : 0;
	const inViewOffset = blok.inViewOffset ? parseInt(blok.inViewOffset, 10) : 0;

	let isInView: boolean = $state(false);

	const options: Options = {
		rootMargin: `${inViewOffset}px`
	};

	// Handle inView state changes
	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		// console.log('InView changed:', detail.inView);
		isInView = detail.inView;
	};

	// ✅ Ensure duration is always positive
	const sharedOptions = { duration: duration > 0 ? duration : 100, delay };
</script>

<div
	use:storyblokEditable={blok}
	use:inview={options}
	oninview_change={handleChange}
	class="relative block h-full w-full"
>
	{#if isInView}
		<div
			in:blur={{
				...sharedOptions,
				amount: blok.blurAmount || 0,
				opacity: 0
			}}
			class="fade-in--wrapper_blur h-full w-full"
		>
			<div
				in:fly={{
					...sharedOptions,
					x: blok.xOffset || 0,
					y: blok.yOffset || 0
				}}
				class="fade-in--wrapper_fly h-full w-full shrink-0 items-center justify-center"
			>
				{#if blok}
					{#each blok.items ?? [] as item (item._uid)}
						{#if item.component !== 'contentWrapper'}
							<StoryblokComponent blok={item} />
						{/if}
					{/each}
				{/if}
			</div>
		</div>
	{:else}
		<div style="opacity: 0;">
			{#if blok}
				{#each blok.items ?? [] as item (item._uid)}
					{#if item.component !== 'contentWrapper'}
						<StoryblokComponent blok={item} />
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
</div>

<!--
If issues with the horizontal sections arise anew...
<div
  in:fly={{
    ...sharedOptions,
    x: blok.xOffset || 0,
    y: blok.yOffset || 0
  }}
  class="fade-in--wrapper_fly flex h-full w-full shrink-0 items-center justify-center"
>
-->
