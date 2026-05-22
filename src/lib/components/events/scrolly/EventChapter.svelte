<script lang="ts">
	import type { EventChapter, EventSpeaker, EventProgrammeItem } from '$lib/events/types';
	import Scrolly from '$lib/components/events/scrolly/Scrolly.svelte';
	import Step from '$lib/components/events/scrolly/Step.svelte';
	import SpeakerPortrait from '$lib/components/events/SpeakerPortrait.svelte';
	import ProgrammeTimeline from '$lib/components/events/ProgrammeTimeline.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		chapter: EventChapter;
		speakers: EventSpeaker[];
		programme: EventProgrammeItem[];
		index: number;
	}

	let { chapter, speakers, programme, index }: Props = $props();

	const isProgrammeChapter = $derived(chapter.steps.some((step) => step.viz?.type === 'programme'));
	const vizSide = $derived(isProgrammeChapter ? 'left' : (chapter.vizSide ?? 'left'));

	const accentBg = $derived(
		{
			burgundy: 'from-[var(--event-bg)] via-[var(--event-bg)] to-[var(--event-accent)]/8',
			cream: 'from-[var(--event-bg)] to-[var(--event-bg-soft)]',
			ink: 'from-[var(--event-bg)] to-[var(--event-bg)]'
		}[chapter.accent ?? 'cream']
	);

	function getSpeaker(id: string | undefined): EventSpeaker | undefined {
		if (!id) return undefined;
		return speakers.find((s) => s.id === id);
	}

	function getStep(stepIndex: number): EventChapter['steps'][number] | undefined {
		return chapter.steps[stepIndex];
	}

	function getStepSpeaker(stepIndex: number): EventSpeaker | undefined {
		const viz = getStep(stepIndex)?.viz;
		return viz?.type === 'speaker' ? getSpeaker(viz.speakerId) : undefined;
	}

	function getStepProgrammeId(stepIndex: number): string | undefined {
		const viz = getStep(stepIndex)?.viz;
		return viz?.type === 'programme' ? viz.programmeId : undefined;
	}

	function getStepImage(stepIndex: number): { image: string; imageAlt?: string } | undefined {
		const viz = getStep(stepIndex)?.viz;
		return viz?.type === 'image' && viz.image
			? { image: viz.image, imageAlt: viz.imageAlt }
			: undefined;
	}

	function getStepImageSrc(stepIndex: number): string | undefined {
		return getStepImage(stepIndex)?.image;
	}

	function getStepImageAlt(stepIndex: number): string {
		return getStepImage(stepIndex)?.imageAlt ?? '';
	}

	function getProgrammeHref(item: EventProgrammeItem): `#${string}` | undefined {
		const step = chapter.steps.find((entry) => {
			const viz = entry.viz;
			return viz?.type === 'programme' && viz.programmeId === item.id;
		});
		return step ? `#${chapter.id}-${step.id}` : undefined;
	}

	function stepVizKey(step: EventChapter['steps'][number] | undefined): string {
		if (!step?.viz) return 'empty';
		return JSON.stringify(step.viz);
	}

	function hasStepViz(step: EventChapter['steps'][number] | undefined): boolean {
		return !!step?.viz && step.viz.type !== 'empty';
	}

	function sharesAdjacentViz(stepIndex: number): boolean {
		const step = chapter.steps[stepIndex];
		if (!hasStepViz(step)) return false;
		const key = stepVizKey(step);
		return (
			(hasStepViz(chapter.steps[stepIndex - 1]) &&
				stepVizKey(chapter.steps[stepIndex - 1]) === key) ||
			(hasStepViz(chapter.steps[stepIndex + 1]) && stepVizKey(chapter.steps[stepIndex + 1]) === key)
		);
	}

	function shouldShowMobileSpeakerFirst(step: EventChapter['steps'][number] | undefined): boolean {
		return step?.viz?.type === 'speaker' && !!getSpeaker(step.viz.speakerId);
	}
</script>

<section
	id={chapter.id}
	class={cn(
		'event-chapter relative isolate overflow-clip bg-linear-to-b px-6 py-16 lg:px-10 lg:py-24',
		accentBg,
		index % 2 === 1 && 'bg-[var(--event-bg-soft)]'
	)}
>
	<header class="mx-auto mb-12 max-w-3xl text-center lg:mb-16">
		{#if chapter.eyebrow}
			<p
				class="font-sans text-xs font-semibold tracking-[0.25em] text-[var(--event-accent)] uppercase"
			>
				{chapter.eyebrow}
			</p>
		{/if}
		<h2
			class="mt-3 font-serif text-3xl leading-tight text-[var(--event-ink)] md:text-4xl lg:text-5xl"
		>
			{chapter.title}
		</h2>
		{#if chapter.subtitle}
			<p class="mt-4 font-sans text-lg leading-relaxed text-[var(--event-ink-muted)]">
				{chapter.subtitle}
			</p>
		{/if}
	</header>

	<div class="mx-auto w-full max-w-6xl">
		<Scrolly {vizSide}>
			{#snippet viz({ activeStep })}
				<div class="flex h-full w-full items-center justify-center p-4 lg:justify-center">
					<div class="event-viz-frame w-full max-w-xl lg:max-w-[26rem]">
						{#if getStepSpeaker(activeStep)}
							<SpeakerPortrait speaker={getStepSpeaker(activeStep)} />
						{:else if getStepProgrammeId(activeStep)}
							<ProgrammeTimeline
								items={programme}
								activeId={getStepProgrammeId(activeStep)}
								hrefForItem={getProgrammeHref}
								compact
							/>
						{:else if getStepImageSrc(activeStep)}
							<img
								src={getStepImageSrc(activeStep)}
								alt={getStepImageAlt(activeStep)}
								class="w-full rounded-none shadow-xl"
							/>
						{/if}
					</div>
				</div>
			{/snippet}

			{#snippet steps({ activeStep })}
				{#each chapter.steps as step, stepIndex (step.id)}
					<Step
						isActive={activeStep === stepIndex}
						id={`${chapter.id}-${step.id}`}
						class={cn(
							isProgrammeChapter && 'programme-mobile-step',
							isProgrammeChapter && stepIndex === 0 && 'programme-first-step'
						)}
					>
						{#if shouldShowMobileSpeakerFirst(step) && step.viz?.type === 'speaker'}
							<div data-scrolly-mobile-viz class="mb-8 lg:hidden">
								<SpeakerPortrait speaker={getSpeaker(step.viz.speakerId)} />
							</div>
						{/if}

						{#if isProgrammeChapter && getStepProgrammeId(stepIndex)}
							<div class="programme-mobile-entry lg:hidden">
								<div class="programme-mobile-marker" aria-hidden="true">
									<span class="programme-mobile-dot"></span>
									{#if stepIndex < chapter.steps.length - 1}
										<span class="programme-mobile-line"></span>
									{/if}
								</div>
								<div class="programme-mobile-copy">
									{#if step.eyebrow}
										<p
											class="font-sans text-xs font-semibold tracking-[0.2em] text-[var(--event-accent)] uppercase"
										>
											{step.eyebrow}
										</p>
									{/if}
									{#if step.title}
										<h3
											class="mt-2 font-serif text-2xl leading-snug text-[var(--event-ink)] md:text-3xl"
										>
											{step.title}
										</h3>
									{/if}
									{#if step.text}
										<p
											class="mt-4 font-sans text-base leading-relaxed text-[var(--event-ink-muted)] md:text-lg"
										>
											{step.text}
										</p>
									{/if}
								</div>
							</div>

							<div class="hidden lg:block">
								{#if step.eyebrow}
									<p
										class="font-sans text-xs font-semibold tracking-[0.2em] text-[var(--event-accent)] uppercase"
									>
										{step.eyebrow}
									</p>
								{/if}
								{#if step.title}
									<h3
										class="mt-2 font-serif text-2xl leading-snug text-[var(--event-ink)] md:text-3xl"
									>
										{step.title}
									</h3>
								{/if}
								{#if step.text}
									<p
										class="mt-4 font-sans text-base leading-relaxed text-[var(--event-ink-muted)] md:text-lg"
									>
										{step.text}
									</p>
								{/if}
							</div>
						{:else}
							{#if step.eyebrow}
								<p
									class="font-sans text-xs font-semibold tracking-[0.2em] text-[var(--event-accent)] uppercase"
								>
									{step.eyebrow}
								</p>
							{/if}
							{#if step.title}
								<h3
									class="mt-2 font-serif text-2xl leading-snug text-[var(--event-ink)] md:text-3xl"
								>
									{step.title}
								</h3>
							{/if}
							{#if step.text}
								<p
									class="mt-4 font-sans text-base leading-relaxed text-[var(--event-ink-muted)] md:text-lg"
								>
									{step.text}
								</p>
							{/if}
							{#if step.quote}
								<blockquote
									class="mt-4 border-l-4 border-[var(--event-accent)] pl-4 font-serif text-xl italic text-[var(--event-ink)]"
								>
									{step.quote}
								</blockquote>
							{/if}
						{/if}

						<!-- Mobile inline viz -->
						{#if step.viz && hasStepViz(step) && !sharesAdjacentViz(stepIndex) && step.viz.type !== 'speaker' && !(isProgrammeChapter && step.viz.type === 'programme')}
							<div data-scrolly-mobile-viz class="mt-8 lg:hidden">
								{#if step.viz.type === 'programme'}
									<ProgrammeTimeline
										items={programme}
										activeId={step.viz.programmeId}
										hrefForItem={getProgrammeHref}
										compact
									/>
								{:else if step.viz.type === 'image' && step.viz.image}
									<img
										src={step.viz.image}
										alt={step.viz.imageAlt ?? ''}
										class="w-full shadow-lg"
									/>
								{/if}
							</div>
						{/if}
					</Step>
				{/each}
			{/snippet}
		</Scrolly>
	</div>
</section>

<style>
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(.animate-fade-in) {
		animation: fade-in 400ms ease-out both;
	}

	.event-viz-frame {
		contain: layout paint;
	}

	.event-chapter::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background-image: radial-gradient(circle, rgb(160 60 80 / 0.18) 1.15px, transparent 1.35px);
		background-position:
			top 3rem left 7%,
			center;
		background-size: 9px 9px;
		mask-image:
			radial-gradient(ellipse 24rem 18rem at 18% 28%, black, transparent 72%),
			radial-gradient(ellipse 18rem 14rem at 86% 74%, black, transparent 70%);
		opacity: 0.65;
	}

	:global(.programme-mobile-step) {
		padding-top: 0;
		padding-bottom: 0;
	}

	:global(.programme-mobile-step [data-scrolly-step-content]) {
		border: 0;
		background: transparent;
		box-shadow: none;
		padding: 0;
	}

	.programme-mobile-entry {
		display: grid;
		grid-template-columns: 1.5rem minmax(0, 1fr);
		gap: 1rem;
	}

	.programme-mobile-marker {
		position: relative;
		display: flex;
		justify-content: center;
		padding-top: 1.65rem;
	}

	.programme-mobile-dot {
		position: relative;
		z-index: 1;
		width: 1rem;
		height: 1rem;
		border: 2px solid var(--event-accent);
		border-radius: 999px;
		background: var(--event-accent);
	}

	.programme-mobile-line {
		position: absolute;
		top: 2.65rem;
		bottom: -2rem;
		width: 1px;
		background: linear-gradient(to bottom, rgb(160 60 80 / 0.38), rgb(160 60 80 / 0.18));
	}

	.programme-mobile-copy {
		margin-bottom: 1.5rem;
		border: 1px solid rgb(160 60 80 / 0.24);
		background: rgb(247 244 239 / 0.78);
		padding: 1.5rem;
		box-shadow: 0 16px 34px rgb(41 41 41 / 0.06);
	}

	@media (min-width: 1024px) {
		.programme-mobile-entry {
			display: none;
		}

		:global(.programme-mobile-step) {
			align-items: center;
			padding-bottom: 6svh;
			padding-top: 6svh;
			scroll-margin-top: 0;
		}

		:global(.programme-first-step) {
			scroll-margin-top: 0;
		}

		:global(.programme-mobile-step [data-scrolly-step-content]) {
			border: 0;
			background: transparent;
			box-shadow: none;
			padding: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.animate-fade-in) {
			animation: none;
		}
	}
</style>
