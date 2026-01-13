<script lang="ts">
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { onMount } from 'svelte';

	// Header animation states (for initial load)
	let titleVisible = $state(false);
	let descVisible = $state(false);
	let bylineVisible = $state(false);

	// Scrolly state - step 0 is header, step 1 & 2 are content boxes
	let activeStep = $state(0);

	// Video scrolly state
	let activeVideoStep = $state(0);
	let videoRefs: (HTMLVideoElement | null)[] = $state([]);

	// Effect to handle video play/pause based on active step
	$effect(() => {
		videoRefs.forEach((video, i) => {
			if (video) {
				if (i === activeVideoStep) {
					video.play().catch(() => {});
				} else {
					video.pause();
					video.currentTime = 0;
				}
			}
		});
	});

	onMount(() => {
		// Staggered reveal animation for header
		setTimeout(() => (titleVisible = true), 100);
		setTimeout(() => (descVisible = true), 400);
		setTimeout(() => (bylineVisible = true), 700);
	});

	function handleStepChange(stepIndex: number) {
		return ({ detail }: CustomEvent<ObserverEventDetails>) => {
			if (detail.inView) {
				activeStep = stepIndex;
			}
		};
	}

	// Handle video step change
	function handleVideoStepChange(stepIndex: number) {
		return ({ detail }: CustomEvent<ObserverEventDetails>) => {
			if (detail.inView) {
				activeVideoStep = stepIndex;
			}
		};
	}

	// Image logic: Image 1 for steps 0 and 1, Image 2 for step 2
	const images = ['/images/assam-evictions/image1.jpg', '/images/assam-evictions/image2.jpg'];

	function getActiveImageIndex(step: number): number {
		return step < 2 ? 0 : 1;
	}

	const contentSteps = [
		{
			title: 'The Evictions Begin',
			text: 'In Assam, India, authorities have conducted mass evictions that have displaced thousands of families from their homes. The demolitions often occur with little warning, leaving residents scrambling to salvage their belongings.'
		},
		{
			title: 'Aftermath',
			text: 'After the evictions, families are left to pick up the pieces of their shattered lives. Many have lost everything they owned and face an uncertain future with no clear path to resettlement or compensation.'
		}
	];

	// Video scrolly steps - compelling quotes that define intent
	const videoSteps = [
		{
			file: '1952348361748594720_00001.mp4',
			date: 'August 4, 2025',
			quote: '"The drive WILL CONTINUE, here as well as across the State, to take back EVERY INCH of land which rightfully belongs to the people of Assam."',
			context: 'On eviction drives in Rengma Reserve Forest',
			link: 'https://x.com/himantabiswa/status/1952348361748594720'
		},
		{
			file: '1960624416171417922_00001.mp4',
			date: 'August 27, 2025',
			quote: '"Encroachers who were earlier fighting our eviction drives are now supporting it. The best way forward is Compliance over Confrontation."',
			context: 'Framing acquiescence as community support',
			link: 'https://x.com/himantabiswa/status/1960624416171417922'
		},
		{
			file: '1932812566457196638_00001.mp4',
			date: 'June 11, 2025',
			quote: '"Regardless of whether someone\'s name is listed in the NRC or not, if the administration determines someone to be an illegal infiltrator, they will be pushed back."',
			context: 'Declaring legal citizenship status irrelevant',
			link: 'https://x.com/himantabiswa/status/1932812566457196638'
		},
		{
			file: '2008539054044823637_00001.mp4',
			date: 'January 6, 2026',
			quote: '"You don\'t encroach on our lands, our culture and then cry victim when the JCBs arrive. You just make way for them. The eviction drive will spare no one."',
			context: 'Warning to communities facing demolition',
			link: 'https://x.com/himantabiswa/status/2008539054044823637'
		},
		{
			file: '2010693241705054300_00001.mp4',
			date: 'January 12, 2026',
			quote: '"\'Shoot at Sight\' का आदेश दिया गया।"',
			translation: 'A "Shoot at Sight" order was given.',
			context: 'On orders issued in Dhubri district',
			link: 'https://x.com/himantabiswa/status/2010693241705054300'
		}
	];
</script>

<svelte:head>
	<title>Evicting a People | TNH Storytelling</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Unified Scrolly Container - starts at page top -->
<div class="scrolly-container relative">
	<!-- Fixed background image container -->
	<div class="fixed inset-0 w-full h-full bg-black">
		{#each images as image, i}
			<img
				src={image}
				alt="Assam eviction scene {i + 1}"
				class="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
				class:opacity-100={getActiveImageIndex(activeStep) === i}
				class:opacity-0={getActiveImageIndex(activeStep) !== i}
			/>
		{/each}
		<!-- Dark overlay for better text readability -->
		<div class="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
	</div>

	<!-- Scrollable steps -->
	<article class="relative z-10">
		<!-- Step 0: Header (over Image 1) -->
		<div
			class="step min-h-screen flex items-center justify-center p-4"
			use:inview={{ rootMargin: '-40% 0px -40% 0px' }}
			oninview_change={handleStepChange(0)}
		>
			<div class="header-content max-w-3xl mx-auto text-center">
				<h1
					class="header-title text-white mb-6"
					class:title-visible={titleVisible}
				>
					Evicting a People
				</h1>

				<p
					class="header-desc text-white/90 mb-8"
					class:desc-visible={descVisible}
				>
					In Assam, India, a wave of demolitions has displaced thousands of Muslim families
					from their homes. Conducted under the guise of evicting "illegal encroachers,"
					these operations have left communities shattered and futures uncertain.
				</p>

				<div
					class="header-byline"
					class:byline-visible={bylineVisible}
				>
					<p class="text-white/70 text-sm tracking-widest uppercase mb-2">By</p>
					<p class="text-white font-medium text-lg">Ahmer Khan and Tom Vaillant</p>
					<p class="text-white/50 text-sm mt-2">January 2026</p>
				</div>

				<!-- Scroll indicator -->
				<div
					class="scroll-indicator mt-12"
					class:byline-visible={bylineVisible}
				>
					<div class="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 mx-auto">
						<div class="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Step 1 & 2: Content boxes -->
		{#each contentSteps as step, i}
			<div
				class="step min-h-screen flex items-center justify-center p-4"
				use:inview={{ rootMargin: '-40% 0px -40% 0px' }}
				oninview_change={handleStepChange(i + 1)}
			>
				<div class="text-box max-w-xl bg-white/95 backdrop-blur-sm p-8 rounded shadow-2xl">
					<h2 class="step-title text-gray-900 mb-4">{step.title}</h2>
					<p class="step-text text-gray-700">{step.text}</p>
				</div>
			</div>
		{/each}

		<!-- Spacer at the end to allow scrolling past last step -->
		<div class="h-[50vh]"></div>
	</article>
</div>

<!-- Content Section -->
<section class="content-section relative z-20 bg-white py-20 px-6">
	<div class="max-w-2xl mx-auto">
		<h2 class="content-heading text-gray-900 mb-8">
			A Pattern of Displacement
		</h2>

		<div class="prose-content text-gray-700 space-y-6">
			<p>
				The evictions in Assam are part of a broader pattern of displacement that has affected
				minority communities across India. Human rights organizations have documented numerous
				cases where residents were given little to no notice before bulldozers arrived.
			</p>

			<p>
				Families describe waking to the sound of machinery, scrambling to gather what few
				possessions they could carry before their homes were reduced to rubble. Many had lived
				in these communities for generations, building lives and livelihoods that were
				destroyed in hours.
			</p>

			<blockquote class="border-l-4 border-gray-300 pl-6 my-8 italic text-gray-600">
				"We had no warning. They came with bulldozers and told us to leave.
				Everything we had built over 30 years was gone in an afternoon."
				<cite class="block mt-2 text-sm not-italic text-gray-500">
					— Noorjahan Begum, displaced resident
				</cite>
			</blockquote>

			<p>
				The government maintains that the evictions target illegal encroachments on public land.
				However, critics argue that many of the displaced families held legitimate claims to their
				land, and that the operations disproportionately affect Muslim communities.
			</p>

			<p>
				As investigations continue and international attention grows, the displaced families
				face an uncertain future. Many now live in temporary camps, dependent on aid,
				and wondering if they will ever be able to rebuild their lives.
			</p>
		</div>
	</div>
</section>

<!-- Video Scrolly Section -->
<div class="video-scrolly-container relative z-20">
	<!-- Fixed video background -->
	<div class="video-canvas sticky top-0 w-full h-screen bg-black overflow-hidden">
		<!-- Video frame with cinematic letterboxing -->
		<div class="video-frame absolute inset-4 md:inset-8 lg:inset-12 flex items-center justify-center">
			{#each videoSteps as video, i}
				<video
					bind:this={videoRefs[i]}
					class="video-element max-w-full max-h-full object-contain transition-opacity duration-500"
					class:opacity-100={activeVideoStep === i}
					class:opacity-0={activeVideoStep !== i}
					class:pointer-events-none={activeVideoStep !== i}
					muted
					loop
					playsinline
					preload="metadata"
				>
					<source src="/videos/assam-evictions/{video.file}" type="video/mp4" />
				</video>
			{/each}
		</div>

		<!-- Cinematic vignette -->
		<div class="absolute inset-0 pointer-events-none video-vignette"></div>

	</div>

	<!-- Scrollable quote cards -->
	<div class="video-steps relative">
		{#each videoSteps as video, i}
			<div
				class="video-step min-h-screen flex items-end md:items-center justify-center p-4 pb-24 md:pb-4"
				use:inview={{ rootMargin: '-35% 0px -35% 0px' }}
				oninview_change={handleVideoStepChange(i)}
			>
				<div
					class="quote-card bg-black/80 backdrop-blur-md border border-white/10 p-6 md:p-8 max-w-xl w-full"
				>
					<span class="text-white/40 text-xs tracking-[0.2em] uppercase block mb-4">
						{video.date}
					</span>

					<blockquote class="quote-text text-white mb-3">
						{video.quote}
					</blockquote>

					{#if video.translation}
						<p class="quote-translation text-white/70 mb-4">
							{video.translation}
						</p>
					{/if}

					<p class="text-white/40 text-sm mb-5">
						{video.context}
					</p>

					<a
						href={video.link}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-xs tracking-wide transition-colors"
					>
						<span>View original post</span>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				</div>
			</div>
		{/each}

		<!-- Final spacer -->
		<div class="h-[30vh]"></div>
	</div>

	<!-- Sources footer -->
	<div class="sources-card relative bg-black py-16 px-6 border-t border-white/10">
		<div class="max-w-2xl mx-auto text-center">
			<p class="text-white/30 text-xs tracking-[0.2em] uppercase mb-6">Sources</p>
			<p class="text-white/50 text-sm mb-8">
				All videos from official posts by @himantabiswa on X.com
			</p>
			<div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
				{#each videoSteps as video}
					<a
						href={video.link}
						target="_blank"
						rel="noopener noreferrer"
						class="text-white/30 hover:text-white/70 text-xs transition-colors"
					>
						{video.date}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Footer -->
<footer class="footer-section relative z-20 bg-gray-900 text-white py-12 px-6">
	<div class="max-w-4xl mx-auto">
		<div class="grid md:grid-cols-3 gap-8 mb-8">
			<div>
				<h3 class="footer-label mb-3">Credits</h3>
				<p class="text-gray-400 text-sm leading-relaxed">
					Reporting by Ahmer Khan<br />
					Development by Tom Vaillant<br />
					The New Humanitarian
				</p>
			</div>

			<div>
				<h3 class="footer-label mb-3">Sources</h3>
				<p class="text-gray-400 text-sm leading-relaxed">
					Reuters, Al Jazeera, Article 14,<br />
					Human Rights Watch,<br />
					Amnesty International
				</p>
			</div>

			<div>
				<h3 class="footer-label mb-3">Share</h3>
				<div class="flex gap-4">
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Twitter</button>
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Facebook</button>
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">LinkedIn</button>
				</div>
			</div>
		</div>

		<div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
			<p class="text-gray-500 text-sm">
				The New Humanitarian
			</p>
			<p class="text-gray-600 text-xs">
				Published January 2026. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
	/* Typography */
	.header-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.header-desc {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 300;
		line-height: 1.7;
		max-width: 42ch;
		margin-left: auto;
		margin-right: auto;
	}

	.header-byline {
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	.step-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.step-text {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.75;
	}

	.content-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		line-height: 1.2;
	}

	.prose-content {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.85;
	}

	.footer-label {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #9ca3af;
	}

	/* Header animations - initial load */
	.header-title,
	.header-desc,
	.header-byline,
	.scroll-indicator {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(20px);
		transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.header-title.title-visible,
	.header-desc.desc-visible,
	.header-byline.byline-visible,
	.scroll-indicator.byline-visible {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0);
	}

	/* Scrolly container */
	.scrolly-container {
		min-height: 300vh;
	}

	/* Smooth scroll indicator animation */
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(6px);
		}
	}

	.animate-bounce {
		animation: bounce 1.5s ease-in-out infinite;
	}

	/* Video scrolly styles */
	.video-scrolly-container {
		background: #000;
	}

	.video-canvas {
		z-index: 1;
	}

	.video-steps {
		z-index: 10;
		margin-top: -100vh;
	}

	.video-vignette {
		background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
	}

	.video-intro-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.quote-card {
		box-shadow:
			0 0 0 1px rgba(255,255,255,0.05),
			0 25px 50px -12px rgba(0,0,0,0.5);
	}

	.quote-text {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: -0.01em;
	}

	.quote-translation {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(0.95rem, 2vw, 1.1rem);
		font-style: italic;
		line-height: 1.5;
	}

	/* Video element positioning for different aspect ratios */
	.video-element {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Mobile-specific adjustments */
	@media (max-width: 768px) {
		.video-step {
			align-items: flex-end;
			padding-bottom: 6rem;
		}

		.quote-card {
			margin-bottom: env(safe-area-inset-bottom, 0);
		}

		.video-frame {
			inset: 1rem;
		}
	}
</style>
