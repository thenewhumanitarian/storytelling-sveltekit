<script>
	export let pageTitle = '';
	export let pageDescription = '';
	export let pageImage = '';
	export let pageUrl = '';
	export let pageType = '';
	export let pagePublished = '';
	export let pageModified = '';
	export let pageAuthor = '';
	export let pagePublisher = '';
	export let pageSection = '';
	export let pageTags = '';
	export let pageTwitterCard = '';
	export let pageTwitterSite = '';
	export let pageTwitterCreator = '';
</script>

<svelte:head>
	{#if pageTitle && pageTitle !== ''}
		<title>TNH| {pageTitle}</title>
	{/if}
</svelte:head>
