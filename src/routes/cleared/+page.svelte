<script lang="ts">
	/**
	 * Cleared - Investigation into Assam's mass eviction campaign
	 *
	 * This article uses a unified ScrollySection pattern for all scrolly
	 * sections to ensure consistent behavior, dark background throughout,
	 * and no horizontal overflow issues.
	 */
	import { onMount } from 'svelte';
	import ScrollySection from '$lib/components/scrolly/ScrollySection.svelte';
	import HeroVisualization from '$lib/components/cleared/HeroVisualization.svelte';
	import EvictionScrolly from '$lib/components/evictions/EvictionScrolly.svelte';
	import MapScrolly from '$lib/components/cleared/MapScrolly.svelte';
	import NoticeMosaic from '$lib/components/scrolly/NoticeMosaic.svelte';
	import DemolitionGallery from '$lib/components/cleared/DemolitionGallery.svelte';
	import HeadlineStack from '$lib/components/scrolly/HeadlineStack.svelte';
	import SatelliteComparison from '$lib/components/cleared/SatelliteComparison.svelte';
	import XNotificationStack from '$lib/components/XNotificationStack.svelte';
	import { inview } from 'svelte-inview';

	// === SECTION STEP DATA ===

	// Hero section steps (3 steps for the header with fading images)
	const heroSteps = [
		{
			raw: true,
			text: `<div class="hero-header">
				<h1 class="hero-title">Cleared</h1>
				<p class="hero-desc">How Assam demolished the homes of 20,000 families</p>
				<div class="hero-byline">
					<p class="byline-label">By</p>
					<p class="byline-authors">Ahmer Khan and Tom Vaillant</p>
					<p class="byline-date">January 2026</p>
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
			text: 'In the early morning, police opened fire on a crowd in Dhalpur village, Darrang district. Two people died: Moinul Haque, 28, and Sheikh Farid, 12 years old. As Haque lay dying, a government photographer was filmed stomping on his body. Again. And again. The video went viral and became the image of a campaign that will reshape hundreds of thousands of lives.',
			source: {
				text: 'Al Jazeera',
				url: 'https://www.aljazeera.com/news/2021/9/29/assam'
			}
		},
		{
			title: 'A Campaign of Displacement',
			text: 'This was not an isolated incident. Between May 2021 and 2026, the Assam government conducted at least 33 documented eviction operations. More than 22,000 homes are demolished. The Assam government is led by the same party that governs at the federal level: the BJP. Chief Minister Himanta Biswa Sarma is widely seen as the BJP\'s poster boy for implementing the party\'s Hindu nationalist agenda. The eviction drives follow directly from federal policies like the National Register of Citizens and Citizenship Amendment Act, both passed by Modi\'s government. Federal Home Minister Amit Shah has repeatedly promised to take this model nationwide.'
		},
		{
			text: 'That\'s 165,000 people \u2013 or twice Wembley Stadium.'
		},
		{
			text: 'One eviction every three minutes, 24 hours a day, for an entire year. The vast majority of those evicted are Bengali-speaking Muslims.',
			imageCredit: 'Disclaimer: image generated with Nano Banana Pro and GPT Image 1.5'
		}
	];

	// Eviction data visualization steps (12 steps)
	const evictionSteps = [
		{
			text: 'More than 100,000 people were displaced across Assam between 2021 and 2026 in 33 documented eviction drives. Each bubble represents one operation \u2014 the larger the bubble, the more people displaced.'
		},
		{
			text: 'The government cited various legal grounds for these evictions. We\'ve grouped them into <strong>four categories</strong>.'
		},
		{
			text: 'The largest category: <span class="highlight-env">Environmental Protection</span> \u2014 forest clearances, wildlife sanctuaries, elephant corridors. Twelve operations are conducted. These operations affected more than 60,000 people. In July 2025, in Goalpara district, over 1,080 families were evicted from Haseela Beel and Paikan Reserve Forest. One killed, 15 injured.'
		},
		{
			text: '<span class="highlight-dev">Development Projects</span> cleared land for corporate investment, including the USD 4.75 billion allegedly allocated to Adani thermal power plant in Dhubri.'
		},
		{
			text: '<span class="highlight-admin">Administrative Enforcement</span> targeted alleged "encroachers" on government land, including controversial border pushbacks to Bangladesh.'
		},
		{
			text: '<span class="highlight-satra">Religious Land (Satra)</span> evictions cleared land claimed by Hindu monasteries in Barpeta and Nagaon districts.'
		},
		{
			text: 'What is unfolding in Assam is not a series of sporadic clearances but an increasingly institutionalised campaign of dispossession. Since 2021, both the frequency and the scale of eviction operations have expanded markedly. Here\'s when each operation occurred.'
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

	// Notice mosaic steps (4 steps for 4 notices)
	const noticeSteps = [
		{ text: '' },
		{ text: '' },
		{ text: '' },
		{ text: '' }
	];

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

	// === HERO IMAGE CONTROL ===
	// Each step maps directly to an image via $derived
	const heroImages = [
		'/images/assam-evictions/image1.jpg', // Step 0: header
		'/images/assam-evictions/image2.jpg', // Step 1: Sept 23
		'/images/cleared/villages/charuabakhra.jpg', // Step 2: campaign
		'/images/assam-evictions/image3.jpg', // Step 3: stadium full
		'/images/assam-evictions/image4.jpg' // Step 4: stadium empty
	];
	let currentHeroImage = $derived(heroImages[heroStep] ?? heroImages[0]);

	// Whether to use contain mode (for stadium images)
	let useContainMode = $derived(heroStep >= 3);

	// Preload all hero images on mount
	onMount(() => {
		heroImages.forEach((src) => {
			const img = new Image();
			img.src = src;
		});
	});

	// Fade to black on last step: map the last ~15% of scroll progress to 0-1 fade
	let heroFadeProgress = $derived(() => {
		if (heroStep !== 4) return 0; // Only fade on last image
		// Start fading at 85% scroll progress, fully black at 100%
		const fadeStart = 0.85;
		const fadeEnd = 1.0;
		if (heroScrollProgress < fadeStart) return 0;
		return Math.min(1, (heroScrollProgress - fadeStart) / (fadeEnd - fadeStart));
	});

	let evictionStep = $state(0);
	let mapStep = $state(0);
	let mapScrollProgress = $state(0);
	let noticeStep = $state(0);
	let notificationsTriggered = $state(false);

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
	<!-- Preload stadium images (larger files that need early fetching) -->
	<link rel="preload" as="image" href="/images/assam-evictions/image3.jpg" />
	<link rel="preload" as="image" href="/images/assam-evictions/image4.jpg" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="article-container">
	<!-- Hero Section with fading background images -->
	<ScrollySection
		bind:activeStep={heroStep}
		steps={heroSteps}
		backgroundColor="#000000"
		showTextBoxes={true}
		textBoxVariant="light"
		onScrollProgress={(p) => (heroScrollProgress = p)}
	>
		{#snippet children({ activeStep })}
			<HeroVisualization currentImage={currentHeroImage} fadeProgress={heroFadeProgress()} useContain={useContainMode} />
		{/snippet}
	</ScrollySection>

	<!-- Maiful Naysa Introduction -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					Maiful Naysa, 65, says her family received an eviction notice in November and were given a month to respond. Before dawn, just a day after the deadline, bulldozers arrived.
				</p>

				<blockquote>
					"At five in the morning, while we were sleeping, three JCBs came and started demolishing our house."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Eviction Data Visualization -->
	<ScrollySection
		bind:activeStep={evictionStep}
		steps={evictionSteps}
		backgroundColor="#0a0a0a"
	>
		{#snippet children({ activeStep })}
			<EvictionScrolly {activeStep} />
		{/snippet}
	</ScrollySection>

	<!-- Background Section -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">Background</h2>

			<div class="prose-content">
				<p>
					Behind these numbers is a state with a long, contested history of deciding who belongs. Assam sits at a volatile crossroads, bordered by Bangladesh to the west, Bhutan to the north, and surrounded by six other Indian states. It is one of India's most ethnically diverse regions, home to dozens of Indigenous communities, tribal groups, and migrant populations. For decades, the question of who truly belongs here has defined its politics. Indigenous Assamese communities (both Hindu and Muslim) have long feared being culturally and demographically overwhelmed, particularly by Bengali-speaking Muslims. That anxiety has been systematically exploited. Under the BJP, which came to power in Assam in 2016, it became policy.
				</p>

				<p>
					Assam lies along the Brahmaputra, one of the world's largest rivers. Every monsoon season, it floods, swallowing villages and forcing families to rebuild from scratch. Displacement here is not new. It is a way of life.
				</p>

				<p>
					Many of those now facing eviction are Miya Muslims, Bengali-speaking Muslims whose ancestors migrated from the Bengal region, parts of which is now Bangladesh, to Assam during the colonial period and settled on low-lying river islands called chars. These were marginal, flood-prone strips of land that nobody else wanted. Their forefathers had little choice. Many settled there 50 to 60 years ago after losing their original homes and farmland to the Brahmaputra's relentless erosion. Over generations, they cleared the land, farmed it, and built communities on it.
				</p>

				<p>
					The word "Miya" was once a term of respect. Today, it is used as a slur to mark Bengali-speaking Muslims as outsiders, regardless of how long they have lived in Assam or whether they hold legal citizenship documents.
				</p>

				<p>
					But since 2016, these communities have faced a different kind of uprooting: government-led eviction drives targeting what officials call "illegal encroachments". It is a label with consequences. In Myanmar, the same logic was applied to Rohingya Muslims for decades, branding an entire community as illegal immigrants on land they had lived on for generations.
				</p>

				<p>
					The Assam government frames these evictions as action against "illegal immigrants" from Bangladesh. But the story is more complicated. Many of those being displaced are Bengali-speaking Muslims whose families arrived after 1947, when Partition divided Bengal along religious lines. Some came with official permission from the government of what is now India. Others were given land by the Indian state itself, often unproductive char lands that the government was eager to have cultivated. By the time the evictions began, many had been living in Assam for 50 to 70 years.
				</p>

				<p>
					More than one third of Assam's 31 million people are Muslim &ndash; one of the highest proportions of any Indian state. That demographic reality has made Assam a focal point of a broader national shift. In recent years, the BJP-led government of Narendra Modi has faced repeated accusations of enacting laws and policies that specifically target India's <a href="https://www.aljazeera.com/news/2024/3/11/india-implements-anti-muslim-2019-citizenship-law-weeks-before-election" target="_blank" rel="noopener">200 million Muslims</a>, from the Citizenship Amendment Act, which critics say deliberately excludes Muslims from a fast-tracked citizenship pathway, to the National Register of Citizens, which left millions stateless. In Assam, these national policies have found their sharpest expression.
				</p>

				<p>
					What makes these evictions particularly troubling is that many families held Patta &ndash; official land titles issued by the Assam government &ndash; along with ration cards and voter IDs, documents that under Indian law establish legal residence and citizenship.
				</p>

				<p>
					Some Pattas dated back decades, proof that the state itself had recognised their right to the land. Yet documented cases show Patta-holders being evicted without warning, without due process, their legal papers rendered meaningless overnight.
				</p>

				<p>
					The National Register of Citizens (NRC), initiated after the right-wing BJP came to power in 2016 and concluded in 2019, was designed to identify who qualified as an Indian citizen in Assam. To be included, residents had to prove that they or their families arrived in Assam before March 24, 1971 &ndash; the eve of Bangladesh's independence from Pakistan. The final list excluded over more than million people, roughly 6% of Assam's population, who failed to meet this requirement. Many were poor. Most were Muslim. For many observers, the NRC was not an administrative exercise. It was the latest manifestation of a broader, systematic effort by the BJP government to target and disenfranchise India's Muslims, using the machinery of the state to question the citizenship of communities that have lived on Indian soil for generations.
				</p>

				<p>
					The process was not free from error or bias. Legitimate citizens were excluded on the basis of technical errors, spelling mistakes, and documentation challenges. Several detention centres were established, including India's largest dedicated detention centre opened in Goalpara designed to house up to 3,500 people. In some cases, children were separated from their parents. For many of the evicted, there is literally nowhere legal to go.
				</p>
			</div>
		</div>
	</section>

	<!-- Zain-ul-Abadin Testimony -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					For Zain-ul-Abadin, a 43-year-old resident of Uriamghat in Assam's Golaghat district, the eviction represents more than the loss of a home. He says his family was among those encouraged by the Assam government to settle in the late 1970s in a border belt along Nagaland, then considered a disputed zone. The Assam-Nagaland border has been contested since Nagaland was carved out of Assam in 1963, with both states claiming ownership of a stretch of reserved forests known as the Disputed Area Belt. The long-running land dispute has triggered repeated bouts of violent clashes over the decades. Two major confrontations in 1979 and 1985 left more than 100 people dead. In the 1970s, the Assam government settled landless communities in this zone as part of a strategy to strengthen its territorial claims. According to Zain-ul-Abadin, his family was part of that policy. Now, decades later, the same government is demolishing the settlement it once built.
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

	<!-- Eviction Notices Mosaic -->
	<ScrollySection
		bind:activeStep={noticeStep}
		steps={noticeSteps}
		backgroundColor="#0a0a0a"
		showTextBoxes={false}
	>
		{#snippet children({ activeStep })}
			<NoticeMosaic {activeStep} {notices} backgroundColor="#0a0a0a" />
		{/snippet}
	</ScrollySection>

	<!-- Abdul Barik Testimony -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					In the early hours of July 12, 2025, the Asadubi Revenue Village, a community that had stood for over seven decades, was met with the mechanical roar of bulldozers. Among the 1,080 families displaced was Abdul Barik, a man who insists that his presence there was not an act of "encroachment," but a matter of documented rights.
				</p>

				<blockquote>
					"Our village is 70-75 years old. It was not forest land; it was Pattaland. We showed our documents to the District Officer, but they were rejected. It was written in the papers that this land is 'not indigenous' and reserved for public development."
				</blockquote>

				<blockquote>
					"Nearly 60 bulldozers came early morning around 6am and bulldozed our village, including our houses."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Bulldozer Justice Section -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">"Bulldozer justice"</h2>

			<div class="prose-content">
				<p>
					In India, the yellow JCB bulldozer has taken on a meaning far beyond its function as a machine. Since 2017, the brand name has become almost generic in the country &ndash; used interchangeably with "bulldozer", especially during state-led demolition drives that critics say bypass due process. Amnesty International verified at least <a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">33 instances</a> of JCB equipment being used in what it described as punitive demolitions of Muslim properties across five states.
				</p>

				<p>
					The practice has acquired its own name: "<a href="https://www.bbc.com/news/articles/c0k8d3ynvzxo" target="_blank" rel="noopener">bulldozer justice</a>", a term used for demolitions that are openly celebrated by BJP leaders and their supporters. Amnesty International had described JCB as the "<a href="https://www.amnesty.org/en/latest/news/2024/02/india-authorities-must-immediately-stop-unjust-targeted-demolition-of-muslim-properties/" target="_blank" rel="noopener">brand of choice in a hate campaign against the minority community</a>". Over time, the yellow excavator itself has become a potent political symbol for the use of demolitions as a show of state power against marginalized communities.
				</p>

				<p>
					<a href="https://www.ohchr.org/en/press-releases/2025/06/india-must-halt-arbitrary-demolitions-targeting-minorities-and-marginalised" target="_blank" rel="noopener">Rights groups</a> and <a href="https://www.codastory.com/authoritarian-tech/india-bulldozers-muslim-neighborhoods/" target="_blank" rel="noopener">legal scholars</a> often draw parallels between India's "bulldozer justice" and Israel's long-standing practice of demolishing Palestinian homes in the occupied territories. Since 1948, Israel has used home demolitions as a central tool of displacement against Palestinians, demolishing more than <a href="https://www.palestineportal.org/learn-teach/key-issues/home-demolitions/" target="_blank" rel="noopener">26,000 homes since 1967</a> alone. The justification is almost always the same: illegal construction, encroachment, or a bureaucratic infraction.
				</p>
			</div>
		</div>
	</section>

	<!-- CM Rhetoric Section -->
	<section class="content-section">
		<div class="content-container">
			<div class="prose-content">
				<p>
					The language driving these evictions in Assam has been sharply polarising. Chief Minister Himanta Biswa Sarma has a long record of Islamophobic rhetoric, frequently framing Bengali-speaking Muslims as "Bangladeshi encroachers" and a demographic threat to justify the state's aggressive displacement policies.
				</p>

				<p>
					This reached a violent peak in February 2026, when the Assam BJP's official X account posted a <a href="https://x.com/MahuaMoitra/status/2020444649857351865" target="_blank" rel="noopener">video</a> of an AI-generated Sarma aiming and firing a rifle at Muslims, captioned "point blank shot". Though deleted after a massive outrage by the public and opposition leaders, who warned it was a direct incitement to violence against minorities.
				</p>

				<p>
					Concerns about the chief minister's language have also been raised by a group of more than 180 scholars, lawyers, and activists who issued a joint <a href="https://thewire.in/communalism/himanta-government-policies-hallmarks-ethnic-cleansing-statement" target="_blank" rel="noopener">statement</a> condemning Sarma's relentless "hateful and divisive" remarks, warning that such state-led rhetoric fundamentally threatens constitutional rights and the safety of minority rights.
				</p>
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
					Assam's BJP government, led by Chief Minister Himanta Biswa Sarma, appeared unmoved.
				</p>

				<p>
					Between late 2024 and mid-2025, the state proceeded with mass evictions in Muslim-majority areas &ndash; demolitions that would lead India's highest court to issue two contempt notices against the Assam government, one in <a href="https://www.deccanchronicle.com/nation/assam-govt-gets-contempt-notice-from-supreme-court-for-bulldozer-action-1827032" target="_blank" rel="noopener">September 2024</a> and another in <a href="https://lawbeat.in/news-updates/supreme-court-issues-notice-on-contempt-plea-against-assams-goalpara-demolitions-1513859" target="_blank" rel="noopener">July 2025</a>.
				</p>

				<p>
					But Assam was not alone in defying judicial authority. In April 2022, the Supreme Court had to issue its <a href="https://www.thehindu.com/news/cities/Delhi/supreme-court-halts-eviction-drive-in-delhis-jahangirpuri/article65337761.ece" target="_blank" rel="noopener">order</a> twice to stop demolitions in Delhi's Jahangirpuri neighbourhood, as <a href="https://www.ndtv.com/india-news/supreme-court-halts-demolition-in-delhis-violence-hit-jahangirpuri-orders-status-quo-hearing-tomorrow-2902922" target="_blank" rel="noopener">bulldozers kept moving</a> for an hour after the first order. In November 2024, the <a href="https://www.bbc.com/news/articles/c0k8d3ynvzxo" target="_blank" rel="noopener">court</a> issued what was widely described as a landmark, categorical ban on bulldozer justice across India. The 12 months that followed were marked by demolition drives across states, revealing a distinctly different reality on the ground.
				</p>

				<p>
					In Gujarat, thousands of homes in Muslim-majority settlements around Ahmedabad's Chandola Lake were <a href="https://article-14.com/post/the-hunt-for-bangladeshis-thousands-of-muslims-homeless-2-months-after-vast-gujarat-demolition-688fd625e41f6" target="_blank" rel="noopener">demolished in 2025</a> in a campaign framed as a crackdown on "illegal Bangladeshis", leaving families homeless for months.
				</p>

				<p>
					The bulldozers continued to roll, raising a fundamental question about the limits of judicial authority when state power refuses to yield.
				</p>
			</div>

			<!-- Contempt Timeline -->
			<div class="contempt-timeline">
				<div class="contempt-event">
					<span class="contempt-date">Nov 2024</span>
					<span class="contempt-desc">Supreme Court issues landmark ban on bulldozer justice</span>
				</div>
				<div class="contempt-event">
					<span class="contempt-date">Sep 2024</span>
					<span class="contempt-desc">First contempt notice against Assam government</span>
				</div>
				<div class="contempt-event">
					<span class="contempt-date">Jul 2025</span>
					<span class="contempt-desc">Second contempt notice against Assam government</span>
				</div>
			</div>
		</div>
	</section>

	<!-- Content Section: The Violence -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Violence</h2>

			<div class="prose-content">
				<p>At least 10 people have been killed during eviction drives since the BJP came to power in 2016.</p>

				<div class="timeline-events">
					<div class="event">
						<p class="event-date">September 21, 2016 &mdash; <a href="https://www.ndtv.com/guwahati-news/two-dead-as-eviction-drive-near-kaziranga-national-park-turns-violent-1460443" target="_blank" rel="noopener">Near Kaziranga National Park</a>, Nagaon district (2)</p>
						<p>Two killed during a violent eviction drive.</p>
					</div>
					<div class="event">
						<p class="event-date">March 11, 2019 &mdash; <a href="https://www.aljazeera.com/news/2019/3/25/in-indias-assam-muslim-families-evicted-weeks-before-elections" target="_blank" rel="noopener">Hojai district</a> (1)</p>
						<p>Heavily pregnant Kulsuma Begum succumbed to her injuries.</p>
					</div>
					<div class="event">
						<p class="event-date">September 23, 2021 &mdash; <a href="https://indianexpress.com/article/north-east-india/assam/assam-eviction-violence-two-deaths-clashes-7532641/" target="_blank" rel="noopener">Dhalpur, Darrang</a> (2)</p>
						<p>Moinul Haque (28) and Sheikh Farid (12) killed by police firing. 20 injured.</p>
					</div>
					<div class="event">
						<p class="event-date">April 1, 2022 &mdash; <a href="https://www.youtube.com/watch?v=t2xSk2iULO8" target="_blank" rel="noopener">Purana Bazar, Hojai</a> (1)</p>
						<p>One person died amid eviction for flyover construction.</p>
					</div>
					<div class="event">
						<p class="event-date">July 17&ndash;18, 2023 &mdash; <a href="https://indianexpress.com/article/north-east-india/assam/woman-shot-dead-6-including-3-guards-injured-clash-assam-wildlife-sanctuary-8844594/" target="_blank" rel="noopener">Burha Chapori Wildlife Sanctuary</a>, Sonitpur (1)</p>
						<p>Rahima Khatun was shot dead by forest officials during clashes after eviction.</p>
					</div>
					<div class="event">
						<p class="event-date">September 12, 2024 &mdash; <a href="https://www.newindianexpress.com/nation/2024/Sep/12/two-muslims-killed-after-police-opened-fire-at-villagers-during-eviction-drive-in-assams-sonapur" target="_blank" rel="noopener">Kachutali, Sonapur</a> (2)</p>
						<p>Haidar Ali (19) and Jubahir Ali (18) killed, 33 injured during "tribal belt protection" eviction.</p>
					</div>
					<div class="event">
						<p class="event-date">July 17, 2025 &mdash; <a href="https://www.newindianexpress.com/nation/2025/Jul/17/eviction-drive-in-assams-goalpara-turns-violent-one-killed-in-police-firing" target="_blank" rel="noopener">Paikan Reserve Forest, Goalpara</a> (1)</p>
						<p>Shakaur Ali killed and several injured during forest eviction clearance.</p>
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
			bind:activeStep={mapStep}
			steps={mapSteps}
			backgroundColor="#0d0d0d"
			textBoxPosition="left"
			firstStepOffset={0.5}
			onScrollProgress={(p) => (mapScrollProgress = p)}
		>
			{#snippet children({ activeStep })}
				<MapScrolly {activeStep} fadeProgress={mapFadeProgress()} fadeOutProgress={mapFadeOutProgress()} />
			{/snippet}
		</ScrollySection>
	</div>

	<!-- Transition Gallery - Demolition Images -->
	<DemolitionGallery />

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
					<li><strong>The Present:</strong> A plastic tent, no income, and the nightly terror of wild elephants.</li>
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
					The government's stated purpose: clearing land for an Adani Power Ltd thermal plant &ndash; a 3,200 megawatt facility representing a <a href="https://www.adani.com/newsroom/media-releases/adani-to-invest-rs-63000-cr-in-transformative-energy-projects-in-assam" target="_blank" rel="noopener">USD 5.6 billion investment</a>. Weeks earlier, the Geological Survey of India reported <a href="https://www.indiatodayne.in/assam/story/assam-makes-history-with-first-iron-ore-find-in-dhubri-unlocking-industrial-potential-1247986-2025-07-21" target="_blank" rel="noopener">18.29 million tonnes of iron</a> ore in the same area. Adani Group is one of India's most powerful conglomerates, with interests spanning energy, ports, mining, and infrastructure, and has expanded rapidly over the past decade alongside the country's infrastructure push. Opposition parties and critics have repeatedly questioned Gautam Adani, the founder of the Adani Group, about his proximity to Modi, though both the company and the government deny any preferential treatment. Adani is the second richest Asian, with a net worth of $66.6 billion.
				</p>

				<p>
					In February 2025, the Assam government held its Advantage Assam 2.0 investment summit. Since then, land has been allocated to major corporations including Adani, Patanjali, Reliance Industries, and Vedanta for industrial and agricultural projects.
				</p>

				<p>
					In <a href="https://nenow.in/north-east-news/assam/tribal-groups-flag-large-scale-corporate-land-transfers-in-assams-karbi-anglong-and-dima-hasao.html" target="_blank" rel="noopener">Karbi Anglong and Dima Hasao</a>, tribal organisations say more than 11,000 acres have been transferred for industrial projects, threatening 20,000&ndash;25,000 tribal families. Similar patterns emerged after the 2021 Gorukhuti evictions displaced 1,400 families, where land cleared for "agriculture" later fell within <a href="https://assamtribune.com/north-east/northeast-identified-as-new-hotspots-for-rare-earth-critical-minerals-gsi-1582932" target="_blank" rel="noopener">mineral exploration zones</a>.
				</p>

				<p>
					Questions about where cleared land ultimately goes are not new. A 2021 <a href="https://thewire.in/government/assam-government-land-himanta-biswa-sarma-rbs-realtors" target="_blank" rel="noopener">joint investigation</a> by The Wire and The Crosscurrent reported that between 2006 and 2009, a real estate company co-founded by the chief minister's wife acquired at least 18 acres of government land in and around Guwahati through a series of transactions that appeared to contravene state land regulations. The parcels reportedly included ceiling-surplus land meant for redistribution to landless families, tribal belt land with transfer restrictions, and plots reserved for public or institutional use.
				</p>

				<p>
					The investigation found that some of these transfers took place at concessional rates or through direct allotments during a period when Himanta Biswa Sarma was serving as a senior cabinet minister in the Assam government. Land records cited in the report suggested irregularities in classification changes and eligibility criteria. The company &ndash; since renamed Vasistha Realtors &ndash; lists the chief minister's son as a shareholder. Sarma has denied any wrongdoing.
				</p>
			</div>
		</div>
	</section>

	<!-- The Displaced -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Displaced</h2>

			<div class="prose-content">
				<p>Where do 20,000 families go?</p>

				<p>
					We saw families living in makeshift shelters constructed from tarpaulin and bamboo along roadsides, on the banks of the river and at the edges of forests, sometimes dependent on NGO assistance for basic necessities. Many received no government rehabilitation, despite Assam's stated policy of providing support to the landless.
				</p>

				<p>
					Despite Zain-ul-Abaadin possessing National Register of Citizens (NRC) documents and valid voter IDs, they were met with a familiar xenophobic taunt during the drive.
				</p>

				<blockquote>
					"The police harassed us at the riverbanks and told us to 'go back to Bangladesh.' But we are not Bangladeshis. We are from Assam. We vote here. Our ancestors are from here. How do we go back to a place we have never known?"
				</blockquote>

				<p>
					Zain describes a terrifying atmosphere where the displaced are being systematically cut off from the local economy. The eviction drives reflect layered systemic marginalisation. Economically, families lose land, livelihoods, and access to welfare, pushing them into deeper precarity. Politically and socially, even documented citizens face recurring challenges to their belonging, reinforcing stigma, exclusion, and a condition of insecurity where rights exist on paper but remain fragile in practice.
				</p>

				<p>
					The most harrowing aspect of Barik's testimony is the apparent defiance of the judiciary by executive forces. Just two days before the demolition, the residents believed they had secured a lifeline from the state's highest court.
				</p>

				<blockquote>
					"We received an order from the High Court on 10 July. It said if it is necessary to evict them, the government must first arrange for their accommodation and food. The government didn't accept the court's order. They are lying to the court again and again."
				</blockquote>

				<p>
					This reflects a broader pattern in Assam's eviction drives, where the category of "indigenous" functions as a shifting benchmark, often used to undermine the land claims of Bengali-origin Muslims regardless of decades of residence or tax records.
				</p>

				<blockquote>
					"The current government refuses to follow the Constitution of India. The RSS wants to make India a Hindu state. There is no place for Muslims here."
				</blockquote>
			</div>
		</div>
	</section>

	<!-- Migration Map Placeholder -->
	<div class="content-section">
		<div class="content-container">
			<div class="visual-placeholder">
				<p>
					[VISUAL: EVICTION AREAS AND MIGRATORY FLOWS]<br/>
					<span>Map showing displacement patterns&mdash;where evicted families have moved.</span>
				</p>
			</div>
		</div>
	</div>

	<!-- Media Headlines Section -->
	<HeadlineStack {headlines} />

	<!-- Content Section: The Pattern -->
	<section class="content-section">
		<div class="content-container">
			<h2 class="content-heading">The Pattern</h2>

			<div class="prose-content">
				<p>
					Amnesty International, Human Rights Watch, and UN Special Rapporteurs have all examined what is happening in Assam.
				</p>

				<p>
					Amnesty's February 2024 report documented that evictions in Assam constitute "forced evictions" prohibited under international human rights law, finding violations of the right to adequate housing, fair trial, and non-discrimination.
				</p>

				<p>
					In June 2025, UN experts called on India to "halt arbitrary demolitions targeting minorities and marginalised communities."
				</p>

				<p>
					Last month, <a href="https://maktoobmedia.com/india/un-rights-body-flags-discrimination-against-bengali-speaking-muslims-in-assam-seeks-answers-from-india/" target="_blank" rel="noopener">UN rights experts</a> flag systematic bias and "forced displacement" of Bengali Muslims in Assam.
				</p>

				<p>
					The bulldozer has emerged as a global weapon of state oppression. In Israel-Palestine, over 55,000 Palestinian structures have been demolished since 1967 for systematic home destruction.
				</p>

				<p>
					Similar patterns have been observed in parts of India and Latin America.
				</p>

				<p>
					Paraguay forcibly evicted 3,000 people from Indigenous communities since September 2024, while Guatemala razed indigenous settlements using tactics from its civil war era.
				</p>

				<p>
					UN Special Rapporteur Balakrishnan Rajagopal noted an <a href="https://thepolisproject.com/research/un-rapporteur-balakrishnan-rajagopal-demolitions/" target="_blank" rel="noopener">"uncanny similarity"</a> between India's methods and Israel's conduct in Palestine, explaining both use bulldozers to create "chilling effects" and punish entire communities.
				</p>

				<p>
					From Assam to Gaza, from Kashmir to the Andes, the bulldozer has become more than a piece of machinery. It is a tool of displacement, used to erase marginalised communities under the guise of "development," "security," and "legality." Its practical purpose may be to clear land, but its political function is to send a message about power, belonging, and whose homes are considered disposable.
				</p>
			</div>

			<h2 class="content-heading">The Chief Minister's Words</h2>

			<div class="prose-content">
				<p>
					Throughout this period, Modi's close ally Chief Minister Himanta Biswa Sarma has characterised the evictions publicly. He has described them as necessary action against "Bangladeshi encroachers".
				</p>

				<blockquote>
					"My job is to make the <a href="https://scroll.in/article/1090396/himanta-sarmas-remarks-about-miyas-make-a-mockery-of-constitution" target="_blank" rel="noopener">Miya people suffer</a>."
					<footer>&mdash; Himanta Biswa Sarma, January 27</footer>
				</blockquote>

				<p class="additional-research">
					<em>Additional research by Mir Wafa Raseeq</em>
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
						<div class="credit-item">
							<span class="credit-role">Additional Research</span>
							<span class="credit-name">Mir Wafa Raseeq</span>
						</div>
					</div>
				</div>

				<div class="footer-column">
					<h3 class="footer-heading">
						<span class="heading-marker"></span>
						Sources
					</h3>
					<ul class="source-list">
						<li>Reuters</li>
						<li>Al Jazeera</li>
						<li>Article 14</li>
						<li>Human Rights Watch</li>
						<li>Amnesty International</li>
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
</div>

<style>
	/* Article container - dark background throughout */
	.article-container {
		background: #0a0a0a;
		min-height: 100vh;
	}

	/* Override global overflow-x: hidden which breaks position: sticky */
	:global(html), :global(body) {
		overflow-x: clip;
	}

	/* Hero header styles (rendered via step 0) */
	:global(.hero-header) {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 1rem;
	}

	:global(.hero-title) {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(2.5rem, 8vw, 5rem);
		font-weight: 600;
		letter-spacing: -0.02em;
		line-height: 1.1;
		color: #fff;
		margin: 0 0 1.5rem 0;
	}

	:global(.hero-desc) {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: clamp(1.1rem, 2.5vw, 1.35rem);
		font-weight: 300;
		line-height: 1.7;
		color: rgba(255, 255, 255, 0.9);
		max-width: 42ch;
		margin: 0 0 2rem 0;
	}

	:global(.hero-byline) {
		font-family: 'Source Sans 3', system-ui, sans-serif;
	}

	:global(.byline-label) {
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.75rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		margin: 0 0 0.5rem 0;
	}

	:global(.byline-authors) {
		color: #fff;
		font-weight: 500;
		font-size: 1.125rem;
		margin: 0;
	}

	:global(.byline-date) {
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.875rem;
		margin: 0.5rem 0 0 0;
	}

	:global(.scroll-indicator) {
		margin-top: 3rem;
	}

	:global(.scroll-indicator-track) {
		width: 1.5rem;
		height: 2.5rem;
		border: 2px solid rgba(255, 255, 255, 0.4);
		border-radius: 9999px;
		display: flex;
		justify-content: center;
		padding-top: 0.5rem;
	}

	:global(.scroll-indicator-dot) {
		width: 0.25rem;
		height: 0.5rem;
		background: rgba(255, 255, 255, 0.6);
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

	/* Content sections - dark theme */
	.content-section {
		position: relative;
		background: #0a0a0a;
		padding: 5rem 1.5rem;
	}

	.content-container {
		max-width: 42rem;
		margin: 0 auto;
	}

	.content-heading {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		font-weight: 600;
		line-height: 1.2;
		color: #ffffff;
		margin: 0 0 2rem 0;
	}

	.content-heading + .content-heading {
		margin-top: 4rem;
	}

	.prose-content {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 1.125rem;
		line-height: 1.85;
		color: rgba(255, 255, 255, 0.85);
	}

	.prose-content p {
		margin: 0 0 1.5rem 0;
	}

	.prose-content strong {
		font-weight: 600;
		color: #ffffff;
	}

	.prose-content blockquote {
		border-left: 4px solid rgba(255, 255, 255, 0.2);
		padding-left: 1.5rem;
		margin: 2rem 0;
		font-style: italic;
		color: rgba(255, 255, 255, 0.6);
	}

	/* Timeline events */
	.timeline-events {
		margin: 2rem 0;
	}

	.event {
		padding-left: 1.5rem;
		border-left: 4px solid #dc2626;
		margin-bottom: 1.5rem;
	}

	.event-date {
		font-weight: 600;
		color: #ffffff;
		margin: 0 0 0.25rem 0;
	}

	.event p:last-child {
		margin: 0;
	}

	/* Visual placeholder */
	.visual-placeholder {
		margin: 3rem 0;
		padding: 2rem;
		background: rgba(255, 255, 255, 0.05);
		border: 2px dashed rgba(255, 255, 255, 0.15);
		border-radius: 0.5rem;
		text-align: center;
	}

	.visual-placeholder p {
		font-style: italic;
		color: rgba(255, 255, 255, 0.5);
		margin: 0;
	}

	.visual-placeholder span {
		font-size: 0.875rem;
		display: block;
		margin-top: 0.5rem;
	}

	/* Footer Styles */
	.article-footer {
		position: relative;
		z-index: 10;
		background: #0a0a0a;
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
		border-top: 2px solid rgba(255, 255, 255, 0.1);
		border-bottom: 2px solid rgba(255, 255, 255, 0.1);
		text-align: center;
	}

	.pull-quote p {
		font-family: 'Playfair Display', Georgia, serif;
		font-size: clamp(1.5rem, 4vw, 2rem);
		font-weight: 500;
		font-style: italic;
		line-height: 1.4;
		color: #ffffff;
		margin: 0 0 0.75rem 0;
	}

	.pull-quote-source {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.4);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	/* Contempt timeline */
	.contempt-timeline {
		margin: 2rem 0;
		padding-left: 1.5rem;
		border-left: 2px solid rgba(255, 255, 255, 0.15);
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
		color: rgba(255, 255, 255, 0.4);
		white-space: nowrap;
		min-width: 5rem;
	}

	.contempt-desc {
		font-family: 'Source Sans 3', system-ui, sans-serif;
		font-size: 0.95rem;
		color: rgba(255, 255, 255, 0.7);
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
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		color: rgba(255, 255, 255, 0.85);
		font-size: 1.125rem;
		line-height: 1.85;
	}

	.before-after-list li strong {
		color: #ffffff;
	}

	/* Additional research credit */
	.additional-research {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		color: rgba(255, 255, 255, 0.5);
		font-size: 0.95rem;
	}
</style>
