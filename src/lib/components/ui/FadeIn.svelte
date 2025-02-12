<script lang="ts">
	import { fly, blur } from 'svelte/transition';
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, Options } from 'svelte-inview';
	import { Spring } from 'svelte/motion';

	export let delay: number = 0;
	export let duration: number = 500;
	export let initialOpacity: number = 0.5;
	export let finalOpacity: number = 1;
	export let xOffset: number = 0;
	export let yOffset: number = 0;
	export let blurAmount: number = 0;
	export let inViewOffset: string = '0px';

	let isInView: boolean = false;
	const opacity = new Spring(initialOpacity, { stiffness: 0.2, damping: 0.8 });
	const translateX = new Spring(xOffset, { stiffness: 0.2, damping: 0.5 });

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

<div use:inview={options} on:inview_change={handleChange}>
	{#if isInView}
		<div
			in:blur={{
				...sharedOptions,
				amount: blurAmount,
				opacity: 0
			}}
		>
			<div
				in:fly={{
					...sharedOptions,
					x: xOffset,
					y: yOffset
				}}
			>
				<slot />
			</div>
		</div>
	{/if}
</div>
