<script lang="ts">
	import { inview } from 'svelte-inview';
	import type { ObserverEventDetails } from 'svelte-inview';
	import { onMount } from 'svelte';
	import XNotificationStack from '$lib/components/XNotificationStack.svelte';

	// Header animation states
	let titleVisible = $state(false);
	let descVisible = $state(false);
	let bylineVisible = $state(false);

	// Notification animation state (triggered by scroll)
	let notificationsTriggered = $state(false);

	// Video scrolly state
	let activeVideoStep = $state(0);
	let videoRefs: (HTMLVideoElement | null)[] = $state([]);

	// Effect to handle video play/pause based on active step
	$effect(() => {
		videoRefs.forEach((video, i) => {
			if (video) {
				if (i === activeVideoStep) {
					video.play().catch(() => {});
				} else {
					video.pause();
					video.currentTime = 0;
				}
			}
		});
	});

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
	});

	// Handle video step change
	function handleVideoStepChange(stepIndex: number) {
		return ({ detail }: CustomEvent<ObserverEventDetails>) => {
			if (detail.inView) {
				activeVideoStep = stepIndex;
			}
		};
	}

	// Video scrolly steps - compelling quotes that define intent
	const videoSteps = [
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
</script>

<svelte:head>
	<title>The 18 Acres | TNH Storytelling</title>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
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
</div>

<!-- Intro Section -->
<section class="intro-section relative z-10 bg-white py-16 px-6">
	<div class="max-w-2xl mx-auto">
		<div class="prose-content text-gray-700 space-y-6">
			<p class="text-xl leading-relaxed">
				The company was called RBS Realtors. It was founded in June 2006 by two people: Riniki Bhuyan Sarma and Ranjit Bhattacharyya. A source close to the family confirmed what the name suggested: RBS stood for Riniki Bhuyan Sarma's initials.
			</p>

			<p>
				Riniki Bhuyan Sarma is the wife of Himanta Biswa Sarma, who became Chief Minister of Assam in May 2021—the same month the eviction campaigns accelerated.
			</p>

			<p>
				Between 2006 and 2009, RBS Realtors acquired <strong>18 acres of government land</strong> through transactions that, according to official land records, violated state law.
			</p>

			<p>
				Today, <a href="https://www.zaubacorp.com/" class="text-blue-600 hover:underline">15.9% of the company</a>—now renamed Vasistha Realtors—is owned by Nandil Biswa Sarma, the Chief Minister's adult son.
			</p>
		</div>
	</div>
</section>

<!-- Video Scrolly Section -->
<div class="video-scrolly-container relative z-10">
	<!-- Fixed video background -->
	<div class="video-canvas sticky top-0 w-full h-screen bg-black overflow-hidden">
		<!-- Video frame with cinematic letterboxing -->
		<div class="video-frame absolute inset-4 md:inset-8 lg:inset-12 flex items-center justify-center">
			{#each videoSteps as video, i}
				<video
					bind:this={videoRefs[i]}
					class="video-element max-w-full max-h-full object-contain transition-opacity duration-500"
					class:opacity-100={activeVideoStep === i}
					class:opacity-0={activeVideoStep !== i}
					class:pointer-events-none={activeVideoStep !== i}
					muted
					loop
					playsinline
					preload="metadata"
				>
					<source src="/videos/assam-evictions/{video.file}" type="video/mp4" />
				</video>
			{/each}
		</div>

		<!-- Cinematic vignette -->
		<div class="absolute inset-0 pointer-events-none video-vignette"></div>

	</div>

	<!-- Scrollable quote cards -->
	<div class="video-steps relative">
		{#each videoSteps as video, i}
			<div
				class="video-step min-h-screen flex items-end md:items-center justify-center p-4 pb-24 md:pb-4"
				use:inview={{ rootMargin: '-35% 0px -35% 0px' }}
				oninview_change={handleVideoStepChange(i)}
			>
				<div
					class="quote-card bg-black/80 backdrop-blur-md border border-white/10 p-6 md:p-8 max-w-xl w-full"
				>
					<span class="text-white/40 text-xs tracking-[0.2em] uppercase block mb-4">
						{video.date}
					</span>

					<blockquote class="quote-text text-white mb-3">
						{video.quote}
					</blockquote>

					{#if video.translation}
						<p class="quote-translation text-white/70 mb-4">
							{video.translation}
						</p>
					{/if}

					<p class="text-white/40 text-sm mb-5">
						{video.context}
					</p>

					<a
						href={video.link}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 text-white/30 hover:text-white/70 text-xs tracking-wide transition-colors"
					>
						<span>View original post</span>
						<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
						</svg>
					</a>
				</div>
			</div>
		{/each}

		<!-- Final spacer -->
		<div class="h-[30vh]"></div>
	</div>

	<!-- Sources footer -->
	<div class="sources-card relative bg-black py-16 px-6 border-t border-white/10">
		<div class="max-w-2xl mx-auto text-center">
			<p class="text-white/30 text-xs tracking-[0.2em] uppercase mb-6">Sources</p>
			<p class="text-white/50 text-sm mb-8">
				All videos from official posts by @himantabiswa on X.com
			</p>
			<div class="flex flex-wrap justify-center gap-x-6 gap-y-2">
				{#each videoSteps as video}
					<a
						href={video.link}
						target="_blank"
						rel="noopener noreferrer"
						class="text-white/30 hover:text-white/70 text-xs transition-colors"
					>
						{video.date}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>

<!-- Article Content Section -->
<section class="article-content relative z-10 bg-white py-16 px-6">
	<div class="max-w-2xl mx-auto">
		<div class="prose-content text-gray-700 space-y-8">

			<!-- The Bongora Land -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The Bongora Land: 6.92 Acres</h2>

				<p>
					In November 2008, the Assam government allotted ceiling surplus land to seven individuals described in records as "needy" beneficiaries. Ceiling surplus land is agricultural property seized from large landowners and redistributed to landless families.
				</p>

				<p>
					The land was in Bongora, near Guwahati—adjacent to Gopinath Bordoloi International Airport, AMTRON Tech City, and IIIT Guwahati. Prime real estate.
				</p>

				<p>
					The allotment came with a condition recorded on the <a href="https://ilrms.assam.gov.in/dhar/" class="text-blue-600 hover:underline">Dharitree land portal</a>, Assam's official land records system. In Assamese: <em>"Ullekh thake je ei mati 10 bosorole bikri koribo nuwaribo."</em>
				</p>

				<p class="text-lg font-medium text-gray-900">
					Translation: This land cannot be sold for 10 years.
				</p>

				<p>
					Within weeks, all seven beneficiaries sold their allotments to RBS Realtors.
				</p>

				<div class="bg-gray-50 p-6 my-6 border-l-4 border-gray-900">
					<p class="text-sm text-gray-600 mb-2">The <a href="https://ilrms.assam.gov.in/dhar/" class="text-blue-600 hover:underline">records show</a>:</p>
					<ul class="list-disc list-inside text-sm text-gray-700 space-y-1">
						<li>November 25, 2008: Four beneficiaries receive allotments on the same day</li>
						<li>January 28, 2009: Three of them sell to RBS Realtors on the same day</li>
						<li>The remaining four sell between January and December 2009</li>
					</ul>
				</div>

				<p class="font-medium">
					Total land acquired: 6.92 acres. Time elapsed since allotment: 2-13 months. Lock-in period: 10 years.
				</p>
			</div>

			<!-- The North Guwahati Land -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The North Guwahati Land: 10.6 Acres</h2>

				<p>
					In August 2006, the Assam government allotted two parcels of institutional land in North Guwahati:
				</p>

				<div class="bg-gray-50 p-6 my-6">
					<h3 class="font-semibold text-gray-900 mb-2">Udayon Fishery Development Farm</h3>
					<ul class="list-none text-sm text-gray-700 space-y-1">
						<li>Allotted: August 10, 2006</li>
						<li>Size: 7 bigha, 2 katha, 5 lessa</li>
						<li><a href="https://ilrms.assam.gov.in/dhar/" class="text-blue-600 hover:underline">Sold to RBS Realtors</a>: December 27, 2006—four months later</li>
					</ul>
				</div>

				<div class="bg-gray-50 p-6 my-6">
					<h3 class="font-semibold text-gray-900 mb-2">Welfare Activities School</h3>
					<ul class="list-none text-sm text-gray-700 space-y-1">
						<li>Allotted: August 23, 2006</li>
						<li>Size: 10 bigha</li>
						<li><a href="https://ilrms.assam.gov.in/dhar/" class="text-blue-600 hover:underline">Sold to RBS Realtors</a>: July 20, 2007—eleven months later</li>
					</ul>
				</div>

				<p>
					Under the Assam Land Policy of 1989, institutional land allotted for specific purposes—a fishery, a school—cannot be sold to private companies.
				</p>

				<p>
					Both parcels were sold to RBS Realtors while <a href="https://www.mca.gov.in/" class="text-blue-600 hover:underline">Riniki Bhuyan Sarma was listed as a director</a>.
				</p>

				<p class="font-medium">
					Total North Guwahati land: 10.6 acres.
				</p>

				<p class="text-xl font-semibold text-gray-900">
					Combined with Bongora: 18 acres of government land.
				</p>
			</div>

			<!-- The Shell Companies -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The Shell Companies</h2>

				<p>
					<a href="https://www.mca.gov.in/" class="text-blue-600 hover:underline">Corporate filings from the Ministry of Corporate Affairs</a> show an unusual pattern in RBS Realtors' shareholder structure.
				</p>

				<p>
					Between 2006 and 2009—the period during which the company acquired the 18 acres—17 corporate entities invested in the company. Their names: Dingo Commodeal, Elegance Trade, Oleander Manufacturers, Echolac Vinimay, Prakhar Vyapay, and 12 others.
				</p>

				<p>
					On June 9, 2009, after most of the land acquisitions were complete, <a href="https://www.zaubacorp.com/" class="text-blue-600 hover:underline">Riniki Bhuyan Sarma resigned as director</a>.
				</p>

				<p>
					Between 2009 and 2010, all 17 shell companies exited. Their shares were replaced by family members.
				</p>

				<p>
					In 2009, the company changed its name from RBS Realtors to Vasistha Realtors. The Corporate Identification Number remained the same.
				</p>

				<p>
					In 2017, Riniki's mother-in-law Meena Bhuyan received <a href="https://www.zaubacorp.com/" class="text-blue-600 hover:underline">23.61% of the company's shares</a>.
				</p>

				<p>
					On September 16, 2019—eighteen days after Nandil Biswa Sarma turned 18—Meena <a href="https://www.zaubacorp.com/" class="text-blue-600 hover:underline">transferred her entire stake to him</a>.
				</p>

				<p class="font-medium text-gray-900">
					Today, the Chief Minister's son owns 15.9% of a company holding 18 acres of government land acquired in apparent violation of state law.
				</p>
			</div>

			<!-- The Wealth Growth -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The Wealth Growth</h2>

				<p>
					<a href="https://myneta.info/" class="text-blue-600 hover:underline">Election affidavits filed with the Election Commission of India</a>—public records—show the trajectory of the Sarma family's declared assets:
				</p>

				<div class="overflow-x-auto my-8">
					<table class="w-full text-sm border-collapse">
						<thead>
							<tr class="border-b-2 border-gray-900">
								<th class="text-left py-3 px-4 font-semibold">Year</th>
								<th class="text-right py-3 px-4 font-semibold">Total Family Assets</th>
							</tr>
						</thead>
						<tbody>
							<tr class="border-b border-gray-200">
								<td class="py-3 px-4">2006</td>
								<td class="text-right py-3 px-4">Rs 1.02 crore</td>
							</tr>
							<tr class="border-b border-gray-200">
								<td class="py-3 px-4">2011</td>
								<td class="text-right py-3 px-4">Rs 3.06 crore</td>
							</tr>
							<tr class="border-b border-gray-200">
								<td class="py-3 px-4">2016</td>
								<td class="text-right py-3 px-4">Rs 6.38 crore</td>
							</tr>
							<tr class="border-b border-gray-200 bg-gray-50">
								<td class="py-3 px-4 font-medium">2021</td>
								<td class="text-right py-3 px-4 font-medium">Rs 17.27 crore</td>
							</tr>
						</tbody>
					</table>
				</div>

				<p class="font-medium">
					Between 2016 and 2021, family assets increased by 170%.
				</p>

				<p>
					The <a href="https://myneta.info/" class="text-blue-600 hover:underline">2021 affidavit</a> shows Riniki Bhuyan Sarma's declared income from 2015-2020 ranged from Rs 1.25 crore to Rs 3.64 crore annually. Her husband—then Health Minister, now Chief Minister—declared income between Rs 7.29 lakh and Rs 25.94 lakh during the same period.
				</p>

				<p class="text-lg font-medium text-gray-900">
					Riniki's income was 12 to 50 times higher than her husband's.
				</p>

				<p>
					The affidavit also lists a <a href="https://myneta.info/" class="text-blue-600 hover:underline">Rs 5.16 lakh liability owed to "JCB Industries."</a>
				</p>

				<p>
					JCB is the manufacturer of the excavators and bulldozers used in eviction operations across Assam. <a href="https://www.amnesty.org/en/wp-content/uploads/2024/02/ASA2076142024ENGLISH.pdf" class="text-blue-600 hover:underline">Amnesty International documented JCB equipment</a> in verified videos of demolitions, including five from Assam.
				</p>
			</div>

			<!-- The Allegations -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The Allegations</h2>

				<p>
					On February 24, 2025, as Prime Minister Narendra Modi arrived in Assam to inaugurate the Advantage Assam 2.0 business summit, Congress leaders held a press conference and made public allegations about the Chief Minister's business holdings.
				</p>

				<p>
					Jitendra Singh, Congress General Secretary in charge of Assam, <a href="https://www.thehindu.com/" class="text-blue-600 hover:underline">alleged that Sarma, his family members and associates had become "business tycoons"</a> and "built an entire empire in Assam." He listed specific holdings: tea gardens including Kanchanjuri and Radhha Krishna estates, news portals, a McDonald's franchise, international schools, and land purchases.
				</p>

				<p>
					Singh made a specific allegation: "A lot of land has been purchased in tribal areas, including Majuli, Kamrup, Guwahati, Nagaon, Golaghat, where land cannot be bought."
				</p>

				<p>
					Under Assam law, land in tribal belts and blocks cannot be purchased by non-tribals. If the allegation is accurate, such purchases would constitute violations of the Assam Land and Revenue Regulation, 1886.
				</p>

				<p>
					Lok Sabha MP Gaurav Gogoi stated: "In Assam the CM's family has eaten up lands in every district."
				</p>

				<p>
					Lok Sabha MP Rakibul Hussain made a separate allegation: that Sarma had links to the militant outfit United Liberation Front of Asom (ULFA), "recorded in a government affidavit" from 1999.
				</p>

				<div class="bg-amber-50 p-6 my-6 border-l-4 border-amber-500">
					<p class="text-sm text-gray-700">
						<strong>Note:</strong> These are opposition allegations. They have not been independently verified. But they point to additional records that would confirm or refute the claims.
					</p>
				</div>

				<p>
					The Advantage Assam 2.0 summit where these allegations were made is the same event after which evictions accelerated. In the months following the February 2025 summit, land was cleared for corporate projects including the <a href="https://scroll.in/latest/1084333/" class="text-blue-600 hover:underline">Rs 48,000 crore Adani thermal plant in Dhubri</a>.
				</p>
			</div>

			<!-- The State Agency -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The State Agency</h2>

				<p>
					On October 31, 2022, the Government of Assam incorporated a new company: <a href="https://www.indiafilings.com/search/assam-urban-infrastructure-development-finance-corporation-limited-cin-U45400AS2022SGC023784" class="text-blue-600 hover:underline">Assam Urban Infrastructure Development & Finance Corporation Limited (AUIDFCL)</a>.
				</p>

				<p>
					Its purpose: serving as the nodal agency for urban infrastructure development in the state.
				</p>

				<p class="text-lg font-medium text-gray-900">
					Its Board Chairperson: <a href="https://auidfcl.assam.gov.in/" class="text-blue-600 hover:underline">Himanta Biswa Sarma</a>.
				</p>

				<p>
					The Chief Minister who oversees eviction policy sits on the board of the agency that manages urban development on cleared land.
				</p>

				<p>
					A <a href="https://cag.gov.in/webroot/uploads/download_audit_report/2024/SFAR-2022-23_Report-No.-1-of-2024_English-066d98d2be4eb40.74033099.pdf" class="text-blue-600 hover:underline">2023 audit by the Comptroller and Auditor General of India</a> found that the Assam state government had 45.28% of disbursements unreconciled and 14,159 pending utilization certificates involving Rs 37,991.70 crore.
				</p>
			</div>

			<!-- The Connection -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">The Connection</h2>

				<p>
					This investigation cannot prove that the Chief Minister's family has directly benefited from the eviction campaigns. The land held by Vasistha Realtors was acquired between 2006 and 2009, before the current eviction wave.
				</p>

				<p class="font-medium text-gray-900">
					But the pattern is documented:
				</p>

				<p>
					A state government clears land from communities, predominantly Bengali-speaking Muslims, citing forest protection, wildlife conservation, and agricultural projects.
				</p>

				<p>
					The same state government allocates land to corporations—<a href="https://www.adanigreenenergy.com/newsroom/media-releases/adani-to-invest-rs-63000-cr" class="text-blue-600 hover:underline">Rs 48,000 crore to Adani in Dhubri</a>, where <a href="https://scroll.in/latest/1084333/" class="text-blue-600 hover:underline">1,400 families were evicted</a>.
				</p>

				<p>
					The same Chief Minister who directs eviction policy leads a family that acquired 18 acres of government land through transactions that violated state law, held now by shell company structures in his son's name.
				</p>

				<p>
					The Chief Minister who describes evictions as action against <a href="https://www.amnesty.org/en/wp-content/uploads/2024/02/ASA2076132024ENGLISH.pdf" class="text-blue-600 hover:underline">"demographic invasion" and "land jihad"</a> chairs the board of the state agency managing urban infrastructure development.
				</p>
			</div>

			<!-- What the Records Show -->
			<div class="border-t-4 border-gray-900 pt-8">
				<h2 class="content-heading text-gray-900 mb-6">What the Records Show</h2>

				<p>
					The <a href="https://ilrms.assam.gov.in/dhar/" class="text-blue-600 hover:underline">Dharitree land portal</a> shows the lock-in stipulations. The <a href="https://www.mca.gov.in/" class="text-blue-600 hover:underline">MCA filings</a> show the corporate ownership transfers. The <a href="https://myneta.info/" class="text-blue-600 hover:underline">election affidavits</a> show the wealth growth.
				</p>

				<p class="font-medium text-gray-900">
					These are public records.
				</p>

				<p>
					What they document is a system in which government land meant for the needy reached the family of the man now running the state, while thousands of families—accused of being encroachers on government land—have had their homes demolished.
				</p>

				<p class="text-xl font-medium text-gray-900 mt-8">
					The land beneath their homes is gone. The records remain.
				</p>
			</div>

			<!-- Sources -->
			<div class="border-t-4 border-gray-900 pt-8 mt-12">
				<h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Sources</h3>
				<p class="text-sm text-gray-500 leading-relaxed">
					<a href="https://ilrms.assam.gov.in/dhar/" class="hover:underline">Dharitree Land Records Portal</a>,
					<a href="https://www.mca.gov.in/" class="hover:underline">Ministry of Corporate Affairs</a>,
					<a href="https://myneta.info/" class="hover:underline">Election Commission of India affidavits via MyNeta</a>,
					<a href="https://www.amnesty.org/en/wp-content/uploads/2024/02/ASA2076142024ENGLISH.pdf" class="hover:underline">Amnesty International "Unearthing Accountability" report</a> (February 2024),
					<a href="https://m.thewire.in/article/communalism/himanta-biswa-sarma-rahul-gandhi-assam-corruption-pakistan-bangladeshi" class="hover:underline">The Wire investigative reporting</a> (December 2021),
					<a href="https://cag.gov.in/webroot/uploads/download_audit_report/2024/SFAR-2022-23_Report-No.-1-of-2024_English-066d98d2be4eb40.74033099.pdf" class="hover:underline">CAG State Finances Audit Report 2022-23</a>,
					<a href="https://www.zaubacorp.com/" class="hover:underline">ZaubaCorp company records</a>,
					<a href="https://auidfcl.assam.gov.in/" class="hover:underline">AUIDFCL official portal</a>,
					<a href="https://www.thehindu.com/" class="hover:underline">The Hindu - Congress allegations at Advantage Assam 2.0</a> (February 2025).
				</p>
			</div>

		</div>
	</div>
</section>

<!-- Footer -->
<footer class="footer-section relative z-10 bg-gray-900 text-white py-12 px-6">
	<div class="max-w-4xl mx-auto">
		<div class="grid md:grid-cols-3 gap-8 mb-8">
			<div>
				<h3 class="footer-label mb-3">Credits</h3>
				<p class="text-gray-400 text-sm leading-relaxed">
					Reporting by Ahmer Khan<br />
					Development by Tom Vaillant<br />
					The New Humanitarian
				</p>
			</div>

			<div>
				<h3 class="footer-label mb-3">Sources</h3>
				<p class="text-gray-400 text-sm leading-relaxed">
					Dharitree Land Portal, MCA,<br />
					MyNeta, Amnesty International,<br />
					CAG Audit Reports
				</p>
			</div>

			<div>
				<h3 class="footer-label mb-3">Share</h3>
				<div class="flex gap-4">
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Twitter</button>
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">Facebook</button>
					<button type="button" class="text-gray-400 hover:text-white transition-colors text-sm cursor-pointer">LinkedIn</button>
				</div>
			</div>
		</div>

		<div class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
			<p class="text-gray-500 text-sm">
				The New Humanitarian
			</p>
			<p class="text-gray-600 text-xs">
				Published January 2026. All rights reserved.
			</p>
		</div>
	</div>
</footer>

<style>
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

	.footer-label {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #9ca3af;
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

	/* Video scrolly styles */
	.video-scrolly-container {
		background: #000;
	}

	.video-canvas {
		z-index: 1;
	}

	.video-steps {
		z-index: 10;
		margin-top: -100vh;
	}

	.video-vignette {
		background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%);
	}

	.video-intro-title {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2rem, 6vw, 3.5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.quote-card {
		box-shadow:
			0 0 0 1px rgba(255,255,255,0.05),
			0 25px 50px -12px rgba(0,0,0,0.5);
	}

	.quote-text {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 500;
		line-height: 1.5;
		letter-spacing: -0.01em;
	}

	.quote-translation {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(0.95rem, 2vw, 1.1rem);
		font-style: italic;
		line-height: 1.5;
	}

	/* Video element positioning for different aspect ratios */
	.video-element {
		position: absolute;
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	/* Mobile-specific adjustments */
	@media (max-width: 768px) {
		.video-step {
			align-items: flex-end;
			padding-bottom: 6rem;
		}

		.quote-card {
			margin-bottom: env(safe-area-inset-bottom, 0);
		}

		.video-frame {
			inset: 1rem;
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
</style>
