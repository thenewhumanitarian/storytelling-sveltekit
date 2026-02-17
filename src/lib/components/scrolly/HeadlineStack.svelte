<script lang="ts">
	import { inview } from 'svelte-inview';
	import HeadlineCard from './HeadlineCard.svelte';

	interface Headline {
		id: string;
		source: string;
		date: string;
		title: string;
		description?: string;
		author: string;
		url: string;
	}

	interface Props {
		headlines?: Headline[];
	}

	let { headlines = [] }: Props = $props();

	// Track when the section enters viewport to trigger animations
	let sectionVisible = $state(false);
</script>

<section
	class="headline-stack-section"
	use:inview={{ rootMargin: '-10% 0px' }}
	oninview_enter={() => (sectionVisible = true)}
>
	<div class="content-wrapper">
		<div class="intro-text">
			<p class="eyebrow">Media Coverage</p>
			<h2 class="section-title">The World Watched</h2>
			<p class="section-desc">
				From the first deadly eviction in 2021 to the Supreme Court's intervention in 2025,
				international and national media documented the campaign.
			</p>
		</div>

		<div class="cards-grid">
			{#each headlines as headline, i}
				<HeadlineCard
					{headline}
					index={i}
					visible={sectionVisible}
				/>
			{/each}
		</div>
	</div>
</section>

<style>
	.headline-stack-section {
		background: #111;
		position: relative;
		z-index: 20;
	}

	.content-wrapper {
		max-width: 900px;
		margin: 0 auto;
		padding: 80px 24px;
	}

	.intro-text {
		text-align: center;
		margin-bottom: 48px;
	}

	.eyebrow {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #9f3e52;
		margin: 0 0 12px 0;
	}

	.section-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 16px 0;
		line-height: 1.2;
	}

	.section-desc {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.1rem;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.7);
		max-width: 600px;
		margin: 0 auto;
	}

	.cards-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 24px;
	}

	@media (max-width: 768px) {
		.content-wrapper {
			padding: 60px 16px;
		}

		.cards-grid {
			grid-template-columns: 1fr;
			gap: 16px;
		}

		.intro-text {
			margin-bottom: 32px;
		}

		.section-desc {
			font-size: 1rem;
		}
	}
</style>
