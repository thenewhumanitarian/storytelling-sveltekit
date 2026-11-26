<script lang="ts">
	/*
	 * Landing page for "The climate cost of conflict", in the full-bleed look of the wall prototype
	 * at /climate but without the live wall: the photos rotate behind the page, Jessica's project
	 * text sits on it, with the webinar, Tammam's letter (placeholder) and "Get in touch" beside it.
	 * "Get in touch" opens the private tips form in a panel.
	 */
	import { onMount, untrack } from 'svelte';
	import { Dialog } from 'bits-ui';
	import { prefersReducedMotion } from 'svelte/motion';
	import SharePopover from '../SharePopover.svelte';
	import NewsletterSignup from '../NewsletterSignup.svelte';
	import GetInvolvedForm from '../GetInvolvedForm.svelte';
	import { backdrops as photos, backdropSizes } from '../backdrops';
	import type { PageProps } from './$types';

	// Tammam's portrait: square, black and white (made with sharp from his author photo).
	const portraitFiles = import.meta.glob<string>(
		'$lib/assets/climate/people/tammam-*.{avif,webp}',
		{
			eager: true,
			query: '?url',
			import: 'default'
		}
	);
	const portraitSet = (format: 'avif' | 'webp') =>
		[96, 160, 240, 300]
			.map((w) => `${portraitFiles[`/src/lib/assets/climate/people/tammam-${w}.${format}`]} ${w}w`)
			.join(', ');
	const portrait = {
		avif: portraitSet('avif'),
		webp: portraitSet('webp'),
		src: portraitFiles['/src/lib/assets/climate/people/tammam-160.webp'],
		placeholder:
			'data:image/webp;base64,UklGRmQAAABXRUJQVlA4IFgAAADwAQCdASoQABAAA4BaJaQAApMjxvszj4AA/ulCm0RmKhDJ6Z69fq4dk1sDXD6ddwl9BbEcrXz4XGu2J1RNeWyAUUVQu471pZKTpXu16icTG+pYcrL0wAAA'
	};
	let portraitLoaded = $state(false);

	// Calls back once an image has loaded, including one that finished before hydration.
	function whenLoaded(img: HTMLImageElement, done: () => void) {
		const check = () => img.naturalWidth && done();
		if (img.complete) check();
		img.addEventListener('load', check);
		return { destroy: () => img.removeEventListener('load', check) };
	}

	// The cards column sticks while the text scrolls; when it's taller than the window it sticks
	// by its bottom edge instead, so every card can still be reached.
	let cardsHeight = $state(0);

	let { data, form }: PageProps = $props();

	// The webinar page. After 4 December, point the card at the recording (see the card below).
	const eventUrl =
		'https://www.thenewhumanitarian.org/events/hidden-climate-costs-militarisation-and-conflict';
	// Tammam's letter/op-ed: shown as "coming soon" until there is a link.
	const letterUrl: string | null = null;

	// Slideshow: starts on the photo the server picked, fades to the next every 25 seconds, and
	// only fetches a photo once the one before it has loaded.
	const first = untrack(() =>
		Math.min(photos.length - 1, Math.floor(data.photoSeed * photos.length))
	);
	let current = $state(first);
	let previous = $state(-1);
	let mounted = $state(photos.map((_, index) => index === first));
	let loaded = $state(photos.map(() => false));
	const credit = $derived(photos[current].credit);

	function slideImage(img: HTMLImageElement, index: number) {
		const done = () => {
			if (img.naturalWidth) loaded[index] = true;
		};
		if (img.complete) done();
		img.addEventListener('load', done);
		return { destroy: () => img.removeEventListener('load', done) };
	}

	// Once the photo on screen has loaded, fetch the next one in the background.
	$effect(() => {
		if (!loaded[current]) return;
		const next = (current + 1) % photos.length;
		if (untrack(() => mounted[next])) return;
		const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 1500));
		idle(() => (mounted[next] = true));
	});

	onMount(() => {
		const timer = setInterval(() => {
			if (prefersReducedMotion.current || document.hidden) return;
			const next = (current + 1) % photos.length;
			if (!loaded[next]) return;
			previous = current;
			current = next;
		}, 25_000);
		return () => clearInterval(timer);
	});

	// Open on load when a tip was just posted without JavaScript, so its result shows.
	let tipsOpen = $state(untrack(() => Boolean(form)));
</script>

<svelte:head>
	<title>The climate cost of conflict | The New Humanitarian</title>
	<meta
		name="description"
		content="War carries a climate cost that extends far beyond the battlefield and persists long after the fighting ends. A New Humanitarian project."
	/>
	<!-- Draft for review: out of search results. -->
	<meta name="robots" content="noindex" />
	<link
		rel="preload"
		as="image"
		type="image/avif"
		imagesrcset={photos[first].avif}
		imagesizes={backdropSizes}
		fetchpriority="high"
	/>
</svelte:head>

<Dialog.Root bind:open={tipsOpen}>
	<div class="landing">
		<div class="scene" aria-hidden="true">
			{#each photos as photo, index (photo.slug)}
				{#if mounted[index]}
					<div
						class="slide"
						class:current={index === current}
						class:previous={index === previous}
						style:--focus={photo.focus}
						style:--shade={photo.shade}
					>
						<div class="placeholder" style:background-image={`url(${photo.placeholder})`}></div>
						<picture>
							<source type="image/avif" srcset={photo.avif} sizes={backdropSizes} />
							<img
								src={photo.src}
								srcset={photo.webp}
								sizes={backdropSizes}
								alt=""
								width={photo.width}
								height={photo.height}
								fetchpriority={index === first ? 'high' : 'low'}
								decoding="async"
								class:loaded={loaded[index]}
								use:slideImage={index}
							/>
						</picture>
					</div>
				{/if}
			{/each}
		</div>

		<header class="masthead">
			<div class="share">
				<SharePopover
					title="The climate cost of conflict | The New Humanitarian"
					message="The climate cost of conflict"
				/>
			</div>
			<a
				class="wordmark"
				href="https://www.thenewhumanitarian.org/"
				aria-label="The New Humanitarian home"
			>
				<img src="/images/climate/tnh-wordmark-white.svg" alt="" width="165" height="44" />
			</a>
			<Dialog.Trigger class="landing-button masthead-cta">Get in touch</Dialog.Trigger>
		</header>

		<main class="content">
			<section class="intro">
				<h1>The climate cost of conflict</h1>
				<p class="lead">
					War carries a climate cost that extends far beyond the battlefield and persists long after
					the fighting ends.
				</p>
				<div class="text">
					<p>
						Researchers estimate that militaries account for
						<a
							href="https://www.sgr.org.uk/publications/estimating-military-s-global-greenhouse-gas-emissions"
							>around 5.5 per cent of global greenhouse gas emissions</a
						>, before counting the impact of fighting itself.
					</p>
					<p>
						Yet emissions are only part of the picture. Before a war starts, the defence industry
						consumes vast natural resources to manufacture weapons, build fortifications and move
						troops and equipment. Once fighting begins, war destroys forests and other carbon
						stores, damages water systems and farmland, disrupts climate adaptation and diverts
						public money from climate action. When it ends, debris, unexploded munitions and toxic
						waste leave pollutants in soil and water for years. Rebuilding then adds further
						emissions.
					</p>
					<p>
						We often hear how climate change drives conflict. Far less is known about how conflict
						damages the climate. The New Humanitarian is bringing this hidden toll into view. Our
						project combines data, on-the-ground reporting and conversations among climate,
						humanitarian and peacebuilding experts to show what conflict is doing to the planet and
						to the people living with the consequences. Here’s what we bring:
					</p>
					<ul class="bring">
						<li>
							<strong>Data and human stories, together.</strong> Bringing data and evidence together with
							first-hand accounts from affected communities.
						</li>
						<li>
							<strong>Beyond the headline wars.</strong> Most research focuses on a few high-profile conflicts.
							We draw on our reporting from crises that rarely make the news.
						</li>
						<li>
							<strong>Beyond carbon.</strong> We look at the harms that outlast the fighting: poisoned
							water, ruined farmland, displacement and land left unusable for years.
						</li>
						<li>
							<strong>Convening expertise across disciplines and regions.</strong> Evidence and expertise
							do not consistently reach across sectors, leaving the wider consequences of conflict poorly
							understood. We bring actors together to show what we know, what remains unknown and where
							action is most needed.
						</li>
					</ul>
				</div>
			</section>

			<aside
				class="cards"
				aria-label="Webinar, letter and getting involved"
				bind:clientHeight={cardsHeight}
				style:--cards-h={`${cardsHeight}px`}
			>
				<!-- After the webinar: "Watch the webinar", "Recorded 4 December 2026", link to the recording. -->
				<div class="card">
					<span class="kicker">Webinar · 4 December 2026, 15:00 GMT</span>
					<span class="card-title">The hidden climate costs of militarisation and conflict</span>
					<span class="card-text"
						>With Benjamin Neimark, Neta Crawford and Mohammed Usrof, moderated by Philip Kleinfeld.</span
					>
					<a class="landing-button card-button" href={eventUrl}>Register now</a>
				</div>

				<div class="card letter" class:soon={!letterUrl}>
					<span class="kicker">{letterUrl ? 'Op-ed' : 'Op-ed · Coming soon'}</span>
					<div class="letter-row">
						<div class="portrait" style:background-image={`url(${portrait.placeholder})`}>
							<picture>
								<source type="image/avif" srcset={portrait.avif} sizes="4.5rem" />
								<img
									src={portrait.src}
									srcset={portrait.webp}
									sizes="4.5rem"
									alt=""
									width="72"
									height="72"
									loading="lazy"
									decoding="async"
									class:loaded={portraitLoaded}
									use:whenLoaded={() => (portraitLoaded = true)}
								/>
							</picture>
						</div>
						<div class="letter-text">
							<span class="card-title">A letter from Tammam</span>
							{#if letterUrl}
								<a class="landing-button card-button" href={letterUrl}>Read the letter</a>
							{:else}
								<span class="card-text">His letter on the project will be published here.</span>
							{/if}
						</div>
					</div>
				</div>

				<div class="card">
					<span class="kicker">Get involved</span>
					<span class="card-title">Share a tip, idea or lead</span>
					<span class="card-text"
						>The project is just getting started. If you work in this space, or have research,
						stories or ideas to share, we’d love to hear from you.</span
					>
					<Dialog.Trigger class="landing-button card-button">Get in touch</Dialog.Trigger>
				</div>

				<div class="card updates">
					<span class="kicker">Stay informed</span>
					<span class="card-text"
						>Get The New Humanitarian’s environment and disasters coverage in your inbox.</span
					>
					<NewsletterSignup />
				</div>
			</aside>

			<!-- In the grid beside the cards, so their sticky area runs to the page end. -->
			<footer class="footer">
				{#key current}
					<span class="credit"
						>Photo:
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={credit.profile} target="_blank" rel="noopener">{credit.name}</a> /
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={credit.page} target="_blank" rel="noopener">{credit.source}</a></span
					>
				{/key}
				<a href="https://www.thenewhumanitarian.org/legal/privacy-policy">Privacy</a>
			</footer>
		</main>
	</div>

	<Dialog.Portal>
		<Dialog.Overlay class="landing-overlay" />
		<Dialog.Content class="landing-dialog">
			<Dialog.Title class="visually-hidden">Get in touch</Dialog.Title>
			<Dialog.Close class="landing-close" aria-label="Close">
				<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" /></svg>
			</Dialog.Close>
			<GetInvolvedForm stamp={data.formStamp} {form} />
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-regular.woff2') format('woff2');
		font-display: swap;
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-700.woff2') format('woff2');
		font-display: swap;
		font-weight: 700;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Regular.woff2') format('woff2');
		font-display: swap;
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Bold.woff2') format('woff2');
		font-display: swap;
		font-weight: 700;
	}

	/* The site sets overflow-x: hidden on html and body, which turns body into a scroll container
	   that never scrolls and stops anything sticking. clip hides sideways overflow without that. */
	:global(html:has(.landing)),
	:global(body:has(.landing)) {
		overflow-x: clip;
		background: #1d1d1b;
	}
	.landing {
		--brand: #9f3e52;
		--brand-hover: #803244;
		--serif: 'Climate Sectra', Georgia, serif;
		--sans: 'Climate Roboto', Arial, sans-serif;
		--pad-x: clamp(1.1rem, 5vw, 5rem);
		--masthead-height: clamp(3.5rem, 8svh, 4.5rem);
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100vh;
		min-height: 100svh;
		color: #fff;
		font: 400 1rem/1.5 var(--sans);
	}
	.landing :where(h1, p) {
		margin: 0;
	}

	/* One focus style: no browser blue, a white ring only for keyboard focus. */
	.landing :global(:focus) {
		outline: none;
		box-shadow: none;
	}
	.landing :global(:focus-visible) {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	/* The photos, fixed behind the whole page and shaded towards the text. */
	.scene {
		position: fixed;
		inset: 0;
		z-index: 0;
		overflow: hidden;
		background: #1d1d1b;
	}
	.scene::after {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 3;
		background:
			linear-gradient(
				90deg,
				rgb(18 18 14 / 86%) 0%,
				rgb(18 18 14 / 70%) 42%,
				rgb(18 18 14 / 35%) 70%,
				rgb(18 18 14 / 45%) 100%
			),
			linear-gradient(180deg, rgb(18 18 14 / 25%), rgb(18 18 14 / 0%) 25%);
	}
	.slide {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 4s ease-in-out;
	}
	.slide.previous {
		z-index: 1;
		opacity: 1;
		transition: none;
	}
	.slide.current {
		z-index: 2;
		opacity: 1;
	}
	.slide::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgb(18 18 14 / calc(var(--shade, 0) * 100%));
	}
	.placeholder {
		position: absolute;
		inset: -6%;
		background-size: cover;
		background-position: var(--focus);
		filter: blur(22px);
	}
	.slide picture,
	.slide img {
		position: absolute;
		inset: 0;
	}
	.slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--focus);
		opacity: 0;
		transition: opacity 700ms ease;
	}
	.slide img.loaded {
		opacity: 1;
	}

	/* Masthead: the TNH dark bar. */
	/* Stays at the top while the page scrolls. */
	.masthead {
		position: sticky;
		top: 0;
		z-index: 5;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: var(--masthead-height);
		padding-inline: max(0.5rem, calc((var(--masthead-height) - 2.75rem) / 2));
		background: #282828;
	}
	.share {
		justify-self: start;
	}
	.wordmark img {
		display: block;
		width: clamp(7.5rem, 14vw, 10.3rem);
		height: auto;
	}
	.landing :global(.landing-button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.68rem 1.15rem;
		border: 0;
		border-radius: 0;
		background: var(--brand);
		color: #fff;
		font: 700 0.93rem/1.3 var(--sans);
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	.landing :global(.landing-button:hover) {
		background: var(--brand-hover);
	}
	.landing :global(.masthead-cta) {
		justify-self: end;
		min-height: 2.75rem;
	}

	/* Content: the text on the left, the cards beside it. */
	.content {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: minmax(0, 40rem) minmax(17rem, 23rem);
		justify-content: space-between;
		align-items: start;
		gap: 2.5rem clamp(2rem, 5vw, 5rem);
		padding: clamp(1.25rem, 3.5vh, 2.5rem) var(--pad-x) 1.5rem;
		text-shadow: 0 1px 10px rgb(0 0 0 / 35%);
	}
	h1 {
		/* Pull the large type up by its built-in top space, so the letters line up with the first card. */
		margin-top: -0.12em;
		font: 700 clamp(2.6rem, 6vw, 4.6rem) / 1 var(--serif);
		letter-spacing: -0.025em;
		text-wrap: balance;
	}
	.lead {
		margin-top: 1rem;
		max-width: 34rem;
		font-size: clamp(1.05rem, 1.6vw, 1.2rem);
		font-weight: 700;
		line-height: 1.45;
	}
	.text {
		margin-top: 1.4rem;
		color: rgb(255 255 255 / 88%);
		font-size: 0.97rem;
		line-height: 1.6;
	}
	.text p + p {
		margin-top: 0.85rem;
	}
	.text a {
		color: #fff;
		font-weight: 700;
		text-decoration: underline;
		text-decoration-color: rgb(255 255 255 / 45%);
		text-underline-offset: 0.2em;
	}
	.text a:hover {
		text-decoration-color: #fff;
	}
	.bring {
		display: grid;
		gap: 0.7rem;
		margin: 0.9rem 0 0;
		padding: 0;
		list-style: none;
	}
	.bring li {
		padding-left: 0.9rem;
		border-left: 3px solid var(--brand);
	}
	.bring strong {
		color: #fff;
	}

	/* Cards: dark glass, like the wall's panels. */
	.intro {
		grid-column: 1;
		grid-row: 1;
	}
	.cards {
		grid-column: 2;
		grid-row: 1 / span 2;
		position: sticky;
		top: min(calc(var(--masthead-height) + 1.5rem), calc(100svh - var(--cards-h, 0px) - 1.5rem));
		display: grid;
		gap: 0.85rem;
	}
	.card {
		display: grid;
		gap: 0.35rem;
		padding: 1.05rem 1.15rem 1.15rem;
		border-radius: 0;
		background:
			linear-gradient(160deg, rgb(255 255 255 / 14%), rgb(255 255 255 / 4%) 60%),
			rgb(30 30 28 / 70%);
		backdrop-filter: blur(18px) saturate(150%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 35%),
			0 18px 50px rgb(0 0 0 / 35%);
		color: #fff;
		text-decoration: none;
		text-shadow: none;
	}
	/* Label across the top like the other cards; portrait and title side by side, top-aligned. */
	.letter-row {
		display: grid;
		grid-template-columns: 4.5rem minmax(0, 1fr);
		align-items: start;
		gap: 1rem;
		margin-top: 0.3rem;
	}
	.letter-text {
		display: grid;
		gap: 0.35rem;
	}
	/* The one round element in the cards: an author portrait. */
	.portrait {
		position: relative;
		width: 4.5rem;
		height: 4.5rem;
		overflow: hidden;
		border-radius: 50%;
		background-size: cover;
		box-shadow: 0 0 0 1px rgb(255 255 255 / 25%);
	}
	.portrait img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: cover;
		opacity: 0;
		transition: opacity 500ms ease;
	}
	.portrait img.loaded {
		opacity: 1;
	}
	.kicker {
		color: #9fe0c4;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.card-title {
		font: 700 1.25rem/1.2 var(--serif);
	}
	.card-text {
		color: rgb(255 255 255 / 82%);
		font-size: 0.9rem;
		line-height: 1.45;
	}
	.soon .card-title,
	.soon .card-text {
		opacity: 0.85;
	}
	.landing :global(.card-button) {
		justify-self: start;
		margin-top: 0.5rem;
	}
	.updates :global(form) {
		margin-top: 0.4rem;
	}

	.footer {
		grid-column: 1;
		grid-row: 2;
		align-self: end;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.4rem;
		padding-top: 1rem;
		text-shadow: none;
		color: rgb(255 255 255 / 75%);
		font-size: 0.8rem;
	}
	.footer a {
		color: inherit;
	}
	.footer a:hover {
		color: #fff;
	}
	.credit {
		animation: credit-in 900ms ease;
	}
	@keyframes credit-in {
		from {
			opacity: 0;
		}
	}

	/* Get in touch: the tips form in a panel over the page. */
	:global(.landing-overlay) {
		position: fixed;
		inset: 0;
		z-index: 90;
		background: rgb(19 17 15 / 60%);
		backdrop-filter: blur(10px);
	}
	:global(.landing-dialog) {
		position: fixed;
		z-index: 91;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		width: min(44rem, calc(100vw - 2rem));
		max-height: calc(100dvh - 2rem);
		overflow-y: auto;
		overscroll-behavior: contain;
		box-shadow: 0 30px 80px rgb(0 0 0 / 45%);
	}
	:global(.landing-dialog:focus),
	:global(.landing-dialog:focus-visible) {
		outline: none;
	}
	:global(.landing-close) {
		position: absolute;
		top: 1.1rem;
		right: 0.9rem;
		z-index: 1;
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border: 0;
		border-radius: 50%;
		background: rgb(40 40 40 / 8%);
		color: #282828;
		cursor: pointer;
	}
	:global(.landing-close:hover) {
		background: rgb(40 40 40 / 16%);
	}
	:global(.landing-close:focus) {
		outline: none;
		box-shadow: none;
	}
	:global(.landing-close:focus-visible) {
		outline: 2px solid #9f3e52;
		outline-offset: 2px;
	}
	:global(.landing-close svg) {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
	}
	:global(.visually-hidden) {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	@media (max-width: 960px) {
		.content {
			grid-template-columns: minmax(0, 42rem);
			justify-content: center;
		}
		.intro,
		.cards,
		.footer {
			grid-column: 1;
			grid-row: auto;
		}
		.cards {
			position: static;
		}
		.scene::after {
			background: linear-gradient(
				180deg,
				rgb(18 18 14 / 60%),
				rgb(18 18 14 / 72%) 40%,
				rgb(18 18 14 / 82%)
			);
		}
	}
	@media (max-width: 650px) {
		.landing :global(.masthead-cta) {
			padding: 0.5rem 0.8rem;
			font-size: 0.85rem;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.slide,
		.slide img {
			transition: none;
		}
		.credit {
			animation: none;
		}
	}
</style>
