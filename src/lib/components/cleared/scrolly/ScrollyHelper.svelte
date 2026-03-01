<script lang="ts">
	/**
	 * ScrollyHelper - IntersectionObserver-based scroll step tracker
	 *
	 * Tracks which child element is most visible in the viewport and exports
	 * a reactive `value` binding indicating the current step index.
	 * Returns `undefined` when no steps are in view.
	 *
	 * Based on sleep-training's Scrolly.svelte pattern.
	 *
	 * Usage:
	 * <ScrollyHelper bind:value={currentStep}>
	 *   <div class="step">Step 0</div>
	 *   <div class="step">Step 1</div>
	 *   <div class="step">Step 2</div>
	 * </ScrollyHelper>
	 */
	import { onMount } from 'svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		value?: number;
		root?: Element | null;
		top?: number;
		bottom?: number;
		increments?: number;
		children: Snippet;
	}

	let {
		value = $bindable(undefined),
		root = null,
		top = 0,
		bottom = 0,
		increments = 100,
		children
	}: Props = $props();

	let container: HTMLDivElement;
	let nodes: NodeListOf<Element>;
	let intersectionObservers: IntersectionObserver[] = [];
	const steps: number[] = [];
	const threshold: number[] = [];

	function mostInView() {
		let maxRatio = 0;
		let maxIndex = 0;
		for (let i = 0; i < steps.length; i++) {
			if (steps[i] > maxRatio) {
				maxRatio = steps[i];
				maxIndex = i;
			}
		}

		// Simple: return index if something visible, undefined otherwise
		if (maxRatio > 0) value = maxIndex;
		else value = undefined;
	}

	function createObserver(node: Element, index: number) {
		const handleIntersect = (entries: IntersectionObserverEntry[]) => {
			const ratio = entries[0].intersectionRatio;
			steps[index] = ratio;
			mostInView();
		};

		const marginTop = top ? top * -1 : 0;
		const marginBottom = bottom ? bottom * -1 : 0;
		const rootMargin = `${marginTop}px 0px ${marginBottom}px 0px`;
		const options = { root, rootMargin, threshold };

		if (intersectionObservers[index]) {
			intersectionObservers[index].disconnect();
		}

		const io = new IntersectionObserver(handleIntersect, options);
		io.observe(node);
		intersectionObservers[index] = io;
	}

	function update() {
		if (!nodes?.length) return;
		nodes.forEach((node, index) => createObserver(node, index));
	}

	$effect(() => {
		// Re-run update when top or bottom changes
		top;
		bottom;
		update();
	});

	onMount(() => {
		// Build threshold array (0 to 1 in increments)
		for (let i = 0; i <= increments; i++) {
			threshold.push(i / increments);
		}
		nodes = container.querySelectorAll(':scope > *:not(iframe)');
		update();

		return () => {
			// Cleanup observers on unmount
			intersectionObservers.forEach((io) => io?.disconnect());
		};
	});
</script>

<div bind:this={container}>
	{@render children()}
</div>
