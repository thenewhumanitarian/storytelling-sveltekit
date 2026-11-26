<script lang="ts">
	/*
	 * Landing page for "The climate cost of conflict": a calm page people can find during and after
	 * the webinar. The project text sits on the page, with links to the webinar recording and
	 * Tammam's letter, a private form for tips and ideas, and the newsletter signup.
	 *
	 * Plain markup and CSS on purpose, so it could move to Drupal: only the tips form (a SvelteKit
	 * action) and the photo picker would need an equivalent there.
	 * A draft for review next to the conversation-wall prototype at /climate; the real page may be
	 * built in Drupal (see docs/climate/landing-drupal.html for a paste-ready version).
	 */
	import { untrack } from 'svelte';
	import { enhance } from '$app/forms';
	import SharePopover from '../SharePopover.svelte';
	import NewsletterSignup from '../NewsletterSignup.svelte';
	import { backdrops } from '../backdrops';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// The recording is expected on the event page once the webinar has run.
	const recordingUrl =
		'https://www.thenewhumanitarian.org/events/hidden-climate-costs-militarisation-and-conflict';
	// Not published yet: shown as "coming soon" until there is a link.
	const letterUrl: string | null = null;

	const photo = untrack(
		() => backdrops[Math.min(backdrops.length - 1, Math.floor(data.photoSeed * backdrops.length))]
	);

	let sending = $state(false);
	let sent = $state(false);
</script>

<svelte:head>
	<title>The climate cost of conflict | The New Humanitarian</title>
	<!-- Draft for review: out of search results. -->
	<meta name="robots" content="noindex" />
	<meta
		name="description"
		content="War carries a climate cost that extends far beyond the battlefield and persists long after the fighting ends. A New Humanitarian project."
	/>
	<link
		rel="preload"
		as="image"
		type="image/avif"
		imagesrcset={photo.avif}
		imagesizes="100vw"
		fetchpriority="high"
	/>
</svelte:head>

<div class="landing">
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
		<a class="masthead-cta" href="#get-involved">Share a tip</a>
	</header>

	<section class="hero" style:--focus={photo.focus} style:--shade={photo.shade}>
		<div class="backdrop" aria-hidden="true">
			<div class="placeholder" style:background-image={`url(${photo.placeholder})`}></div>
			<picture>
				<source type="image/avif" srcset={photo.avif} sizes="100vw" />
				<img
					src={photo.src}
					srcset={photo.webp}
					sizes="100vw"
					alt=""
					width={photo.width}
					height={photo.height}
					fetchpriority="high"
					decoding="async"
				/>
			</picture>
		</div>
		<div class="hero-text">
			<p class="eyebrow">A New Humanitarian project</p>
			<h1>The climate cost of conflict</h1>
			<p class="lead">
				War carries a climate cost that extends far beyond the battlefield and persists long after
				the fighting ends.
			</p>
			<div class="actions">
				<a class="button" href={recordingUrl} target="_blank" rel="noopener"
					>Watch the webinar recording</a
				>
				{#if letterUrl}
					<a class="button ghost" href={letterUrl}>Read Tammam’s letter</a>
				{:else}
					<span class="button ghost soon" aria-disabled="true"
						>Read Tammam’s letter <em>Coming soon</em></span
					>
				{/if}
			</div>
		</div>
		<p class="credit">
			Photo: {photo.alt}.
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={photo.credit.profile} target="_blank" rel="noopener">{photo.credit.name}</a> /
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
			<a href={photo.credit.page} target="_blank" rel="noopener">{photo.credit.source}</a>
		</p>
	</section>

	<main class="content">
		<article class="story">
			<p>
				Researchers estimate that militaries account for
				<a
					href="https://www.sgr.org.uk/publications/estimating-military-s-global-greenhouse-gas-emissions"
					>around 5.5 per cent of global greenhouse gas emissions</a
				>, before counting the impact of fighting itself.
			</p>
			<p>
				Yet emissions are only part of the picture. Before a war starts, the defence industry
				consumes vast natural resources to manufacture weapons, build fortifications and move troops
				and equipment. Once fighting begins, war destroys forests and other carbon stores, damages
				water systems and farmland, disrupts climate adaptation and diverts public money from
				climate action. When it ends, debris, unexploded munitions and toxic waste leave pollutants
				in soil and water for years. Rebuilding then adds further emissions.
			</p>
			<p>
				We often hear how climate change drives conflict. Far less is known about how conflict
				damages the climate. The New Humanitarian is bringing this hidden toll into view. Our
				project combines data, on-the-ground reporting and conversations among climate, humanitarian
				and peacebuilding experts to show what conflict is doing to the planet and to the people
				living with the consequences.
			</p>

			<h2>What we bring</h2>
			<ul class="bring">
				<li>
					<strong>Data and human stories, together.</strong>
					Bringing data and evidence together with first-hand accounts from affected communities.
				</li>
				<li>
					<strong>Beyond the headline wars.</strong>
					Most research focuses on a few high-profile conflicts. We draw on our reporting from crises
					that rarely make the news.
				</li>
				<li>
					<strong>Beyond carbon.</strong>
					We look at the harms that outlast the fighting: poisoned water, ruined farmland, displacement
					and land left unusable for years.
				</li>
				<li>
					<strong>Convening expertise across disciplines and regions.</strong>
					Evidence and expertise do not consistently reach across sectors, leaving the wider consequences
					of conflict poorly understood. We bring actors together to show what we know, what remains unknown
					and where action is most needed.
				</li>
			</ul>
		</article>

		<section id="get-involved" class="involve" aria-labelledby="involve-title">
			<h2 id="involve-title">Get involved</h2>
			<p>
				The project is just getting started. If you work in this space, or have research, stories or
				ideas to share, we’d love to hear from you.
			</p>
			<p>
				As the research progresses, send us tips, leads, research topics or anything we should look
				into.
			</p>

			{#if sent && form?.ok}
				<p class="sent" role="status">{form.message}</p>
				<button class="text-button" type="button" onclick={() => (sent = false)}
					>Send another message</button
				>
			{:else}
				<form
					method="POST"
					action="?/tip"
					use:enhance={() => {
						sending = true;
						return async ({ result, update }) => {
							await update({ reset: result.type === 'success' });
							sending = false;
							if (result.type === 'success') sent = true;
						};
					}}
				>
					<input type="hidden" name="started" value={data.formStamp} />
					<div class="trap" aria-hidden="true">
						<label for="tip-website">Website</label>
						<input id="tip-website" name="website" type="text" tabindex="-1" autocomplete="off" />
					</div>

					<label for="tip-message">Your tip, idea or lead</label>
					<textarea
						id="tip-message"
						name="message"
						rows="5"
						maxlength="780"
						required
						value={form?.values?.message ?? ''}
					></textarea>

					<div class="pair">
						<div>
							<label for="tip-name">Name <span>(optional)</span></label>
							<input
								id="tip-name"
								name="name"
								type="text"
								autocomplete="name"
								maxlength="80"
								value={form?.values?.name ?? ''}
							/>
						</div>
						<div>
							<label for="tip-email">Email <span>(optional, if you’d like a reply)</span></label>
							<input
								id="tip-email"
								name="email"
								type="email"
								autocomplete="email"
								maxlength="120"
								value={form?.values?.email ?? ''}
							/>
						</div>
					</div>

					<div class="send-row">
						<button class="button" type="submit" disabled={sending}>
							{sending ? 'Sending…' : 'Send to TNH'}
						</button>
						<p class="hint">Goes privately to the TNH team. It is never published.</p>
					</div>
					{#if form && !form.ok}<p class="error" role="alert">{form.message}</p>{/if}
				</form>
			{/if}
		</section>

		<section class="updates" aria-labelledby="updates-title">
			<h2 id="updates-title">Stay informed</h2>
			<p>Get The New Humanitarian’s environment and disasters coverage in your inbox.</p>
			<NewsletterSignup tone="light" />
		</section>
	</main>

	<footer class="footer">
		<img
			src="/images/climate/tnh-wordmark-white.svg"
			alt="The New Humanitarian"
			width="132"
			height="35"
		/>
		<nav aria-label="The New Humanitarian">
			<a href="https://www.thenewhumanitarian.org/about-us">About TNH</a>
			<a href="https://www.thenewhumanitarian.org/about-us/contact-us">Contact</a>
			<a href="https://www.thenewhumanitarian.org/legal/privacy-policy">Privacy</a>
		</nav>
	</footer>
</div>

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

	.landing {
		--brand: #9f3e52;
		--brand-hover: #803244;
		--ink: #282828;
		--muted: #5c5550;
		--serif: 'Climate Sectra', Georgia, serif;
		--sans: 'Climate Roboto', Arial, sans-serif;
		--pad-x: clamp(1.1rem, 5vw, 4rem);
		min-height: 100vh;
		background: #fff;
		color: var(--ink);
		font: 400 1rem/1.5 var(--sans);
	}
	.landing :where(h1, h2, p) {
		margin: 0;
	}
	.landing :where(a, button, input, textarea, [aria-disabled]):focus {
		outline: none;
	}
	.landing :where(a, button, input, textarea):focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 3px;
	}

	/* Masthead: the TNH dark bar, as on the wall. */
	.masthead {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		height: clamp(3.5rem, 8svh, 4.5rem);
		padding-inline: 0.75rem;
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
	.masthead-cta {
		justify-self: end;
		padding: 0.6rem 1rem;
		background: var(--brand);
		color: #fff;
		font-weight: 700;
		font-size: 0.93rem;
		text-decoration: none;
	}
	.masthead-cta:hover {
		background: var(--brand-hover);
	}
	.masthead-cta:focus-visible,
	.landing .masthead :global(.share-trigger:focus-visible) {
		outline-color: #fff;
	}

	/* Hero: one photo, shaded, with the title and the two links. */
	.hero {
		position: relative;
		display: grid;
		align-content: end;
		min-height: min(78svh, 46rem);
		padding: 6rem var(--pad-x) 3.2rem;
		overflow: hidden;
		background: #1d1d1b;
		color: #fff;
	}
	.backdrop,
	.placeholder,
	.backdrop picture,
	.backdrop img {
		position: absolute;
		inset: 0;
	}
	.placeholder {
		inset: -6%;
		background-size: cover;
		background-position: var(--focus);
		filter: blur(22px);
	}
	.backdrop img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--focus);
	}
	.backdrop::after {
		content: '';
		position: absolute;
		inset: 0;
		background:
			linear-gradient(180deg, rgb(18 18 14 / 30%), rgb(18 18 14 / 0%) 30%),
			linear-gradient(0deg, rgb(18 18 14 / 88%), rgb(18 18 14 / 45%) 45%, rgb(18 18 14 / 0%) 80%),
			rgb(18 18 14 / calc(var(--shade, 0) * 100%));
	}
	.hero-text {
		position: relative;
		max-width: 46rem;
		text-shadow: 0 1px 14px rgb(0 0 0 / 40%);
	}
	.eyebrow {
		font-weight: 700;
		font-size: 0.85rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: rgb(255 255 255 / 85%);
	}
	h1 {
		margin-top: 0.6rem;
		font: 700 clamp(2.6rem, 7vw, 5rem) / 1 var(--serif);
		letter-spacing: -0.025em;
		text-wrap: balance;
	}
	.lead {
		margin-top: 1.1rem;
		max-width: 38rem;
		font-size: clamp(1.1rem, 2vw, 1.3rem);
		line-height: 1.45;
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1.8rem;
		text-shadow: none;
	}
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		min-height: 46px;
		padding: 0.7rem 1.2rem;
		border: 0;
		background: var(--brand);
		color: #fff;
		font: 700 0.98rem/1.2 var(--sans);
		text-decoration: none;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	.button:hover:not(:disabled, .soon) {
		background: var(--brand-hover);
	}
	.button:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	.button.ghost {
		background: rgb(255 255 255 / 12%);
		box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 75%);
	}
	.button.ghost:hover:not(.soon) {
		background: rgb(255 255 255 / 22%);
	}
	.soon {
		cursor: default;
		color: rgb(255 255 255 / 75%);
	}
	.soon em {
		padding: 0.15rem 0.4rem;
		background: rgb(255 255 255 / 16%);
		font: 700 0.7rem/1 var(--sans);
		font-style: normal;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}
	.credit {
		position: absolute;
		right: var(--pad-x);
		bottom: 0.8rem;
		max-width: calc(100% - 2 * var(--pad-x));
		color: rgb(255 255 255 / 70%);
		font-size: 0.75rem;
		text-align: right;
	}
	.credit a {
		color: inherit;
	}

	/* Content: the TNH article column. */
	.content {
		display: grid;
		gap: 3.5rem;
		max-width: calc(42rem + 2 * var(--pad-x));
		margin: 0 auto;
		padding: clamp(2.5rem, 6vw, 4rem) var(--pad-x) 4.5rem;
	}
	.story {
		font-size: 1.125rem;
		line-height: 1.65;
	}
	.story p + p {
		margin-top: 1.1rem;
	}
	.story a {
		color: var(--brand);
		font-weight: 700;
		text-decoration: underline;
		text-decoration-color: rgb(159 62 82 / 35%);
		text-underline-offset: 0.2em;
	}
	.story a:hover {
		text-decoration-color: currentColor;
	}
	h2 {
		font: 700 clamp(1.6rem, 3.4vw, 2.1rem) / 1.15 var(--serif);
		letter-spacing: -0.01em;
	}
	.story h2 {
		margin-top: 2.4rem;
	}
	.bring {
		display: grid;
		gap: 1rem;
		margin: 1.1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.bring li {
		padding-left: 1.1rem;
		border-left: 4px solid var(--brand);
	}
	.bring strong {
		display: block;
		font-size: 1.05rem;
	}

	/* Get involved: the tips form, set off as a card. */
	.involve {
		padding: clamp(1.4rem, 4vw, 2.2rem);
		background: #f6f1ec;
		border-top: 5px solid var(--brand);
	}
	.involve > p {
		margin-top: 0.7rem;
	}
	form {
		display: grid;
		gap: 0.35rem;
		margin-top: 1.3rem;
	}
	label {
		margin-top: 0.6rem;
		font-weight: 700;
		font-size: 0.92rem;
	}
	label span {
		color: var(--muted);
		font-weight: 400;
	}
	textarea,
	input:not([type='hidden']) {
		width: 100%;
		min-height: 46px;
		padding: 0.6rem 0.7rem;
		border: 1px solid #8f8984;
		border-radius: 0;
		background: #fff;
		color: var(--ink);
		font: 400 1rem/1.45 var(--sans);
	}
	textarea {
		resize: vertical;
	}
	textarea:focus-visible,
	input:focus-visible {
		outline-offset: -2px;
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 1rem;
	}
	.pair > div {
		display: grid;
		gap: 0.35rem;
	}
	.send-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-top: 1rem;
	}
	.hint {
		color: var(--muted);
		font-size: 0.88rem;
	}
	.error {
		margin-top: 0.5rem;
		color: var(--brand);
		font-weight: 700;
	}
	.sent {
		margin-top: 1.3rem;
		padding: 0.9rem 1rem;
		background: #e3f4ec;
		border-left: 4px solid #35b58b;
		font-weight: 700;
	}
	.text-button {
		margin-top: 0.7rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--brand);
		font: 700 0.95rem/1.4 var(--sans);
		text-decoration: underline;
		cursor: pointer;
	}
	.trap {
		position: absolute;
		left: -5000px;
	}

	.updates > p {
		margin-top: 0.7rem;
	}

	.footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 1rem 2rem;
		padding: 2rem var(--pad-x);
		background: #282828;
		color: #fff;
	}
	.footer nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.4rem;
	}
	.footer a {
		color: #fff;
		font-weight: 700;
		font-size: 0.92rem;
		text-decoration: none;
	}
	.footer a:hover {
		text-decoration: underline;
	}
	.footer a:focus-visible {
		outline-color: #fff;
	}

	@media (max-width: 650px) {
		.masthead-cta {
			padding: 0.5rem 0.75rem;
			font-size: 0.85rem;
		}
		.hero {
			min-height: 82svh;
			padding-bottom: 3.6rem;
		}
		.actions .button {
			flex: 1 1 100%;
		}
		.pair {
			grid-template-columns: 1fr;
		}
		.credit {
			left: var(--pad-x);
			text-align: left;
		}
	}
</style>
