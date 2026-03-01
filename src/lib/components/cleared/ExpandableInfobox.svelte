<script lang="ts">
	import { tick } from 'svelte';

	interface InfoboxData {
		label: string;
		paragraphs: string[];
	}

	interface Props {
		data: InfoboxData;
		suffix?: string;
	}

	let { data, suffix = '' }: Props = $props();

	let expanded = $state(false);
	let panelVisible = $state(false);
	let panelOpen = $state(false);

	function toggle() {
		if (!expanded) {
			expanded = true;
			panelVisible = true;
			tick().then(() => {
				requestAnimationFrame(() => {
					panelOpen = true;
				});
			});
		} else {
			expanded = false;
			panelOpen = false;
			setTimeout(() => {
				panelVisible = false;
			}, 410);
		}
	}
</script>

<button
	class="infobox-trigger"
	class:expanded
	onclick={toggle}
	aria-expanded={expanded}
>{data.label}{suffix}</button>{#if panelVisible}<span
	class="infobox-panel"
	class:open={panelOpen}
><span class="infobox-content"><span class="infobox-inner"
		>{#each data.paragraphs as paragraph}<span class="infobox-paragraph">{paragraph}</span
			>{/each}</span
		></span></span>{/if}

<style>
	.infobox-trigger {
		display: inline;
		appearance: none;
		-webkit-appearance: none;
		vertical-align: baseline;
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
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.infobox-panel.open {
		grid-template-rows: 1fr;
	}

	.infobox-content {
		display: block;
		overflow: hidden;
	}

	.infobox-inner {
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
