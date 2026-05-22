<script lang="ts">
	import EventSEO from '$lib/components/events/EventSEO.svelte';
	import EventNav from '$lib/components/events/EventNav.svelte';
	import EventHero3D from '$lib/components/events/EventHero3D.svelte';
	import EventChapter from '$lib/components/events/scrolly/EventChapter.svelte';
	import FilmSpotlight from '$lib/components/events/FilmSpotlight.svelte';
	import EventDetails from '$lib/components/events/EventDetails.svelte';
	import TNHFooter from '$lib/components/TNHFooter.svelte';
	import { reveal } from '$lib/attachments/reveal';

	let { data } = $props();

	const { meta, content } = $derived(data.event);
	const checkout = $derived(data.checkout);
</script>

<EventSEO {meta} {content} />
<EventNav {meta} {checkout} />

<main
	style:--event-bg={meta.backgroundColor}
	style:--event-accent={meta.accentColor}
	style:--event-hero-bg={meta.themeColor}
>
	<EventHero3D {meta} {checkout} speakers={content.speakers} />

	<section
		id="intro"
		class="px-6 py-16 lg:px-10 lg:py-24"
	>
		<div class="mx-auto max-w-3xl text-center">
			<p
				class="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--event-accent)] uppercase"
				{@attach reveal()}
			>
				{content.intro.eyebrow}
			</p>
			<h2
				class="mt-4 font-serif text-3xl leading-tight text-[var(--event-ink)] md:text-4xl lg:text-5xl"
				{@attach reveal({ delay: 100 })}
			>
				{content.intro.title}
			</h2>
			<p
				class="mt-6 font-sans text-lg leading-relaxed text-[var(--event-ink-muted)]"
				{@attach reveal({ delay: 200 })}
			>
				{content.intro.text}
			</p>
			{#if meta.chair}
				<p class="mt-4 font-sans text-sm text-[var(--event-ink-muted)]" {@attach reveal({ delay: 300 })}>
					Chaired by <strong class="text-[var(--event-ink)]">{meta.chair.name}</strong> — {meta.chair.role}
				</p>
			{/if}
		</div>
	</section>

	{#each content.chapters as chapter, index (chapter.id)}
		<EventChapter {chapter} speakers={content.speakers} programme={content.programme} {index} />
	{/each}

	{#if content.film}
		<FilmSpotlight film={content.film} />
	{/if}

	<EventDetails {meta} {content} {checkout} />

	<TNHFooter />
</main>
