<script lang="ts">
	let { path = '' }: { path?: string } = $props();
</script>

<main class="not-found">
	<div class="not-found__frame">
		<div class="not-found__header">
			<a
				href="https://www.thenewhumanitarian.org"
				class="not-found__logo"
				target="_blank"
				rel="noopener noreferrer"
				title="The New Humanitarian"
			>
				<img src="/images/tnh-logo.svg" alt="The New Humanitarian" height="32" />
			</a>
			<div class="not-found__message">
				<p class="not-found__code" aria-hidden="true">404</p>
				<h1 class="not-found__title">Page not found</h1>
			</div>
		</div>

		<p class="not-found__lede">
			We couldn&rsquo;t find that page on our interactive storytelling site. The story may have moved, or the
			link might be out of date.
		</p>

		{#if path}
			<p class="not-found__path"><span class="not-found__path-label">Requested:</span> <code>{path}</code></p>
		{/if}

		<nav class="not-found__actions" aria-label="Helpful links">
			<a class="not-found__btn not-found__btn--primary" href="https://www.thenewhumanitarian.org">
				Visit thenewhumanitarian.org
			</a>
			<a class="not-found__btn" href="https://www.thenewhumanitarian.org/interactive">
				Interactive projects
			</a>
		</nav>
	</div>
</main>

<style>
	.not-found {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.25rem;
		background-color: #faf9f7;
		background-image: radial-gradient(circle at 20% 10%, rgb(159 62 82 / 0.06), transparent 45%),
			radial-gradient(circle at 80% 90%, rgb(255 224 181 / 0.35), transparent 50%);
	}

	.not-found__frame {
		width: 100%;
		max-width: 30rem;
		padding: 1.5rem 1.25rem 1.25rem;
		text-align: center;
		border: 4px solid #9f3e52;
		background: #fff;
	}

	.not-found__header {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 0.65rem 0.85rem;
		margin-bottom: 1rem;
	}

	.not-found__logo {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		line-height: 0;
	}

	.not-found__logo img {
		display: block;
		height: 2rem;
		width: auto;
	}

	.not-found__message {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem 0.5rem;
		line-height: 1;
	}

	.not-found__code {
		margin: 0;
		font-family: 'GT Sectra Bold', ui-serif, Georgia, serif;
		font-size: 2rem;
		line-height: 1;
		font-weight: 700;
		color: #9f3e52;
		letter-spacing: -0.02em;
	}

	.not-found__title {
		margin: 0;
		font-family: 'GT Sectra Bold', ui-serif, Georgia, serif;
		font-size: 2rem;
		font-weight: 700;
		color: #282828;
		line-height: 1;
		letter-spacing: -0.01em;
	}

	.not-found__lede {
		margin: 0 0 1.25rem;
		font-family: Roboto, 'Open Sans', ui-sans-serif, system-ui, sans-serif;
		font-size: 0.9375rem;
		line-height: 1.5;
		color: #4a4a4a;
	}

	.not-found__path {
		margin: 0 0 1.25rem;
		font-size: 0.8125rem;
		color: #666;
		word-break: break-all;
	}

	.not-found__path-label {
		font-weight: 600;
		color: #282828;
	}

	.not-found__path code {
		font-size: 0.75rem;
		background: #f4f0ec;
		padding: 0.15em 0.35em;
	}

	.not-found__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}

	.not-found__btn {
		display: inline-block;
		padding: 0.5rem 0.9rem;
		font-family: Roboto, 'Open Sans', ui-sans-serif, system-ui, sans-serif;
		font-size: 0.875rem;
		font-weight: 600;
		text-decoration: none;
		border: 1px solid #ccc;
		color: #282828;
		background: #fff;
		transition:
			border-color 0.15s ease,
			color 0.15s ease,
			background 0.15s ease;
	}

	.not-found__btn:hover {
		border-color: #9f3e52;
		color: #9f3e52;
	}

	.not-found__btn--primary {
		background: #9f3e52;
		border-color: #9f3e52;
		color: #fff;
	}

	.not-found__btn--primary:hover {
		background: #7c2d3f;
		border-color: #7c2d3f;
		color: #fff;
	}

	@media (max-width: 420px) {
		.not-found__header {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
