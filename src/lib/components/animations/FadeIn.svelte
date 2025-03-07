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
</script>

<div
	use:inview={options}
	oninview_change={handleChange}
	class={`${isAbsolute ? 'absolute top-0 left-0' : 'relative'} block h-full w-full`}
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
					x: xOffset,
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
