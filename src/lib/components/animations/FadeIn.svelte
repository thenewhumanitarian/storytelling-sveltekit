<script lang="ts">
	import { fly, blur } from 'svelte/transition';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, Options } from 'svelte-inview';

	import { createIsRtlStore } from '$lib/utils/storyblok';
	const isRtl = createIsRtlStore();

	interface Props {
		delay?: number;
		duration?: number;
		xOffset?: number;
		yOffset?: number;
		blurAmount?: number;
		inViewOffset?: string;
		children?: import('svelte').Snippet;
		containerClasses?: string;
		isAbsolute?: boolean;
	}

	let {
		delay = 0,
		duration = 500,
		xOffset = 0,
		yOffset = 0,
		blurAmount = 0,
		inViewOffset = '0px',
		children,
		containerClasses = '',
		isAbsolute = false
	}: Props = $props();

	let isInView: boolean = $state(false);

	const options: Options = {
		rootMargin: inViewOffset
	};

	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		isInView = detail.inView;
	};

	const sharedOptions = {
		duration: duration,
		delay: delay
	};

	const flipX = $derived(isRtl ? -xOffset : xOffset);
</script>

<div
	use:inview={options}
	oninview_change={handleChange}
	class={`${isAbsolute ? 'absolute left-0 top-0' : 'relative'} block h-full w-full`}
>
	{#if isInView}
		<div
			in:blur={{
				...sharedOptions,
				amount: blurAmount,
				opacity: 0
			}}
			class="fade-in--wrapper_blur h-full w-full"
		>
			<div
				in:fly={{
					...sharedOptions,
					x: flipX,
					y: yOffset
				}}
				class={`fade-in--wrapper_fly h-full w-full shrink-0 ${containerClasses || 'flex flex-col items-center justify-center'}`}
			>
				{@render children?.()}
			</div>
		</div>
	{:else}
		<div style="opacity: 0;">
			{@render children?.()}
		</div>
	{/if}
</div>
