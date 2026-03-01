<script lang="ts">
	interface Props {
		src: string;
		alt: string;
		caption?: string;
		credit?: string;
	}

	let { src, alt, caption, credit }: Props = $props();
</script>

<figure class="article-image">
	<div class="image-frame">
		<img {src} {alt} loading="lazy" />
		<div class="frame-corner tl"></div>
		<div class="frame-corner tr"></div>
		<div class="frame-corner bl"></div>
		<div class="frame-corner br"></div>
	</div>

	{#if caption || credit}
		<figcaption class="image-caption">
			{#if caption}
				<p class="caption-text">{caption}</p>
			{/if}
			{#if credit}
				<span class="caption-credit">{credit}</span>
			{/if}
		</figcaption>
	{/if}
</figure>

<style>
	.article-image {
		--accent-amber: #d4a574;
		--text-secondary: rgba(255, 255, 255, 0.7);
		--text-muted: rgba(255, 255, 255, 0.4);
		--border-subtle: rgba(255, 255, 255, 0.08);

		margin: 2.5rem 0;
		max-width: 100%;
	}

	.image-frame {
		position: relative;
		background: rgba(255, 255, 255, 0.02);
		padding: 0.75rem;
		border: 1px solid var(--border-subtle);
	}

	.image-frame img {
		display: block;
		width: 100%;
		height: auto;
	}

	/* Corner brackets - evidence/document aesthetic */
	.frame-corner {
		position: absolute;
		width: 12px;
		height: 12px;
		border-color: var(--accent-amber);
		border-style: solid;
		border-width: 0;
		opacity: 0.6;
	}

	.frame-corner.tl {
		top: 0;
		left: 0;
		border-top-width: 2px;
		border-left-width: 2px;
	}

	.frame-corner.tr {
		top: 0;
		right: 0;
		border-top-width: 2px;
		border-right-width: 2px;
	}

	.frame-corner.bl {
		bottom: 0;
		left: 0;
		border-bottom-width: 2px;
		border-left-width: 2px;
	}

	.frame-corner.br {
		bottom: 0;
		right: 0;
		border-bottom-width: 2px;
		border-right-width: 2px;
	}

	.image-caption {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.caption-text {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
	}

	.caption-credit {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.caption-credit::before {
		content: '— ';
		color: var(--accent-amber);
	}

	@media (max-width: 640px) {
		.image-frame {
			padding: 0.5rem;
		}

		.frame-corner {
			width: 8px;
			height: 8px;
		}
	}
</style>
