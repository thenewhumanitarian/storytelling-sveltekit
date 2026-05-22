<script lang="ts">
	import type { EventMeta, EventContent } from '$lib/events/types';
	import { absoluteAssetUrl, eventCanonicalUrl, jsonLdScript } from '$lib/events/seo';

	interface Props {
		meta: EventMeta;
		content: EventContent;
	}

	let { meta, content }: Props = $props();

	const canonicalUrl = $derived(eventCanonicalUrl(meta.canonicalPath));
	const ogImageUrl = $derived(absoluteAssetUrl(meta.ogImage));
	const ogImageWidth = $derived(meta.ogImageWidth ? `${meta.ogImageWidth}` : undefined);
	const ogImageHeight = $derived(meta.ogImageHeight ? `${meta.ogImageHeight}` : undefined);
	const fullTitle = $derived(`${meta.title} | The New Humanitarian`);

	const eventStatus = 'https://schema.org/EventScheduled';

	const jsonLd = $derived.by(() => {
		const performers = content.speakers.map((speaker) => ({
			'@type': 'Person',
			name: speaker.name,
			jobTitle: speaker.role
		}));

		const eventSchema = {
			'@context': 'https://schema.org',
			'@type': 'Event',
			name: meta.title,
			description: meta.description,
			startDate: meta.startDate,
			endDate: meta.endDate,
			eventStatus,
			eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
			image: [ogImageUrl],
			url: canonicalUrl,
			location: {
				'@type': 'Place',
				name: meta.location.name,
				address: {
					'@type': 'PostalAddress',
					streetAddress: meta.location.address,
					addressLocality: meta.location.city,
					addressRegion: meta.location.region,
					addressCountry: meta.location.country
				}
			},
			organizer: {
				'@type': 'Organization',
				name: 'The New Humanitarian',
				url: 'https://www.thenewhumanitarian.org'
			},
			performer: performers,
			offers: {
				'@type': 'Offer',
				url: meta.registrationUrl,
				availability: 'https://schema.org/InStock',
				price: '0',
				priceCurrency: 'USD'
			},
			sameAs: [meta.wwwEventUrl, meta.registrationUrl]
		};

		const webPageSchema = {
			'@context': 'https://schema.org',
			'@type': 'WebPage',
			name: fullTitle,
			description: meta.description,
			url: canonicalUrl,
			isPartOf: {
				'@type': 'WebSite',
				name: 'The New Humanitarian',
				url: 'https://www.thenewhumanitarian.org'
			}
		};

		const breadcrumbSchema = {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: [
				{
					'@type': 'ListItem',
					position: 1,
					name: 'The New Humanitarian',
					item: 'https://www.thenewhumanitarian.org'
				},
				{
					'@type': 'ListItem',
					position: 2,
					name: 'Events',
					item: 'https://www.thenewhumanitarian.org/events'
				},
				{
					'@type': 'ListItem',
					position: 3,
					name: meta.title,
					item: canonicalUrl
				}
			]
		};

		return [eventSchema, webPageSchema, breadcrumbSchema];
	});
	const jsonLdTag = $derived(
		'<scr' + 'ipt type="application/ld+json">' + jsonLdScript(jsonLd) + '</scr' + 'ipt>'
	);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={meta.description} />
	<meta name="keywords" content={meta.keywords.join(', ')} />
	<link rel="canonical" href={canonicalUrl} />
	<meta name="theme-color" content={meta.themeColor} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="The New Humanitarian" />
	<meta property="og:title" content={meta.title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:image:url" content={ogImageUrl} />
	<meta property="og:image:secure_url" content={ogImageUrl} />
	<meta property="og:image:alt" content={meta.ogImageAlt} />
	{#if ogImageWidth}
		<meta property="og:image:width" content={ogImageWidth} />
	{/if}
	{#if ogImageHeight}
		<meta property="og:image:height" content={ogImageHeight} />
	{/if}
	{#if meta.ogImageType}
		<meta property="og:image:type" content={meta.ogImageType} />
	{/if}
	<meta property="og:locale" content="en_US" />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@newhumanitarian" />
	<meta name="twitter:title" content={meta.title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={ogImageUrl} />
	<meta name="twitter:image:alt" content={meta.ogImageAlt} />

	{@html jsonLdTag}
</svelte:head>
