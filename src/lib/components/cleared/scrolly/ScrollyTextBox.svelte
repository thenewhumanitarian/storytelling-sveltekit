<script lang="ts">
	/**
	 * ScrollyTextBox - Unified text box component for scrollytelling sections
	 *
	 * Used in both photo scrolly and data visualization scrolly for consistent styling.
	 * Features active state transitions, responsive sizing, and slot-based content.
	 */
	import type { Snippet } from 'svelte';

	interface SourceLink {
		text: string;
		url: string;
	}

	interface Props {
		title?: string;
		image?: string | null;
		bgColor?: string | null;
		active?: boolean;
		variant?: 'light' | 'dark' | 'editorial';
		maxWidth?: 'narrow' | 'wide';
		source?: SourceLink | null;
		imageCredit?: string | null;
		children?: Snippet;
	}

	let {
		title = '',
		image = null,
		bgColor = null,
		active = true,
		variant = 'light',
		maxWidth = 'narrow',
		source = null,
		imageCredit = null,
		children
	}: Props = $props();
</script>

<div
	class="scrolly-text-box"
	class:active
	class:dark={variant === 'dark'}
	class:editorial={variant === 'editorial'}
	class:wide={maxWidth === 'wide'}
	class:has-image={image}
	class:custom-bg={bgColor}
	style:--custom-bg={bgColor}
>
	{#if image}
		<img src={image} alt="" class="box-image" />
	{/if}
	{#if title}
		<h2 class="box-title">{title}</h2>
	{/if}
	<div class="box-content">
		{@render children?.()}
	</div>
	{#if imageCredit || source}
		<div class="box-footer">
			{#if imageCredit}
				<span class="image-credit">Photo: {imageCredit}</span>
			{/if}
			{#if imageCredit && source}
				<span class="footer-divider">|</span>
			{/if}
			{#if source}
				<a href={source.url} target="_blank" rel="noopener noreferrer" class="source-link">
					Source: {source.text} →
				</a>
			{/if}
		</div>
	{/if}
</div>

<style>
	.scrolly-text-box {
		max-width: 380px;
		background: rgba(255, 255, 255, 0.96);
		backdrop-filter: blur(6px);
		-webkit-backdrop-filter: blur(6px);
		padding: 1.5rem 1.75rem;
		border-radius: 6px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
		opacity: 0.75;
		transform: translateY(8px);
		transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
		pointer-events: auto;
	}

	.scrolly-text-box.active {
		opacity: 1;
		transform: translateY(0);
	}

	.scrolly-text-box.wide {
		max-width: 480px;
	}

	.scrolly-text-box.has-image {
		max-width: 320px;
	}

	.box-image {
		width: 100%;
		height: auto;
		border-radius: 4px;
		margin-bottom: 1rem;
	}

	.scrolly-text-box.dark {
		background: rgba(15, 15, 15, 0.92);
	}

	.scrolly-text-box.editorial {
		background: #ffffff;
		border: 1px solid rgba(0, 0, 0, 0.08);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
		backdrop-filter: none;
		-webkit-backdrop-filter: none;
	}

	.scrolly-text-box.custom-bg {
		background: var(--custom-bg);
	}

	.scrolly-text-box.dark .box-title,
	.scrolly-text-box.custom-bg .box-title {
		color: rgba(255, 255, 255, 0.95);
	}

	.scrolly-text-box.dark .box-content,
	.scrolly-text-box.custom-bg .box-content {
		color: rgba(255, 255, 255, 0.9);
	}

	.box-title {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: 1.5rem;
		font-weight: 600;
		line-height: 1.25;
		margin: 0 0 0.75rem 0;
		color: #1a1a1a;
	}

	.box-content {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1.05rem;
		line-height: 1.65;
		color: #2a2a2a;
	}

	.box-content :global(p) {
		margin: 0;
	}

	.box-content :global(p + p) {
		margin-top: 1em;
	}

	.box-content :global(blockquote) {
		border-left: none;
		padding-left: 0;
		margin: 0.75rem 0 0 0;
		font-style: italic;
		color: #4a4a4a;
	}

	.box-content :global(strong) {
		font-weight: 600;
		color: #000;
	}

	.scrolly-text-box.dark .box-content :global(strong) {
		color: #fff;
	}

	/* Category highlight colors - TNH branding */
	.box-content :global(.highlight-env),
	.box-content :global(.highlight-dev),
	.box-content :global(.highlight-admin),
	.box-content :global(.highlight-satra) {
		color: white;
		padding: 0.1em 0.4em;
		border-radius: 3px;
		font-weight: 500;
		box-decoration-break: clone;
		-webkit-box-decoration-break: clone;
	}

	.box-content :global(.highlight-env) {
		background: #35B58B;
	}

	.box-content :global(.highlight-dev) {
		background: #9F3E52;
	}

	.box-content :global(.highlight-admin) {
		background: #E8A84C;
	}

	.box-content :global(.highlight-satra) {
		background: #6B7FD7;
	}

	/* Footer with source and image credit */
	.box-footer {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid rgba(0, 0, 0, 0.1);
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.8rem;
		color: rgba(0, 0, 0, 0.5);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
	}

	.scrolly-text-box.dark .box-footer {
		border-top-color: rgba(255, 255, 255, 0.15);
		color: rgba(255, 255, 255, 0.5);
	}

	.image-credit {
		font-style: italic;
	}

	.footer-divider {
		opacity: 0.4;
	}

	.source-link {
		color: inherit;
		text-decoration: none;
		transition: color 0.15s ease;
	}

	.source-link:hover {
		color: rgba(0, 0, 0, 0.8);
		text-decoration: underline;
	}

	.scrolly-text-box.dark .source-link:hover {
		color: rgba(255, 255, 255, 0.9);
	}

	/* Responsive */
	@media (max-width: 600px) {
		.scrolly-text-box {
			max-width: 320px;
			padding: 1.25rem 1.5rem;
		}

		.scrolly-text-box.wide {
			max-width: 340px;
		}

		.scrolly-text-box.has-image {
			max-width: 280px;
			padding: 1rem 1.25rem;
		}

		.box-image {
			margin-bottom: 0.75rem;
		}

		.box-content {
			font-size: 0.95rem;
		}

		.box-title {
			font-size: 1.35rem;
		}

		.scrolly-text-box.editorial {
			box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1);
		}
	}
</style>
