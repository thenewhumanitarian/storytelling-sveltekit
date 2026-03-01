<script lang="ts">
	/**
	 * ExpandableInfobox - Inline expandable context box
	 *
	 * Renders a clickable inline trigger that expands a context box below.
	 * Uses <span> elements throughout so it can be placed inside <p> tags
	 * without breaking paragraph flow.
	 */

	interface InfoboxData {
		label: string;
		paragraphs: string[];
	}

	interface Props {
		/** The infobox data object */
		data: InfoboxData;
		/** Punctuation to include inside the button (e.g. ".") */
		suffix?: string;
	}

	let { data, suffix = '' }: Props = $props();

	let expanded = $state(false);
	let contentEl: HTMLSpanElement | undefined = $state();
	let contentHeight = $state(0);

	function toggle() {
		expanded = !expanded;
		if (expanded && contentEl) {
			contentHeight = contentEl.scrollHeight;
		}
	}

	$effect(() => {
		if (expanded && contentEl) {
			contentHeight = contentEl.scrollHeight;
		}
	});
</script>

<span class="infobox-wrapper">
	<button
		class="infobox-trigger"
		class:expanded
		onclick={toggle}
		aria-expanded={expanded}
	>{data.label}{suffix}</button>
	<span
		class="infobox-panel"
		class:expanded
		style:max-height={expanded ? `${contentHeight}px` : '0px'}
		style:display={expanded ? 'block' : 'none'}
	>
		<span class="infobox-content" bind:this={contentEl}>
			{#each data.paragraphs as paragraph}
				<span class="infobox-paragraph">{paragraph}</span>
			{/each}
		</span>
	</span>
</span>

<style>
	.infobox-wrapper {
		display: inline;
	}

	.infobox-trigger {
		display: inline;
		background: rgba(159, 62, 82, 0.08);
		border: 1px solid rgba(159, 62, 82, 0.2);
		border-radius: 3px;
		padding: 0.05em 0.4em;
		margin: 0;
		font: inherit;
		font-size: inherit;
		line-height: inherit;
		color: #9f3e52;
		cursor: pointer;
		text-decoration: none;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06);
		transition: all 0.2s ease;
	}

	.infobox-trigger:hover {
		background: rgba(159, 62, 82, 0.12);
		border-color: rgba(159, 62, 82, 0.35);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}

	.infobox-panel {
		display: none;
		max-height: 0;
		overflow: hidden;
		transition: max-height 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.infobox-panel.expanded {
		display: block;
	}

	.infobox-content {
		display: block;
		margin-top: 1rem;
		padding: 1.25rem 1.5rem;
		background: rgba(159, 62, 82, 0.04);
		border-left: 3px solid rgba(159, 62, 82, 0.3);
		border-radius: 0 4px 4px 0;
	}

	.infobox-paragraph {
		display: block;
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		line-height: 1.75;
		color: #4a4a4a;
		margin: 0 0 0.75rem 0;
	}

	.infobox-paragraph:last-child {
		margin-bottom: 0;
	}
</style>
