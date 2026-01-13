<script lang="ts">
	/**
	 * VideoScrollyVisualization - Multi-video scrolly with step-based transitions
	 *
	 * Used inside ScrollySection to display multiple videos that swap based on
	 * activeStep. Includes video play/pause management and opacity transitions.
	 */

	interface VideoStep {
		videoSrc: string;
		poster?: string;
	}

	interface Props {
		activeStep: number;
		videoSteps: VideoStep[];
	}

	let { activeStep, videoSteps }: Props = $props();

	let videoRefs: HTMLVideoElement[] = $state([]);

	$effect(() => {
		// Pause all, play active
		videoRefs.forEach((video, i) => {
			if (video) {
				if (i === activeStep) {
					video.play().catch(() => {}); // Handle autoplay restrictions
				} else {
					video.pause();
					video.currentTime = 0;
				}
			}
		});
	});
</script>

<div class="video-scrolly-viz">
	<!-- Video frame with padding for letterboxing effect -->
	<div class="video-frame">
		{#each videoSteps as step, i}
			<video
				src={step.videoSrc}
				poster={step.poster}
				bind:this={videoRefs[i]}
				class="video-layer"
				class:active={i === activeStep}
				muted
				loop
				playsinline
				preload="metadata"
			/>
		{/each}
	</div>

	<!-- Cinematic vignette overlay -->
	<div class="video-vignette"></div>
</div>

<style>
	.video-scrolly-viz {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		background: #000;
	}

	.video-frame {
		position: absolute;
		inset: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media (min-width: 768px) {
		.video-frame {
			inset: 2rem;
		}
	}

	@media (min-width: 1024px) {
		.video-frame {
			inset: 3rem;
		}
	}

	.video-layer {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
		opacity: 0;
		transition: opacity 500ms ease;
		pointer-events: none;
	}

	.video-layer.active {
		opacity: 1;
	}

	.video-vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
		pointer-events: none;
	}
</style>
