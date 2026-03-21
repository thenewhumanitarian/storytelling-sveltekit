<script lang="ts">
	interface Props {
		showNewsletter?: boolean;
		showMembership?: boolean;
	}

	let { showNewsletter = true, showMembership = true }: Props = $props();
</script>

{#if showNewsletter}
<section class="signup-cta">
	<div class="signup-cta__content">
		<h2 class="signup-cta__title">
			<img class="signup-cta__icon" src="https://thenewhumanitarian.org/themes/custom/tnh/images/icon-newsletter.svg" alt="" width="72" height="32" />
			Get the latest humanitarian news, direct to your inbox
		</h2>
		<p class="signup-cta__description">
			Sign up to receive our original, on-the-ground coverage that informs policymakers, practitioners, donors, and others who want to make the world more humane.
		</p>
		<a href="https://www.thenewhumanitarian.org/subscribe" target="_blank" rel="noopener noreferrer" class="signup-cta__button">Sign up</a>
	</div>
</section>
{/if}

{#if showMembership}
<section class="support-cta">
	<div class="support-inner">
		<div class="support-content">
			<h2 class="support-heading">Become a member of The New Humanitarian</h2>
			<p class="support-text">
				Support our journalism and become more involved in our community. Help us deliver informative, accessible, independent journalism that you can trust and provides accountability to the millions of people affected by crises worldwide.
			</p>
		</div>
		<a href="https://www.thenewhumanitarian.org/membership" target="_blank" rel="noopener noreferrer" class="support-button">Join</a>
	</div>
</section>
{/if}

<footer class="site-footer">
	<div class="footer-inner">
		<p class="footer-tagline">Journalism from the heart of crises</p>
		<nav class="footer-nav">
			<a href="https://www.thenewhumanitarian.org/about-us" target="_blank" rel="noopener noreferrer">About us</a>
			<a href="https://www.thenewhumanitarian.org/careers" target="_blank" rel="noopener noreferrer">Careers</a>
			<a href="https://www.thenewhumanitarian.org/contact-us" target="_blank" rel="noopener noreferrer">Contact Us</a>
			<a href="https://www.thenewhumanitarian.org/pitch-us-a-story" target="_blank" rel="noopener noreferrer">Pitch us a story</a>
			<a href="https://www.thenewhumanitarian.org/privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
			<a href="https://www.thenewhumanitarian.org/syndication" target="_blank" rel="noopener noreferrer">Syndication</a>
		</nav>
		<div class="footer-logo">
			<img src="https://thenewhumanitarian.org/themes/custom/tnh/images/logo.svg" alt="The New Humanitarian" class="footer-logo__img" />
		</div>
		<div class="footer-social">
			<a href="https://bsky.app/profile/thenewhumanitarian.org" target="_blank" rel="noopener noreferrer" aria-label="Bluesky">
				<img src="https://thenewhumanitarian.org/themes/custom/tnh/images/icon-bluesky.svg" alt="Bluesky" width="20" height="20" />
			</a>
			<a href="https://www.facebook.com/TheNewHumanitarian" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
				<img src="https://thenewhumanitarian.org/themes/custom/tnh/images/icon-facebook.svg" alt="Facebook" width="20" height="20" />
			</a>
			<a href="https://www.linkedin.com/company/the-new-humanitarian" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
				<img src="https://thenewhumanitarian.org/themes/custom/tnh/images/icon-linkedin.svg" alt="LinkedIn" width="20" height="20" />
			</a>
			<a href="https://www.youtube.com/c/TheNewHumanitarian" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
				<img src="https://thenewhumanitarian.org/themes/custom/tnh/images/icon-youtube.svg" alt="YouTube" width="20" height="20" />
			</a>
		</div>
		<p class="footer-copyright">&copy; All rights reserved {new Date().getFullYear()}</p>
	</div>
</footer>

<style>
	/* ── Newsletter CTA ── */
	.signup-cta {
		width: 100%;
		padding: 6rem 2rem;
		background-color: #9f3e52;
		background: radial-gradient(circle, rgb(186, 66, 85) 50%, rgb(140, 49, 67) 100%);
		text-align: left;
		color: white;
	}

	.signup-cta__content {
		max-width: 40rem;
		margin: 0 auto;
		padding-left: 4.0625rem;
	}

	.signup-cta__title {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.5rem, 4vw, 2.125rem);
		font-weight: 700;
		line-height: 1.21;
		letter-spacing: -0.23px;
		margin: 0 0 1.875rem 0;
		color: #fff;
		position: relative;
	}

	.signup-cta__icon {
		position: absolute;
		display: block;
		width: 2.8125rem;
		height: 1.25rem;
		top: 0.75rem;
		left: -4.0625rem;
		object-fit: contain;
	}

	.signup-cta__description {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1.05rem;
		line-height: 1.65;
		color: rgba(255, 255, 255, 0.9);
		margin: 0 0 2rem 0;
		max-width: 38rem;
	}

	.signup-cta__button {
		display: inline-block;
		background: #1a1a1a;
		color: white;
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1rem;
		font-weight: 500;
		padding: 0.85rem 2.5rem;
		text-decoration: none;
		transition: background 0.2s ease;
	}

	.signup-cta__button:hover {
		background: #333;
	}

	/* ── Membership CTA ── */
	.support-cta {
		width: 100%;
		padding: 3.5rem 2rem;
		background: #282828;
	}

	.support-inner {
		max-width: 42rem;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 2.5rem;
	}

	.support-content {
		flex: 1;
	}

	.support-heading {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: clamp(1.25rem, 3vw, 1.5rem);
		font-weight: 700;
		line-height: 1.3;
		color: #fff;
		margin: 0 0 0.75rem 0;
	}

	.support-text {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.95rem;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.7);
		margin: 0;
	}

	.support-button {
		flex-shrink: 0;
		display: inline-block;
		background: #9f3e52;
		color: white;
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 1rem;
		font-weight: 500;
		padding: 0.75rem 2.5rem;
		text-decoration: none;
		transition: background 0.2s ease;
	}

	.support-button:hover {
		background: #8a3447;
	}

	/* ── Site Footer ── */
	.site-footer {
		width: 100%;
		padding: 3.5rem 2rem 2.5rem;
		background: #fff;
		text-align: center;
		color: #4a4a4a;
	}

	.footer-inner {
		max-width: 42rem;
		margin: 0 auto;
	}

	.footer-tagline {
		font-family: 'GT Sectra Bold', Georgia, serif;
		font-size: 1.25rem;
		color: #1a1a1a;
		margin: 0 0 1.5rem 0;
	}

	.footer-nav {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem 1.5rem;
		margin-bottom: 2rem;
	}

	.footer-nav a {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.9rem;
		color: #4a4a4a;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.footer-nav a:hover {
		color: #1a1a1a;
		text-decoration: underline;
	}

	.footer-logo {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
	}

	.footer-logo__img {
		height: 3rem;
		width: auto;
	}

	.footer-social {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.75rem;
	}

	.footer-social a {
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.2s ease;
	}

	.footer-social a:hover {
		opacity: 0.6;
	}

	.footer-social img {
		width: 16px;
		height: 16px;
		object-fit: contain;
	}

	.footer-copyright {
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.8rem;
		color: rgba(0, 0, 0, 0.4);
		margin: 0;
	}

	/* ── Responsive ── */
	@media (max-width: 767px) {
		.signup-cta {
			padding: 4rem 1.5rem;
		}

		.signup-cta__content {
			padding-left: 0;
			max-width: 100%;
		}

		.signup-cta__icon {
			position: static;
			margin-bottom: 1.25rem;
		}

		.support-cta {
			padding: 2.5rem 1.5rem;
		}

		.support-inner {
			flex-direction: column;
			text-align: center;
			gap: 1.5rem;
		}

		.site-footer {
			padding: 2.5rem 1.5rem 2rem;
		}

		.footer-nav {
			flex-direction: column;
			gap: 0.75rem;
		}
	}
</style>
