<script lang="ts" module>
	export type Ripple = { key: number; x: number; y: number; name: string; label?: string };
</script>

<script lang="ts">
	import { prefersReducedMotion } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import type { ClimateCursor } from './realtime';

	interface Props {
		cursors: ClimateCursor[];
		ripples: Ripple[];
		width: number;
		height: number;
	}

	let { cursors, ripples, width, height }: Props = $props();
	const motion = $derived(prefersReducedMotion.current ? 0 : 1);
</script>

<div class="peers" aria-hidden="true">
	{#each cursors as cursor (cursor.id)}
		<div
			class="cursor"
			style:transform={`translate3d(${cursor.x * width}px, ${cursor.y * height}px, 0)`}
			transition:fade={{ duration: 220 * motion }}
		>
			<svg viewBox="0 0 18 22" width="22" height="27">
				<path d="M1.5 1.5 L16 12.2 L9.3 13.2 L5.6 20 Z" />
			</svg>
			<span class="tag">{cursor.name}</span>
		</div>
	{/each}

	{#each ripples as ripple (ripple.key)}
		<div class="ripple" style:left={`${ripple.x * width}px`} style:top={`${ripple.y * height}px`}>
			<span class="ring"></span>
			{#if ripple.label}<span class="pop">{ripple.label}</span>{/if}
		</div>
	{/each}
</div>

<style>
	.peers {
		position: absolute;
		inset: 0;
		z-index: 6;
		overflow: clip;
		pointer-events: none;
	}
	.cursor {
		position: absolute;
		top: 0;
		left: 0;
		display: flex;
		align-items: flex-start;
		gap: 2px;
		/* Updates arrive every ~200ms; ease between them so motion reads as a hand, not a jump. */
		transition: transform 220ms cubic-bezier(0.25, 0.7, 0.35, 1);
		will-change: transform;
	}
	.cursor svg {
		flex: none;
		filter: drop-shadow(0 1px 3px rgb(0 0 0 / 55%));
	}
	.cursor path {
		fill: #fff;
		stroke: #282828;
		stroke-width: 1.4;
		stroke-linejoin: round;
	}
	.tag {
		margin-top: 19px;
		padding: 0.2rem 0.45rem;
		background: #9f3e52;
		color: #fff;
		font: 700 0.78rem/1 var(--sans);
		letter-spacing: 0.02em;
		white-space: nowrap;
		box-shadow: 0 4px 14px rgb(0 0 0 / 30%);
	}
	.ripple {
		position: absolute;
		width: 0;
		height: 0;
	}
	.ring {
		position: absolute;
		left: -22px;
		top: -22px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: radial-gradient(
			circle,
			rgb(255 255 255 / 0%) 45%,
			rgb(255 255 255 / 75%) 70%,
			rgb(255 255 255 / 0%) 72%
		);
		animation: ring 760ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
	}
	.pop {
		position: absolute;
		left: 0;
		top: -10px;
		padding: 0.25rem 0.5rem;
		background: #fff;
		color: #282828;
		font: 700 0.85rem/1 var(--sans);
		white-space: nowrap;
		animation: pop 1100ms cubic-bezier(0.2, 0.7, 0.3, 1) both;
	}
	@keyframes ring {
		from {
			transform: scale(0.2);
			opacity: 1;
		}
		to {
			transform: scale(1.9);
			opacity: 0;
		}
	}
	@keyframes pop {
		0% {
			transform: translate(-50%, 0) scale(0.6);
			opacity: 0;
		}
		25% {
			transform: translate(-50%, -16px) scale(1.08);
			opacity: 1;
		}
		100% {
			transform: translate(-50%, -54px) scale(1);
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.cursor {
			transition: none;
		}
		.ring,
		.pop {
			animation-duration: 1ms;
		}
	}
</style>
