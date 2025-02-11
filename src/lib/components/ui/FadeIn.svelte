<script lang="ts">
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails, Options } from 'svelte-inview';
	import { Spring } from 'svelte/motion';

	export let delay: number = 0;
	export let duration: number = 500;
	export let initialOpacity: number = 0;
	export let finalOpacity: number = 1;
	export let xOffset: number = -50; // Moves up on enter
	// export let offset: string = '-10%'; // Root margin for in-view detection

	let isInView: boolean = false;
	const opacity = new Spring(initialOpacity, { stiffness: 0.2, damping: 0.8 });
	const translateX = new Spring(xOffset, { stiffness: 0.2, damping: 0.5 });

	const options: Options = {
		// rootMargin: offset
	};

	const handleChange = ({ detail }: CustomEvent<ObserverEventDetails>) => {
		isInView = detail.inView;

		if (isInView) {
			opacity.target = finalOpacity;
			translateX.target = 0;
		} else {
			opacity.target = initialOpacity;
			translateX.target = xOffset;
		}
	};
</script>

<div
	use:inview={options}
	on:inview_change={handleChange}
	style="
    opacity: {opacity.current};
    transform: translateX({translateX.current}px);
    transition: opacity {duration}ms ease-out {delay}ms, transform {duration}ms ease-out {delay}ms;
  "
>
	<slot />
</div>
