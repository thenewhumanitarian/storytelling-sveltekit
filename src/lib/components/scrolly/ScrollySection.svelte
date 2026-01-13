<script lang="ts">
	/**
	 * ScrollySection - Reusable scrollytelling container
	 *
	 * Based on the sleep-training pattern:
	 * - Sticky visualization container
	 * - Scroll steps with negative margin-top to overlap sticky
	 * - Text boxes appear ON TOP of visualization
	 * - STICKY LOGIC: preserves first/last step when scrolling past section
	 */
	import ScrollyHelper from './ScrollyHelper.svelte';
	import ScrollyTextBox from './ScrollyTextBox.svelte';
	import { onMount } from 'svelte';

	interface SourceLink {
		text: string;
		url: string;
	}

	interface Step {
		text?: string;
		title?: string;
		image?: string;
		bgColor?: string;
		raw?: boolean; // If true, render text without ScrollyTextBox wrapper
		source?: SourceLink; // Optional source link for citations
		imageCredit?: string; // Optional photo credit
	}

	interface Props {
		activeStep?: number;
		steps: Step[];
		backgroundColor?: string;
		showTextBoxes?: boolean;
		textBoxVariant?: 'light' | 'dark';
		textBoxPosition?: 'center' | 'left' | 'right';
		firstStepOffset?: number; // Extra viewport fraction to push first step down (0 = default, 0.5 = 50vh lower)
		onStepEnter?: (stepIndex: number, direction: 'up' | 'down') => void;
		onScrollProgress?: (progress: number) => void;
		children?: import('svelte').Snippet<[{ activeStep: number }]>;
	}

	let {
		activeStep = $bindable(0),
		steps,
		backgroundColor = '#0a0a0a',
		showTextBoxes = true,
		textBoxVariant = 'light',
		textBoxPosition = 'center',
		firstStepOffset = 0,
		onStepEnter,
		onScrollProgress,
		children
	}: Props = $props();

	// Raw value from ScrollyHelper (can be undefined when nothing visible)
	let rawStep = $state<number | undefined>(undefined);

	// Internal step that's always valid (applies sticky logic)
	let internalStep = $state(0);

	// Track previous step for direction detection
	let previousStep = $state<number | undefined>(undefined);

	// STICKY LOGIC: When rawStep is defined, use it. When undefined (scrolled past),
	// internalStep naturally stays at its current value (first or last step).
	$effect(() => {
		if (rawStep !== undefined) {
			internalStep = rawStep;
		}
		activeStep = internalStep;
	});

	// Fire onStepEnter callback when internalStep changes
	$effect(() => {
		if (internalStep !== previousStep) {
			const direction = previousStep === undefined || internalStep > previousStep ? 'down' : 'up';
			onStepEnter?.(internalStep, direction);
			previousStep = internalStep;
		}
	});

	let viewportHeight = $state(800);
	let stepHeight = $derived(Math.max(viewportHeight * 0.7, 520));
	let stepGap = $derived(Math.max(viewportHeight * 0.25, 240));
	let triggerOffset = $derived(Math.round(viewportHeight * 0.25));

	// Section element reference for scroll progress tracking
	let sectionEl: HTMLElement | undefined = $state();

	onMount(() => {
		viewportHeight = window.innerHeight;
		const handleResize = () => (viewportHeight = window.innerHeight);
		window.addEventListener('resize', handleResize);

		// Scroll progress tracking
		const handleScroll = () => {
			if (!sectionEl || !onScrollProgress) return;

			const rect = sectionEl.getBoundingClientRect();
			const sectionHeight = rect.height;
			const scrolledPast = -rect.top; // How far we've scrolled into/past the section
			const scrollableDistance = sectionHeight - viewportHeight;

			// Progress: 0 = at top of section, 1 = scrolled past section
			const progress = Math.max(0, Math.min(1, scrolledPast / scrollableDistance));
			onScrollProgress(progress);
		};

		if (onScrollProgress) {
			window.addEventListener('scroll', handleScroll, { passive: true });
			handleScroll(); // Initial call
		}

		return () => {
			window.removeEventListener('resize', handleResize);
			if (onScrollProgress) {
				window.removeEventListener('scroll', handleScroll);
			}
		};
	});
</script>

<section
	bind:this={sectionEl}
	class="scroll-section"
	style:background={backgroundColor}
	style={`--vh:${viewportHeight}px`}
>
	<div class="scroll-inner">
		<!-- Sticky visualization layer -->
		<div class="visual-layer">
			{#if children}
				{@render children({ activeStep: internalStep })}
			{/if}
		</div>

		<!-- Text track (drives scroll + animation state) -->
		<div class="text-track">
			<ScrollyHelper bind:value={rawStep} top={triggerOffset} bottom={triggerOffset}>
				{#each steps as step, i}
					{@const isFirst = i === 0}
					{@const isLast = i === steps.length - 1}
					{@const active = internalStep === i}
					<div
						class="step"
						class:active
						class:step-first={isFirst}
						style:min-height={isFirst && step.raw ? `${viewportHeight}px` : `${stepHeight}px`}
						style:margin-bottom={`${isLast ? viewportHeight * 0.5 : stepGap}px`}
						style:margin-top={isFirst && firstStepOffset > 0 ? `${viewportHeight * (-1 + firstStepOffset)}px` : undefined}
					>
						{#if step.raw && step.text}
							<!-- Raw content without text box wrapper -->
							<div class="step-raw">
								{@html step.text}
							</div>
						{:else if showTextBoxes && step.text}
							<div
								class="step-content"
								class:position-left={textBoxPosition === 'left'}
								class:position-right={textBoxPosition === 'right'}
							>
								<ScrollyTextBox
									title={step.title || ''}
									image={step.image || null}
									bgColor={step.bgColor || null}
									source={step.source || null}
									imageCredit={step.imageCredit || null}
									{active}
									variant={textBoxVariant}
								>
									{@html step.text}
								</ScrollyTextBox>
							</div>
						{/if}
					</div>
				{/each}
			</ScrollyHelper>
		</div>
	</div>
</section>

<style>
	.scroll-section {
		position: relative;
		width: 100%;
		isolation: isolate;
	}

	.scroll-inner {
		position: relative;
	}

	.visual-layer {
		position: sticky;
		top: 0;
		width: 100%;
		height: 100vh;
		min-height: var(--vh);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.text-track {
		position: relative;
		z-index: 2;
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 1.5rem calc(var(--vh) * 0.4);
	}

	.step {
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0.35;
		transform: translateY(6px);
		transition: opacity 220ms ease, transform 220ms ease;
		pointer-events: none;
	}

	.step.active {
		opacity: 1;
		transform: translateY(0);
	}

	/* First step starts at negative margin to overlap sticky layer from top */
	.step.step-first {
		margin-top: calc(var(--vh) * -1);
	}

	.step-raw {
		pointer-events: auto;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.step-content {
		pointer-events: auto;
		max-width: 480px;
		width: 100%;
		padding: 0 0.5rem;
	}

	.step-content.position-left {
		margin-right: auto;
	}

	.step-content.position-right {
		margin-left: auto;
	}

	@media (max-width: 900px) {
		.text-track {
			padding: calc(var(--vh) * 0.2) 1.25rem calc(var(--vh) * 0.35);
		}
	}

	@media (max-width: 768px) {
		.text-track {
			padding: calc(var(--vh) * 0.18) 1rem calc(var(--vh) * 0.25);
		}

		.step-content {
			max-width: 360px;
		}

		.step-content.position-left,
		.step-content.position-right {
			margin: 0 auto;
		}
	}
</style>
