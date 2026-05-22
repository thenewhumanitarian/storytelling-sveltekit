<script lang="ts">
	import { cn } from '$lib/utils/cn';

	interface Props {
		href: string;
		label?: string;
		variant?: 'primary' | 'secondary' | 'dark';
		class?: string;
	}

	let {
		href,
		label = 'Reserve your spot',
		variant = 'primary',
		class: className
	}: Props = $props();

	const isExternal = $derived(/^https?:\/\//.test(href));
</script>

<a
	{href}
	target={isExternal ? '_blank' : undefined}
	rel={isExternal ? 'noopener noreferrer' : undefined}
	class={cn(
		'inline-flex items-center justify-center rounded-full px-8 py-3.5 font-sans text-sm font-semibold tracking-wide uppercase transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-2',
		variant === 'primary' &&
			'bg-[var(--event-accent)] text-white hover:bg-[var(--event-accent)]/90 focus-visible:outline-[var(--event-accent)]',
		variant === 'secondary' &&
			'border-2 border-[var(--event-accent)] bg-transparent text-[var(--event-accent)] hover:bg-[var(--event-accent)]/5 focus-visible:outline-[var(--event-accent)]',
		variant === 'dark' &&
			'bg-[var(--event-ink)] text-white hover:bg-[var(--event-ink)]/90 focus-visible:outline-[var(--event-ink)]',
		className
	)}
>
	{label}
</a>
