<script lang="ts">
	/*
	 * The "Get involved" tips form on its own, for an iframe on the Drupal site. The root layout
	 * already loads iframe-resizer's child script and tags the page wrapper with
	 * data-iframe-height, so a host page running iframe-resizer (v4) sizes the iframe to fit,
	 * including when a confirmation or error message changes the height.
	 * Iframe code: docs/climate/get-involved-iframe.html.
	 */
	import GetInvolvedForm from '../../../GetInvolvedForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Get involved | The climate cost of conflict | The New Humanitarian</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<GetInvolvedForm stamp={data.formStamp} {form} />

<style>
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-regular.woff2') format('woff2');
		font-display: swap;
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-700.woff2') format('woff2');
		font-display: swap;
		font-weight: 700;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Bold.woff2') format('woff2');
		font-display: swap;
		font-weight: 700;
	}
	/* Blend into the host page: no page margin or background of its own. */
	:global(html),
	:global(body) {
		margin: 0;
		background: transparent;
	}
</style>
