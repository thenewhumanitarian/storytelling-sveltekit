<script lang="ts">
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { onMount } from 'svelte';
	import XNotificationStack from '$lib/components/XNotificationStack.svelte';
	import ScrollySection from '$lib/components/scrolly/ScrollySection.svelte';
	import VideoScrollyVisualization from '$lib/components/scrolly/VideoScrollyVisualization.svelte';
	import ArticleImage from '$lib/components/ArticleImage.svelte';

	// Header animation states
	let titleVisible = $state(false);
	let descVisible = $state(false);
	let bylineVisible = $state(false);

	// Notification animation state (triggered by scroll)
	let notificationsTriggered = $state(false);

	// Video scrolly state
	let videoStep = $state(0);

	// Fade-to-black state (for video header section)
	let headerFadeProgress = $state(0);

	// Handle notification section entering view
	function handleNotificationInView({ detail }: CustomEvent<ObserverEventDetails>) {
		if (detail.inView && !notificationsTriggered) {
			notificationsTriggered = true;
		}
	}

	onMount(() => {
		// Staggered reveal animation for header on load
		setTimeout(() => (titleVisible = true), 100);
		setTimeout(() => (descVisible = true), 400);
		setTimeout(() => (bylineVisible = true), 700);

		// Scroll tracking for fade-to-black effect
		const handleHeaderScroll = () => {
			const headerContainer = document.querySelector('.video-header-container');
			if (!headerContainer) return;

			const rect = headerContainer.getBoundingClientRect();
			const containerHeight = rect.height;
			const scrolledPast = -rect.top;
			const viewportHeight = window.innerHeight;
			const scrollableDistance = containerHeight - viewportHeight;
			const progress = Math.max(0, Math.min(1, scrolledPast / scrollableDistance));

			// Start fading at 75% progress, fully black at 100%
			const fadeStart = 0.75;
			headerFadeProgress = progress < fadeStart ? 0 : Math.min(1, (progress - fadeStart) / (1 - fadeStart));
		};

		window.addEventListener('scroll', handleHeaderScroll, { passive: true });
		handleHeaderScroll(); // Initial call

		return () => {
			window.removeEventListener('scroll', handleHeaderScroll);
		};
	});

	// Video scrolly data - compelling quotes that define intent
	const videoStepsData = [
		{
			file: '1952348361748594720_00001.mp4',
			date: 'August 4, 2025',
			quote: '"The drive WILL CONTINUE, here as well as across the State, to take back EVERY INCH of land which rightfully belongs to the people of Assam."',
			context: 'On eviction drives in Rengma Reserve Forest',
			link: 'https://x.com/himantabiswa/status/1952348361748594720'
		},
		{
			file: '1960624416171417922_00001.mp4',
			date: 'August 27, 2025',
			quote: '"Encroachers who were earlier fighting our eviction drives are now supporting it. The best way forward is Compliance over Confrontation."',
			context: 'Framing acquiescence as community support',
			link: 'https://x.com/himantabiswa/status/1960624416171417922'
		},
		{
			file: '1932812566457196638_00001.mp4',
			date: 'June 11, 2025',
			quote: '"Regardless of whether someone\'s name is listed in the NRC or not, if the administration determines someone to be an illegal infiltrator, they will be pushed back."',
			context: 'Declaring legal citizenship status irrelevant',
			link: 'https://x.com/himantabiswa/status/1932812566457196638'
		},
		{
			file: '2008539054044823637_00001.mp4',
			date: 'January 6, 2026',
			quote: '"You don\'t encroach on our lands, our culture and then cry victim when the JCBs arrive. You just make way for them. The eviction drive will spare no one."',
			context: 'Warning to communities facing demolition',
			link: 'https://x.com/himantabiswa/status/2008539054044823637'
		},
		{
			file: '2010693241705054300_00001.mp4',
			date: 'January 12, 2026',
			quote: '"\'Shoot at Sight\' का आदेश दिया गया।"',
			translation: 'A "Shoot at Sight" order was given.',
			context: 'On orders issued in Dhubri district',
			link: 'https://x.com/himantabiswa/status/2010693241705054300'
		}
	];

	// Video sources for VideoScrollyVisualization
	const videoData = videoStepsData.map((step) => ({
		videoSrc: `/videos/assam-evictions/${step.file}`
	}));

	// Step content for ScrollySection (raw HTML for custom quote card styling)
	const videoScrollySteps = videoStepsData.map((step) => ({
		raw: true,
		text: `
			<div class="quote-card">
				<span class="quote-date">${step.date}</span>
				<blockquote class="quote-text">${step.quote}</blockquote>
				${step.translation ? `<p class="quote-translation">${step.translation}</p>` : ''}
				<p class="quote-context">${step.context}</p>
				<a href="${step.link}" target="_blank" rel="noopener noreferrer" class="quote-link">
					<span>View original post</span>
					<svg class="quote-link-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
					</svg>
				</a>
			</div>
		`
	}));
</script>

<svelte:head>
	<title>The 18 Acres | TNH Storytelling</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- Video Header Section -->
<div class="video-header-container relative">
	<!-- Fixed video background -->
	<div class="fixed inset-0 w-full h-full bg-black -z-10">
		<video
			class="absolute inset-0 w-full h-full object-cover"
			autoplay
			muted
			loop
			playsinline
			preload="auto"
		>
			<source src="/videos/assam-evictions/1952348361748594720_00001.mp4" type="video/mp4" />
		</video>
		<!-- Dark overlay for better text readability -->
		<div class="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
	</div>

	<!-- Header content -->
	<article class="relative z-10">
		<div class="step min-h-screen flex items-center justify-center p-4">
			<div class="header-content max-w-3xl mx-auto text-center">
				<h1
					class="header-title text-white mb-6"
					class:title-visible={titleVisible}
				>
					The 18 Acres
				</h1>

				<p
					class="header-desc text-white/90 mb-8"
					class:desc-visible={descVisible}
				>
					How government land reached the Chief Minister's family
				</p>

				<div
					class="header-byline"
					class:byline-visible={bylineVisible}
				>
					<p class="text-white/70 text-sm tracking-widest uppercase mb-2">By</p>
					<p class="text-white font-medium text-lg">Ahmer Khan and Tom Vaillant</p>
					<p class="text-white/50 text-sm mt-2">January 2026</p>
				</div>

				<!-- Scroll indicator -->
				<div
					class="scroll-indicator mt-12"
					class:byline-visible={bylineVisible}
				>
					<div class="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center pt-2 mx-auto">
						<div class="w-1 h-2 bg-white/60 rounded-full animate-bounce"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Notification section - appears as user scrolls past header -->
		<div
			class="notification-section py-24"
			use:inview={{ rootMargin: '-20% 0px -20% 0px' }}
			oninview_change={handleNotificationInView}
		>
			<XNotificationStack
				autoTrigger={false}
				triggerDelay={200}
				externalTrigger={notificationsTriggered}
			/>
		</div>

		<!-- Spacer before transition to white section -->
		<div class="h-[30vh]"></div>
	</article>

	<!-- Fade to black overlay -->
	{#if headerFadeProgress > 0}
		<div class="header-fade-overlay" style:opacity={headerFadeProgress}></div>
	{/if}
</div>

<!-- Intro Section -->
<section class="intro-section relative bg-[#0a0a0a] py-16 px-6">
	<div class="max-w-2xl mx-auto">
		<div class="prose-content text-[rgba(255,255,255,0.8)] space-y-6">
			<p class="text-xl leading-relaxed text-[rgba(255,255,255,0.9)]">
				The company was called RBS Realtors. It was founded in June 2006 by two people: Riniki Bhuyan Sarma and Ranjit Bhattacharyya. A source close to the family confirmed what the name suggested: RBS stood for Riniki Bhuyan Sarma's initials.
			</p>

			<p>
				Riniki Bhuyan Sarma is the wife of Himanta Biswa Sarma, who became Chief Minister of Assam in May 2021—the same month the eviction campaigns accelerated.
			</p>

			<p>
				Between 2006 and 2009, RBS Realtors acquired <strong class="text-white">18 acres of government land</strong> through transactions that, according to official land records, violated state law.
			</p>

			<p>
				Today, <a href="https://www.zaubacorp.com/" class="text-[#7eb8da] hover:text-[#a3d0ed] transition-colors">15.9% of the company</a>—now renamed Vasistha Realtors—is owned by Nandil Biswa Sarma, the Chief Minister's adult son.
			</p>
		</div>
	</div>
</section>

<!-- Video Scrolly Section -->
<ScrollySection
	bind:activeStep={videoStep}
	steps={videoScrollySteps}
	backgroundColor="#000000"
	showTextBoxes={true}
>
	{#snippet children({ activeStep })}
		<VideoScrollyVisualization {activeStep} videoSteps={videoData} />
	{/snippet}
</ScrollySection>

<!-- Article Content Section -->
<section class="article-content relative bg-[#0a0a0a] py-16 px-6">
	<div class="max-w-2xl mx-auto">
		<div class="prose-content text-[rgba(255,255,255,0.8)] space-y-8">

			<!-- The Bongora Land -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">01</span>
				</div>
				<h2 class="section-title">The Bongora Land</h2>
				<p class="section-subtitle">6.92 Acres</p>
			</div>

			<div class="prose-block">
				<p class="lead">
					In November 2008, ceiling surplus land—agricultural property seized from large landowners—was allotted to seven "needy" beneficiaries near Guwahati's international airport.
				</p>

				<p>
					The allotment came with a condition recorded on the <a href="https://ilrms.assam.gov.in/dhar/" class="article-link">Dharitree land portal</a>. In Assamese: <em class="text-[rgba(255,255,255,0.7)]">"Ullekh thake je ei mati 10 bosorole bikri koribo nuwaribo."</em>
				</p>

				<p class="finding-highlight">
					Translation: This land cannot be sold for 10 years.
				</p>

				<p>
					Within weeks, all seven beneficiaries sold their allotments to RBS Realtors.
				</p>
			</div>

			<div class="finding-card">
				<div class="finding-badge">Key Finding</div>
				<p class="finding-text">
					The <a href="https://ilrms.assam.gov.in/dhar/" class="article-link">land records</a> show a coordinated pattern:
				</p>
				<ul class="evidence-list">
					<li><span class="evidence-marker"></span><span class="evidence-content"><strong>November 25, 2008:</strong> Four beneficiaries receive allotments on the same day</span></li>
					<li><span class="evidence-marker"></span><span class="evidence-content"><strong>January 28, 2009:</strong> Three of them sell to RBS Realtors on the same day</span></li>
					<li><span class="evidence-marker"></span><span class="evidence-content">The remaining four sell between January and December 2009</span></li>
				</ul>
				<div class="finding-source">
					<span class="source-label">Source:</span>
					<span class="source-text">Dharitree Land Portal, Assam</span>
				</div>
			</div>

			<p class="conclusion-text">
				Total land acquired: <strong>6.92 acres</strong>. Time elapsed since allotment: <strong>2-13 months</strong>. Lock-in period: <strong>10 years</strong>.
			</p>

			<div class="section-transition"><div class="transition-line"></div></div>

			<!-- The North Guwahati Land -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">02</span>
				</div>
				<h2 class="section-title">The North Guwahati Land</h2>
				<p class="section-subtitle">10.6 Acres</p>
			</div>

			<div class="prose-block">
				<p class="lead">
					In August 2006, the Assam government allotted two parcels of institutional land—designated for a fishery and a school.
				</p>
			</div>

			<div class="document-excerpt">
				<div class="document-header">
					<span class="doc-icon">📄</span>
					<span class="doc-label">Property Record</span>
				</div>
				<div class="document-content">
					<h4 class="doc-title">Udayon Fishery Development Farm</h4>
					<ul class="doc-list">
						<li><span class="doc-key">Allotted:</span> August 10, 2006</li>
						<li><span class="doc-key">Size:</span> 7 bigha, 2 katha, 5 lessa</li>
						<li><span class="doc-key">Sold to RBS Realtors:</span> <mark>December 27, 2006</mark>—four months later</li>
					</ul>
				</div>
			</div>

			<div class="document-excerpt">
				<div class="document-header">
					<span class="doc-icon">📄</span>
					<span class="doc-label">Property Record</span>
				</div>
				<div class="document-content">
					<h4 class="doc-title">Welfare Activities School</h4>
					<ul class="doc-list">
						<li><span class="doc-key">Allotted:</span> August 23, 2006</li>
						<li><span class="doc-key">Size:</span> 10 bigha</li>
						<li><span class="doc-key">Sold to RBS Realtors:</span> <mark>July 20, 2007</mark>—eleven months later</li>
					</ul>
				</div>
			</div>

			<div class="alert-card">
				<div class="alert-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 5v4h-1.5V5h1.5z"/>
					</svg>
				</div>
				<p class="alert-text">
					Under the Assam Land Policy of 1989, institutional land allotted for specific purposes cannot be sold to private companies.
				</p>
			</div>

			<div class="prose-block">
				<p>
					Both parcels were sold to RBS Realtors while <a href="https://www.mca.gov.in/" class="article-link">Riniki Bhuyan Sarma was listed as a director</a>.
				</p>
			</div>

			<p class="conclusion-text">
				Total North Guwahati land: <strong>10.6 acres</strong>.
			</p>

			<p class="major-finding">
				Combined with Bongora: <strong>18 acres of government land</strong>.
			</p>

			<div class="section-transition"><div class="transition-line"></div></div>

			<!-- The Shell Companies -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">03</span>
				</div>
				<h2 class="section-title">The Shell Companies</h2>
			</div>

			<div class="prose-block">
				<p class="lead">
					<a href="https://www.mca.gov.in/" class="article-link">Corporate filings</a> reveal 17 entities with names like Dingo Commodeal and Elegance Trade invested in RBS Realtors during the land acquisition period—then vanished.
				</p>
			</div>

			<div class="timeline">
				<div class="timeline-item">
					<div class="timeline-date">2006–2009</div>
					<div class="timeline-content">
						<h4>Shell Company Investments</h4>
						<p>17 corporate entities invest in RBS Realtors during land acquisitions</p>
					</div>
				</div>
				<div class="timeline-item highlight">
					<div class="timeline-date">June 9, 2009</div>
					<div class="timeline-content">
						<h4>Director Resignation</h4>
						<p><a href="https://www.zaubacorp.com/" class="article-link">Riniki Bhuyan Sarma resigns</a> after most acquisitions complete</p>
					</div>
				</div>
				<div class="timeline-item">
					<div class="timeline-date">2009–2010</div>
					<div class="timeline-content">
						<h4>Shell Company Exit</h4>
						<p>All 17 entities exit; shares transfer to family members</p>
					</div>
				</div>
				<div class="timeline-item">
					<div class="timeline-date">2009</div>
					<div class="timeline-content">
						<h4>Company Renamed</h4>
						<p>RBS Realtors becomes Vasistha Realtors (same CIN)</p>
					</div>
				</div>
				<div class="timeline-item">
					<div class="timeline-date">2017</div>
					<div class="timeline-content">
						<h4>Share Transfer</h4>
						<p>Riniki's mother-in-law Meena Bhuyan receives <a href="https://www.zaubacorp.com/" class="article-link">23.61% of shares</a></p>
					</div>
				</div>
				<div class="timeline-item highlight">
					<div class="timeline-date">Sep 16, 2019</div>
					<div class="timeline-content">
						<h4>Final Transfer</h4>
						<p>18 days after son turns 18, Meena <a href="https://www.zaubacorp.com/" class="article-link">transfers entire stake to him</a></p>
					</div>
				</div>
			</div>

			<p class="major-finding">
				Today, the Chief Minister's son owns <strong>15.9%</strong> of a company holding <strong>18 acres of government land</strong> acquired in apparent violation of state law.
			</p>

			<div class="section-transition"><div class="transition-line"></div></div>

			<!-- The Wealth Growth -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">04</span>
				</div>
				<h2 class="section-title">The Wealth Growth</h2>
			</div>

			<div class="prose-block">
				<p class="lead">
					<a href="https://myneta.info/" class="article-link">Election affidavits</a> filed with the Election Commission reveal the trajectory of the Sarma family's declared assets.
				</p>
			</div>

			<div class="data-table-wrapper">
				<div class="table-header">
					<h3 class="table-title">Declared Family Assets</h3>
					<p class="table-subtitle">Election Commission affidavit filings, 2006-2021</p>
				</div>

				<table class="evidence-table">
					<thead>
						<tr>
							<th>Year</th>
							<th class="text-right">Total Assets</th>
							<th class="text-right highlight-col">Growth</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="year-cell">2006</td>
							<td class="text-right">Rs 1.02 Cr</td>
							<td class="text-right highlight-col">—</td>
						</tr>
						<tr>
							<td class="year-cell">2011</td>
							<td class="text-right">Rs 3.06 Cr</td>
							<td class="text-right highlight-col"><span class="growth-badge">+200%</span></td>
						</tr>
						<tr>
							<td class="year-cell">2016</td>
							<td class="text-right">Rs 6.38 Cr</td>
							<td class="text-right highlight-col"><span class="growth-badge">+108%</span></td>
						</tr>
						<tr class="highlight-row">
							<td class="year-cell">2021</td>
							<td class="text-right font-medium">Rs 17.27 Cr</td>
							<td class="text-right highlight-col"><span class="growth-badge primary">+170%</span></td>
						</tr>
					</tbody>
				</table>

				<div class="table-source">
					Source: Election Commission of India / MyNeta.info
				</div>
			</div>

			<div class="finding-card">
				<div class="finding-badge">Key Finding</div>
				<p class="finding-text">
					The <a href="https://myneta.info/" class="article-link">2021 affidavit</a> shows Riniki Bhuyan Sarma's declared income from 2015-2020:
				</p>
				<ul class="evidence-list">
					<li><span class="evidence-marker"></span><span class="evidence-content"><strong>Riniki's annual income:</strong> Rs 1.25 crore to Rs 3.64 crore</span></li>
					<li><span class="evidence-marker"></span><span class="evidence-content"><strong>Husband's annual income:</strong> Rs 7.29 lakh to Rs 25.94 lakh</span></li>
				</ul>
			</div>

			<p class="major-finding">
				Riniki's income was <strong>12 to 50 times higher</strong> than her husband's—then the Health Minister.
			</p>

			<div class="alert-card">
				<div class="alert-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 5v4h-1.5V5h1.5z"/>
					</svg>
				</div>
				<p class="alert-text">
					The affidavit lists a <a href="https://myneta.info/" class="article-link">Rs 5.16 lakh liability to "JCB Industries"</a>—the manufacturer of excavators used in eviction operations. <a href="https://www.amnesty.org/en/wp-content/uploads/2024/02/ASA2076142024ENGLISH.pdf" class="article-link">Amnesty International documented JCB equipment</a> in verified demolition videos.
				</p>
			</div>

			<div class="section-transition"><div class="transition-line"></div></div>

			<!-- The Allegations -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">05</span>
				</div>
				<h2 class="section-title">The Allegations</h2>
			</div>

			<div class="prose-block">
				<p class="lead">
					On February 24, 2025, as PM Modi arrived to inaugurate the Advantage Assam 2.0 summit, Congress leaders made public allegations about the CM's business holdings.
				</p>
			</div>

			<blockquote class="evidence-quote">
				<div class="quote-mark">"</div>
				<p class="quote-text-block">
					In Assam the CM's family has eaten up lands in every district.
				</p>
				<footer class="quote-attribution">
					<span class="attribution-name">Gaurav Gogoi</span>
					<span class="attribution-context">Lok Sabha MP</span>
				</footer>
			</blockquote>

			<div class="prose-block">
				<p>
					Jitendra Singh, Congress General Secretary, <a href="https://www.thehindu.com/" class="article-link">alleged the family had become "business tycoons"</a> with holdings including:
				</p>
			</div>

			<ul class="evidence-list compact">
				<li><span class="evidence-marker"></span><span class="evidence-content">Tea gardens (Kanchanjuri, Radhha Krishna estates)</span></li>
				<li><span class="evidence-marker"></span><span class="evidence-content">News portals and media outlets</span></li>
				<li><span class="evidence-marker"></span><span class="evidence-content">McDonald's franchise</span></li>
				<li><span class="evidence-marker"></span><span class="evidence-content">International schools</span></li>
				<li><span class="evidence-marker"></span><span class="evidence-content">Land purchases in tribal areas</span></li>
			</ul>

			<ArticleImage
				src="/images/the-eighteen-acres/sarma_land.png"
				alt="Map showing land holdings associated with Chief Minister Himanta Biswa Sarma's family across Assam"
				caption="Land holdings associated with the Chief Minister's family, mapped across multiple districts in Assam."
				credit="The New Humanitarian"
			/>

			<ArticleImage
				src="/images/cleared/sarma/sarma_2.png"
				alt="Closeup satellite view of land near the airport"
				caption="A closeup view of the land holdings near the airport."
				credit="The New Humanitarian"
			/>

			<div class="alert-card">
				<div class="alert-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zM8.75 5v4h-1.5V5h1.5z"/>
					</svg>
				</div>
				<p class="alert-text">
					Under Assam law, land in tribal belts cannot be purchased by non-tribals. If accurate, such purchases would violate the Assam Land and Revenue Regulation, 1886.
				</p>
			</div>

			<div class="alert-card warning">
				<div class="alert-icon">
					<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
						<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
					</svg>
				</div>
				<p class="alert-text">
					<strong>Note:</strong> These are opposition allegations. They have not been independently verified. But they point to additional records that would confirm or refute the claims.
				</p>
			</div>

			<div class="prose-block">
				<p>
					The summit where these allegations were made is the same event after which evictions accelerated. In following months, land was cleared for corporate projects including the <a href="https://scroll.in/latest/1084333/" class="article-link">Rs 48,000 crore Adani thermal plant in Dhubri</a>.
				</p>
			</div>

			<div class="section-transition"><div class="transition-line"></div></div>

			<!-- The State Agency -->
			<div class="section-header">
				<div class="section-marker">
					<span class="marker-line"></span>
					<span class="marker-number">06</span>
				</div>
				<h2 class="section-title">The State Agency</h2>
			</div>

			<div class="prose-block">
				<p class="lead">
					On October 31, 2022, the Government of Assam incorporated <a href="https://www.indiafilings.com/search/assam-urban-infrastructure-development-finance-corporation-limited-cin-U45400AS2022SGC023784" class="article-link">AUIDFCL</a>—the nodal agency for urban infrastructure development.
				</p>
			</div>

			<div class="finding-card final">
				<div class="finding-badge">Board Chairperson</div>
				<p class="finding-text large">
					<a href="https://auidfcl.assam.gov.in/" class="article-link">Himanta Biswa Sarma</a>
				</p>
			</div>

			<p class="final-statement">
				The Chief Minister who oversees eviction policy sits on the board of the agency that manages urban development on cleared land.
			</p>

		</div>
	</div>
</section>

<!-- Footer -->
<footer class="article-footer">
	<div class="footer-inner">
		<!-- Top rule with document marker -->
		<div class="footer-rule">
			<span class="rule-line"></span>
			<span class="rule-marker">End of Document</span>
			<span class="rule-line"></span>
		</div>

		<!-- Credits Grid -->
		<div class="footer-grid">
			<div class="footer-column">
				<h3 class="footer-heading">
					<span class="heading-marker"></span>
					Credits
				</h3>
				<div class="credit-items">
					<div class="credit-item">
						<span class="credit-role">Reporting</span>
						<span class="credit-name">Ahmer Khan and Tom Vaillant</span>
					</div>
					<div class="credit-item">
						<span class="credit-role">Visuals</span>
						<span class="credit-name">Tom Vaillant</span>
					</div>
				</div>
			</div>

			<div class="footer-column">
				<h3 class="footer-heading">
					<span class="heading-marker"></span>
					Sources
				</h3>
				<ul class="source-list">
					<li>Dharitree Land Portal</li>
					<li>Ministry of Corporate Affairs</li>
					<li>MyNeta / Election Commission</li>
					<li>Amnesty International</li>
					<li>CAG Audit Reports</li>
				</ul>
			</div>

			<div class="footer-column">
				<h3 class="footer-heading">
					<span class="heading-marker"></span>
					Share
				</h3>
				<div class="share-buttons">
					<button type="button" class="share-btn" aria-label="Share on Twitter">
						<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
						</svg>
						<span>Twitter</span>
					</button>
					<button type="button" class="share-btn" aria-label="Share on Facebook">
						<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
						</svg>
						<span>Facebook</span>
					</button>
					<button type="button" class="share-btn" aria-label="Share on LinkedIn">
						<svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
						</svg>
						<span>LinkedIn</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Bottom bar -->
		<div class="footer-bottom">
			<div class="brand">
				<span class="brand-name">The New Humanitarian</span>
			</div>
			<div class="meta">
				<span class="publish-date">Published January 2026</span>
				<span class="separator">·</span>
				<span class="rights">All rights reserved</span>
			</div>
		</div>
	</div>
</footer>

<style>
	/* Override global overflow-x: hidden which breaks position: sticky */
	:global(html), :global(body) {
		overflow-x: clip;
	}

	/* Typography */
	.header-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}

	.header-desc {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 300;
		line-height: 1.7;
		max-width: 42ch;
		margin-left: auto;
		margin-right: auto;
	}

	.header-byline {
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	.step-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: 1.75rem;
		font-weight: 600;
		line-height: 1.2;
	}

	.step-text {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.75;
	}

	.content-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		line-height: 1.2;
	}

	.prose-content {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.85;
	}

	/* Footer Styles */
	.article-footer {
		position: relative;
		z-index: 10;
		background: var(--bg-charcoal, #0a0a0a);
		padding: 0 1.5rem 3rem;
	}

	.footer-inner {
		max-width: 42rem;
		margin: 0 auto;
	}

	/* Document end marker */
	.footer-rule {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 2.5rem 0;
	}

	.rule-line {
		flex: 1;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.1),
			transparent
		);
	}

	.rule-marker {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.6rem;
		letter-spacing: 0.25em;
		color: rgba(255, 255, 255, 0.4);
		text-transform: uppercase;
	}

	/* Footer Grid */
	.footer-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 2rem;
		padding-bottom: 2.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	}

	.footer-column {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.footer-heading {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #d4a574;
		margin: 0;
	}

	.heading-marker {
		width: 1rem;
		height: 1px;
		background: #d4a574;
	}

	/* Credits */
	.credit-items {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.credit-item {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.credit-role {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: rgba(255, 255, 255, 0.4);
	}

	.credit-name {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.7);
	}

	/* Sources */
	.source-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.source-list li {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.4);
		line-height: 1.4;
	}

	/* Share buttons */
	.share-buttons {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.share-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0;
		background: transparent;
		border: none;
		cursor: pointer;
		color: rgba(255, 255, 255, 0.4);
		transition: color 0.2s ease;
	}

	.share-btn:hover {
		color: rgba(255, 255, 255, 0.9);
	}

	.share-btn svg {
		flex-shrink: 0;
	}

	.share-btn span {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.8rem;
	}

	/* Footer bottom bar */
	.footer-bottom {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-top: 2rem;
		gap: 1rem;
	}

	.brand-name {
		font-family: 'Playfair Display', serif;
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.7);
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		color: rgba(255, 255, 255, 0.4);
	}

	.separator {
		color: rgba(255, 255, 255, 0.2);
	}

	/* Footer responsive */
	@media (max-width: 640px) {
		.footer-grid {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.footer-bottom {
			flex-direction: column;
			align-items: flex-start;
			gap: 0.75rem;
		}

		.share-buttons {
			flex-direction: row;
			flex-wrap: wrap;
			gap: 1rem;
		}
	}

	/* Header animations - initial load */
	.header-title,
	.header-desc,
	.header-byline,
	.scroll-indicator {
		opacity: 0;
		filter: blur(8px);
		transform: translateY(20px);
		transition: all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.header-title.title-visible,
	.header-desc.desc-visible,
	.header-byline.byline-visible,
	.scroll-indicator.byline-visible {
		opacity: 1;
		filter: blur(0);
		transform: translateY(0);
	}

	/* Scrolly container */
	.scrolly-container {
		min-height: 300vh;
	}

	/* Smooth scroll indicator animation */
	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(6px);
		}
	}

	.animate-bounce {
		animation: bounce 1.5s ease-in-out infinite;
	}

	/* Quote card styles for raw HTML in ScrollySection */
	:global(.quote-card) {
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border: 1px solid rgba(255, 255, 255, 0.1);
		padding: 1.5rem 2rem;
		max-width: 32rem;
		width: 100%;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.05),
			0 25px 50px -12px rgba(0, 0, 0, 0.5);
	}

	:global(.quote-date) {
		display: block;
		color: rgba(255, 255, 255, 0.4);
		font-size: 0.75rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		margin-bottom: 1rem;
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	:global(.quote-text) {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: -0.01em;
		color: white;
		margin: 0 0 0.75rem 0;
	}

	:global(.quote-translation) {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(0.95rem, 2vw, 1.1rem);
		font-style: italic;
		line-height: 1.5;
		color: rgba(255, 255, 255, 0.7);
		margin: 0 0 1rem 0;
	}

	:global(.quote-context) {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
		margin: 0 0 1.25rem 0;
	}

	:global(.quote-link) {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		color: rgba(255, 255, 255, 0.3);
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		text-decoration: none;
		transition: color 0.15s ease;
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	:global(.quote-link:hover) {
		color: rgba(255, 255, 255, 0.7);
	}

	:global(.quote-link-icon) {
		width: 0.75rem;
		height: 0.75rem;
	}

	@media (max-width: 768px) {
		:global(.quote-card) {
			padding: 1.25rem 1.5rem;
			margin-bottom: env(safe-area-inset-bottom, 0);
		}
	}

	/* Notification section styles */
	.notification-section {
		position: relative;
		z-index: 10;
	}

	/* Ensure video-header-container doesn't clip content */
	.video-header-container {
		overflow: visible;
	}

	/* Fade to black overlay - scoped to header container only */
	.header-fade-overlay {
		position: absolute;
		inset: 0;
		background: #0a0a0a;
		pointer-events: none;
		z-index: 5;
	}

	/* ========================================
	   EDITORIAL NOIR COMPONENT STYLES
	   ======================================== */

	/* CSS Variables */
	.article-content {
		--bg-charcoal: #0a0a0a;
		--accent-amber: #d4a574;
		--text-primary: rgba(255, 255, 255, 0.9);
		--text-secondary: rgba(255, 255, 255, 0.7);
		--text-muted: rgba(255, 255, 255, 0.4);
		--border-subtle: rgba(255, 255, 255, 0.08);
		--link-color: #7eb8da;
	}

	/* Section Headers */
	.section-header {
		padding: 3rem 0 1.5rem;
	}

	.section-marker {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.marker-line {
		width: 2rem;
		height: 1px;
		background: var(--accent-amber);
	}

	.marker-number {
		font-family: 'JetBrains Mono', 'SF Mono', monospace;
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		color: var(--accent-amber);
		text-transform: uppercase;
	}

	.section-title {
		font-family: 'Playfair Display', serif;
		font-size: clamp(1.75rem, 5vw, 2.5rem);
		font-weight: 600;
		color: #ffffff;
		margin: 0;
		line-height: 1.1;
	}

	.section-subtitle {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-top: 0.5rem;
		letter-spacing: 0.05em;
	}

	/* Prose Blocks */
	.prose-block {
		margin: 1.5rem 0;
	}

	.prose-block p {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.85;
		color: var(--text-secondary);
		margin-bottom: 1.25rem;
	}

	.prose-block .lead {
		font-size: 1.25rem;
		color: var(--text-primary);
		line-height: 1.7;
		margin-bottom: 1.5rem;
	}

	/* Article Links */
	.article-link {
		color: var(--link-color);
		text-decoration: underline;
		text-decoration-color: rgba(126, 184, 218, 0.3);
		text-underline-offset: 3px;
		transition: text-decoration-color 0.2s;
	}

	.article-link:hover {
		text-decoration-color: rgba(126, 184, 218, 0.8);
	}

	/* Finding Highlight */
	.finding-highlight {
		font-size: 1.125rem;
		font-weight: 500;
		color: #ffffff;
		padding: 1rem 0;
	}

	/* Finding Cards */
	.finding-card {
		background: linear-gradient(
			135deg,
			rgba(212, 165, 116, 0.08) 0%,
			rgba(212, 165, 116, 0.03) 100%
		);
		border: 1px solid rgba(212, 165, 116, 0.2);
		border-left: 3px solid var(--accent-amber);
		padding: 1.5rem 1.75rem;
		margin: 2rem 0;
	}

	.finding-card.final {
		text-align: center;
		border-left: none;
		border-top: 3px solid var(--accent-amber);
	}

	.finding-badge {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--accent-amber);
		margin-bottom: 0.75rem;
	}

	.finding-text {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--text-primary);
		margin: 0;
	}

	.finding-text.large {
		font-size: 1.5rem;
		font-family: 'Playfair Display', serif;
	}

	.finding-text strong {
		color: #ffffff;
		font-weight: 600;
	}

	.finding-source {
		margin-top: 1rem;
		padding-top: 0.75rem;
		border-top: 1px solid var(--border-subtle);
		display: flex;
		gap: 0.5rem;
		font-size: 0.75rem;
	}

	.source-label {
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.source-text {
		color: var(--text-secondary);
		font-style: italic;
	}

	/* Alert Cards */
	.alert-card {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--border-subtle);
		padding: 1.25rem 1.5rem;
		margin: 1.5rem 0;
	}

	.alert-card.warning {
		background: rgba(212, 165, 116, 0.05);
		border-color: rgba(212, 165, 116, 0.2);
	}

	.alert-icon {
		color: var(--text-muted);
		flex-shrink: 0;
		margin-top: 0.125rem;
	}

	.alert-card.warning .alert-icon {
		color: var(--accent-amber);
	}

	.alert-text {
		font-size: 0.9rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin: 0;
	}

	.alert-text strong {
		color: #ffffff;
	}

	/* Evidence Lists */
	.evidence-list {
		list-style: none;
		padding: 0;
		margin: 1rem 0;
	}

	.evidence-list li {
		display: flex;
		gap: 1rem;
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}

	.evidence-list.compact li {
		padding: 0.5rem 0;
	}

	.evidence-marker {
		width: 6px;
		height: 6px;
		background: var(--accent-amber);
		border-radius: 50%;
		flex-shrink: 0;
		margin-top: 0.5rem;
	}

	.evidence-content {
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.evidence-content strong {
		color: #ffffff;
		font-weight: 500;
	}

	/* Document Excerpts */
	.document-excerpt {
		background: rgba(255, 255, 255, 0.02);
		border: 1px dashed rgba(255, 255, 255, 0.15);
		margin: 1.5rem 0;
		font-family: 'JetBrains Mono', 'Courier New', monospace;
	}

	.document-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: rgba(255, 255, 255, 0.03);
		border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
	}

	.doc-icon {
		font-size: 0.875rem;
	}

	.doc-label {
		font-size: 0.65rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.document-content {
		padding: 1.25rem;
	}

	.doc-title {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.75rem;
	}

	.doc-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.doc-list li {
		font-size: 0.9rem;
		line-height: 1.8;
		color: var(--text-secondary);
		padding: 0.25rem 0;
	}

	.doc-key {
		color: var(--text-muted);
		margin-right: 0.5rem;
	}

	.document-content mark {
		background: rgba(212, 165, 116, 0.2);
		color: var(--accent-amber);
		padding: 0.125rem 0.25rem;
	}

	/* Timeline */
	.timeline {
		position: relative;
		margin: 2rem 0;
		padding-left: 2rem;
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 1px;
		background: linear-gradient(
			to bottom,
			transparent,
			rgba(255, 255, 255, 0.15) 10%,
			rgba(255, 255, 255, 0.15) 90%,
			transparent
		);
	}

	.timeline-item {
		position: relative;
		padding: 1rem 0 1rem 1.5rem;
	}

	.timeline-item::before {
		content: '';
		position: absolute;
		left: -2rem;
		top: 1.25rem;
		width: 7px;
		height: 7px;
		background: var(--bg-charcoal);
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-radius: 50%;
	}

	.timeline-item.highlight::before {
		border-color: var(--accent-amber);
		background: var(--accent-amber);
	}

	.timeline-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin-bottom: 0.5rem;
	}

	.timeline-content h4 {
		font-size: 1rem;
		color: #ffffff;
		margin: 0 0 0.25rem;
		font-weight: 500;
	}

	.timeline-content p {
		font-size: 0.9rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	/* Data Table */
	.data-table-wrapper {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--border-subtle);
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.table-header {
		margin-bottom: 1.25rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.06);
	}

	.table-title {
		font-family: 'Playfair Display', serif;
		font-size: 1.25rem;
		color: #ffffff;
		margin: 0;
	}

	.table-subtitle {
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.evidence-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}

	.evidence-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		font-weight: 500;
	}

	.evidence-table td {
		padding: 0.875rem 1rem;
		color: var(--text-secondary);
		border-bottom: 1px solid rgba(255, 255, 255, 0.04);
	}

	.year-cell {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: var(--text-muted);
	}

	.highlight-col {
		background: rgba(212, 165, 116, 0.05);
		color: #ffffff !important;
	}

	.highlight-row {
		background: rgba(255, 255, 255, 0.02);
	}

	.growth-badge {
		display: inline-block;
		padding: 0.25rem 0.5rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 2px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: var(--text-secondary);
	}

	.growth-badge.primary {
		background: rgba(212, 165, 116, 0.2);
		color: var(--accent-amber);
	}

	.table-source {
		margin-top: 1rem;
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Quote Blocks */
	.evidence-quote {
		position: relative;
		margin: 2rem 0;
		padding: 1.5rem 2rem 1.5rem 3rem;
		background: transparent;
		border-left: 2px solid rgba(255, 255, 255, 0.15);
	}

	.evidence-quote .quote-mark {
		position: absolute;
		left: 0.75rem;
		top: 0.5rem;
		font-family: 'Playfair Display', serif;
		font-size: 3rem;
		color: rgba(255, 255, 255, 0.1);
		line-height: 1;
	}

	.quote-text-block {
		font-family: 'Playfair Display', serif;
		font-size: 1.25rem;
		line-height: 1.6;
		color: var(--text-primary);
		font-style: italic;
		margin: 0;
	}

	.quote-attribution {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
		margin-top: 1rem;
	}

	.attribution-name {
		font-size: 0.875rem;
		color: var(--text-secondary);
		font-style: normal;
	}

	.attribution-context {
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	/* Section Transitions */
	.section-transition {
		padding: 2.5rem 0;
		display: flex;
		justify-content: center;
	}

	.transition-line {
		width: 4rem;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent,
			rgba(255, 255, 255, 0.15),
			transparent
		);
	}

	/* Conclusion/Finding Text */
	.conclusion-text {
		font-size: 1rem;
		color: var(--text-secondary);
		margin: 1.5rem 0;
	}

	.conclusion-text strong {
		color: #ffffff;
	}

	.major-finding {
		font-size: 1.125rem;
		font-weight: 500;
		color: #ffffff;
		margin: 1.5rem 0;
		padding: 1rem 0;
	}

	.major-finding strong {
		color: var(--accent-amber);
	}

	.final-statement {
		font-family: 'Playfair Display', serif;
		font-size: 1.35rem;
		font-weight: 500;
		line-height: 1.5;
		color: #ffffff;
		margin: 2rem 0 0;
		padding-top: 2rem;
		border-top: 1px solid var(--border-subtle);
	}

	/* Responsive adjustments */
	@media (max-width: 640px) {
		.section-header {
			padding: 2rem 0 1rem;
		}

		.finding-card {
			padding: 1.25rem;
		}

		.timeline {
			padding-left: 1.5rem;
		}

		.timeline-item {
			padding-left: 1rem;
		}

		.data-table-wrapper {
			padding: 1rem;
		}

		.evidence-table th,
		.evidence-table td {
			padding: 0.5rem;
		}

		.evidence-quote {
			padding: 1rem 1.5rem 1rem 2rem;
		}

		.evidence-quote .quote-mark {
			font-size: 2rem;
			left: 0.5rem;
		}
	}
</style>
