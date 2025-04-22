<script lang="ts">
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
		yOffset = 20,
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

	const flipX = $derived(isRtl ? -xOffset : xOffset);
</script>

<div
	use:inview={options}
	oninview_change={handleChange}
	class={`${isAbsolute ? 'absolute left-0 top-0' : 'relative'} block h-full w-full`}
>
	<div
		class={`transform transition-opacity duration-[${duration}ms] delay-[${delay}ms] ease-out
			${isInView ? 'translate-x-0 translate-y-0 opacity-100 blur-0' : 'translate-x-[${flipX}px] translate-y-[${yOffset}px] opacity-0 blur-sm'}
			fade-in--wrapper h-full w-full ${containerClasses || 'flex flex-col items-center justify-center'}
		`}
		style="will-change: opacity, transform, filter;"
	>
		{@render children?.()}
	</div>
</div>
