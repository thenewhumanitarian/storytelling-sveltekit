<script lang="ts">
	import { PUBLIC_GTM_ID } from '$env/static/public';

	const isProduction = import.meta.env.MODE === 'production';
	const shouldEmbedGTM = isProduction && PUBLIC_GTM_ID;

	const {
		pageTitle = '',
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
</script>

<svelte:head>
	{#if pageTitle}
		<title>Lebanon Displacement Diaries | {pageTitle}</title>
	{/if}

	{#if pageDescription}
		<meta name="description" content={pageDescription} />
	{/if}

	{#if pageUrl}
		<link rel="canonical" href={pageUrl} />
	{/if}

	<!-- Google Tag Manager (if enabled) -->
	{#if shouldEmbedGTM}
		{@html `
			<script>
				(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
				new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
				j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
				'https://www.googletagmanager.com/gtm.js?id=${PUBLIC_GTM_ID}'+dl;
				f.parentNode.insertBefore(j,f);
				})(window,document,'script','dataLayer','${PUBLIC_GTM_ID}');
			</script>
		`}
	{/if}

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

{#if shouldEmbedGTM}
	<noscript>
		<iframe
			src="https://www.googletagmanager.com/ns.html?id=${PUBLIC_GTM_ID}"
			height="0"
			width="0"
			style="display:none;visibility:hidden"
			title="Google Tag Manager"
		></iframe>
	</noscript>
{/if}
