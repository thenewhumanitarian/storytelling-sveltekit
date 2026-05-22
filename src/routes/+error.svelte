<script lang="ts">
	import NotFoundPage from '$lib/components/NotFoundPage.svelte';
	import { page } from '$app/state';

	let { error, status: statusProp }: { error: App.Error; status?: number } = $props();

	// `status` prop can be undefined on SSR (SvelteKit 2.60); page.status has the real code.
	const status = $derived(statusProp ?? page.status);
	const is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Page not found' : 'Something went wrong'} — The New Humanitarian</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if is404}
	<NotFoundPage path={page.url.pathname} />
{:else}
	<main class="error-page">
		<div class="error-page__frame">
			<h1>Something went wrong</h1>
			<p>{error?.message || 'An unexpected error occurred.'}</p>
			<p class="error-page__status">Error {status}</p>
			<a class="error-page__link" href="/">Return home</a>
		</div>
	</main>
{/if}

<style>
	.error-page {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: #faf9f7;
	}

	.error-page__frame {
		max-width: 28rem;
		padding: 1.5rem 1.25rem;
		text-align: center;
		border: 4px solid #9f3e52;
		background: #fff;
	}

	.error-page h1 {
		font-family: 'GT Sectra Bold', ui-serif, Georgia, serif;
		color: #282828;
		margin: 0 0 0.75rem;
	}

	.error-page p {
		font-family: Roboto, 'Open Sans', ui-sans-serif, sans-serif;
		color: #4a4a4a;
		margin: 0 0 0.5rem;
	}

	.error-page__status {
		font-size: 0.875rem;
		color: #888;
	}

	.error-page__link {
		display: inline-block;
		margin-top: 1.25rem;
		font-weight: 600;
		color: #9f3e52;
	}
</style>
