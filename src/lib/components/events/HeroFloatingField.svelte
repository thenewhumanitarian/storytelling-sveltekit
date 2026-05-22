<script lang="ts">
	import type { HeroArtifact } from '$lib/events/who-owns-the-narrative/hero-artifacts';
	import { cn } from '$lib/utils/cn';

	interface MasonryTile extends HeroArtifact {
		gridX: number;
		gridY: number;
		width: number;
		height: number;
		repeat: number;
		tone: 'cream' | 'burgundy' | 'ink' | 'orange' | 'blue' | 'mint';
	}

	interface Props {
		artifacts: HeroArtifact[];
		mouseX?: number;
		mouseY?: number;
		scrollProgress?: number;
	}

	let { artifacts, mouseX = 0.5, mouseY = 0.5, scrollProgress = 0 }: Props = $props();

	const tilePattern = [
		{ gridX: 4, gridY: 2, width: 15, height: 10, tone: 'cream' },
		{ gridX: 23, gridY: 5, width: 18, height: 8, tone: 'burgundy' },
		{ gridX: 47, gridY: 1, width: 14, height: 12, tone: 'ink' },
		{ gridX: 66, gridY: 8, width: 17, height: 9, tone: 'orange' },
		{ gridX: 12, gridY: 20, width: 19, height: 11, tone: 'blue' },
		{ gridX: 36, gridY: 18, width: 16, height: 9, tone: 'cream' },
		{ gridX: 58, gridY: 24, width: 21, height: 12, tone: 'burgundy' },
		{ gridX: 81, gridY: 18, width: 14, height: 10, tone: 'mint' },
		{ gridX: 2, gridY: 38, width: 18, height: 8, tone: 'ink' },
		{ gridX: 26, gridY: 36, width: 15, height: 12, tone: 'orange' },
		{ gridX: 49, gridY: 41, width: 17, height: 10, tone: 'cream' },
		{ gridX: 72, gridY: 37, width: 22, height: 12, tone: 'blue' },
		{ gridX: 10, gridY: 55, width: 14, height: 10, tone: 'mint' },
		{ gridX: 32, gridY: 58, width: 21, height: 9, tone: 'burgundy' },
		{ gridX: 61, gridY: 54, width: 15, height: 12, tone: 'ink' },
		{ gridX: 82, gridY: 60, width: 17, height: 8, tone: 'cream' }
	] as const;

	const tones: Record<MasonryTile['tone'], string> = {
		cream: 'border-[#ddd]/22 bg-[#ddd]/12 text-[#f5f0eb]/82',
		burgundy: 'border-[#a03c50]/38 bg-[#a03c50]/18 text-[#f5ebe8]/86',
		ink: 'border-[#ddd]/12 bg-[#292929]/52 text-white/72',
		orange: 'border-[#f0781e]/32 bg-[#f0781e]/12 text-[#f4c29f]/82',
		blue: 'border-[#413c78]/46 bg-[#413c78]/24 text-[#e7e4ff]/80',
		mint: 'border-[#2db487]/36 bg-[#2db487]/12 text-[#c9f6e8]/78'
	};

	const tileItems = $derived.by(() => {
		const baseArtifacts = artifacts.filter((artifact) => artifact.type !== 'tag');
		return Array.from({ length: 3 }, (_, repeat) =>
			baseArtifacts.map((artifact, index) => {
				const pattern = tilePattern[index % tilePattern.length];
				return {
					...artifact,
					...pattern,
					repeat,
					gridY: pattern.gridY + repeat * 72,
					rotation: artifact.rotation * 0.4 + ((index % 5) - 2) * 0.9
				};
			})
		).flat() as MasonryTile[];
	});

	function fieldStyle(): string {
		const rotateY = (mouseX - 0.5) * -16;
		const rotateX = (mouseY - 0.5) * 9;
		const moveX = (mouseX - 0.5) * -54;
		const moveY = (mouseY - 0.5) * -36 - scrollProgress * 110;

		return `--hero-grid-rx:${rotateX}deg; --hero-grid-ry:${rotateY}deg; --hero-grid-mx:${moveX}px; --hero-grid-my:${moveY}px;`;
	}

	function tileStyle(tile: MasonryTile): string {
		const depth = 1 + tile.depth * 36;
		const delay = -1 * ((tile.gridX + tile.gridY + tile.repeat * 17) % 28);

		return `--x:${tile.gridX}%; --y:${tile.gridY}%; --w:${tile.width}rem; --h:${tile.height}rem; --rot:${tile.rotation}deg; --z:${depth}px; --delay:${delay}s;`;
	}

	function tileClass(tile: MasonryTile): string {
		return cn(
			'hero-masonry-tile absolute block overflow-hidden border px-5 py-4 font-sans no-underline shadow-2xl backdrop-blur-md transition-[border-color,background,opacity,transform] duration-300',
			tones[tile.tone],
			tile.type === 'quote' && 'italic',
			tile.type === 'voice' && 'uppercase tracking-[0.08em]',
			tile.type === 'headline' && 'font-semibold',
			tile.size === 'lg' ? 'text-sm leading-relaxed' : 'text-xs leading-snug'
		);
	}
</script>

<div
	class="hero-masonry-field pointer-events-none absolute inset-0 z-[5] overflow-hidden"
	aria-hidden="true"
>
	<div class="hero-masonry-camera absolute inset-0" style={fieldStyle()}>
		<div class="hero-masonry-grid absolute">
			{#each tileItems as tile (`${tile.id}-${tile.repeat}`)}
				<div class={tileClass(tile)} style={tileStyle(tile)}>
					<span class="hero-masonry-text">{tile.text}</span>
					{#if tile.attribution}
						<span class="mt-3 block text-[0.62rem] not-italic tracking-[0.08em] opacity-55">
							{tile.attribution}
						</span>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.hero-masonry-field {
		perspective: 1100px;
		mask-image: linear-gradient(to right, transparent 0%, transparent 20%, black 42%, black 100%);
	}

	.hero-masonry-camera {
		transform-style: preserve-3d;
		transform: rotateX(var(--hero-grid-rx)) rotateY(var(--hero-grid-ry))
			translate3d(var(--hero-grid-mx), var(--hero-grid-my), 0);
		transition: transform 160ms ease-out;
	}

	.hero-masonry-grid {
		top: -34%;
		left: 46%;
		width: 96rem;
		height: 154rem;
		transform: rotate(-4deg) translateZ(-90px);
		transform-style: preserve-3d;
		animation: masonry-drift 52s linear infinite;
	}

	.hero-masonry-grid::before {
		content: '';
		position: absolute;
		inset: -8rem;
		background-image:
			linear-gradient(rgb(221 221 221 / 0.05) 1px, transparent 1px),
			linear-gradient(90deg, rgb(221 221 221 / 0.04) 1px, transparent 1px),
			radial-gradient(circle, rgb(221 221 221 / 0.11) 1px, transparent 1.3px);
		background-size:
			7rem 7rem,
			7rem 7rem,
			1rem 1rem;
		opacity: 0.5;
		transform: translateZ(-70px);
	}

	.hero-masonry-tile {
		left: var(--x);
		top: var(--y);
		width: min(var(--w), 24vw);
		min-height: var(--h);
		transform: translate3d(-50%, -50%, var(--z)) rotate(var(--rot));
		opacity: 0.62;
	}

	.hero-masonry-tile::before,
	.hero-masonry-tile::after {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 0.55rem;
		background-image: radial-gradient(circle, rgb(245 240 235 / 0.42) 1.6px, transparent 2px);
		background-size: 0.55rem 0.85rem;
		background-position: center 0.25rem;
		opacity: 0.72;
	}

	.hero-masonry-tile::before {
		left: 0.45rem;
	}

	.hero-masonry-tile::after {
		right: 0.45rem;
	}

	.hero-masonry-text {
		display: block;
		padding-inline: 0.9rem;
	}

	@keyframes masonry-drift {
		from {
			transform: rotate(-4deg) translate3d(0, 0, -90px);
		}
		to {
			transform: rotate(-4deg) translate3d(-10rem, -20rem, -90px);
		}
	}

	@media (max-width: 768px) {
		.hero-masonry-field {
			opacity: 0.5;
			mask-image: linear-gradient(to right, transparent 0%, transparent 42%, black 68%);
		}

		.hero-masonry-grid {
			left: 58%;
			width: 58rem;
		}

		.hero-masonry-tile {
			width: min(var(--w), 42vw);
			opacity: 0.42;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-masonry-grid {
			animation: none;
		}

		.hero-masonry-camera {
			transform: none;
		}
	}
</style>
