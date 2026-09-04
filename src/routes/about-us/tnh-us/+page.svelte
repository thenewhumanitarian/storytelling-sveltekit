<script lang="ts">
	import TNHFooter from '$lib/components/TNHFooter.svelte';
	import TNHHeader from '$lib/components/TNHHeader.svelte';

	const donateHref =
		'https://www.zeffy.com/en-US/donation-form/the-new-humanitarian-us-support-journalism-that-refuses-to-look-away';
	const canonicalUrl = 'https://interactive.thenewhumanitarian.org/about-us/tnh-us';

	const boardMembers = [
		{
			name: 'H.R.H. Princess Sarah Zeid',
			role: 'President, The New Humanitarian US',
			image:
				'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-01/tnh-board--zeid.jpg.webp?itok=-Dm00i2O',
			alt: 'H.R.H. Princess Sarah Zeid',
			bio: 'A champion of maternal, newborn, child and adolescent health, Princess Sarah has led advocacy and policy work across humanitarian and fragile settings.'
		},
		{
			name: 'Christina Vrachnos',
			role: 'Board member',
			image:
				'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-01/tnh-board--christina.jpg.webp?itok=7-ACr27l',
			alt: 'Christina Vrachnos',
			bio: 'A multilingual communications strategist and storyteller with two decades of experience spanning global health, advocacy, and women’s leadership.'
		},
		{
			name: 'Jim Brady',
			role: 'Board member',
			image:
				'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-01/tnh-board--jim.jpg.webp?itok=URu9Hjh4',
			alt: 'Jim Brady',
			bio: 'A digital media leader and former Vice President of Journalism at the Knight Foundation, with deep experience supporting sustainable local news.'
		},
		{
			name: 'Craig Spencer',
			role: 'Board member',
			image:
				'https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-01/tnh-board--craig.jpg.webp?itok=ra_D9icm',
			alt: 'Craig Spencer',
			bio: 'An emergency physician and global health expert whose work focuses on humanitarian response, pandemic preparedness, and health equity.'
		}
	];
</script>

<svelte:head>
	<title>The New Humanitarian US | Support independent journalism</title>
	<meta
		name="description"
		content="Support The New Humanitarian US and independent journalism from the heart of crises. Meet our US board and learn how to make a tax-deductible donation."
	/>
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="The New Humanitarian US" />
	<meta
		property="og:description"
		content="Support independent journalism from the heart of crises through The New Humanitarian US."
	/>
	<meta property="og:url" content={canonicalUrl} />
	<meta
		property="og:image"
		content="https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-01/tnh-board--zeid.jpg.webp?itok=-Dm00i2O"
	/>
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div class="tnh-us-page">
	<a class="skip-link font-reset" href="#main-content">Skip to main content</a>
	<TNHHeader />

	<main id="main-content">
		<section class="hero" aria-labelledby="page-title">
			<div class="hero-copy">
				<p class="eyebrow eyebrow-light">The New Humanitarian US</p>
				<h1 id="page-title">Support journalism from the heart of crises.</h1>
				<p class="hero-lede">
					Your tax-deductible donation supports independent reporting with communities affected by
					crises, holds power to account, and brings vital stories to the world.
				</p>
				<a
					class="button button-light font-reset"
					href={donateHref}
					target="_blank"
					rel="noopener noreferrer">Donate to TNH US <span aria-hidden="true">↗</span></a
				>
			</div>
			<figure class="hero-media">
				<img
					src="/images/reports/our-strategy/annie-slemrod.jpg"
					alt="A journalist reporting with a camera and notebook"
					width="1080"
					height="720"
				/>
				<figcaption>Independent reporting, close to the people living through crises.</figcaption>
			</figure>
		</section>

		<section class="mission-strip" aria-label="Our mission">
			<p>
				Independent journalism is a public good. It helps people understand crises, challenges
				assumptions, and makes humanitarian action more accountable.
			</p>
		</section>

		<section id="about" class="section about-section" aria-labelledby="about-title">
			<div class="section-label">
				<p class="eyebrow">Who we are</p>
				<h2 id="about-title">About The New Humanitarian US</h2>
			</div>
			<div class="section-copy">
				<p class="large-copy">
					The New Humanitarian US is an independent nonprofit organisation registered in the United
					States. It supports The New Humanitarian’s mission to deliver quality, independent
					journalism from the heart of humanitarian crises.
				</p>
				<p>
					Our journalism is fair, rigorous, and accountable to the people most affected. We report
					from the ground, amplify a diverse range of voices, and examine how the aid sector can do
					better.
				</p>
			</div>
		</section>

		<section class="entity-section" aria-labelledby="entity-title">
			<div class="entity-intro">
				<p class="eyebrow eyebrow-light">How we are organised</p>
				<h2 id="entity-title">One mission, two independent entities</h2>
				<p>
					The New Humanitarian US and The New Humanitarian work in partnership to sustain
					independent humanitarian journalism.
				</p>
			</div>
			<div class="entity-grid">
				<article>
					<p class="entity-number">01</p>
					<h3>The New Humanitarian US</h3>
					<p>
						A US-registered 501(c)(3) nonprofit that raises funds and builds partnerships in support
						of independent humanitarian journalism.
					</p>
				</article>
				<article>
					<p class="entity-number">02</p>
					<h3>The New Humanitarian</h3>
					<p>
						The Geneva-based international nonprofit newsroom producing trusted reporting from
						crises around the world.
					</p>
				</article>
			</div>
		</section>

		<section id="board" class="section board-section" aria-labelledby="board-title">
			<div class="board-heading">
				<div>
					<p class="eyebrow">Leadership</p>
					<h2 id="board-title">Meet our US board</h2>
				</div>
				<p>
					Our board brings experience in journalism, humanitarian response, global health, and
					philanthropy to The New Humanitarian US.
				</p>
			</div>

			<div class="board-grid">
				{#each boardMembers as member, index (member.name)}
					<article class:board-featured={index === 0} class="board-member">
						<img src={member.image} alt={member.alt} width="720" height="720" loading="lazy" />
						<div class="board-member-copy">
							<p class="board-index">0{index + 1}</p>
							<h3>{member.name}</h3>
							<p class="board-role">{member.role}</p>
							<p>{member.bio}</p>
						</div>
					</article>
				{/each}
			</div>
			<a
				class="text-link font-reset"
				href="https://www.thenewhumanitarian.org/about-us/our-board"
				target="_blank"
				rel="noopener noreferrer">See the full TNH board <span aria-hidden="true">↗</span></a
			>
		</section>

		<section id="contact" class="contact-section" aria-labelledby="contact-title">
			<div class="contact-media">
				<img
					src="https://assets.thenewhumanitarian.org/s3fs-public/styles/responsive_large_2x/public/2026-08/tnh-team--amira.jpg.webp?itok=NbDj4gBS"
					alt="Amira El-Ghobashy"
					width="720"
					height="720"
					loading="lazy"
				/>
			</div>
			<div class="contact-copy">
				<p class="eyebrow eyebrow-light">Start a conversation</p>
				<h2 id="contact-title">Connect with TNH US</h2>
				<p>
					For questions about giving, institutional partnerships, or the work of The New
					Humanitarian US, contact Amira El-Ghobashy.
				</p>
				<p class="contact-name">Amira El-Ghobashy</p>
				<p class="contact-role">U.S. Partnerships Lead</p>
				<a class="button button-dark font-reset" href="mailto:amira@thenewhumanitarian.org"
					>Email Amira</a
				>
			</div>
		</section>

		<section class="donation-section" aria-labelledby="donation-title">
			<div>
				<p class="eyebrow">Make an impact</p>
				<h2 id="donation-title">Support independent humanitarian journalism</h2>
			</div>
			<div class="donation-copy">
				<p>
					Donations to The New Humanitarian US support the on-the-ground work of its partner, The
					New Humanitarian, the international nonprofit organisation based in Geneva, Switzerland.
				</p>
				<a
					class="button button-primary font-reset"
					href={donateHref}
					target="_blank"
					rel="noopener noreferrer">Make a donation <span aria-hidden="true">↗</span></a
				>
				<p class="legal-copy">
					The New Humanitarian US is a registered 501(c)(3) nonprofit organisation. Donations are
					tax-deductible to the extent permitted by law. EIN available upon request.
				</p>
			</div>
		</section>
	</main>

	<TNHFooter showNewsletter={true} showMembership={false} />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
		scroll-padding-top: 2rem;
	}

	:global(body) {
		margin: 0;
		background: #f5f3ef;
	}

	:global(.tnh-us-page *) {
		box-sizing: border-box;
		border-radius: 0;
	}

	.tnh-us-page {
		--burgundy: #9f3e52;
		--burgundy-dark: #7f3041;
		--ink: #282828;
		--paper: #f5f3ef;
		--line: #d8d3cc;
		width: 100%;
		min-height: 100vh;
		background: var(--paper);
		color: var(--ink);
		font-family: 'Roboto', 'Open Sans', sans-serif;
	}

	.skip-link {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		padding: 0.75rem 1rem;
		background: #fff;
		color: var(--ink);
		font-weight: 700;
		transform: translateY(-110%);
	}

	.skip-link:focus {
		transform: translateY(0);
	}

	.hero {
		display: grid;
		min-height: min(47rem, calc(100svh - 6.5rem));
		background: var(--ink);
		grid-template-columns: minmax(24rem, 0.88fr) minmax(0, 1.12fr);
	}

	.hero-copy {
		display: flex;
		padding: clamp(4rem, 7vw, 8rem) clamp(2rem, 6vw, 7rem);
		color: #fff;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.eyebrow {
		margin: 0 0 1.4rem;
		color: var(--burgundy);
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.15em;
		line-height: 1.3;
		text-transform: uppercase;
	}

	.eyebrow-light {
		color: #ede580;
	}

	.hero h1 {
		max-width: 10ch;
		margin: 0;
		color: #fff;
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(3.25rem, 6vw, 6.5rem);
		font-weight: 700;
		letter-spacing: -0.055em;
		line-height: 0.95;
	}

	.hero-lede {
		max-width: 36rem;
		margin: 2.25rem 0 2rem;
		color: rgb(255 255 255 / 82%);
		font-size: clamp(1.05rem, 1.6vw, 1.3rem);
		line-height: 1.65;
	}

	.hero-media {
		position: relative;
		min-height: 35rem;
		margin: 0;
		background: #111;
		overflow: hidden;
	}

	.hero-media::after {
		position: absolute;
		inset: 0;
		background: linear-gradient(90deg, rgb(40 40 40 / 25%), transparent 35%);
		content: '';
		pointer-events: none;
	}

	.hero-media img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: 56% center;
	}

	.hero-media figcaption {
		position: absolute;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: 1;
		max-width: 18rem;
		padding: 0.75rem 1rem;
		background: rgb(40 40 40 / 86%);
		color: #fff;
		font-size: 0.72rem;
		line-height: 1.45;
	}

	.button {
		display: inline-flex;
		min-height: 3.25rem;
		padding: 0.9rem 1.35rem;
		border: 2px solid transparent;
		align-items: center;
		gap: 0.65rem;
		font-size: 0.95rem;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
	}

	.button:hover {
		text-decoration: none;
	}

	.button-light {
		background: #fff;
		color: var(--ink);
	}

	.button-light:hover {
		background: #ede580;
		color: var(--ink);
	}

	.button-primary {
		background: var(--burgundy);
		color: #fff;
	}

	.button-primary:hover {
		background: var(--burgundy-dark);
		color: #fff;
	}

	.button-dark {
		background: var(--ink);
		color: #fff;
	}

	.button-dark:hover {
		background: #111;
		color: #fff;
	}

	.mission-strip {
		padding: clamp(3.5rem, 6vw, 6rem) clamp(1.5rem, 5vw, 4rem);
		background: #ede580;
	}

	.mission-strip p {
		max-width: 54rem;
		margin: 0 auto;
		font-family: 'GT Sectra Medium', Georgia, serif;
		font-size: clamp(1.8rem, 3.8vw, 3.5rem);
		letter-spacing: -0.025em;
		line-height: 1.15;
		text-align: center;
	}

	.section {
		max-width: 90rem;
		margin: 0 auto;
		padding: clamp(5rem, 9vw, 9rem) clamp(1.5rem, 6vw, 6rem);
	}

	.about-section {
		display: grid;
		gap: clamp(3rem, 7vw, 8rem);
		grid-template-columns: minmax(16rem, 0.7fr) minmax(0, 1.3fr);
	}

	.section h2,
	.entity-section h2,
	.contact-section h2,
	.donation-section h2 {
		margin: 0;
		color: var(--ink);
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(2.5rem, 5vw, 5rem);
		font-weight: 700;
		letter-spacing: -0.045em;
		line-height: 0.98;
	}

	.section-copy {
		padding-top: 2.1rem;
		border-top: 5px solid var(--burgundy);
	}

	.section-copy p {
		max-width: 45rem;
		margin: 0 0 1.5rem;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.section-copy .large-copy {
		font-family: 'GT Sectra Regular', Georgia, serif;
		font-size: clamp(1.45rem, 2.3vw, 2rem);
		line-height: 1.4;
	}

	.entity-section {
		display: grid;
		max-width: 100%;
		padding: clamp(5rem, 9vw, 9rem) max(1.5rem, calc((100vw - 78rem) / 2));
		background: var(--burgundy);
		color: #fff;
		gap: clamp(4rem, 8vw, 8rem);
		grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.2fr);
	}

	.entity-intro h2 {
		color: #fff;
	}

	.entity-intro > p:last-child {
		max-width: 33rem;
		margin: 2rem 0 0;
		color: rgb(255 255 255 / 78%);
		font-size: 1.05rem;
		line-height: 1.65;
	}

	.entity-grid {
		display: grid;
		border-top: 1px solid rgb(255 255 255 / 55%);
		grid-template-columns: 1fr 1fr;
	}

	.entity-grid article {
		padding: 2rem 2rem 0 0;
	}

	.entity-grid article + article {
		padding-right: 0;
		padding-left: 2rem;
		border-left: 1px solid rgb(255 255 255 / 55%);
	}

	.entity-number {
		margin: 0 0 4rem;
		color: #ede580;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.entity-grid h3 {
		margin: 0 0 1rem;
		color: #fff;
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.6rem, 2.3vw, 2.3rem);
		line-height: 1.1;
	}

	.entity-grid article > p:last-child {
		margin: 0;
		color: rgb(255 255 255 / 80%);
		font-size: 0.95rem;
		line-height: 1.65;
	}

	.board-section {
		max-width: 88rem;
	}

	.board-heading {
		display: grid;
		margin-bottom: clamp(3rem, 6vw, 6rem);
		gap: clamp(2rem, 6vw, 8rem);
		grid-template-columns: 1fr minmax(18rem, 0.65fr);
		align-items: end;
	}

	.board-heading > p {
		margin: 0;
		padding-top: 1.5rem;
		border-top: 1px solid var(--ink);
		font-size: 1rem;
		line-height: 1.65;
	}

	.board-grid {
		display: grid;
		margin-bottom: 2.5rem;
		gap: 3.5rem 2rem;
		grid-template-columns: repeat(3, 1fr);
	}

	.board-member {
		display: grid;
		align-content: start;
	}

	.board-member img {
		display: block;
		width: 100%;
		aspect-ratio: 1 / 1;
		background: #ddd;
		filter: grayscale(100%);
		object-fit: cover;
	}

	.board-member-copy {
		padding: 1.35rem 0 0;
		border-top: 4px solid var(--burgundy);
	}

	.board-member img + .board-member-copy {
		margin-top: 0;
	}

	.board-featured {
		grid-column: span 3;
		grid-template-columns: minmax(18rem, 0.9fr) minmax(0, 1.1fr);
	}

	.board-featured img {
		aspect-ratio: 4 / 3;
	}

	.board-featured .board-member-copy {
		padding: clamp(2rem, 5vw, 5rem);
		border-top: 0;
		border-left: 5px solid var(--burgundy);
		background: #fff;
	}

	.board-index {
		margin: 0 0 2rem;
		color: var(--burgundy);
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.12em;
	}

	.board-member h3 {
		margin: 0;
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.5rem, 2.4vw, 2.2rem);
		line-height: 1.1;
	}

	.board-role {
		margin: 0.55rem 0 1.25rem;
		color: var(--burgundy);
		font-size: 0.78rem;
		font-weight: 700;
		letter-spacing: 0.07em;
		line-height: 1.4;
		text-transform: uppercase;
	}

	.board-member-copy > p:last-child {
		margin: 0;
		font-size: 0.93rem;
		line-height: 1.65;
	}

	.board-featured .board-member-copy > p:last-child {
		max-width: 34rem;
		font-size: 1.05rem;
	}

	.text-link {
		display: inline-flex;
		padding-bottom: 0.35rem;
		border-bottom: 2px solid var(--burgundy);
		color: var(--burgundy);
		font-size: 0.9rem;
		font-weight: 700;
		gap: 0.6rem;
		text-decoration: none;
	}

	.text-link:hover {
		border-color: var(--ink);
		color: var(--ink);
		text-decoration: none;
	}

	.contact-section {
		display: grid;
		background: var(--burgundy);
		grid-template-columns: minmax(20rem, 0.82fr) minmax(0, 1.18fr);
	}

	.contact-media {
		min-height: 38rem;
		background: #ddd;
	}

	.contact-media img {
		display: block;
		width: 100%;
		height: 100%;
		filter: grayscale(100%);
		object-fit: cover;
	}

	.contact-copy {
		display: flex;
		padding: clamp(4rem, 8vw, 8rem);
		color: #fff;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
	}

	.contact-copy h2 {
		max-width: 8ch;
		color: #fff;
	}

	.contact-copy > p:nth-of-type(2) {
		max-width: 35rem;
		margin: 2rem 0 2.5rem;
		color: rgb(255 255 255 / 82%);
		font-size: 1.05rem;
		line-height: 1.65;
	}

	.contact-name {
		margin: 0 0 0.25rem;
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: 1.35rem;
	}

	.contact-role {
		margin: 0 0 2rem;
		color: rgb(255 255 255 / 72%);
		font-size: 0.85rem;
	}

	.donation-section {
		display: grid;
		max-width: 90rem;
		margin: 0 auto;
		padding: clamp(5rem, 9vw, 9rem) clamp(1.5rem, 6vw, 6rem);
		gap: clamp(3rem, 8vw, 9rem);
		grid-template-columns: minmax(18rem, 1fr) minmax(0, 0.85fr);
	}

	.donation-copy {
		padding-top: 2rem;
		border-top: 5px solid var(--burgundy);
	}

	.donation-copy > p:first-child {
		margin: 0 0 2rem;
		font-size: 1.05rem;
		line-height: 1.7;
	}

	.legal-copy {
		margin: 1.75rem 0 0;
		color: #67635e;
		font-size: 0.76rem;
		font-style: italic;
		line-height: 1.55;
	}

	:global(.tnh-us-page a:focus-visible),
	:global(.tnh-us-page summary:focus-visible) {
		outline: 3px solid #ede580;
		outline-offset: 4px;
	}

	@media (max-width: 1000px) {
		.hero {
			min-height: auto;
			grid-template-columns: 1fr;
		}

		.hero-copy {
			min-height: 36rem;
		}

		.hero-media {
			min-height: 34rem;
		}

		.about-section,
		.entity-section,
		.donation-section {
			gap: 3rem;
			grid-template-columns: 1fr;
		}

		.board-heading {
			grid-template-columns: 1fr;
		}

		.contact-copy {
			padding: 5rem 3rem;
		}
	}

	@media (max-width: 720px) {
		.hero-copy {
			min-height: 33rem;
			padding: 4.5rem 1.5rem;
		}

		.hero h1 {
			font-size: clamp(3.1rem, 15vw, 4.9rem);
		}

		.hero-media {
			min-height: 29rem;
		}

		.hero-media figcaption {
			right: 1rem;
			bottom: 1rem;
			left: 1rem;
		}

		.section {
			padding-right: 1.5rem;
			padding-left: 1.5rem;
		}

		.entity-section {
			padding-right: 1.5rem;
			padding-left: 1.5rem;
		}

		.entity-grid {
			grid-template-columns: 1fr;
		}

		.entity-grid article,
		.entity-grid article + article {
			padding: 1.5rem 0 2.5rem;
			border-left: 0;
		}

		.entity-grid article + article {
			border-top: 1px solid rgb(255 255 255 / 55%);
		}

		.entity-number {
			margin-bottom: 2rem;
		}

		.board-grid {
			grid-template-columns: 1fr;
		}

		.board-featured {
			grid-column: auto;
			grid-template-columns: 1fr;
		}

		.board-featured img {
			aspect-ratio: 1 / 1;
		}

		.board-featured .board-member-copy {
			padding: 1.5rem 0 0;
			border-top: 4px solid var(--burgundy);
			border-left: 0;
			background: transparent;
		}

		.contact-section {
			grid-template-columns: 1fr;
		}

		.contact-media {
			min-height: auto;
		}

		.contact-media img {
			aspect-ratio: 1 / 1;
		}

		.contact-copy {
			padding: 4.5rem 1.5rem;
		}

		.donation-section {
			padding-right: 1.5rem;
			padding-left: 1.5rem;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.button,
		.text-link {
			transition:
				background 160ms ease,
				color 160ms ease,
				border-color 160ms ease;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) {
			scroll-behavior: auto;
		}
	}
</style>
