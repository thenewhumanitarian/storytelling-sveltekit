<script lang="ts">
	import type { Snippet } from 'svelte';
	import { scrolly } from '$lib/attachments/scrolly';
	import { cn } from '$lib/utils/cn';

	interface Props {
		viz: Snippet<[{ progress: number; activeStep: number; stepProgress: number }]>;
		steps: Snippet<[{ activeStep: number }]>;
		class?: string;
		vizSide?: 'left' | 'right';
		onActiveStep?: (step: number) => void;
	}

	let { viz, steps, class: className, vizSide = 'right', onActiveStep }: Props = $props();

	let progress = $state(0);
	let activeStep = $state(0);
	let stepProgress = $state(0);
	let lastNotifiedStep = -1;

	const scrollyAttachment = scrolly({
		onProgress: (p, step, sp) => {
			progress = p;
			stepProgress = sp;
			if (step !== lastNotifiedStep) {
				lastNotifiedStep = step;
				activeStep = step;
				onActiveStep?.(step);
			}
		}
	});
</script>

<section
	{@attach scrollyAttachment}
	class={cn(
		'relative grid w-full min-w-0 grid-cols-1 gap-y-10 lg:gap-x-10 xl:gap-x-14',
		'lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]',
		className
	)}
>
	<div
		data-scrolly-viz
		data-viz-sticky
		class={cn(
			'hidden min-w-0 items-center justify-center overflow-hidden',
			'lg:sticky lg:z-0 lg:flex',
			'lg:top-(--scrolly-viz-safe-top)',
			'lg:h-[calc(100svh-var(--scrolly-viz-safe-top)-var(--scrolly-viz-safe-bottom))]',
			vizSide === 'left' ? 'lg:col-start-1' : 'lg:col-start-2'
		)}
		style:--scrolly-viz-safe-top="calc(var(--event-nav-h, 4rem) + clamp(1rem, 3svh, 2rem))"
		style:--scrolly-viz-safe-bottom="clamp(1rem, 3svh, 2rem)"
	>
		{@render viz({ progress, activeStep, stepProgress })}
	</div>

	<div
		data-scrolly-story
		class={cn(
			'relative z-10 min-w-0 w-full text-left',
			vizSide === 'left' ? 'lg:col-start-2' : 'lg:col-start-1'
		)}
	>
		{@render steps({ activeStep })}
	</div>
</section>
