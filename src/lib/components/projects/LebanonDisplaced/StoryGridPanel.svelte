<script lang="ts">
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	interface Props {
		i: number;
		bgImage?: string;
		text?: string;
		boxShadow?: boolean;
		gridColumn?: string;
		textAlign?: string;
	}

	let {
		i = 0,
		bgImage = '',
		text = '',
		boxShadow = true,
		gridColumn = '',
		textAlign = 'left'
	}: Props = $props();
</script>

<div
	class={`story-grid--panel panel-${i + 1}`}
	style={`
    background-image: url(${bgImage});
    ${boxShadow ? '' : 'box-shadow: none;'}
    grid-column: ${gridColumn};
  `}
>
	{#if text}
		<FadeIn
			yOffset={50}
			containerClasses={'flex flex-col items-center gap-y-4'}
			delay={60 * i + 100}
		>
			<p style={`text-align: ${textAlign};`}>{text}</p>
		</FadeIn>
	{/if}
</div>

<style>
	/* media query 1 */
	@media only screen and (min-width: 400px) {
		.panel-3,
		.panel-6,
		.panel-7 {
			grid-column: span 2;
		}
		.panel-7 {
			text-align: center;
		}
	}

	/* media query 2 */
	@media only screen and (min-width: 600px) {
		.panel-3,
		.panel-6 {
			grid-column: auto;
		}
		.panel-8 {
			grid-column: span 2;
		}
	}
</style>
