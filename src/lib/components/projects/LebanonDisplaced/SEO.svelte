<script lang="ts">
	import { onMount } from 'svelte';
	import { PUBLIC_GA4_ID } from '$env/static/public';

	const isProduction = import.meta.env.MODE === 'production';
	const shouldEmbedGA = isProduction && PUBLIC_GA4_ID;

	const {
		pageTitle = '',
		pageTitlePrefix = '',
		pageDescription = '',
		pageImage = '',
		pageUrl = '',
		pageType = 'article',
		pagePublished = '',
		pageModified = '',
		pageAuthor = '',
		pagePublisher = 'The New Humanitarian',
		pageSection = '',
		pageTags = [],
		pageTwitterCard = 'summary_large_image',
		pageTwitterSite = '@newhumanitarian',
		pageTwitterCreator = '@newhumanitarian'
	} = $props();

	onMount(() => {
		if (!shouldEmbedGA) return;

		const initGA = () => {
			// Load GA script
			const script = document.createElement('script');
			script.setAttribute('async', '');
			script.src = `https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA4_ID}`;
			document.head.appendChild(script);

			// Inline config script
			const inline = document.createElement('script');
			inline.innerHTML = `
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', '${PUBLIC_GA4_ID}');
			`;
			document.head.appendChild(inline);
		};

		// Prefer requestIdleCallback if available
		if ('requestIdleCallback' in window) {
			(requestIdleCallback as any)(initGA);
		} else {
			setTimeout(initGA, 2000); // fallback if not supported
		}
	});
</script>

<svelte:head>
	{#if pageTitle}
		{#if pageTitlePrefix}
			<title>{pageTitlePrefix} | {pageTitle}</title>
		{:else}
			<title>{pageTitle}</title>
		{/if}
		<title>Lebanon Displacement Diaries</title>
	{/if}

	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}

	{#if pageUrl}
		<link rel="canonical" href={pageUrl} />
	{/if}

	<!-- Google Analytics GA4 (if enabled) -->
	<!-- {#if shouldEmbedGA}
		{@html `
			<script async src="https://www.googletagmanager.com/gtag/js?id=${PUBLIC_GA4_ID}"></script>
			<script>
				window.dataLayer = window.dataLayer || [];
				function gtag(){dataLayer.push(arguments);}
				gtag('js', new Date());
				gtag('config', '${PUBLIC_GA4_ID}');
			</script>
		`}
	{/if} -->

	<!-- Open Graph -->
	<meta property="og:site_name" content="The New Humanitarian" />
	{#if pageType}<meta property="og:type" content={pageType} />{/if}
	{#if pageUrl}<meta property="og:url" content={pageUrl} />{/if}
	{#if pageTitle}<meta property="og:title" content={pageTitle} />{/if}
	{#if pageDescription}<meta property="og:description" content={pageDescription} />{/if}
	{#if pageImage}
		<meta property="og:image" content={pageImage} />
		<meta property="og:image:url" content={pageImage} />
		<meta property="og:image:secure_url" content={pageImage} />
	{/if}
	{#if pageModified}<meta property="og:updated_time" content={pageModified} />{/if}

	<!-- Article-specific OG tags -->
	{#if pagePublished}<meta property="article:published_time" content={pagePublished} />{/if}
	{#if pageModified}<meta property="article:modified_time" content={pageModified} />{/if}
	{#if pageAuthor}<meta property="article:author" content={pageAuthor} />{/if}
	{#if pagePublisher}<meta property="article:publisher" content={pagePublisher} />{/if}
	{#if pageSection}<meta property="article:section" content={pageSection} />{/if}
	{#if pageTags}
		{#each pageTags as tag}
			<meta property="article:tag" content={tag} />
		{/each}
	{/if}

	<!-- Twitter Card -->
	{#if pageTwitterCard}<meta name="twitter:card" content={pageTwitterCard} />{/if}
	{#if pageTitle}<meta name="twitter:title" content={pageTitle} />{/if}
	{#if pageDescription}<meta name="twitter:description" content={pageDescription} />{/if}
	{#if pageImage}<meta name="twitter:image" content={pageImage} />{/if}
	{#if pageTwitterSite}<meta name="twitter:site" content={pageTwitterSite} />{/if}
	{#if pageTwitterCreator}<meta name="twitter:creator" content={pageTwitterCreator} />{/if}
</svelte:head>
