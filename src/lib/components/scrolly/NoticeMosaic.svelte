<script lang="ts">
	/**
	 * NoticeMosaic - Scroll-triggered mosaic of eviction notices
	 *
	 * Displays document images in a scattered "evidence board" layout,
	 * progressively revealing them as activeStep increases. Includes an
	 * animated text placard showing details for each notice.
	 */
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';

	export interface Notice {
		image: string;
		alt: string;
		title: string;
		subtitle: string;
		excerpt: string;
	}

	interface Props {
		activeStep: number;
		notices: Notice[];
		backgroundColor?: string;
	}

	let { activeStep, notices, backgroundColor = '#1a1715' }: Props = $props();

	let viewportHeight = $state(0);
	let isMobile = $state(false);

	// Current notice index based on activeStep
	let currentNoticeIndex = $derived(Math.min(activeStep, notices.length - 1));

	// Pre-computed positions for each notice (deterministic based on index)
	function getPosition(index: number): [string, string, number] {
		const positions: [number, number, number][] = [
			[20, 15, -3],
			[50, 25, 2.5],
			[15, 45, -1.5],
			[55, 10, 3]
		];

		const pos = positions[index % positions.length];

		// Add slight randomization for organic feel (seeded by index)
		const seed = index * 7919;
		const jitterX = ((seed % 10) - 5) * 0.5;
		const jitterY = (((seed * 3) % 10) - 5) * 0.5;
		const jitterRot = (((seed * 7) % 10) - 5) * 0.2;

		return [
			`${pos[0] + jitterX}%`,
			`${pos[1] + jitterY}%`,
			pos[2] + jitterRot
		];
	}

	onMount(() => {
		viewportHeight = window.innerHeight;
		isMobile = window.innerWidth < 640;

		const handleResize = () => {
			viewportHeight = window.innerHeight;
			isMobile = window.innerWidth < 640;
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});
</script>

<div class="notice-mosaic" style:background={backgroundColor}>
	<!-- Notice images -->
	{#each notices as notice, i}
		{@const pos = getPosition(i)}
		{#if i <= currentNoticeIndex}
			<div
				class="notice-image"
				class:mobile={isMobile}
				style:left={pos[0]}
				style:top={pos[1]}
				style:transform="rotate({pos[2]}deg)"
				in:fade={{ duration: 350 }}
			>
				<img src={notice.image} alt={notice.alt} loading="lazy" />
			</div>
		{/if}
	{/each}

	<!-- Text placard -->
	<div class="notice-placard" class:mobile={isMobile}>
		{#if notices[currentNoticeIndex]}
			{#key currentNoticeIndex}
				<div
					class="placard-content"
					in:fade={{ duration: 250, delay: 100 }}
					out:fade={{ duration: 150 }}
				>
					<p class="placard-title">{notices[currentNoticeIndex].title}</p>
					<p class="placard-subtitle">{notices[currentNoticeIndex].subtitle}</p>
					<p class="placard-excerpt">{notices[currentNoticeIndex].excerpt}</p>
				</div>
			{/key}
		{:else}
			<div class="placard-content placard-empty">
				<p class="placard-subtitle">Scroll to reveal eviction notices</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.notice-mosaic {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	/* Notice image cards - sized like photos on a desk */
	.notice-image {
		position: absolute;
		max-width: 25vw;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow:
			0 2px 8px rgba(0, 0, 0, 0.06),
			0 4px 16px rgba(0, 0, 0, 0.08);
		border-radius: 2px;
		padding: 3px;
	}

	.notice-image.mobile {
		max-width: 50vw;
	}

	.notice-image img {
		display: block;
		width: 100%;
		height: auto;
		border-radius: 1px;
	}

	/* Text placard - museum card style with fixed height to prevent jumping */
	.notice-placard {
		position: absolute;
		bottom: 6%;
		left: 50%;
		transform: translateX(-50%);
		width: 90%;
		max-width: 480px;
		height: 150px;
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-left: 3px solid #9f3e52;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		border-radius: 2px;
		overflow: hidden;
	}

	.notice-placard.mobile {
		bottom: 4%;
		width: 94%;
		height: 140px;
	}

	/* Content is absolutely positioned so fade doesn't affect container size */
	.placard-content {
		position: absolute;
		inset: 0;
		padding: 1.25rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.notice-placard.mobile .placard-content {
		padding: 1rem 1.25rem;
	}

	.placard-empty {
		justify-content: center;
	}

	.placard-title {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1a1a1a;
		letter-spacing: 0.01em;
		margin: 0;
	}

	.placard-subtitle {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.9375rem;
		font-weight: 500;
		color: #6b6b6b;
		margin: 0;
	}

	.placard-excerpt {
		font-family: 'Courier Prime', 'Courier New', monospace;
		font-size: 1rem;
		font-weight: 500;
		font-style: italic;
		color: #9f3e52;
		margin: 0.5rem 0 0 0;
		line-height: 1.5;
	}

	/* Mobile adjustments */
	@media (max-width: 640px) {
		.placard-title {
			font-size: 1rem;
		}

		.placard-subtitle {
			font-size: 0.8125rem;
		}

		.placard-excerpt {
			font-size: 1rem;
			line-height: 1.4;
		}

		.notice-placard.mobile {
			height: 160px;
		}
	}
</style>
