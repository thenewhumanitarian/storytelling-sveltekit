<script lang="ts">
	interface Props {
		beforeImage: string;
		afterImage: string;
		beforeLabel?: string;
		afterLabel?: string;
		location: string;
		credit?: string;
	}

	let { beforeImage, afterImage, beforeLabel = 'Before', afterLabel = 'Today', location, credit = 'Satellite imagery: Planet Labs' }: Props = $props();

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

	<div class="image-container">
		<!-- After image (full width, underneath) -->
		<img src={afterImage} alt="{location} - {afterLabel}" class="after-image" />

		<!-- Before image (clipped) -->
		<div class="before-container" style="clip-path: inset(0 {100 - sliderPosition}% 0 0);">
			<img src={beforeImage} alt="{location} - {beforeLabel}" class="before-image" />
		</div>

		<!-- Labels -->
		<div class="label before-label" class:visible={sliderPosition > 15}>{beforeLabel}</div>
		<div class="label after-label" class:visible={sliderPosition < 85}>{afterLabel}</div>

		<!-- Slider handle -->
		<div
			class="slider-handle"
			style="left: {sliderPosition}%;"
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
		border-radius: 4px;
		border: 1px solid rgba(0, 0, 0, 0.08);
	}

	.image-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 10;
		overflow: hidden;
		border-radius: 8px;
		border: 1px solid rgba(0, 0, 0, 0.1);
		background: #f5f0eb;
		cursor: ew-resize;
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
		border-radius: 3px;
		opacity: 0;
		transition: opacity 0.2s ease;
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
		cursor: ew-resize;
		z-index: 5;
		touch-action: none;
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

	/* Expand touch target on mobile */
	@media (max-width: 768px) {
		.slider-handle {
			width: 44px;
		}
	}

	.credit {
		text-align: right;
		font-size: 0.7rem;
		color: rgba(0, 0, 0, 0.35);
		margin-top: 0.35rem;
		padding-right: 4px;
	}
</style>
