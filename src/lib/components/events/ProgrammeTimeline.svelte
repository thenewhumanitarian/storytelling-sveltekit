<script lang="ts">
	import type { EventProgrammeItem } from '$lib/events/types';
	import { cn } from '$lib/utils/cn';

	type HashHref = `#${string}`;

	interface Props {
		items: EventProgrammeItem[];
		activeId?: string;
		compact?: boolean;
		hrefForItem?: (item: EventProgrammeItem) => HashHref | undefined;
	}

	let { items, activeId, compact = false, hrefForItem }: Props = $props();

	function getHref(item: EventProgrammeItem): HashHref | undefined {
		return hrefForItem?.(item);
	}

	function isActive(item: EventProgrammeItem): boolean {
		return activeId === item.id;
	}

	function itemClass(item: EventProgrammeItem): string {
		return cn(
			'group block w-full min-w-0 cursor-pointer rounded-none border px-5 py-4 text-left no-underline',
			'transition-[background-color,border-color,color,box-shadow] duration-300 ease-out',
			getHref(item) &&
				'hover:border-[var(--event-accent)]/45 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--event-accent)]',
			isActive(item)
				? 'border-[var(--event-accent)]/55 bg-white shadow-md shadow-[var(--event-accent)]/8'
				: 'border-[var(--event-ink)]/8 bg-white/60 shadow-none'
		);
	}

	function dotClass(item: EventProgrammeItem): string {
		return cn(
			'z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
			isActive(item)
				? 'border-[var(--event-accent)] bg-[var(--event-accent)]'
				: 'border-[var(--event-accent)]/40 bg-[var(--event-bg)]'
		);
	}

	function titleClass(item: EventProgrammeItem): string {
		return cn(
			'mt-1 font-serif text-lg leading-tight text-[var(--event-ink)] transition-colors md:text-xl',
			getHref(item) && 'group-hover:text-[var(--event-accent)]'
		);
	}

	function scrollToAnchor(event: MouseEvent, href: HashHref | undefined) {
		if (!href?.startsWith('#')) return;
		const target = document.querySelector<HTMLElement>(href);
		if (!target) return;

		event.preventDefault();
		const navHeight =
			parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--event-nav-h')) ||
			document.querySelector('header')?.getBoundingClientRect().height ||
			64;
		const content = target.querySelector<HTMLElement>('[data-scrolly-step-content]') ?? target;
		const contentRect = content.getBoundingClientRect();
		const availableHeight = window.innerHeight - navHeight;
		const desiredTop = navHeight + availableHeight * 0.5;
		const top = contentRect.top + window.scrollY - desiredTop;

		window.history.replaceState(null, '', href);
		window.scrollTo({ top, behavior: 'smooth' });
	}
</script>

<ol class={cn('programme-timeline relative w-full', compact ? 'space-y-5' : 'space-y-7')}>
	{#each items as item, index (item.id)}
		<li class="relative grid grid-cols-[1.35rem_minmax(0,1fr)] gap-4">
			<div class="flex flex-col items-center pt-3">
				<div class={dotClass(item)}></div>
				{#if index < items.length - 1}
					<div class="mt-1 w-px flex-1 bg-[var(--event-accent)]/25"></div>
				{/if}
			</div>

			{#if getHref(item)}
				<button
					type="button"
					onclick={(event) => scrollToAnchor(event, getHref(item))}
					class={itemClass(item)}
				>
					<p
						class="font-sans text-xs font-bold tracking-[0.08em] text-[var(--event-accent)] uppercase"
					>
						{item.time}
					</p>
					<h4 class={titleClass(item)}>{item.title}</h4>
					{#if item.description && !compact}
						<p class="mt-2 font-sans text-sm leading-relaxed text-[var(--event-ink-muted)]">
							{item.description}
						</p>
					{/if}
				</button>
			{:else}
				<div class={itemClass(item)}>
					<p
						class="font-sans text-xs font-bold tracking-[0.08em] text-[var(--event-accent)] uppercase"
					>
						{item.time}
					</p>
					<h4 class={titleClass(item)}>{item.title}</h4>
					{#if item.description && !compact}
						<p class="mt-2 font-sans text-sm leading-relaxed text-[var(--event-ink-muted)]">
							{item.description}
						</p>
					{/if}
				</div>
			{/if}
		</li>
	{/each}
</ol>

<style>
	.programme-timeline::before {
		content: '';
		position: absolute;
		top: 1.25rem;
		bottom: 1.25rem;
		left: 0.64rem;
		width: 1px;
		background: linear-gradient(
			to bottom,
			transparent,
			rgb(160 60 80 / 0.36) 12%,
			rgb(160 60 80 / 0.24) 88%,
			transparent
		);
	}

	.programme-timeline :global(a),
	.programme-timeline :global(a:hover),
	.programme-timeline :global(a:focus-visible),
	.programme-timeline :global(button),
	.programme-timeline :global(button:hover),
	.programme-timeline :global(button:focus-visible) {
		transform: none;
	}
</style>
