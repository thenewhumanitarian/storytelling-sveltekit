<script lang="ts">
	import type { EventMeta, EventContent } from '$lib/events/types';
	import type { EventCheckoutConfig } from '$lib/events/eventbrite';
	import RegisterCTA from '$lib/components/events/RegisterCTA.svelte';
	import EventbriteCheckout from '$lib/components/events/EventbriteCheckout.svelte';

	interface Props {
		meta: EventMeta;
		content: EventContent;
		checkout: EventCheckoutConfig;
	}

	let { meta, content, checkout }: Props = $props();

	const eventDate = $derived(
		new Date(meta.startDate).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			timeZone: 'America/New_York'
		})
	);
</script>

<section id="register" class="scroll-mt-24 px-6 py-16 lg:px-10 lg:py-20">
	<div class="mx-auto max-w-3xl text-center">
		<h2 class="font-serif text-3xl text-[var(--event-ink)] md:text-4xl">Join us in New York</h2>
		<p class="mt-4 font-sans text-lg leading-relaxed text-[var(--event-ink-muted)]">
			Reserve your spot for an evening of film, conversation, and community.
		</p>
	</div>

	{#if checkout.enabled && checkout.eventId}
		<div class="mx-auto mt-10 max-w-2xl">
			<EventbriteCheckout
				eventId={checkout.eventId}
				accentColor={meta.accentColor}
				backgroundColor={meta.backgroundColor}
				inkColor={meta.themeColor}
			/>
		</div>
		<p class="mx-auto mt-6 max-w-2xl text-center font-sans text-xs text-[var(--event-ink-muted)]">
			Secure checkout powered by Eventbrite. Prefer the full event page?
			<a
				href={meta.wwwEventUrl}
				class="text-[var(--event-accent)] underline-offset-2 hover:underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				View on TNH.org
			</a>
		</p>
	{:else}
		<div class="mt-8 flex flex-wrap justify-center gap-4">
			<RegisterCTA href={meta.registrationUrl} />
			<RegisterCTA
				href={meta.wwwEventUrl}
				label="Full details on TNH.org"
				variant="secondary"
			/>
		</div>
	{/if}
</section>

<section class="border-t border-[var(--event-ink)]/10 bg-[var(--event-bg-soft)] px-6 py-16 lg:px-10">
	<div class="mx-auto grid max-w-4xl gap-10 md:grid-cols-2">
		<div>
			<h3 class="font-serif text-xl text-[var(--event-ink)]">Event details</h3>
			<dl class="mt-4 space-y-3 font-sans text-sm text-[var(--event-ink-muted)]">
				<div>
					<dt class="font-semibold text-[var(--event-ink)]">Date</dt>
					<dd>{eventDate}</dd>
				</div>
				<div>
					<dt class="font-semibold text-[var(--event-ink)]">Time</dt>
					<dd>6:30pm EDT (doors open)</dd>
				</div>
				<div>
					<dt class="font-semibold text-[var(--event-ink)]">Location</dt>
					<dd>
						{meta.location.name}<br />
						{meta.location.address}<br />
						{meta.location.city}, {meta.location.region}
					</dd>
				</div>
			</dl>
		</div>

		<div class="space-y-6">
			{#if content.details.catering}
				<div>
					<h3 class="font-serif text-xl text-[var(--event-ink)]">Refreshments</h3>
					<p class="mt-2 font-sans text-sm leading-relaxed text-[var(--event-ink-muted)]">
						{content.details.catering}
					</p>
				</div>
			{/if}

			{#if content.details.partnershipNote || meta.partners.length}
				<div>
					<h3 class="font-serif text-xl text-[var(--event-ink)]">Partnership</h3>
					<p class="mt-2 font-sans text-sm leading-relaxed text-[var(--event-ink-muted)]">
						{content.details.partnershipNote}
					</p>
					<ul class="mt-2">
						{#each meta.partners as partner (partner.name)}
							<li>
								{#if partner.url}
									<a
										href={partner.url}
										class="font-sans text-sm text-[var(--event-accent)] underline-offset-2 hover:underline"
										target="_blank"
										rel="noopener noreferrer"
									>
										{partner.name}
									</a>
								{:else}
									<span class="font-sans text-sm text-[var(--event-ink-muted)]">{partner.name}</span>
								{/if}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	</div>
</section>
