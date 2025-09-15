<script lang="ts">
	import { onMount } from 'svelte'

	// Display data (kept inline for robustness of the embed)
	const TOTALS = [
		{ label: 'Killed', value: 2957 },
		{ label: 'Wounded', value: 19866 }
	]
	const DATE_RANGE = '1 Jan 2024–9 Sep 2025'
	const STORY_URL = 'https://www.thenewhumanitarian.org/investigations/2025/09/15/exclusive-israel-has-killed-nearly-3000-gaza-aid-seekers'
	const BG_IMAGE =
		'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2025-09/gaza-data--header.jpg.webp?itok=sMy2BKsD'

	let container: HTMLElement | null = null
	let numberNodes: HTMLElement[] = []
	let animationFrameIds: number[] = []
	let hasRunningAnimation = false
	const formatter = new Intl.NumberFormat('en-GB')

	function easeOutCubic(t: number) {
		return 1 - Math.pow(1 - t, 3)
	}

	function animateNumber(node: HTMLElement, target: number, durationMs: number) {
		const start = performance.now()
		function step(now: number) {
			const t = Math.min(1, (now - start) / durationMs)
			node.textContent = formatter.format(Math.round(target * easeOutCubic(t)))
			if (t < 1) animationFrameIds[animationFrameIds.length - 1] = requestAnimationFrame(step)
			else node.textContent = formatter.format(target)
		}
		animationFrameIds.push(requestAnimationFrame(step))
	}

	function startAnimation() {
		if (hasRunningAnimation) return
		hasRunningAnimation = true
		numberNodes.forEach((n) => (n.textContent = '0'))
		TOTALS.forEach((d, i) => animateNumber(numberNodes[i], d.value, 2200))
	}

	function resetAnimation() {
		hasRunningAnimation = false
		animationFrameIds.forEach((id) => cancelAnimationFrame(id))
		animationFrameIds = []
		numberNodes.forEach((n) => (n.textContent = '0'))
	}

	onMount(() => {
		// Gather number nodes after mount
		numberNodes = Array.from(document.querySelectorAll('[data-counter]')) as HTMLElement[]

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) startAnimation()
				else resetAnimation()
			},
			{ threshold: 0.35 }
		)
		if (container) observer.observe(container)

		// Respect reduced motion
		const media = window.matchMedia('(prefers-reduced-motion: reduce)')
		if (media.matches) {
			TOTALS.forEach((d, i) => (numberNodes[i].textContent = formatter.format(d.value)))
		}

		return () => observer.disconnect()
	})
</script>

<main class="w-full h-full bg-[#111] text-white m-0" aria-labelledby="title">
	<section
		class="relative w-full max-w-[1200px] mx-auto aspect-[16/9] overflow-hidden bg-[#121214] bg-cover bg-center"
		bind:this={container}
		role="group"
		aria-label="Gaza casualties spotlight"
		style={`background-image: url('${BG_IMAGE}');`}
	>
		<div
			class="absolute inset-0 pointer-events-none"
			style="background: radial-gradient(120% 90% at 12% 15%, rgba(171,56,80,.45), transparent 60%), linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.78) 100%); background-repeat: no-repeat, no-repeat; background-size: 140% 140%, 100% 100%; background-position: 0% 0%, 0% 0%; animation: gradientDrift 14s ease-in-out infinite alternate;"
		></div>

		<div class="relative z-[1] grid grid-rows-[1fr_auto] place-items-center w-full h-full p-[clamp(12px,3vw,40px)] max-[400px]:p-2 lg:p-10">
			<h1 id="title" class="sr-only">Gaza casualties spotlight</h1>

			<div class="grid grid-flow-col max-[680px]:grid-flow-row gap-[clamp(12px,3.5vw,48px)] lg:gap-16 max-[400px]:gap-2 max-[340px]:gap-1.5 items-center justify-around w-full">
				{#each TOTALS as d}
					<section class="grid place-items-center text-center min-w-[min(40ch,48%)] max-[680px]:min-w-0" aria-label={d.label}>
						<div class="text-[clamp(40px,8vw,130px)] lg:text-[140px] 2xl:text-[160px] max-[480px]:text-[32px] max-[400px]:text-[26px] max-[340px]:text-[22px] font-serif font-bold leading-[1.04] text-[#f5e7ea] [text-shadow:0_2px_16px_rgba(0,0,0,.55)]" data-counter aria-live="polite">0</div>
						<div class="text-[clamp(12px,2vw,18px)] max-[480px]:text-[12px] max-[400px]:text-[10px] max-[340px]:text-[9px] tracking-[0.02em] text-[#ffe9ef] opacity-95 font-mono">{d.label}</div>
					</section>
				{/each}
			</div>
			<div class="mt-2 lg:mt-4 text-[11px] max-[480px]:text-[10px] max-[400px]:text-[9px] max-[340px]:text-[8px] text-[#e9d6db] opacity-90" aria-label="Data timeframe">{DATE_RANGE}</div>
		</div>
	</section>
</main>

<style>
	@keyframes gradientDrift {
		0% { background-position: 0% 0%, 0% 0%; }
		100% { background-position: 20% 15%, 0% 0%; }
	}
</style>
