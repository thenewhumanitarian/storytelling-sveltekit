<script lang="ts">
	/**
	 * Cleared - Investigation into Assam's mass eviction campaign
	 *
	 * This article uses a unified ScrollySection pattern for all scrolly
	 * sections to ensure consistent behavior, light background throughout,
	 * and no horizontal overflow issues.
	 */
	import ScrollySection from '$lib/components/scrolly/ScrollySection.svelte';
	import VideoHeroVisualization from '$lib/components/cleared/VideoHeroVisualization.svelte';
	import StadiumWipeVisualization from '$lib/components/cleared/StadiumWipeVisualization.svelte';
	import EvictionScrolly from '$lib/components/evictions/EvictionScrolly.svelte';
	import MapScrolly from '$lib/components/cleared/MapScrolly.svelte';
	import NoticeMosaic from '$lib/components/scrolly/NoticeMosaic.svelte';
	import DemolitionGallery from '$lib/components/cleared/DemolitionGallery.svelte';
	import EditorialGallery from '$lib/components/cleared/EditorialGallery.svelte';
	import HeadlineStack from '$lib/components/scrolly/HeadlineStack.svelte';
	import SatelliteComparison from '$lib/components/cleared/SatelliteComparison.svelte';
	import XNotificationStack from '$lib/components/XNotificationStack.svelte';
	import ExpandableInfobox from '$lib/components/cleared/ExpandableInfobox.svelte';
	import { inview } from 'svelte-inview';

	// Infobox data
	import infoboxData from '$lib/data/infoboxes-cleared.json';

	// === SECTION STEP DATA ===

	// Hero section steps (3 steps: title, Dhalpur, photographer)
	const heroSteps = [
		{
			raw: true,
			text: `<div class="hero-header">
				<h1 class="hero-title">Cleared</h1>
				<div class="hero-accent-rule"></div>
				<p class="hero-desc">How Assam demolished the homes of 20,000 families</p>
				<div class="hero-byline">
					<p class="byline-label">By</p>
					<p class="byline-authors">Ahmer Khan and Tom Vaillant</p>
					<p class="byline-date">17 March 2026</p>
				</div>
				<div class="scroll-indicator">
					<div class="scroll-indicator-track">
						<div class="scroll-indicator-dot"></div>
					</div>
				</div>
			</div>`
		},
		{
			title: 'September 23, 2021',
			text: 'In the early morning, police opened fire on a crowd in Dhalpur village, in Assam\u2019s Darrang district. Two people died: Moinul Haque, 28, and Sheikh Farid, 12 years old.',
			source: {
				text: 'Al Jazeera',
				url: 'https://www.aljazeera.com/news/2021/9/29/assam'
			}
		},
		{
			text: 'As Haque lay dying, a government photographer was filmed stomping on his body. Again. And again. The video went viral and became the image of a campaign that will reshape hundreds of thousands of lives.'
		}
	];

	// Stadium image scrolly steps (3 steps: campaign, testimony, wipe + 165k stat)
	const stadiumSteps = [
		{
			title: 'A Campaign of Displacement',
			text: 'This was not an isolated incident. Between May 2021 and 2026, the government in Assam, in far northeastern India, conducted at least 33 documented eviction operations. More than 22,000 homes have been demolished.'
		},
		{
			text: 'Maiful Naysa, 65, says her family received an eviction notice in November and were given a month to respond. Before dawn, just a day after the deadline, bulldozers arrived. <blockquote>"At five in the morning, while we were sleeping, three JCBs came and started demolishing our house."</blockquote>'
		},
		{
			text: 'That\u2019s the equivalent of more than 100,000 people \u2013 more than enough to fill Wembley Stadium.'
		}
	];

	// Eviction data visualization steps (12 steps)
	const evictionSteps = [
		{
			text: 'Each bubble represents one operation \u2014 the larger the bubble, the more people displaced.'
		},
		{
			text: 'The government cited various legal grounds for these evictions. We\'ve grouped them into <strong>four categories</strong>.'
		},
		{
			text: 'The largest category: <span class="highlight-env">Environmental Protection</span> \u2014 forest clearances, wildlife sanctuaries, elephant corridors. Twelve operations are conducted. These operations affected more than 60,000 people. In July 2025, in Goalpara district, over 1,080 families were evicted from Haseela Beel and Paikan Reserve Forest. One killed, 15 injured.'
		},
		{
			text: '<span class="highlight-dev">Development Projects</span> cleared land for corporate investment, including the <a href="https://cjp.org.in/bulldozing-the-poor-assams-eviction-drives-for-adani-project-leave-thousands-homeless/" target="_blank" rel="noopener">$4.75 billion</a> allegedly allocated to Adani thermal power plant in Dhubri.'
		},
		{
			text: '<span class="highlight-admin">Administrative Enforcement</span> targeted alleged "encroachers" on government land, including controversial border pushbacks to Bangladesh.'
		},
		{
			text: '<span class="highlight-satra">Religious Land (Satra)</span> evictions cleared land claimed by Hindu monasteries in Barpeta and Nagaon districts.'
		},
		{
			text: 'What is unfolding now in Assam is not a series of sporadic clearances but an increasingly institutionalised campaign of dispossession. Since 2021, both the frequency and the scale of eviction operations have expanded markedly, indicating a sustained policy shift rather than episodic enforcement. Here\u2019s when each operation occurred.'
		},
		{
			text: '<strong>2021:</strong> The campaign began with 4 major operations. The deadliest: <a href="https://indianexpress.com/article/north-east-india/assam/assam-eviction-violence-two-deaths-clashes-7532641/" target="_blank" rel="noopener">Dhalpur</a>, where police shot two people dead.'
		},
		{
			text: '<strong>2025:</strong> The busiest year \u2014 11 documented eviction operations across Assam.'
		},
		{
			text: 'But it\'s not just the frequency. The <strong>scale</strong> of each operation has grown dramatically.'
		},
		{
			text: '<strong>2021:</strong> Around 14,000 people evicted across all operations.'
		},
		{
			text: '<strong>2025:</strong> More than 40,000 people evicted \u2014 nearly <strong>three times</strong> the 2021 total.'
		}
	];

	// Background scrolly steps (7 steps: Assam history and geography)
	const backgroundSteps = [
		{
			title: 'A Label with Consequences',
			text: 'Behind these numbers is a state with a long, contested history of deciding who belongs.'
		},
		{
			text: 'Assam sits at a volatile crossroads, bordered by Bangladesh to the west, Bhutan to the north, and surrounded by six other Indian states. It is one of India\u2019s most ethnically diverse regions, home to dozens of Indigenous communities, tribal groups, and migrant populations.'
		},
		{
			text: 'For decades, the question of who truly belongs here has defined its politics. Indigenous Assamese communities (both Hindu and Muslim) have long feared being culturally and demographically overwhelmed, particularly by Bengali-speaking Muslims. That anxiety has been systematically exploited. Under the BJP, which came to power in Assam in 2016, it became policy.'
		},
		{
			title: 'The Brahmaputra',
			text: 'Assam lies along the Brahmaputra, one of the world\'s largest rivers. Every monsoon season, it floods, swallowing villages and forcing families to rebuild from scratch. Displacement here is not new. It is a way of life.'
		},
		{
			title: 'The Miya',
			text: 'Many of those now facing eviction are Miya Muslims, Bengali-speaking Muslims whose ancestors migrated from the Bengal region \u2013 parts of which now lie in Bangladesh \u2013 to Assam during the colonial period and settled on low-lying river islands called chars. These were marginal, flood-prone strips of land that nobody else wanted. Their forefathers had little choice.'
		},
		{
			text: 'Many settled there 50 to 60 years ago after losing their original homes and farmland to the Brahmaputra\u2019s relentless erosion. Over generations, they cleared the land, farmed it, and built communities on it.'
		},
		{
			text: 'The word \u201cMiya\u201d was once a term of respect. Today, it is used as a slur to mark Bengali-speaking Muslims as outsiders, regardless of how long they have lived in Assam or whether they hold legal citizenship documents.'
		}
	];

	// Map narrative steps (7 steps: intro, investigation, 4 villages, conclusion)
	const mapSteps = [
		{
			text: 'Since 2021, the Assam government has conducted <span class="highlight-dev">33 documented eviction operations</span> across the state.'
		},
		{
			text: 'We traveled to <span class="highlight-env">20 demolished villages</span> to document what remains after the bulldozers left.'
		},
		{
			title: 'Charuabakhra, Dhubri',
			text: '1,000 homes demolished. 5,000 people displaced.',
			image: '/images/cleared/villages/charuabakhra.jpg'
		},
		{
			title: 'Doloni Pathar, Golaghat',
			text: '700 homes demolished. 8,900 people displaced—the largest single eviction we documented.',
			image: '/images/cleared/villages/doloni-pathar.jpg'
		},
		{
			title: 'Kandapara Bosti, Nagaon',
			text: '700 homes razed. 2,550 people lost everything.',
			image: '/images/cleared/villages/kandapara.jpg'
		},
		{
			title: 'Ashudubi, Goalpara',
			text: '900 homes demolished. 1,500 people displaced.',
			image: '/images/cleared/villages/ashudubi.jpg'
		},
		{
			text: 'Each dot represents families who lost their homes, their livelihoods, their communities.'
		}
	];

	// Displacement video scrolly steps (4 steps: title, Barik intro, two blockquotes)
	const displacementSteps = [
		{
			title: '"Bulldozer justice"',
			text: 'In the early hours of 12 July 2025, the Asudubi Revenue Village \u2013 a community that had stood for over seven decades was met with the mechanical roar of bulldozers.'
		},
		{
			text: 'Among the 1,080 families displaced was Abdul Barik, a man who insists that his presence there was not an act of \u201cencroachment,\u201d but a matter of documented rights.'
		},
		{
			text: '<blockquote>\u201cOur village is 70-75 years old. It was not a forest land; it was Pattaland. We showed our documents to the district officer, but they were rejected. It was written in the papers that this land is \u2018not indigenous\u2019 and reserved for public development. Nearly 60 bulldozers came early morning around 6am and bulldozed our village, including our houses.\u201d</blockquote>'
		},
		{
			text: '<blockquote>\u201cIt was written in the papers that this land is \u2018not indigenous\u2019 and reserved for public development.\u201d</blockquote>'
		}
	];

	const displacementOverlays = [
		{ top: 0.3, center: 0.4, bottom: 0.5, warm: 0.2 },
		{ top: 0.3, center: 0.4, bottom: 0.5, warm: 0.2 },
		{ top: 0.3, center: 0.45, bottom: 0.5, warm: 0.15 },
		{ top: 0.3, center: 0.45, bottom: 0.5, warm: 0.15 },
	];

	// Notice mosaic steps (4 steps for 4 notices)
	const noticeSteps = Array(4).fill({ text: '' });

	// Notice data for the eviction documents mosaic
	const notices = [
		{
			image: '/images/cleared/notices/notice_1.jpg',
			alt: 'Eviction notice document in Assamese',
			title: 'Gorakhor Unarni',
			subtitle: 'Olamghuri Village, Nagaon District',
			excerpt: '"15 days to vacate. No compensation will be entertained."'
		},
		{
			image: '/images/cleared/notices/notice_2.jpg',
			alt: 'Eviction notice document in Assamese',
			title: 'Anara Opni',
			subtitle: 'Alamgudi Village, Nagaon District',
			excerpt: '"Forced eviction within 30 days. All structures removed."'
		},
		{
			image: '/images/cleared/notices/notice_3.jpg',
			alt: 'Eviction notice document in Assamese',
			title: 'Minara Takim',
			subtitle: 'Olaguri Village, Nagaon District',
			excerpt: '"Recipient will bear all costs of eviction proceedings."'
		},
		{
			image: '/images/cleared/notices/notice_4.jpg',
			alt: 'Eviction notice document in Assamese',
			title: 'Fairas Haresho',
			subtitle: 'Olamghuri Village, Nagaon District',
			excerpt: '"Illegal occupation. Trees cut. Houses built. Land cleared."'
		}
	];

	// Headlines data for media coverage section
	const headlines = [
		{
			id: '1',
			source: 'VICE NEWS',
			date: 'September 24, 2021',
			title: 'Shocking Video Shows Police Firing and Killing Protestors in India',
			author: 'Shamani Joshi',
			url: 'https://www.vice.com/en/article/shocking-video-shows-police-firing-and-killing-protestors-in-india/'
		},
		{
			id: '2',
			source: 'THE INDIAN EXPRESS',
			date: 'September 25, 2024',
			title: 'At village that saw deadly eviction drive in Assam, bulldozers are back',
			description: 'Over the next three days, 151 families were evicted and 237 structures demolished.',
			author: 'Sukrita Baruah',
			url: 'https://indianexpress.com/article/india/at-village-that-saw-deadly-eviction-drive-in-assam-bulldozers-are-back-9586329/'
		},
		{
			id: '3',
			source: 'THE INDIAN EXPRESS',
			date: 'July 8, 2025',
			title: 'Mega eviction drive across 3 Assam villages sees stone pelting and lathi charge; 1,400 families displaced',
			description: '3,500 bighas of government khas land in Dhubri district primarily occupied by Bengali-speaking Muslims.',
			author: 'Sukrita Baruah',
			url: 'https://indianexpress.com/article/india/mega-eviction-drive-3-assam-villages-stone-pelting-lathi-charge-1400-families-10114482/'
		},
		{
			id: '4',
			source: 'THE WIRE',
			date: 'August 23, 2025',
			title: "Supreme Court Halts Eviction Drive in Assam's Golaghat District",
			description: 'The petition challenged concurrent orders of the high court refusing relief to petitioners.',
			author: 'The Wire Staff',
			url: 'https://thewire.in/law/supreme-court-halts-eviction-drive-in-assams-golaghat-district'
		}
	];

	// === ACTIVE STEP STATE ===
	let heroStep = $state(0);
	let heroScrollProgress = $state(0);
	let stadiumStep = $state(0);
	let stadiumScrollProgress = $state(0);

	// Fade from cream on stadium scrolly entry (half viewport gradient)
	let stadiumFadeInProgress = $derived(() => {
		const fadeEnd = 0.15;
		if (stadiumScrollProgress >= fadeEnd) return 0;
		return 1 - (stadiumScrollProgress / fadeEnd);
	});

	// Fade to cream on last hero step (step 2)
	let heroFadeProgress = $derived(() => {
		if (heroStep !== 2) return 0;
		const fadeStart = 0.85;
		const fadeEnd = 1.0;
		if (heroScrollProgress < fadeStart) return 0;
		return Math.min(1, (heroScrollProgress - fadeStart) / (fadeEnd - fadeStart));
	});

	let displacementStep = $state(0);
	let displacementScrollProgress = $state(0);

	// Fade from cream on first displacement step (matches fade-out: half viewport, linear gradient)
	let displacementFadeInProgress = $derived(() => {
		const fadeEnd = 0.15;
		if (displacementScrollProgress >= fadeEnd) return 0;
		return 1 - (displacementScrollProgress / fadeEnd);
	});

	// Fade to cream on last displacement step
	let displacementFadeProgress = $derived(() => {
		if (displacementStep !== 3) return 0;
		const fadeStart = 0.85;
		const fadeEnd = 1.0;
		if (displacementScrollProgress < fadeStart) return 0;
		return Math.min(1, (displacementScrollProgress - fadeStart) / (fadeEnd - fadeStart));
	});

	let mapScrollProgress = $state(0);
	let notificationsTriggered = $state(false);
	let backgroundStep = $state(0);
	let backgroundScrollProgress = $state(0);

	// Fade effects for background scrolly
	let backgroundFadeInProgress = $derived(() => {
		const fadeEnd = 0.20;
		if (backgroundScrollProgress >= fadeEnd) return 0;
		return 1 - (backgroundScrollProgress / fadeEnd);
	});

	let backgroundFadeProgress = $derived(() => {
		if (backgroundStep !== 4) return 0;
		const fadeStart = 0.85;
		if (backgroundScrollProgress < fadeStart) return 0;
		return Math.min(1, (backgroundScrollProgress - fadeStart) / (1 - fadeStart));
	});

	// Map fade-in: starts black (1) and fades to visible (0) as we scroll into the section
	let mapFadeProgress = $derived(() => {
		// Fade from black to visible over the first 25% of scroll
		const fadeEnd = 0.25;
		if (mapScrollProgress >= fadeEnd) return 0;
		return 1 - (mapScrollProgress / fadeEnd);
	});

	// Map fade-out: fades to black over the last 25% of scroll
	let mapFadeOutProgress = $derived(() => {
		const fadeStart = 0.75;
		if (mapScrollProgress < fadeStart) return 0;
		return (mapScrollProgress - fadeStart) / (1 - fadeStart);
	});
</script>

<svelte:head>
	<title>Cleared | TNH Storytelling</title>
	<!-- Preload stadium images (used in stadium scrolly) -->
	<link rel="preload" as="image" href="/images/assam-evictions/image2.jpg" />
	<link rel="preload" as="image" href="/images/assam-evictions/stadium-full.jpg" />
	<link rel="preload" as="image" href="/images/assam-evictions/stadium-empty.jpg" />
	<!-- Preload hint for hero video -->
	<link rel="preload" as="video" href="/videos/assam-evictions/1952348361748594720_00001.mp4" />
</svelte:head>

<div class="article-container">
	<!-- Hero Section: cream title → looping bulldozer video → cream -->
	<div class="hero-scrolly">
		<ScrollySection
			bind:activeStep={heroStep}
			steps={heroSteps}
			backgroundColor="#f5f0eb"
			showTextBoxes={true}
			textBoxVariant="editorial"
			onScrollProgress={(p) => (heroScrollProgress = p)}
		>
			{#snippet children({ activeStep })}
				<VideoHeroVisualization
					currentStep={heroStep}
					fadeProgress={heroFadeProgress()}
					scrollProgress={heroScrollProgress}
					videoSrc="/videos/assam-evictions/1952348361748594720_00001.mp4"
				/>
			{/snippet}
		</ScrollySection>
	</div>

	<!-- Editorial prose block -->
	<section class="content-section content-section--spacious">
		<div class="content-container">
			<div class="prose-content">
				<p>
					One eviction every three minutes, 24 hours a day, for an entire year. The vast majority of those evicted are Bengali-speaking Muslims &ndash; a campaign driven by Assam&rsquo;s Chief Minister Himanta Biswa Sarma, who is seen as a poster child for implementing the agenda of Indian Prime Minister Narendra Modi&rsquo;s Hindu majoritarian Bharatiya Janata Party (BJP).
				</p>
			</div>
		</div>
	</section>

	<!-- Stadium image scrolly: campaign stats → full Wembley → wipe to empty -->
	<div class="stadium-scrolly">
		<ScrollySection
			bind:activeStep={stadiumStep}
			steps={stadiumSteps}
			backgroundColor="#f5f0eb"
			showTextBoxes={true}
			textBoxVariant="editorial"
			firstStepOffset={0.35}
			onScrollProgress={(p) => (stadiumScrollProgress = p)}
		>
			{#snippet children({ activeStep })}
				<StadiumWipeVisualization
					activeStep={stadiumStep}
					scrollProgress={stadiumScrollProgress}
					fadeInProgress={stadiumFadeInProgress()}
				/>
			{/snippet}
		</ScrollySection>
	</div>

	<!-- Eviction Data Visualization -->
	<ScrollySection
		steps={evictionSteps}
		backgroundColor="#f5f0eb"
		textBoxVariant="editorial"
	>
		{#snippet children({ activeStep })}
			<EvictionScrolly {activeStep} />
		{/snippet}
	</ScrollySection>

	<!-- Background Scrolly (Assam geography, 5 map steps) -->
	<ScrollySection
		bind:activeStep={backgroundStep}
		steps={backgroundSteps}
		backgroundColor="#f5f0eb"
		showTextBoxes={true}
		textBoxVariant="editorial"
		firstStepOffset={0.35}
		onScrollProgress={(p) => (backgroundScrollProgress = p)}
	>
		{#snippet children({ activeStep })}
			<MapScrolly
				{activeStep}
				fadeProgress={backgroundFadeInProgress()}
				fadeOutProgress={backgroundFadeProgress()}
				narrativePath="/data/cleared/background-narrative.json"
				showDataLayers={false}
			/>
		{/snippet}
	</ScrollySection>

	<!-- The Eviction Machine -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Eviction Machine</h2>
			<div class="prose-content">
				<p>
					But since 2016, these communities have faced a different kind of uprooting: government-led eviction drives targeting what officials call "illegal encroachments". It is a label with consequences. In Myanmar, the same logic was applied to Rohingya Muslims for decades, branding an entire community as illegal immigrants on land they had lived on for generations.
				</p>

				<p>
					The Assam government frames these evictions as action against "illegal immigrants" from Bangladesh. But the story is more complicated. Many of those being displaced are Bengali-speaking Muslims whose families arrived after 1947, when <ExpandableInfobox data={infoboxData.partition} suffix="." />
				</p>

				<p>
					Some came with official permission from the government of what is now India. Others were given land by the Indian state itself, often unproductive char lands that the government was eager to have cultivated. By the time the evictions began, many had been living in Assam for 50 to 70 years.
				</p>
			</div>
		</div>
	</section>

	<!-- Eviction Notices Mosaic -->
	<ScrollySection
		steps={noticeSteps}
		backgroundColor="#f5f0eb"
		showTextBoxes={false}
		textBoxVariant="editorial"
	>
		{#snippet children({ activeStep })}
			<NoticeMosaic {activeStep} {notices} backgroundColor="#f5f0eb" />
		{/snippet}
	</ScrollySection>

	<!-- After Partition -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">After Partition</h2>
			<div class="prose-content">
				<p>
					More than one third of Assam&rsquo;s 31 million people are Muslim &ndash; one of the highest proportions of any Indian state. That demographic reality has made Assam a focal point of a broader national shift. In recent years, Modi&rsquo;s BJP-led government has faced repeated accusations of enacting laws and policies that specifically target India&rsquo;s <a href="https://www.aljazeera.com/news/2024/3/11/india-implements-anti-muslim-2019-citizenship-law-weeks-before-election" target="_blank" rel="noopener">200 million Muslims</a>, from the Citizenship Amendment Act, which critics say deliberately excludes Muslims from a fast-tracked citizenship pathway, to the <a href="https://www.aljazeera.com/news/2019/8/31/india-publishes-final-nrc-all-you-need-to-know-on-citizens-list" target="_blank" rel="noopener">National Register of Citizens</a>, which left millions stateless. In Assam, these national policies have found their sharpest expression.
				</p>

				<div class="gallery-breakout">
					<EditorialGallery images={[
						{ src: '/images/cleared/villages/sontoshpur.jpg', alt: 'Sontoshpur village, Assam', caption: 'Sontoshpur, Darrang district' },
						{ src: '/images/cleared/villages/luptachar.jpg', alt: 'Dubapara Luptachar, Assam', caption: 'Dubapara Luptachar, Dhubri district' },
						{ src: '/images/cleared/villages/ashudubi.jpg', alt: 'Ashudubi village, Assam', caption: 'Ashudubi, Goalpara district' }
					]} />
				</div>
			</div>
		</div>
	</section>

	<!-- Prose bridge -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					What makes these evictions particularly troubling is that many families held Patta &ndash; official land titles issued by the Assam government &ndash; along with ration cards and voter IDs, documents that under Indian law establish legal residence and citizenship.
				</p>

				<p>
					Some Pattas dated back decades, proof that the state itself had recognised their right to the land. Yet documented cases show Patta-holders being evicted without warning, without due process, their legal papers rendered meaningless overnight.
				</p>
			</div>
		</div>
	</section>

	<!-- The Register -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Register</h2>
			<div class="prose-content">
				<p>
					The National Register of Citizens (NRC) &ndash; initiated after the right-wing BJP came to power in 2016 and concluded in 2019 &ndash; was designed to identify who qualified as an Indian citizen in Assam. To be included, residents had to prove that they or their families arrived in Assam before 24 March 1971 &ndash; the eve of Bangladesh&rsquo;s independence from Pakistan. The final list excluded <a href="https://www.aljazeera.com/news/2019/8/31/india-excludes-nearly-2-million-people-from-assam-citizen-list" target="_blank" rel="noopener">more than a million people</a> (roughly 6% of Assam&rsquo;s population) who failed to meet this requirement. Many were poor. Most were Muslim. For many observers, the NRC was not an administrative exercise. It was the latest manifestation of a broader, systematic effort by the BJP government to target and disenfranchise India&rsquo;s Muslims, using the machinery of the state to question the citizenship of communities that have lived on Indian soil for generations.
				</p>

				<div class="gallery-breakout">
					<EditorialGallery images={[
						{ src: '/images/cleared/villages/kandapara.jpg', alt: 'Kandapara Bosti, Nagaon', caption: 'Kandapara Bosti, Nagaon district' },
						{ src: '/images/cleared/villages/doloni-pathar.jpg', alt: 'Doloni Pathar, Golaghat', caption: 'Doloni Pathar, Golaghat district' },
						{ src: '/images/cleared/villages/charuabakhra.jpg', alt: 'Charuabakhra, Dhubri', caption: 'Charuabakhra, Dhubri district' }
					]} />
				</div>

				<p>
					The process was not free from error or bias. Legitimate citizens were excluded on the basis of technical errors, spelling mistakes, and documentation challenges. Several detention centres were established, including India&rsquo;s largest dedicated <a href="https://www.outlookindia.com/national/68-foreigners-moved-to-country-s-largest-detention-centre-in-assam-s-goalpara-news-257735" target="_blank" rel="noopener">detention centre</a> opened in Goalpara and designed to house up to 3,500 people. In some cases, children were separated from their parents. For many of the evicted, there is literally nowhere legal to go.
				</p>
			</div>
		</div>
	</section>

	<div class="section-divider"></div>

	<!-- Zain-ul-Abadin Testimony -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					For Zain-ul-Abadin, a 43-year-old resident of Uriamghat in Assam's Golaghat district, the eviction represents more than the loss of a home. He says his family was among those encouraged by the Assam government to settle in the late 1970s in a border belt along Nagaland, then considered a disputed zone. The Assam-Nagaland border has been contested since <ExpandableInfobox data={infoboxData.nagaland} />, with both states claiming ownership of a stretch of reserved forests known as the Disputed Area Belt. The long-running land dispute has triggered repeated bouts of violent clashes over the decades. Two major confrontations in 1979 and 1985 left more than 100 people dead. In the 1970s, the Assam government settled landless communities in this zone as part of a strategy to strengthen its territorial claims. According to Zain-ul-Abadin, his family was part of that policy. Now, decades later, the same government is demolishing the settlement it once built.
				</p>

				<p>
					The families of those civilians are now being labelled as "foreigners".
				</p>

				<blockquote>
					"My father and grandfather lived here. We came from another part of the state to Uriamghat because the government told us to settle here to protect the land of Assam. This has been going on for 80 or 90 years. We grew up in poverty and built our houses with hard labour."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Displacement Video Scrolly -->
	<ScrollySection
		bind:activeStep={displacementStep}
		steps={displacementSteps}
		backgroundColor="#f5f0eb"
		showTextBoxes={true}
		textBoxVariant="editorial"
		onScrollProgress={(p) => (displacementScrollProgress = p)}
	>
		{#snippet children({ activeStep })}
			<VideoHeroVisualization
				currentStep={displacementStep}
				fadeProgress={displacementFadeProgress()}
				fadeInProgress={displacementFadeInProgress()}
				scrollProgress={displacementScrollProgress}
				videoSrc="/videos/cleared/displacement.mp4"
				overlayConfig={displacementOverlays}
				showCreamOverlay={false}
			/>
		{/snippet}
	</ScrollySection>

	<!-- Bulldozer Justice Section -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					In India, the yellow JCB has taken on a meaning far beyond its function as a machine. Since 2017, the brand name has become almost generic in the country &ndash; used interchangeably with "bulldozer", especially during state-led demolition drives that critics say bypass due process. Amnesty International verified at least <a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">33 instances</a> of JCB equipment being used in what it described as punitive demolitions of Muslim properties across five states.
				</p>

				<p>
					The practice has acquired its own name: "<a href="https://www.bbc.com/news/articles/c0k8d3ynvzxo" target="_blank" rel="noopener">bulldozer justice</a>", a term used for demolitions that are openly celebrated by BJP leaders and their supporters. Amnesty International had described JCB as the "<a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">brand of choice in a hate campaign against the minority community</a>". Over time, the yellow excavator itself has become a potent political symbol for the use of demolitions as a show of state power against marginalised communities.
				</p>
			</div>

			<div class="pull-quote">
				<p>"The brand of choice in a hate campaign against the minority community."</p>
				<span class="pull-quote-source">Amnesty International, February 2024</span>
			</div>

			<div class="prose-content">
				<p>
					<a href="https://www.ohchr.org/en/press-releases/2025/06/india-must-halt-arbitrary-demolitions-targeting-minorities-and-marginalised" target="_blank" rel="noopener">Rights groups</a> and <a href="https://www.codastory.com/authoritarian-tech/india-bulldozers-muslim-neighborhoods/" target="_blank" rel="noopener">legal scholars</a> often draw parallels between India's "bulldozer justice" and Israel's long-standing practice of demolishing Palestinian homes in the occupied territories. Since 1948, Israel has used home demolitions as a central tool of displacement against Palestinians, demolishing more than <a href="https://www.palestineportal.org/learn-teach/key-issues/home-demolitions/" target="_blank" rel="noopener">26,000 homes since 1967</a> alone. The justification is almost always the same: illegal construction, encroachment, or a bureaucratic infraction.
				</p>
			</div>
		</div>
	</section>

	<div class="section-divider"></div>

	<!-- CM Rhetoric Section -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					The language driving these evictions in Assam has been sharply polarising. Chief Minister Himanta Biswa Sarma has a long record of Islamophobic rhetoric, frequently framing Bengali-speaking Muslims as "Bangladeshi encroachers" and a demographic threat to justify the state's aggressive displacement policies.
				</p>

				<p>
					This reached a violent peak in February 2026, when the Assam BJP's official X account posted a <a href="https://x.com/MahuaMoitra/status/2020444649857351865" target="_blank" rel="noopener">video</a> of an AI-generated Sarma aiming and firing a rifle at Muslims, captioned "point blank shot". It was deleted after a massive outrage by the public and opposition leaders, who warned it was a direct incitement to violence against minorities.
				</p>

				<p>
					Concerns about the chief minister's language have also been raised by a group of more than 180 scholars, lawyers, and activists who issued a joint <a href="https://thewire.in/communalism/himanta-government-policies-hallmarks-ethnic-cleansing-statement" target="_blank" rel="noopener">statement</a> condemning Sarma's relentless "hateful and divisive" remarks, warning that such state-led rhetoric fundamentally threatens constitutional rights and the safety of minorities.
				</p>
			</div>

			<div class="pull-quote">
				<p>"Point blank shot"</p>
				<span class="pull-quote-source">Caption on AI-generated video of CM Sarma, deleted after outrage</span>
			</div>

			<!-- CM Tweets -->
			<div
				class="content-container tweet-container"
				use:inview={{ rootMargin: '-20% 0px -20% 0px' }}
				oninview_change={(e) => { if (e.detail.inView) notificationsTriggered = true; }}
			>
				<XNotificationStack
					autoTrigger={false}
					triggerDelay={200}
					externalTrigger={notificationsTriggered}
				/>
			</div>
		</div>
	</section>

	<div class="section-divider"></div>

	<!-- Supreme Court Directives -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Courts</h2>

			<div class="prose-content">
				<p>
					In November 2024, India's top court issued landmark directives to curb arbitrary demolitions. The ruling established strict safeguards: 15-day mandatory notice before any demolition, videographed proceedings, written reasons for action, and the right to be heard. The Court declared that the "executive cannot become the Judge", calling such demolitions unconstitutional and "reminiscent of a lawless state of affairs".
				</p>
			</div>

			<!-- Pull Quote -->
			<div class="pull-quote">
				<p>"The executive cannot become the Judge."</p>
				<span class="pull-quote-source">Supreme Court of India, November 2024</span>
			</div>

			<div class="prose-content">
				<p>
					Assam's BJP government, led by Sarma, appeared unmoved.
				</p>

				<p>
					Between late 2024 and mid-2025, the state proceeded with mass evictions in Muslim-majority areas &ndash; demolitions that would lead India's highest court to issue two contempt notices against the Assam government, one in <a href="https://www.deccanchronicle.com/nation/assam-govt-gets-contempt-notice-from-supreme-court-for-bulldozer-action-1827032" target="_blank" rel="noopener">September 2024</a> and another in <a href="https://lawbeat.in/news-updates/supreme-court-issues-notice-on-contempt-plea-against-assams-goalpara-demolitions-1513859" target="_blank" rel="noopener">July 2025</a>.
				</p>

				<p>
					But Assam was not alone in defying judicial authority. In April 2022, the Supreme Court had to issue its <a href="https://www.thehindu.com/news/cities/Delhi/supreme-court-halts-eviction-drive-in-delhis-jahangirpuri/article65337761.ece" target="_blank" rel="noopener">order</a> twice to stop demolitions in Delhi's Jahangirpuri neighbourhood, as <a href="https://www.ndtv.com/india-news/supreme-court-halts-demolition-in-delhis-violence-hit-jahangirpuri-orders-status-quo-hearing-tomorrow-2902922" target="_blank" rel="noopener">bulldozers kept moving</a> for an hour after the first order. In November 2024, the <a href="https://www.bbc.com/news/articles/c0k8d3ynvzxo" target="_blank" rel="noopener">court</a> issued what was widely described as a landmark, categorical ban on bulldozer justice across India. The 12 months that followed were marked by demolition drives across states, revealing a distinctly different reality on the ground.
				</p>

				<p>
					In Gujarat, for instance, thousands of homes in Muslim-majority settlements around Ahmedabad's Chandola Lake were <a href="https://article-14.com/post/the-hunt-for-bangladeshis-thousands-of-muslims-homeless-2-months-after-vast-gujarat-demolition-688fd625e41f6" target="_blank" rel="noopener">demolished in 2025</a> in a campaign framed as a crackdown on "illegal Bangladeshis", leaving families homeless for months.
				</p>

				<p>
					The bulldozers continued to roll, raising a fundamental question about the limits of judicial authority when state power refuses to yield.
				</p>

				<p>
					For hundreds of evicted families, losing their homes was only the beginning: Many have since found their <a href="https://scroll.in/article/1090844/home-was-razed-now-vote-gone-in-assam-hundreds-of-evicted-find-names-struck-off-electoral-roll" target="_blank" rel="noopener">names struck</a> off the electoral rolls, stripping them of their right to vote.
				</p>
			</div>

			<!-- Contempt Timeline -->
			<div class="contempt-timeline">
				<div class="contempt-event">
					<span class="contempt-date">Sep 2024</span>
					<span class="contempt-desc">First contempt notice against Assam government</span>
				</div>
				<div class="contempt-event">
					<span class="contempt-date">Nov 2024</span>
					<span class="contempt-desc">Supreme Court issues landmark ban on bulldozer justice</span>
				</div>
				<div class="contempt-event">
					<span class="contempt-date">Jul 2025</span>
					<span class="contempt-desc">Second contempt notice against Assam government</span>
				</div>
			</div>
		</div>
	</section>

	<div class="section-divider"></div>

	<!-- Content Section: The Violence -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Violence</h2>

			<div class="prose-content">
				<p>At least 10 people have been killed during eviction drives since the BJP came to power in 2016.</p>

				<div class="violence-timeline">
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2016</span>
							<span class="vt-date">September 21</span>
							<p class="vt-location"><a href="https://www.ndtv.com/guwahati-news/two-dead-as-eviction-drive-near-kaziranga-national-park-turns-violent-1460443" target="_blank" rel="noopener">Kaziranga National Park</a>, Nagaon district</p>
							<p class="vt-description">Two killed during a violent eviction drive.</p>
							<span class="vt-toll">2 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2019</span>
							<span class="vt-date">March 11</span>
							<p class="vt-location"><a href="https://www.aljazeera.com/news/2019/3/25/in-indias-assam-muslim-families-evicted-weeks-before-elections" target="_blank" rel="noopener">Hojai district</a></p>
							<p class="vt-description">Heavily pregnant Kulsuma Begum succumbed to her injuries.</p>
							<span class="vt-toll">1 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2021</span>
							<span class="vt-date">September 23</span>
							<p class="vt-location"><a href="https://indianexpress.com/article/north-east-india/assam/assam-eviction-violence-two-deaths-clashes-7532641/" target="_blank" rel="noopener">Dhalpur</a>, Darrang district</p>
							<p class="vt-description">Moinul Haque (28) and Sheikh Farid (12) killed by police firing. 20 injured.</p>
							<span class="vt-toll">2 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2022</span>
							<span class="vt-date">April 1</span>
							<p class="vt-location"><a href="https://www.youtube.com/watch?v=t2xSk2iULO8" target="_blank" rel="noopener">Purana Bazar</a>, Hojai district</p>
							<p class="vt-description">One person died amid eviction for flyover construction.</p>
							<span class="vt-toll">1 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2023</span>
							<span class="vt-date">July 17&ndash;18</span>
							<p class="vt-location"><a href="https://indianexpress.com/article/north-east-india/assam/woman-shot-dead-6-including-3-guards-injured-clash-assam-wildlife-sanctuary-8844594/" target="_blank" rel="noopener">Burha Chapori Wildlife Sanctuary</a>, Sonitpur district</p>
							<p class="vt-description">Rahima Khatun was shot dead by forest officials during clashes after eviction.</p>
							<span class="vt-toll">1 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2024</span>
							<span class="vt-date">September 12</span>
							<p class="vt-location"><a href="https://www.newindianexpress.com/nation/2024/Sep/12/two-muslims-killed-after-police-opened-fire-at-villagers-during-eviction-drive-in-assams-sonapur" target="_blank" rel="noopener">Kachutali</a>, Sonapur</p>
							<p class="vt-description">Haidar Ali (19) and Jubahir Ali (18) killed, 33 injured during "tribal belt protection" eviction.</p>
							<span class="vt-toll">2 killed</span>
						</div>
					</div>
					<div class="vt-event">
						<div class="vt-node"><div class="vt-node-ring"></div></div>
						<div class="vt-content">
							<span class="vt-year">2025</span>
							<span class="vt-date">July 17</span>
							<p class="vt-location"><a href="https://www.newindianexpress.com/nation/2025/Jul/17/eviction-drive-in-assams-goalpara-turns-violent-one-killed-in-police-firing" target="_blank" rel="noopener">Paikan Reserve Forest</a>, Goalpara district</p>
							<p class="vt-description">Shakaur Ali killed and several injured during forest eviction clearance.</p>
							<span class="vt-toll">1 killed</span>
						</div>
					</div>
				</div>

				<p>
					The eviction was not merely a demolition; it was followed by what Barik describes as a calculated attempt to isolate the survivors. After the houses were levelled, the administration took physical steps to ensure no aid reached the displaced families living under tarpaulins.
				</p>

				<blockquote>
					"With a JCB, they dug a massive pit in the middle of the road... This road was used for organisations to help us with food, water, and tarpaulins. They beat us up. They shot us. One of us died... the injured people were brought from the hospital and straight away put in jail."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Map Scrolly Section -->
	<div class="map-section">
		<ScrollySection
			steps={mapSteps}
			backgroundColor="#f5f0eb"
			textBoxPosition="left"
			firstStepOffset={0.5}
			textBoxVariant="editorial"
			onScrollProgress={(p) => (mapScrollProgress = p)}
		>
			{#snippet children({ activeStep })}
				<MapScrolly {activeStep} fadeProgress={mapFadeProgress()} fadeOutProgress={mapFadeOutProgress()} />
			{/snippet}
		</ScrollySection>
	</div>

	<!-- Transition Gallery - Demolition Images -->
	<div class="gallery-breakout">
		<DemolitionGallery />
	</div>

	<!-- Maiful Naysa Continued -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					Maiful Naysa, 65, says her family received an eviction notice in November and were given a month to respond. Before dawn, just a day after the deadline, evictions began.
				</p>

				<blockquote>
					"We had a solid house, a shop, and four rooms. Everything was settled. Now we have nothing."
				</blockquote>

				<p>
					For Naysa and her family, the demolition was not just the removal of a structure, but the erasure of a lifetime of labour. Despite holding land titles and tax receipts, they watched from behind a police cordon as their "dream house" was reduced to rubble in seconds.
				</p>

				<ul class="before-after-list">
					<li><strong>The Past:</strong> Sturdy walls, a family shop, and a barricade that kept the wildlife out.</li>
					<li><strong>The Present:</strong> A plastic tent, no income, and the nightly terror of wild elephants. This structure highlights that the eviction didn&rsquo;t just take their land; it stripped away their human right to protection.</li>
				</ul>
			</div>
		</div>
	</section>

	<SatelliteComparison />

	<!-- Where the Land Goes -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">Where the Land Goes</h2>

			<div class="prose-content">
				<p>
					On 8 July 2025, 1,400 families were evicted from villages in Dhubri district. Three people were injured.
				</p>

				<p>
					The government's stated purpose: clearing land for an Adani Power Ltd thermal plant &ndash; a 3,200 megawatt facility representing a <a href="https://www.adani.com/newsroom/media-releases/adani-to-invest-rs-63000-cr-in-transformative-energy-projects-in-assam" target="_blank" rel="noopener">USD 5.6 billion investment</a>. Weeks earlier, the Geological Survey of India reported <a href="https://www.indiatodayne.in/assam/story/assam-makes-history-with-first-iron-ore-find-in-dhubri-unlocking-industrial-potential-1247986-2025-07-21" target="_blank" rel="noopener">18.29 million tonnes of iron</a> ore in the same area. Adani Group &ndash; one of India's most powerful conglomerates, with interests spanning energy, ports, mining, and infrastructure &ndash; has expanded rapidly over the past decade alongside the country's infrastructure push. Opposition parties and critics have repeatedly questioned Gautam Adani, the founder of the Adani Group, about his proximity to Modi, though both the company and the government deny any preferential treatment. Adani is the second richest Asian, with a net worth of $66.6 billion.
				</p>

				<p>
					In February 2025, the Assam government held its Advantage Assam 2.0 investment summit. Since then, land has been allocated to major corporations including Adani, Patanjali, Reliance Industries, and Vedanta for industrial and agricultural projects.
				</p>

				<h3 class="prose-subheading">Corporate Allocations</h3>

				<p>
					In <a href="https://nenow.in/north-east-news/assam/tribal-groups-flag-large-scale-corporate-land-transfers-in-assams-karbi-anglong-and-dima-hasao.html" target="_blank" rel="noopener">Karbi Anglong and Dima Hasao</a>, tribal organisations say more than 11,000 acres have been transferred for industrial projects, threatening 20,000&ndash;25,000 tribal families. Similar patterns emerged after the 2021 Gorukhuti evictions displaced 1,400 families, where land cleared for "agriculture" later fell within <a href="https://assamtribune.com/north-east/northeast-identified-as-new-hotspots-for-rare-earth-critical-minerals-gsi-1582932" target="_blank" rel="noopener">mineral exploration zones</a>.
				</p>

				<div class="gallery-breakout">
					<EditorialGallery images={[
						{ src: '/images/cleared/villages/sontoshpur.jpg', alt: 'Demolished structures in Sontoshpur', caption: 'Sontoshpur, Darrang district' },
						{ src: '/images/cleared/villages/doloni-pathar.jpg', alt: 'Aftermath of eviction in Doloni Pathar', caption: 'Doloni Pathar, Golaghat district' }
					]} />
				</div>

				<h3 class="prose-subheading">The Eighteen Acres</h3>

				<p>
					Questions about where cleared land ultimately goes are not new. A 2021 <a href="https://thewire.in/government/assam-government-land-himanta-biswa-sarma-rbs-realtors" target="_blank" rel="noopener">joint investigation</a> by The Wire and The Crosscurrent reported that between 2006 and 2009, a real estate company co-founded by the chief minister's wife acquired at least 18 acres of government land in and around Guwahati through a series of transactions that appeared to contravene state land regulations. The parcels reportedly included ceiling-surplus land meant for redistribution to landless families, tribal belt land with transfer restrictions, and plots reserved for public or institutional use.
				</p>

				<div class="pull-quote">
					<p>"At least 18 acres of government land acquired through transactions that appeared to contravene state land regulations."</p>
					<span class="pull-quote-source">The Wire / The Crosscurrent, 2021</span>
				</div>

				<div class="data-table-wrapper">
					<div class="table-header">
						<h4 class="table-title">Declared Family Assets</h4>
						<p class="table-subtitle">Election Commission affidavit filings, 2006&ndash;2021</p>
					</div>
					<table class="evidence-table">
						<thead>
							<tr>
								<th class="col-year">Year</th>
								<th>Total Assets</th>
								<th class="highlight-col">Growth</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="year-cell">2006</td>
								<td>Rs 1.02 Cr</td>
								<td class="highlight-col">&mdash;</td>
							</tr>
							<tr>
								<td class="year-cell">2011</td>
								<td>Rs 3.06 Cr</td>
								<td class="highlight-col"><span class="growth-badge">+200%</span></td>
							</tr>
							<tr>
								<td class="year-cell">2016</td>
								<td>Rs 6.38 Cr</td>
								<td class="highlight-col"><span class="growth-badge">+108%</span></td>
							</tr>
							<tr class="highlight-row">
								<td class="year-cell">2021</td>
								<td class="font-medium">Rs 17.27 Cr</td>
								<td class="highlight-col"><span class="growth-badge primary">+170%</span></td>
							</tr>
						</tbody>
					</table>
				</div>

				<p>
					The investigation found that some of these transfers took place at concessional rates or through direct allotments during a period when Himanta Biswa Sarma was serving as a senior cabinet minister in the Assam government. Land records cited in the report suggested irregularities in classification changes and eligibility criteria. The company &ndash; since renamed Vasistha Realtors &ndash; lists the chief minister's son as a shareholder. Sarma has denied any wrongdoing.
				</p>
			</div>
		</div>
	</section>

	<!-- The Displaced -->
	<section class="content-section">
		<div class="content-container">
			<div class="gallery-breakout">
				<EditorialGallery images={[
					{ src: '/images/cleared/villages/luptachar.jpg', alt: 'Tarpaulin shelters along roadside in Dubapara Luptachar', caption: 'Dubapara Luptachar, Dhubri district' },
					{ src: '/images/cleared/villages/ashudubi.jpg', alt: 'Displaced families in Ashudubi', caption: 'Ashudubi, Goalpara district' }
				]} />
			</div>
			<h2 class="content-heading">The Displaced</h2>

			<div class="prose-content">
				<p>Where do 20,000 families go?</p>

				<p>
					We saw families living in makeshift shelters constructed from tarpaulin and bamboo along roadsides, on the banks of the river and at the edges of forests, sometimes dependent on NGO assistance for basic necessities. Many received no government rehabilitation, despite Assam's stated policy of providing support to the landless.
				</p>

				<h3 class="prose-subheading">"Go Back to Bangladesh"</h3>

				<p>
					Despite Zain-ul-Abaadin and his family and neighbours possessing NRC documents and valid voter IDs, they were met with a familiar xenophobic taunt during the drive.
				</p>

				<blockquote>
					"The police harassed us at the riverbanks and told us to 'go back to Bangladesh.' But we are not Bangladeshis. We are from Assam. We vote here. Our ancestors are from here. How do we go back to a place we have never known?"
				</blockquote>

				<p>
					Zain describes a terrifying atmosphere where the displaced are being systematically cut off from the local economy. The eviction drives reflect layered systemic marginalisation. Economically, families lose land, livelihoods, and access to welfare, pushing them into deeper precarity. Politically and socially, even documented citizens face recurring challenges to their belonging, reinforcing stigma, exclusion, and a condition of insecurity where rights exist on paper but remain fragile in practice.
				</p>

				<p>
					The most harrowing aspect of Barik's testimony was the apparent defiance of the judiciary by executive forces. Just two days before the demolition, the residents believed they had secured a lifeline from the state's highest court. For Barik, the violence and the disregard for the High Court&rsquo;s stay orders are symptoms of a larger ideological shift in the region.
				</p>

				<blockquote>
					"We received an order from the High Court on 10 July. It said if it is necessary to evict them, the government must first arrange for their accommodation and food. The government didn't accept the court's order. They are lying to the court again and again."
				</blockquote>

				<p>
					This reflects a broader pattern in Assam's eviction drives, where the category of "indigenous" functions as a shifting benchmark, often used to undermine the land claims of Bengali-origin Muslims regardless of decades of residence or tax records.
				</p>

				<blockquote>
					"The current government refuses to follow the Constitution of India. <ExpandableInfobox data={infoboxData.rss} /> wants to make India a Hindu state. There is no place for Muslims here."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Media Headlines Section -->
	<HeadlineStack {headlines} />

	<!-- Content Section: The Pattern -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Pattern</h2>

			<div class="prose-content">
				<p>
					Amnesty International, Human Rights Watch, and UN special rapporteurs have all examined what is happening in Assam.
				</p>

				<p>
					Amnesty's February 2024 report documented that evictions in Assam constitute "forced evictions" prohibited under international human rights law, finding violations of the right to adequate housing, fair trial, and non-discrimination.
				</p>

				<p>
					In June 2025, UN experts called on India to "halt arbitrary demolitions targeting minorities and marginalised communities."
				</p>

				<p>
					Last month, <a href="https://maktoobmedia.com/india/un-rights-body-flags-discrimination-against-bengali-speaking-muslims-in-assam-seeks-answers-from-india/" target="_blank" rel="noopener">UN rights experts</a> flagged systematic bias and "forced displacement" of Bengali Muslims in Assam.
				</p>

				<h3 class="prose-subheading">A Global Pattern</h3>

				<p>
					The bulldozer has emerged as a global weapon of state oppression. In Israel-Palestine, over 55,000 Palestinian structures have been demolished since 1967 for systematic home destruction.
				</p>

				<p>
					Similar patterns have been observed in parts of India and Latin America.
				</p>

				<p>
					Paraguay has forcibly evicted 3,000 people from Indigenous communities since September 2024, while Guatemala razed indigenous settlements using tactics from its civil war era.
				</p>

				<p>
					UN Special Rapporteur Balakrishnan Rajagopal noted an <a href="https://thepolisproject.com/research/un-rapporteur-balakrishnan-rajagopal-demolitions/" target="_blank" rel="noopener">"uncanny similarity"</a> between India's methods and Israel's conduct in Palestine, explaining both use bulldozers to create "chilling effects" and punish entire communities.
				</p>

				<div class="pull-quote">
					<p>"Uncanny similarity" between India's methods and Israel's conduct in Palestine.</p>
					<span class="pull-quote-source">UN Special Rapporteur Balakrishnan Rajagopal</span>
				</div>

				<p>
					From Assam to Gaza, from Kashmir to the Andes, the bulldozer has become more than a piece of machinery. It is a tool of displacement, used to erase marginalised communities under the guise of "development," "security," and "legality." Its practical purpose may be to clear land, but its political function is to send a message about power, belonging, and whose homes are considered disposable.
				</p>
			</div>

			<h2 class="content-heading">The Chief Minister's Words</h2>

			<div class="prose-content">
				<p>
					Throughout this period, Modi&rsquo;s close ally, Chief Minister Himanta Biswa Sarma, has characterised the evictions publicly. He has described them as necessary action against &ldquo;Bangladeshi encroachers&rdquo;.
				</p>

				<blockquote>
					"My job is to make the <a href="https://scroll.in/article/1090396/himanta-sarmas-remarks-about-miyas-make-a-mockery-of-constitution" target="_blank" rel="noopener">Miya people suffer</a>."
					<footer>&mdash; Himanta Biswa Sarma, January 27</footer>
				</blockquote>

			</div>
		</div>
	</section>

	<!-- Credits & Sources -->
	<section class="credits-section">
		<div class="credits-box">
			<h3 class="credits-heading">Credits & Sources</h3>
			<div class="credits-grid">
				<div class="credits-column">
					<div class="credit-entry">
						<span class="credit-label">Reporting & Investigation</span>
						<span class="credit-value">Ahmer Khan and Tom Vaillant</span>
					</div>
					<div class="credit-entry">
						<span class="credit-label">Edited by</span>
						<span class="credit-value">Andrew Gully and Ali M. Latifi</span>
					</div>
					<div class="credit-entry">
						<span class="credit-label">Visuals</span>
						<span class="credit-value">Tom Vaillant</span>
					</div>
					<div class="credit-entry">
						<span class="credit-label">Additional Research</span>
						<span class="credit-value">Mir Wafa Raseeq</span>
					</div>
				</div>
				<div class="credits-column">
					<span class="credit-label">Sources</span>
					<ul class="credits-source-list">
						<li>Reuters</li>
						<li>Al Jazeera</li>
						<li>Article 14</li>
						<li>Human Rights Watch</li>
						<li>Amnesty International</li>
					</ul>
				</div>
			</div>
		</div>
	</section>

	<!-- Methodology Box -->
	<section class="methodology-section">
		<div class="methodology-box">
			<h3 class="methodology-heading">Methodology</h3>
			<div class="methodology-content">
				<p>
					This investigation is based on field reporting conducted across Assam between 2024 and 2026, including visits to 20 demolished villages and interviews with more than 60 affected families, witnesses, local officials, and legal advocates.
				</p>
				<p>
					Eviction data was compiled from official government records, court filings, media reports, and on-the-ground verification. We cross-referenced displacement figures using satellite imagery analysis, district-level administrative data, and reporting by local and international news organisations. Where official figures were unavailable or contested, we relied on corroborated estimates from humanitarian organisations and independent researchers.
				</p>
				<p>
					All testimony was gathered through in-person interviews conducted in Assamese, Bengali, and English, with translation assistance where necessary. Interviewees gave informed consent. Some names have been changed at the request of those who feared reprisal.
				</p>
				<p>
					Satellite imagery was sourced from publicly available archives and analysed to document changes in settlement patterns before and after eviction operations. Legal documents, including eviction notices and court orders, were obtained directly from affected families and verified against public records.
				</p>
				<p>
					The Assam government was contacted for comment. At the time of publication, no response had been received.
				</p>

				<h4 class="methodology-subheading">Evictions Data</h4>
				<p>
					The eviction figures cited in this investigation are derived from a database we compiled, aggregating data from all 33 documented eviction operations conducted between May 2021 and 2026. Sources include official government records, court filings, media reports from local and international outlets, and on-the-ground verification by our reporting team.
				</p>
				<p>
					Some sources reported the number of people displaced, while others reported the number of households affected. To create a consistent metric, we applied a conversion factor of five people per household, in line with India&rsquo;s national census average. This yielded an estimate of more than 22,000 homes demolished and approximately 100,000 people displaced.
				</p>
				<p>
					The full dataset, including sources for each operation, is available <a href="#" target="_blank" rel="noopener">here</a>.
				</p>
			</div>
		</div>
	</section>

</div>

<style>
	/* Article container - unified light background */
	.article-container {
		background: #f5f0eb;
		min-height: 100vh;
	}

	/* Override global overflow-x: hidden which breaks position: sticky */
	:global(html), :global(body) {
		overflow-x: clip;
	}

	/* Eviction category highlight colors (match EvictionBubbles.colorMapping) */
	:global(.highlight-env) { color: #35B58B; font-weight: 600; }
	:global(.highlight-dev) { color: #9F3E52; font-weight: 600; }
	:global(.highlight-admin) { color: #E8A84C; font-weight: 600; }
	:global(.highlight-satra) { color: #6B7FD7; font-weight: 600; }

	/* Hero header styles (rendered via step 0) */
	:global(.hero-header) {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem;
	}

	:global(.hero-title) {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(3rem, 10vw, 6rem);
		font-weight: 700;
		letter-spacing: -0.02em;
		line-height: 1.05;
		color: #1a1a1a;
		margin: 0 0 1.25rem 0;
		opacity: 0;
		animation: heroFadeUp 1.2s ease forwards;
		animation-delay: 0.3s;
	}

	:global(.hero-accent-rule) {
		width: 3.5rem;
		height: 2px;
		background: rgba(159, 62, 82, 0.5);
		margin: 0 auto 1.75rem;
		transform: scaleX(0);
		animation: heroDrawLine 0.8s ease forwards;
		animation-delay: 0.9s;
	}

	:global(.hero-desc) {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 300;
		line-height: 1.7;
		color: rgba(45, 45, 45, 0.85);
		max-width: 38ch;
		margin: 0 0 2rem 0;
		opacity: 0;
		animation: heroFadeUp 1s ease forwards;
		animation-delay: 1.2s;
	}

	:global(.hero-byline) {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		opacity: 0;
		animation: heroFadeUp 1s ease forwards;
		animation-delay: 1.6s;
	}

	:global(.byline-label) {
		color: rgba(0, 0, 0, 0.5);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
	}

	:global(.byline-authors) {
		color: #1a1a1a;
		font-weight: 500;
		font-size: 1.125rem;
		margin: 0;
	}

	:global(.byline-date) {
		color: rgba(0, 0, 0, 0.4);
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
	}

	:global(.scroll-indicator) {
		margin-top: 3rem;
		opacity: 0;
		animation: heroFadeUp 0.8s ease forwards;
		animation-delay: 2.2s;
	}

	:global(.scroll-indicator-track) {
		width: 1.5rem;
		height: 2.5rem;
		border: 2px solid rgba(0, 0, 0, 0.25);
		border-radius: 9999px;
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
	}

	:global(.scroll-indicator-dot) {
		width: 0.25rem;
		height: 0.5rem;
		background: rgba(0, 0, 0, 0.4);
		border-radius: 9999px;
		animation: bounce 1.5s ease-in-out infinite;
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(6px);
		}
	}

	@keyframes heroFadeUp {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes heroDrawLine {
		from { transform: scaleX(0); }
		to { transform: scaleX(1); }
	}


	/* Content sections - warm neutral theme */
	.content-section {
		position: relative;
		background: #f5f0eb;
		padding: 3.5rem 1.5rem;
	}

	.content-section--spacious {
		padding-top: 6rem;
		padding-bottom: 6rem;
	}

	.content-container {
		max-width: 42rem;
		margin: 0 auto;
	}

	.content-heading {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		line-height: 1.2;
		color: #1a1a1a;
		margin: 0 0 2rem 0;
	}

	.content-heading + .content-heading {
		margin-top: 4rem;
	}

	.prose-content {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1.125rem;
		line-height: 1.85;
		color: #2d2d2d;
	}

	.prose-content p {
		margin: 0 0 1.5rem 0;
	}

	.prose-content strong {
		font-weight: 600;
		color: #1a1a1a;
	}

	.prose-content blockquote {
		border-left: 4px solid #9f3e52;
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: #4a4a4a;
	}

	.prose-content a {
		color: #9f3e52;
		text-decoration: underline;
		text-decoration-color: rgba(159, 62, 82, 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s ease;
	}

	.prose-content a:hover {
		text-decoration-color: #9f3e52;
	}

	/* Violence timeline */
	.violence-timeline {
		position: relative;
		margin: 2.5rem 0;
		padding-left: 2.5rem;
	}

	.violence-timeline::before {
		content: '';
		position: absolute;
		left: 0.5rem;
		top: 0.5rem;
		bottom: 0.5rem;
		width: 2px;
		background: rgba(159, 62, 82, 0.25);
	}

	.vt-event {
		position: relative;
		padding-bottom: 2rem;
	}

	.vt-event:last-child {
		padding-bottom: 0;
	}

	.vt-node {
		position: absolute;
		left: -2.5rem;
		top: 0.25rem;
		width: 1.125rem;
		height: 1.125rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.vt-node-ring {
		width: 0.75rem;
		height: 0.75rem;
		border: 2px solid #9f3e52;
		border-radius: 50%;
		background: #f5f0eb;
	}

	.vt-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.vt-year {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.8rem;
		font-weight: 500;
		color: #9f3e52;
		letter-spacing: 0.05em;
	}

	.vt-date {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.85rem;
		color: #6b6b6b;
	}

	.vt-location {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1rem;
		font-weight: 600;
		color: #1a1a1a;
		margin: 0;
		line-height: 1.4;
	}

	.vt-location a {
		color: #9f3e52;
		text-decoration: underline;
		text-decoration-color: rgba(159, 62, 82, 0.3);
		text-underline-offset: 2px;
		transition: text-decoration-color 0.2s ease;
	}

	.vt-location a:hover {
		text-decoration-color: #9f3e52;
	}

	.vt-description {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		color: #2d2d2d;
		line-height: 1.6;
		margin: 0;
	}

	.vt-toll {
		display: inline-block;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.05em;
		color: #9f3e52;
		background: rgba(159, 62, 82, 0.08);
		border: 1px solid rgba(159, 62, 82, 0.15);
		border-radius: 2px;
		padding: 0.2rem 0.5rem;
		margin-top: 0.25rem;
		width: fit-content;
	}

	/* Credits & Sources section */
	.credits-section {
		background: #f5f0eb;
		padding: 2rem 1.5rem;
	}

	.credits-box {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2.5rem 2rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.4);
	}

	.credits-heading {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #9f3e52;
		margin: 0 0 1.5rem 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.credits-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 2rem;
	}

	.credits-column {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.credit-entry {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.credit-label {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #6b6b6b;
	}

	.credit-value {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		color: #2d2d2d;
	}

	.credits-source-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.credits-source-list li {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.9rem;
		color: #4a4a4a;
		line-height: 1.4;
	}

	@media (max-width: 640px) {
		.credits-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}
	}

	/* Map section - wider text boxes on desktop */
	@media (min-width: 900px) {
		.map-section :global(.scrolly-text-box) {
			max-width: 440px;
		}
	}

	/* Pull quotes */
	.pull-quote {
		margin: 3rem 0;
		padding: 2rem 0;
		border-top: 2px solid rgba(159, 62, 82, 0.3);
		border-bottom: 2px solid rgba(159, 62, 82, 0.3);
		text-align: center;
	}

	.pull-quote p {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.25rem, 3vw, 1.75rem);
		font-weight: 500;
		font-style: italic;
		line-height: 1.4;
		color: #1a1a1a;
		margin: 0 0 0.75rem 0;
	}

	.pull-quote-source {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.875rem;
		color: #6b6b6b;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Contempt timeline */
	.contempt-timeline {
		margin: 2rem 0;
		padding-left: 1.5rem;
		border-left: 2px solid rgba(159, 62, 82, 0.3);
	}

	.contempt-event {
		padding: 0.75rem 0 0.75rem 1rem;
		display: flex;
		gap: 1rem;
		align-items: baseline;
	}

	.contempt-date {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: #6b6b6b;
		white-space: nowrap;
		min-width: 5rem;
	}

	.contempt-desc {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		color: #2d2d2d;
		line-height: 1.5;
	}

	/* Tweet container spacing */
	.tweet-container {
		margin-top: 2rem;
	}

	/* Before/after comparison list */
	.before-after-list {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
	}

	.before-after-list li {
		padding: 0.75rem 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
		color: #2d2d2d;
		font-size: 1.125rem;
		line-height: 1.85;
	}

	.before-after-list li strong {
		color: #1a1a1a;
	}

	/* Evidence table (light theme) */
	.data-table-wrapper {
		background: rgba(255, 255, 255, 0.6);
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		padding: 1.5rem;
		margin: 2rem 0;
	}

	.table-header {
		margin-bottom: 1.25rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.table-title {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: 1.125rem;
		color: #1a1a1a;
		margin: 0;
	}

	.table-subtitle {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		color: #6b6b6b;
		margin-top: 0.25rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.evidence-table {
		width: 100%;
		border-collapse: collapse;
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
	}

	.evidence-table th {
		text-align: left;
		padding: 0.75rem 1rem;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: #6b6b6b;
		border-bottom: 1px solid rgba(0, 0, 0, 0.12);
		font-weight: 500;
	}

	.evidence-table td {
		padding: 0.875rem 1rem;
		color: #2d2d2d;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
	}

	.col-year,
	.year-cell {
		width: 4rem;
	}

	.year-cell {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.85rem;
		color: #6b6b6b;
	}

	.highlight-col {
		background: rgba(159, 62, 82, 0.04);
	}

	.highlight-row {
		background: rgba(159, 62, 82, 0.06);
	}

	.growth-badge {
		display: inline-block;
		padding: 0.2rem 0.5rem;
		background: rgba(0, 0, 0, 0.06);
		border-radius: 2px;
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.75rem;
		color: #4a4a4a;
	}

	.growth-badge.primary {
		background: rgba(159, 62, 82, 0.12);
		color: #9f3e52;
	}

	/* Section divider between adjacent prose sections */
	.section-divider {
		width: 4rem;
		height: 1px;
		background: rgba(159, 62, 82, 0.2);
		margin: 0 auto;
	}

	/* Sub-headings within prose sections */
	.prose-subheading {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.25rem, 3vw, 1.5rem);
		font-weight: 600;
		line-height: 1.3;
		color: #1a1a1a;
		margin: 3rem 0 1.5rem 0;
	}

	/* Methodology box */
	.methodology-section {
		background: #f5f0eb;
		padding: 2rem 1.5rem 4rem;
	}

	.methodology-box {
		max-width: 42rem;
		margin: 0 auto;
		padding: 2.5rem 2rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.4);
	}

	.methodology-heading {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.7rem;
		font-weight: 500;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: #9f3e52;
		margin: 0 0 1.5rem 0;
		padding-bottom: 1rem;
		border-bottom: 1px solid rgba(0, 0, 0, 0.08);
	}

	.methodology-content {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		line-height: 1.75;
		color: #4a4a4a;
	}

	.methodology-content p {
		margin: 0 0 1rem 0;
	}

	.methodology-content p:last-child {
		margin-bottom: 0;
	}

	.methodology-subheading {
		font-family: 'JetBrains Mono', monospace;
		font-size: 0.65rem;
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #9f3e52;
		margin: 1.5rem 0 0.75rem 0;
		padding-top: 1rem;
		border-top: 1px solid rgba(0, 0, 0, 0.06);
	}

	/* Gallery breakout — wider than prose on desktop */
	.gallery-breakout {
		max-width: 42rem;
		margin-left: auto;
		margin-right: auto;
	}

	@media (min-width: 768px) {
		.gallery-breakout {
			max-width: 56rem;
			margin-left: calc(50% - 28rem);
			margin-right: calc(50% - 28rem);
		}
	}

	/* ── Mobile audit ── */
	@media (max-width: 767px) {
		/* Ensure body text is at least 1rem */
		.prose-text {
			font-size: 1rem;
			line-height: 1.75;
		}

		/* Screen-edge padding */
		.content-container {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		/* Pull quotes sizing */
		.pull-quote {
			font-size: clamp(1.1rem, 4vw, 1.35rem);
			padding: 1.25rem 0;
		}

		/* Assets table — fit all columns in viewport */
		.data-table-wrapper {
			padding: 1rem 0.75rem;
			margin-left: -0.5rem;
			margin-right: -0.5rem;
		}

		.evidence-table {
			min-width: 0;
		}

		.evidence-table th,
		.evidence-table td {
			padding: 0.625rem 0.5rem;
			font-size: 0.875rem;
		}

		.col-year,
		.year-cell {
			width: 3.5rem;
		}

		/* Methodology box reduce padding */
		.methodology-box {
			padding: 1.5rem 1rem;
		}

		/* Gallery breakout resets to normal width on mobile */
		.gallery-breakout {
			max-width: 100%;
			margin-left: 0;
			margin-right: 0;
		}
	}

</style>
