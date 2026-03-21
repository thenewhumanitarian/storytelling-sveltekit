<script lang="ts">
	import placeholderData from '$lib/data/cleared/image-placeholders.json';

	interface Props {
		beforeImage: string;
		afterImage: string;
		beforeLabel?: string;
		afterLabel?: string;
		location: string;
		credit?: string;
	}

	let { beforeImage, afterImage, beforeLabel = 'Before', afterLabel = 'Today', location, credit = 'Satellite imagery: Planet Labs' }: Props = $props();

	function getSrcset(src: string): string {
		const meta = (placeholderData as Record<string, any>)[src];
		if (!meta) return '';
		const base = src.replace(/\.\w+$/, '');
		return meta.srcset.split(', ').map((w: string) => `${base}-${w}.webp ${w}`).join(', ');
	}

	function getPlaceholder(src: string): string {
		return (placeholderData as Record<string, any>)[src]?.placeholder || '';
	}

	let beforeLoaded = $state(false);
	let afterLoaded = $state(false);

	let sliderPosition = $state(50);
	let isDragging = $state(false);
	let containerRef: HTMLElement;

	function handlePointerDown(e: PointerEvent) {
		isDragging = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		updatePosition(e);
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isDragging) return;
		updatePosition(e);
	}

	function handlePointerUp() {
		isDragging = false;
	}

	function updatePosition(e: PointerEvent) {
		if (!containerRef) return;
		const rect = containerRef.getBoundingClientRect();
		const x = e.clientX - rect.left;
		const percentage = (x / rect.width) * 100;
		sliderPosition = Math.max(0, Math.min(100, percentage));
	}
</script>

<div class="satellite-slider" bind:this={containerRef}>
		<div class="location-label">{location}</div>

		<div
			class="image-container"
			onpointerdown={handlePointerDown}
			onpointermove={handlePointerMove}
			onpointerup={handlePointerUp}
			onpointercancel={handlePointerUp}
			role="slider"
			aria-valuenow={sliderPosition}
			aria-valuemin={0}
			aria-valuemax={100}
			aria-label="Comparison slider"
			tabindex="0"
		>
			<!-- After image (full width, underneath) -->
			<img
				src={afterImage}
				srcset={getSrcset(afterImage)}
				sizes="(max-width: 800px) 100vw, 800px"
				alt="{location} - {afterLabel}"
				class="after-image"
				class:img-loaded={afterLoaded}
				onload={() => (afterLoaded = true)}
				style:background-image="url({getPlaceholder(afterImage)})"
				style:background-size="cover"
			/>

			<!-- Before image (clipped) -->
			<div class="before-container" style="clip-path: inset(0 {100 - sliderPosition}% 0 0);">
				<img
					src={beforeImage}
					srcset={getSrcset(beforeImage)}
					sizes="(max-width: 800px) 100vw, 800px"
					alt="{location} - {beforeLabel}"
					class="before-image"
					class:img-loaded={beforeLoaded}
					onload={() => (beforeLoaded = true)}
					style:background-image="url({getPlaceholder(beforeImage)})"
					style:background-size="cover"
				/>
			</div>

			<!-- Labels -->
			<div class="label before-label" class:visible={sliderPosition > 15}>{beforeLabel}</div>
			<div class="label after-label" class:visible={sliderPosition < 85}>{afterLabel}</div>

			<!-- Slider handle -->
			<div class="slider-handle" style="left: {sliderPosition}%;">
				<div class="handle-line"></div>
				<div class="handle-grip">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<circle cx="12" cy="12" r="11" fill="#ffffff" stroke="#1a1a1a" stroke-width="2"/>
						<path d="M8 12H6M18 12H16" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>
						<path d="M9 9L6 12L9 15" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M15 9L18 12L15 15" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
					</svg>
				</div>
			</div>
		</div>
		<p class="credit">{credit}</p>
</div>

<style>
	/* ── Desktop: horizontal slider ── */
	.satellite-slider {
		position: relative;
		width: 100%;
		max-width: 800px;
		margin: 0 auto;
	}

	.location-label {
		position: absolute;
		top: 12px;
		left: 12px;
		z-index: 10;
		background: rgba(255, 255, 255, 0.9);
		color: #1a1a1a;
		padding: 6px 12px;
		font-size: 0.875rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		border: 1px solid rgba(0, 0, 0, 0.08);
		/* Marc's note: This is to remove the border radius from the location label so it matches TNH design pattern */
		/* border-radius: 4px; */
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background: #f5f0eb;
		cursor: ew-resize;
		touch-action: none;
		/* Marc's note: This is to remove the border radius from the image container so it matches TNH design pattern */
		/* border-radius: 8px; */
	}

	/* Marc's note: Override default blue browser focus ring with TNH burgundy */
	.image-container:focus-visible {
		outline: 2px solid #9f3e52;
		outline-offset: 2px;
	}

	.after-image,
	.before-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
		filter: blur(20px);
		transition: filter 0.5s ease;
	}

	.after-image.img-loaded,
	.before-image.img-loaded {
		filter: none;
		background-image: none !important;
	}

	.before-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}

	.label {
		position: absolute;
		bottom: 12px;
		background: rgba(255, 255, 255, 0.9);
		color: #1a1a1a;
		padding: 4px 10px;
		border: 1px solid rgba(0, 0, 0, 0.08);
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0;
		transition: opacity 0.2s ease;
		/* Marc's note: This is to remove the border radius from the label so it matches TNH design pattern */
		/* border-radius: 3px; */
	}

	.label.visible {
		opacity: 1;
	}

	.before-label {
		left: 12px;
	}

	.after-label {
		right: 12px;
	}

	.slider-handle {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 4px;
		transform: translateX(-50%);
		pointer-events: none;
		z-index: 5;
	}

	.handle-line {
		position: absolute;
		top: 0;
		bottom: 0;
		left: 50%;
		width: 2px;
		background: #1a1a1a;
		transform: translateX(-50%);
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.15);
	}

	.handle-grip {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		justify-content: center;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
	}

	.handle-grip svg {
		display: block;
	}

	.credit {
		text-align: right;
		font-size: 0.8rem; /* Making all labels .8rem to be consistent */
		color: rgba(0, 0, 0, 0.35);
		margin-top: 0.35rem;
		padding-right: 4px;
	}
</style>
