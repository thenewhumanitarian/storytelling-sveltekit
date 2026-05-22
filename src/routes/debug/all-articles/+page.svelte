<script lang="ts">
	import { groupUrlEntries, type UrlEntry } from '$lib/utils/urlManifest';

	let { data } = $props();

	let query = $state('');

	const filtered = $derived(
		data.entries.filter((e) => {
			if (!query.trim()) return true;
			const q = query.trim().toLowerCase();
			return (
				e.path.toLowerCase().includes(q) ||
				e.name.toLowerCase().includes(q) ||
				e.group.toLowerCase().includes(q)
			);
		})
	);

	const grouped = $derived(groupUrlEntries(filtered));

	function localUrl(path: string) {
		return `${data.localBase}${path}`;
	}

	function prodUrl(path: string) {
		return `${data.prodBase}${path}`;
	}

	function badge(entry: UrlEntry): string | null {
		if (entry.expectStatus === 404) return '404 expected';
		if (entry.expectRedirect) return 'redirect';
		if (entry.expectContentType === 'javascript') return 'JS';
		return null;
	}
</script>

<svelte:head>
	<title>All articles — debug</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="debug-index">
	<header class="debug-header">
		<h1>All articles &amp; pages</h1>
		<p class="debug-meta">
			{filtered.length} of {data.total} paths · Local:
			<code>{data.localBase}</code>
			· Prod:
			<code>{data.prodBase}</code>
		</p>
		<label class="debug-search">
			<span class="sr-only">Filter</span>
			<input
				type="search"
				placeholder="Filter by name, path, or group…"
				bind:value={query}
				autocomplete="off"
			/>
		</label>
	</header>

	{#each [...grouped] as [group, entries] (group)}
		<section class="debug-group">
			<h2>{group} <span class="count">({entries.length})</span></h2>
			<ul>
				{#each entries as entry (entry.path)}
					{@const tag = badge(entry)}
					<li>
						<div class="row-main">
							<span class="name">{entry.name}</span>
							{#if tag}
								<span class="badge">{tag}</span>
							{/if}
						</div>
						<code class="path">{entry.path}</code>
						<div class="links">
							<a href={localUrl(entry.path)} target="_blank" rel="noopener noreferrer">Local</a>
							<a href={prodUrl(entry.path)} target="_blank" rel="noopener noreferrer">Production</a>
							<button
								type="button"
								class="both"
								onclick={() => {
									window.open(localUrl(entry.path), '_blank', 'noopener');
									window.open(prodUrl(entry.path), '_blank', 'noopener');
								}}
							>
								Both
							</button>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	{/each}

	{#if filtered.length === 0}
		<p class="empty">No paths match “{query}”.</p>
	{/if}
</div>

<style>
	.debug-index {
		max-width: 56rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 3rem;
		font-family: system-ui, sans-serif;
		font-size: 0.9375rem;
		line-height: 1.45;
		color: #1a1a1a;
		background: #faf9f7;
		min-height: 100vh;
	}

	.debug-header {
		position: sticky;
		top: 0;
		z-index: 1;
		background: #faf9f7;
		padding-bottom: 1rem;
		margin-bottom: 0.5rem;
		border-bottom: 1px solid #ddd;
	}

	h1 {
		font-size: 1.35rem;
		font-weight: 700;
		margin: 0 0 0.35rem;
	}

	.debug-meta {
		margin: 0 0 0.75rem;
		color: #555;
		font-size: 0.8125rem;
	}

	.debug-meta code {
		font-size: 0.75rem;
		background: #eee;
		padding: 0.1em 0.35em;
		border-radius: 3px;
	}

	.debug-search input {
		width: 100%;
		padding: 0.5rem 0.65rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-size: 1rem;
	}

	.debug-group {
		margin-top: 1.5rem;
	}

	.debug-group h2 {
		font-size: 1rem;
		font-weight: 600;
		text-transform: capitalize;
		margin: 0 0 0.5rem;
		color: #8b2942;
	}

	.count {
		font-weight: 400;
		color: #888;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	li {
		padding: 0.65rem 0;
		border-bottom: 1px solid #e8e6e3;
	}

	.row-main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.name {
		font-weight: 600;
	}

	.badge {
		font-size: 0.7rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		padding: 0.15em 0.45em;
		border-radius: 3px;
		background: #eee;
		color: #666;
	}

	.path {
		display: block;
		margin: 0.2rem 0 0.4rem;
		font-size: 0.8rem;
		color: #666;
		word-break: break-all;
	}

	.links {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.links a {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		font-weight: 500;
		text-decoration: none;
		border: 1px solid #ccc;
		background: #fff;
		color: #1a1a1a;
	}

	.links a:hover {
		border-color: #8b2942;
		color: #8b2942;
	}

	.links a:first-child {
		background: #8b2942;
		border-color: #8b2942;
		color: #fff;
	}

	.links a:first-child:hover {
		background: #6d2034;
		border-color: #6d2034;
		color: #fff;
	}

	.links .both {
		display: inline-block;
		padding: 0.25rem 0.6rem;
		border-radius: 4px;
		font-size: 0.8125rem;
		font-weight: 500;
		border: 1px solid #ccc;
		background: #fff;
		color: #1a1a1a;
		cursor: pointer;
		font-family: inherit;
	}

	.links .both:hover {
		border-color: #8b2942;
		color: #8b2942;
	}

	.empty {
		color: #888;
		margin-top: 2rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
