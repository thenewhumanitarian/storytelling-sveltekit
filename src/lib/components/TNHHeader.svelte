<header class="site-header">
	<div class="header-inner">
		<a
			class="brand font-reset"
			href="https://www.thenewhumanitarian.org/"
			aria-label="The New Humanitarian home"
		>
			<img src="/images/tnh-logo.svg" alt="The New Humanitarian" width="190" height="62" />
		</a>

		<nav class="desktop-nav" aria-label="Primary navigation">
			<a class="font-reset" href="#about">About TNH US</a>
			<a class="font-reset" href="#board">Our board</a>
			<a class="font-reset" href="#contact">Contact</a>
			<a
				class="donate-link font-reset"
				href="https://www.zeffy.com/en-US/donation-form/the-new-humanitarian-us-support-journalism-that-refuses-to-look-away"
				target="_blank"
				rel="noopener noreferrer">Donate <span aria-hidden="true">↗</span></a
			>
		</nav>

		<details class="mobile-nav">
			<summary>Menu</summary>
			<nav aria-label="Mobile navigation">
				<a class="font-reset" href="#about">About TNH US</a>
				<a class="font-reset" href="#board">Our board</a>
				<a class="font-reset" href="#contact">Contact</a>
				<a
					class="donate-link font-reset"
					href="https://www.zeffy.com/en-US/donation-form/the-new-humanitarian-us-support-journalism-that-refuses-to-look-away"
					target="_blank"
					rel="noopener noreferrer">Donate <span aria-hidden="true">↗</span></a
				>
			</nav>
		</details>
	</div>
</header>

<style>
	.site-header {
		position: relative;
		z-index: 20;
		width: 100%;
		border-top: 0.375rem solid #9f3e52;
		border-bottom: 1px solid #dedbd7;
		background: #fff;
	}

	.header-inner {
		display: flex;
		min-height: 6.5rem;
		max-width: 90rem;
		margin: 0 auto;
		padding: 0 3rem;
		align-items: center;
		justify-content: space-between;
		gap: 2rem;
	}

	.brand {
		display: inline-flex;
		align-items: center;
	}

	.brand img {
		display: block;
		width: 11.875rem;
		height: auto;
	}

	.desktop-nav {
		display: flex;
		align-items: center;
		gap: clamp(1.25rem, 2.5vw, 2.5rem);
	}

	.desktop-nav a,
	.mobile-nav a,
	.mobile-nav summary {
		color: #282828;
		font-family: 'Roboto', 'Open Sans', sans-serif;
		font-size: 0.875rem;
		font-weight: 700;
		letter-spacing: 0.02em;
		text-decoration: none;
	}

	.desktop-nav a:hover,
	.mobile-nav a:hover {
		color: #9f3e52;
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.35rem;
	}

	.desktop-nav .donate-link,
	.mobile-nav .donate-link {
		padding: 0.8rem 1.25rem;
		background: #9f3e52;
		color: #fff;
	}

	.desktop-nav .donate-link:hover,
	.mobile-nav .donate-link:hover {
		background: #7f3041;
		color: #fff;
		text-decoration: none;
	}

	.mobile-nav {
		display: none;
		position: relative;
	}

	.mobile-nav summary {
		cursor: pointer;
		list-style: none;
		padding: 0.75rem 0;
	}

	.mobile-nav summary::-webkit-details-marker {
		display: none;
	}

	.mobile-nav summary::after {
		content: '+';
		margin-left: 0.5rem;
		color: #9f3e52;
		font-size: 1.25rem;
		line-height: 0;
	}

	.mobile-nav[open] summary::after {
		content: '−';
	}

	.mobile-nav nav {
		position: absolute;
		top: calc(100% + 1.1rem);
		right: -1.25rem;
		display: flex;
		width: min(18rem, calc(100vw - 2rem));
		padding: 1.25rem;
		border-top: 3px solid #9f3e52;
		background: #fff;
		box-shadow: 0 0.75rem 2rem rgb(0 0 0 / 18%);
		flex-direction: column;
		align-items: stretch;
		gap: 1rem;
	}

	.mobile-nav nav a {
		padding: 0.5rem 0;
	}

	.mobile-nav nav .donate-link {
		padding: 0.8rem 1rem;
		text-align: center;
	}

	@media (max-width: 760px) {
		.header-inner {
			min-height: 5.25rem;
			padding: 0 1.25rem;
		}

		.brand img {
			width: 9.5rem;
		}

		.desktop-nav {
			display: none;
		}

		.mobile-nav {
			display: block;
		}
	}

	@media (prefers-reduced-motion: no-preference) {
		.desktop-nav a,
		.mobile-nav a {
			transition:
				color 160ms ease,
				background 160ms ease;
		}
	}
</style>
