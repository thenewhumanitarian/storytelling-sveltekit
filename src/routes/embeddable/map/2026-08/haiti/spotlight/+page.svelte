<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let animationProgress = $state(1);
	let ready = $state(false);
	const isFrench = $derived(data.lang === 'fr');
	const formatter = $derived(new Intl.NumberFormat(isFrench ? 'fr-FR' : 'en-GB'));
	const finalCount = $derived(formatter.format(data.droneCount));
	const displayedCount = $derived(
		formatter.format(Math.round(data.droneCount * animationProgress))
	);
	const digitSlots = $derived.by(() => {
		const padded = String(Math.round(data.droneCount * animationProgress)).padStart(
			String(data.droneCount).length,
			'0'
		);
		let index = 0;
		let leading = true;
		return Array.from(finalCount).map((character) => {
			if (!/\d/.test(character)) return { character, digit: null, visible: !leading };
			const digit = Number(padded[index++]);
			const visible = !leading || digit > 0 || index === padded.length;
			leading = !visible;
			return { character, digit, visible };
		});
	});
	const numberOffset = $derived(
		digitSlots.reduce(
			(width, slot) => width + (slot.visible ? 0 : slot.digit === null ? 0.3 : 0.62),
			0
		) / -2
	);

	const title = $derived(isFrench ? 'drones explosifs recensés' : 'explosive drones recorded');

	onMount(() => {
		if (!data.showDroneTotal) return;
		let disposed = false;
		let frame = 0;
		let started = false;
		let observer: IntersectionObserver | undefined;
		let onMessage: ((event: MessageEvent) => void) | undefined;
		const startAnimation = () => {
			if (started) return;
			started = true;
			let start: number | undefined;
			const tick = (now: number) => {
				start ??= now;
				const progress = Math.max(0, Math.min((now - start) / 1800, 1));
				animationProgress = 1 - (1 - progress) ** 3;
				if (progress < 1) frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		};
		const initialise = () => {
			if (disposed) return;
			const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
			animationProgress = reducedMotion ? 1 : 0;
			ready = true;
			if (
				window.self !== window.top &&
				new URLSearchParams(window.location.search).get('autoplay') === 'external'
			) {
				onMessage = (event: MessageEvent) => {
					if (
						!reducedMotion &&
						event.source === window.parent &&
						event.data?.type === 'tnh-haiti-spotlight-start'
					)
						startAnimation();
				};
				window.addEventListener('message', onMessage);
				window.parent.postMessage({ type: 'tnh-haiti-spotlight-ready' }, '*');
				return;
			}
			if (reducedMotion) return;
			observer = new IntersectionObserver(
				([entry]) => {
					if (entry.isIntersecting && entry.intersectionRatio >= 0.25) startAnimation();
				},
				{ threshold: 0.25 }
			);
			const main = document.querySelector<HTMLElement>('.haiti-spotlight');
			if (main) observer.observe(main);
		};
		// Resolve this local font before revealing text; late metric swaps must not move the counter.
		const revealAfterLayout = () => {
			if (disposed) return;
			frame = requestAnimationFrame(() => {
				frame = requestAnimationFrame(initialise);
			});
		};
		void document.fonts
			.load('700 96px "Haiti Counter Sectra"')
			.then(revealAfterLayout, revealAfterLayout);
		return () => {
			disposed = true;
			cancelAnimationFrame(frame);
			observer?.disconnect();
			if (onMessage) window.removeEventListener('message', onMessage);
		};
	});
</script>

<svelte:head>
	<title
		>{isFrench ? 'Drones explosifs en Haïti' : 'Explosive drones in Haiti'} | The New Humanitarian</title
	>
	<meta
		name="description"
		content={isFrench
			? 'Le nombre de drones explosifs recensés dans la carte interactive de The New Humanitarian.'
			: 'The number of explosive drones recorded in The New Humanitarian’s interactive Haiti map.'}
	/>
</svelte:head>

<noscript
	><style>
		.counter {
			visibility: visible !important;
		}
	</style></noscript
>

{#if data.showDroneTotal}
	<main class="haiti-spotlight" lang={data.lang}>
		<section class="counter" style:visibility={ready ? 'visible' : 'hidden'}>
			<h1 aria-label={`${isFrench ? 'Au moins' : 'At least'} ${finalCount} ${title}`}>
				<span
					class="number-value"
					aria-hidden="true"
					data-display={`${displayedCount}+`}
					style:transform={`translateX(${numberOffset}em)`}
				>
					{#each digitSlots as slot, index (index)}
						{#if slot.digit !== null}
							<span class="digit-window" style:opacity={slot.visible ? 1 : 0}>
								<span class="digit-strip" style:transform={`translateY(${-slot.digit * 1.3}em)`}>
									{#each [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as digit (digit)}<span>{digit}</span>{/each}
								</span>
							</span>
						{:else}
							<span class="separator" style:opacity={slot.visible ? 1 : 0}>{slot.character}</span>
						{/if}
					{/each}
					<span class="plus">+</span>
				</span>
			</h1>
			<p aria-hidden="true">{title}</p>
		</section>
	</main>
{/if}

<style>
	@font-face {
		font-family: 'Haiti Counter Sectra';
		src: url('/fonts/GT-Sectra-Fine-Bold.woff') format('woff');
		font-weight: 700;
		font-display: block;
	}

	:global(html),
	:global(body) {
		margin: 0;
		width: 100%;
		height: 100%;
	}

	.haiti-spotlight {
		display: grid;
		place-items: center;
		width: 100%;
		height: 100svh;
		overflow: hidden;
		padding: clamp(1rem, 3vmin, 2.5rem);
		color: #fff9f3;
		background: radial-gradient(circle at 72% 48%, #65313d 0, #311e29 48%, #1b1922 100%);
	}

	.counter {
		width: 100%;
		max-width: 100%;
		text-align: center;
	}

	h1 {
		position: relative;
		display: grid;
		place-items: center;
		width: 100%;
		height: 1.3em;
		margin: 0;
		font-family: 'Haiti Counter Sectra', Georgia, serif;
		font-size: clamp(4.2rem, 24vmin, 13rem);
		font-weight: 700;
		line-height: 1.3;
		font-variant-numeric: tabular-nums;
	}

	.number-value {
		display: inline-flex;
		height: 1.3em;
		white-space: nowrap;
	}
	.digit-window {
		display: block;
		width: 0.62em;
		height: 1.3em;
		overflow: hidden;
	}
	.digit-strip {
		display: block;
		width: 100%;
		will-change: transform;
	}
	.digit-strip > span {
		display: block;
		width: 100%;
		height: 1.3em;
		line-height: 1.3;
		overflow: hidden;
		text-align: center;
	}
	.separator {
		display: block;
		width: 0.3em;
		height: 1.3em;
	}
	.plus {
		display: block;
		width: 0.5em;
		height: 1.3em;
	}

	p {
		margin: 0.45em 0 0;
		font-family: 'Haiti Counter Sectra', Georgia, serif;
		font-size: clamp(1.1rem, 4vmin, 2.8rem);
		line-height: 1.14;
		min-height: 2.28em;
		display: grid;
		place-items: start center;
	}

	@media (max-height: 240px) {
		.haiti-spotlight {
			padding: 0.55rem 0.75rem;
		}
		h1 {
			font-size: clamp(3.6rem, 31vh, 5.2rem);
		}
		p {
			font-size: clamp(0.95rem, 6.2vh, 1.2rem);
		}
	}
</style>
