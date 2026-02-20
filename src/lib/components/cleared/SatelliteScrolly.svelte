<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		beforeImage: string;
		afterImage: string;
		beforeLabel?: string;
		afterLabel?: string;
		location: string;
		credit?: string;
	}

	let {
		beforeImage,
		afterImage,
		beforeLabel = 'Before',
		afterLabel = 'Today',
		location,
		credit = 'Satellite imagery: Planet Labs'
	}: Props = $props();

	let outerEl: HTMLElement;
	let progress = $state(0);

	let clipInset = $derived(`${(1 - progress) * 100}% 0 0 0`);

	// Date label: single bubble, swap text at midpoint with vertical slide
	let showAfter = $derived(progress > 0.5);
	let dateText = $derived(showAfter ? afterLabel : beforeLabel);

	// Slide animation: ramp from 0→1 over a narrow band around the midpoint
	// 0.4–0.5: old text slides up and fades out (slideOut 0→1)
	// 0.5–0.6: new text slides up into place (slideIn 0→1)
	let slideOut = $derived(Math.max(0, Math.min(1, (progress - 0.4) / 0.1)));
	let slideIn = $derived(Math.max(0, Math.min(1, (progress - 0.5) / 0.1)));
	let dateOffset = $derived(showAfter ? (1 - slideIn) * 100 : slideOut * -100);
	let dateOpacity = $derived(showAfter ? slideIn : 1 - slideOut);

	onMount(() => {
		function handleScroll() {
			if (!outerEl) return;
			const rect = outerEl.getBoundingClientRect();
			const scrollable = outerEl.offsetHeight - window.innerHeight;
			if (scrollable <= 0) return;
			const raw = -rect.top / scrollable;
			progress = Math.max(0, Math.min(1, raw));
		}

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener('scroll', handleScroll);
	});
</script>

<div class="satellite-scrolly" bind:this={outerEl}>
	<div class="satellite-sticky">
		<!-- Before image — always visible underneath -->
		<img src={beforeImage} alt="{location} - {beforeLabel}" class="sat-image" />

		<!-- After image — wipes in from bottom -->
		<img
			src={afterImage}
			alt="{location} - {afterLabel}"
			class="sat-image sat-after"
			style:clip-path="inset({clipInset})"
		/>

		<!-- Location label — top-left -->
		<div class="label location-label">{location}</div>

		<!-- Date label — top-right, single bubble with vertical slide swap -->
		<div class="label date-label" style:transform="translateY({dateOffset}%)" style:opacity={dateOpacity}>
			{dateText}
		</div>

		<!-- Credit bubble — bottom-right -->
		<div class="credit-bubble">{credit}</div>
	</div>
</div>

<style>
	.satellite-scrolly {
		height: 250vh;
		position: relative;
	}

	.satellite-sticky {
		position: sticky;
		top: 0;
		height: 100vh;
		width: 100%;
		overflow: hidden;
	}

	.sat-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		pointer-events: none;
		user-select: none;
	}

	.sat-after {
		z-index: 2;
	}

	.label {
		position: absolute;
		z-index: 5;
		background: rgba(255, 255, 255, 0.92);
		color: #1a1a1a;
		border: 1px solid rgba(0, 0, 0, 0.08);
		border-radius: 3px;
		font-family: 'Source Sans 3', sans-serif;
		pointer-events: none;
	}

	.location-label {
		top: 14px;
		left: 14px;
		padding: 5px 10px;
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0.02em;
	}

	.date-label {
		top: 14px;
		right: 14px;
		padding: 4px 9px;
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		white-space: nowrap;
	}

	.credit-bubble {
		position: absolute;
		bottom: 14px;
		right: 14px;
		z-index: 5;
		background: rgba(0, 0, 0, 0.45);
		color: rgba(255, 255, 255, 0.85);
		padding: 4px 10px;
		border-radius: 100px;
		font-family: 'Source Sans 3', sans-serif;
		font-size: 0.6rem;
		letter-spacing: 0.02em;
		pointer-events: none;
	}
</style>
