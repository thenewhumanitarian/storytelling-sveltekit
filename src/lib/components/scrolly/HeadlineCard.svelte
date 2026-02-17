<script lang="ts">
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
		headline: Headline;
		index: number;
		visible: boolean;
	}

	let { headline, index, visible }: Props = $props();
</script>

<a
	href={headline.url}
	target="_blank"
	rel="noopener noreferrer"
	class="headline-card"
	class:visible
	style="--delay: {index};"
>
	<div class="card-content">
		<div class="card-header">
			<span class="source">{headline.source}</span>
			<span class="date">{headline.date}</span>
		</div>

		<h3 class="title">{headline.title}</h3>

		{#if headline.description}
			<p class="description">{headline.description}</p>
		{/if}
	</div>

	<div class="card-bottom">
		<div class="card-divider"></div>
		<div class="card-footer">
			<span class="author">By {headline.author}</span>
			<span class="read-link">
				Read
				<svg class="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
				</svg>
			</span>
		</div>
	</div>
</a>

<style>
	.headline-card {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #1a1a1a;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 8px;
		padding: 24px;
		text-decoration: none;
		color: inherit;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition:
			transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1),
			box-shadow 0.3s cubic-bezier(0.165, 0.84, 0.44, 1),
			border-color 0.3s ease,
			opacity 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) calc(var(--delay) * 0.15s),
			translate 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) calc(var(--delay) * 0.15s);
		opacity: 0;
		translate: 0 30px;
	}

	.headline-card.visible {
		opacity: 1;
		translate: 0 0;
	}

	.headline-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
		border-color: #9f3e52;
	}

	.card-content {
		flex: 1;
	}

	.card-bottom {
		margin-top: auto;
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}

	.source {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #9f3e52;
	}

	.date {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
	}

	.card-divider {
		height: 1px;
		background: linear-gradient(to right, #9f3e52, rgba(255, 255, 255, 0.1) 30%);
		margin-top: 16px;
		margin-bottom: 12px;
	}

	.title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.25rem;
		font-weight: 600;
		line-height: 1.35;
		color: #ffffff;
		margin: 0 0 12px 0;
	}

	.description {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.author {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.5);
		font-style: italic;
	}

	.read-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.85rem;
		font-weight: 600;
		color: #9f3e52;
		transition: gap 0.2s;
	}

	.headline-card:hover .read-link {
		gap: 8px;
	}

	.arrow-icon {
		width: 14px;
		height: 14px;
	}

	@media (max-width: 600px) {
		.headline-card {
			padding: 18px;
		}

		.title {
			font-size: 1.1rem;
		}

		.description {
			font-size: 0.9rem;
		}
	}
</style>
