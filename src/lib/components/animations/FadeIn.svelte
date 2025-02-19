<script lang="ts">
	import { fly, blur } from 'svelte/transition';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, Options } from 'svelte-inview';

	interface Props {
		delay?: number;
		duration?: number;
		xOffset?: number;
		yOffset?: number;
		blurAmount?: number;
		inViewOffset?: string;
		children?: import('svelte').Snippet;
	}

	let {
		delay = 0,
		duration = 500,
		xOffset = 0,
		yOffset = 0,
		blurAmount = 0,
		inViewOffset = '0px',
		children
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
</script>

<div use:inview={options} oninview_change={handleChange} class="relative w-full h-full block">
	{#if isInView}
		<div
			in:blur={{
				...sharedOptions,
				amount: blurAmount,
				opacity: 0
			}}
			class="fade-in--wrapper_blur w-full h-full"
		>
			<div
				in:fly={{
					...sharedOptions,
					x: xOffset,
					y: yOffset
				}}
				class="fade-in--wrapper_fly w-full h-full flex items-center justify-center shrink-0"
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
