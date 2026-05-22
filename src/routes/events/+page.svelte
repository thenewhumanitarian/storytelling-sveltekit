<script lang="ts">
	import { getEventSummaries } from '$lib/events/registry';
	import { absoluteAssetUrl } from '$lib/events/seo';

	const events = getEventSummaries();

	const indexMeta = {
		title: 'Events',
		description:
			'Immersive event experiences from The New Humanitarian — film screenings, panels, and conversations on humanitarian journalism.',
		canonicalPath: '/events',
		ogImage: events[0]?.ogImage ?? '/images/tnh-logo.svg',
		ogImageAlt: 'The New Humanitarian events'
	};
</script>

<svelte:head>
	<title>Events | The New Humanitarian</title>
	<meta name="description" content={indexMeta.description} />
	<link rel="canonical" href="https://interactive.thenewhumanitarian.org/events" />
</svelte:head>

<section class="px-6 py-20 lg:px-10">
	<div class="mx-auto max-w-5xl">
		<p class="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--event-accent)] uppercase">
			The New Humanitarian
		</p>
		<h1 class="mt-3 font-serif text-4xl text-[var(--event-ink)] md:text-5xl">Events</h1>
		<p class="mt-4 max-w-2xl font-sans text-lg text-[var(--event-ink-muted)]">
			{indexMeta.description}
		</p>

		<ul class="mt-12 grid gap-8 md:grid-cols-2">
			{#each events as event (event.slug)}
				<li>
					<a
						href={event.path}
						class="group block overflow-hidden border border-[var(--event-ink)]/10 bg-white shadow-sm transition-shadow hover:shadow-lg"
					>
						<div class="aspect-[16/9] overflow-hidden bg-[var(--event-ink)]">
							<img
								src={absoluteAssetUrl(event.ogImage)}
								alt=""
								class="h-full w-full object-cover opacity-90 transition-transform group-hover:scale-[1.02]"
							/>
						</div>
						<div class="p-6">
							<p class="font-sans text-xs tracking-wide text-[var(--event-accent)] uppercase">
								{event.status === 'upcoming' ? 'Upcoming' : 'Past event'}
							</p>
							<h2 class="mt-2 font-serif text-2xl text-[var(--event-ink)] group-hover:text-[var(--event-accent)]">
								{event.title}
							</h2>
							<p class="mt-2 font-sans text-sm text-[var(--event-ink-muted)]">{event.subtitle}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>

		<p class="mt-12 font-sans text-sm text-[var(--event-ink-muted)]">
			<a
				href="https://www.thenewhumanitarian.org/events"
				class="text-[var(--event-accent)] underline-offset-2 hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				View all events on thenewhumanitarian.org →
			</a>
		</p>
	</div>
</section>
