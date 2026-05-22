<script lang="ts">
	import type { Snippet } from 'svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		isActive?: boolean;
		id?: string;
		children: Snippet;
		class?: string;
	}

	let { isActive = false, id, children, class: className }: Props = $props();
</script>

<div
	{id}
	data-scrolly-step
	data-active={isActive ? 'true' : 'false'}
	class={cn(
		'scrolly-step flex w-full min-w-0 items-start pb-[6svh]',
		'pt-8 lg:min-h-svh',
		className
	)}
>
	<div
		data-scrolly-step-content
		class={cn(
			'mx-auto w-full min-w-0 border border-[var(--event-ink)]/10',
			'bg-[var(--event-bg)] px-5 py-7 shadow-lg sm:px-6',
			'lg:border-none',
			'lg:bg-transparent lg:px-0 lg:py-0 lg:shadow-none'
		)}
	>
		{@render children()}
	</div>
</div>

<style>
	.scrolly-step {
		--step-desktop-pad-top: clamp(8rem, 20svh, 12rem);

		scroll-margin-top: calc(var(--event-nav-h, 4rem) + 2rem);
	}

	@media (min-width: 1024px) {
		.scrolly-step {
			padding-top: var(--step-desktop-pad-top);
			scroll-margin-top: calc(50svh + var(--event-nav-h, 4rem) * 0.5 - var(--step-desktop-pad-top));
		}
	}
</style>
