<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	type Entry = NonNullable<Extract<PageProps['data'], { state: 'ready' }>['entries']>[number];
	type Tab = 'queue' | 'wall' | 'hidden' | 'private' | 'all';

	let tab = $state<Tab>('queue');
	let query = $state('');
	let busy = $state<string | null>(null);
	let notice = $state('');
	let drafts = $state<Record<string, string>>({});

	const entries = $derived(data.state === 'ready' ? data.entries : []);
	const inTab = (entry: Entry, which: Tab) =>
		which === 'all'
			? true
			: which === 'private'
				? entry.visibility === 'private'
				: entry.visibility === 'public' &&
					entry.status === { queue: 'pending', wall: 'published', hidden: 'removed' }[which];
	const counts = $derived(
		Object.fromEntries(
			(['queue', 'wall', 'hidden', 'private', 'all'] as Tab[]).map((which) => [
				which,
				entries.filter((entry) => inTab(entry, which)).length
			])
		) as Record<Tab, number>
	);
	const shown = $derived(
		entries.filter((entry) => {
			if (!inTab(entry, tab)) return false;
			const needle = query.trim().toLowerCase();
			return (
				!needle ||
				[entry.body, entry.published_body, entry.moderation_term, entry.moderation_reason]
					.filter(Boolean)
					.some((text) => text!.toLowerCase().includes(needle))
			);
		})
	);

	const tabs: { id: Tab; label: string }[] = [
		{ id: 'queue', label: 'Review queue' },
		{ id: 'wall', label: 'On the wall' },
		{ id: 'hidden', label: 'Hidden' },
		{ id: 'private', label: 'Private messages' },
		{ id: 'all', label: 'All' }
	];

	const statusLabel = { pending: 'In queue', published: 'On the wall', removed: 'Hidden' };
	const when = (iso: string) =>
		new Date(iso).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});

	function wallText(entry: Entry) {
		return drafts[entry.id] ?? entry.published_body ?? entry.moderation_term ?? entry.body;
	}

	const act =
		(id: string, done: string): SubmitFunction =>
		({ cancel, action }) => {
			if (action.search.includes('delete') && !confirm('Delete this entry permanently?')) {
				cancel();
				return;
			}
			busy = id;
			notice = '';
			return async ({ result, update }) => {
				await update({ reset: false });
				busy = null;
				if (result.type === 'success') {
					notice = done;
					const next = { ...drafts };
					delete next[id];
					drafts = next;
				}
			};
		};
</script>

<svelte:head>
	<title>Climate wall admin | The New Humanitarian</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="admin">
	<header class="bar">
		<img src="/images/climate/tnh-wordmark-white.svg" alt="The New Humanitarian" width="132" />
		<span class="title">Climate wall admin</span>
		{#if data.state === 'ready'}
			<div class="bar-actions">
				<a class="ghost" href={resolve('/climate')} target="_blank" rel="noopener">Open the wall</a>
				<a class="ghost" href={resolve('/climate/admin/export.csv')} download>Export CSV</a>
				<form method="POST" action="?/logout" use:enhance>
					<button class="ghost" type="submit">Log out</button>
				</form>
			</div>
		{/if}
	</header>

	<main>
		{#if data.state === 'unconfigured'}
			<section class="panel narrow">
				<h1>Admin isn’t set up</h1>
				<p>
					Set <code>CLIMATE_ADMIN_USER</code> and <code>CLIMATE_ADMIN_PASS</code> (12 characters or more)
					in the environment, then redeploy.
				</p>
			</section>
		{:else if data.state === 'login'}
			<section class="panel narrow">
				<h1>Log in</h1>
				<form method="POST" action="?/login" use:enhance>
					<label for="user">Username</label>
					<!-- svelte-ignore a11y_autofocus -->
					<input id="user" name="user" type="text" autocomplete="username" required autofocus />
					<label for="password">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						autocomplete="current-password"
						required
					/>
					<button class="primary" type="submit">Log in</button>
					{#if form?.message}<p class="error" role="alert">{form.message}</p>{/if}
				</form>
			</section>
		{:else if data.state === 'no-database'}
			<section class="panel narrow">
				<h1>No database connection</h1>
				<p>Set <code>CLIMATE_SUPABASE_URL</code> and <code>CLIMATE_SUPABASE_SECRET_KEY</code>.</p>
			</section>
		{:else if data.state === 'migration'}
			<section class="panel narrow">
				<h1>Database update needed</h1>
				<p>
					Apply <code>supabase/migrations/20261126090000_climate_admin.sql</code> to the climate Supabase
					project, then reload.
				</p>
			</section>
		{:else}
			<div class="toolbar">
				<nav class="tabs" aria-label="Filter entries">
					{#each tabs as item (item.id)}
						<button
							type="button"
							class:active={tab === item.id}
							aria-pressed={tab === item.id}
							onclick={() => (tab = item.id)}
						>
							{item.label} <span class="count">{counts[item.id]}</span>
						</button>
					{/each}
				</nav>
				<div class="search">
					<label class="visually-hidden" for="search">Search entries</label>
					<input
						id="search"
						type="search"
						placeholder="Search text, terms, AI notes…"
						bind:value={query}
					/>
					<button class="ghost dark" type="button" onclick={() => invalidateAll()}>Refresh</button>
				</div>
			</div>

			<p class="notice" role="status">
				{#if form && 'message' in form && form.message}<span class="error">{form.message}</span>
				{:else}{notice}{/if}
			</p>

			{#if !shown.length}
				<p class="empty">Nothing here{query ? ' matching that search' : ''}.</p>
			{/if}

			<ul class="entries">
				{#each shown as entry (entry.id)}
					<li class={['entry', entry.status, entry.visibility]} aria-busy={busy === entry.id}>
						<div class="meta">
							<time datetime={entry.created_at}>{when(entry.created_at)}</time>
							<span class="badge {entry.visibility}"
								>{entry.visibility === 'private' ? 'Private' : 'Public'}</span
							>
							{#if entry.visibility === 'public'}
								<span class="badge status">{statusLabel[entry.status]}</span>
							{/if}
							{#if entry.moderation_verdict}
								<span
									class="badge ai {entry.moderation_verdict}"
									title={entry.moderation_reason ?? ''}
								>
									AI: {entry.moderation_verdict}{entry.moderation_categories?.length
										? ` · ${entry.moderation_categories.join(', ')}`
										: ''}
								</span>
							{/if}
							{#if entry.withdrawn_at}<span class="badge withdrawn">Withdrawn by author</span>{/if}
							{#if entry.visibility === 'public'}
								<span class="reactions"
									>+{entry.reactions}{entry.boosts ? ` · ${entry.boosts} golden` : ''}</span
								>
							{/if}
						</div>

						<p class="body">{entry.body}</p>
						{#if entry.moderation_reason}
							<p class="reason">
								AI note: {entry.moderation_reason}{entry.moderation_model
									? ` (${entry.moderation_model})`
									: ''}
							</p>
						{/if}

						{#if entry.visibility === 'public'}
							<form
								method="POST"
								action="?/update"
								use:enhance={act(entry.id, 'Saved.')}
								class="wall"
							>
								<input type="hidden" name="id" value={entry.id} />
								<label for="text-{entry.id}">Text on the wall</label>
								<div class="wall-row">
									<input
										id="text-{entry.id}"
										name="published_body"
										maxlength="500"
										value={wallText(entry)}
										oninput={(event) => (drafts[entry.id] = event.currentTarget.value)}
									/>
									{#if entry.status === 'published'}
										<button
											class="primary"
											name="status"
											value="published"
											disabled={busy === entry.id}>Save text</button
										>
										<button
											class="secondary"
											name="status"
											value="pending"
											disabled={busy === entry.id}>Back to queue</button
										>
									{:else}
										<button
											class="primary"
											name="status"
											value="published"
											disabled={busy === entry.id}>Put on the wall</button
										>
										{#if entry.status === 'removed'}
											<button
												class="secondary"
												name="status"
												value="pending"
												disabled={busy === entry.id}>Back to queue</button
											>
										{/if}
									{/if}
									{#if entry.status !== 'removed'}
										<button
											class="secondary"
											name="status"
											value="removed"
											disabled={busy === entry.id}>Hide</button
										>
									{/if}
								</div>
							</form>
						{/if}

						<form
							method="POST"
							action="?/delete"
							use:enhance={act(entry.id, 'Deleted.')}
							class="delete"
						>
							<input type="hidden" name="id" value={entry.id} />
							<button class="danger" type="submit" disabled={busy === entry.id}
								>Delete permanently</button
							>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
</div>

<style>
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-regular.woff2') format('woff2');
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-700.woff2') format('woff2');
		font-weight: 700;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Bold.woff2') format('woff2');
		font-weight: 700;
	}
	.admin {
		--brand: #9f3e52;
		--brand-hover: #803244;
		--ink: #282828;
		--line: #dcd1ca;
		--sans: 'Climate Roboto', Arial, sans-serif;
		--serif: 'Climate Sectra', Georgia, serif;
		min-height: 100vh;
		background: #f7f4ef;
		color: var(--ink);
		font: 400 1rem/1.5 var(--sans);
	}
	.admin :where(h1, p) {
		margin: 0;
	}
	.admin :where(button, a, input):focus {
		outline: none;
		box-shadow: none;
	}
	.admin :where(button, a, input):focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 2px;
	}
	.bar {
		position: sticky;
		top: 0;
		z-index: 5;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 0.8rem clamp(1rem, 4vw, 3rem);
		background: var(--ink);
		color: #fff;
	}
	.title {
		font-weight: 700;
		border-left: 1px solid rgb(255 255 255 / 30%);
		padding-left: 1rem;
	}
	.bar-actions {
		display: flex;
		gap: 0.5rem;
		margin-left: auto;
	}
	main {
		max-width: 68rem;
		margin: 0 auto;
		padding: 1.5rem clamp(1rem, 4vw, 3rem) 4rem;
	}
	.panel {
		background: #fff;
		border-top: 5px solid var(--brand);
		padding: 2rem;
		box-shadow: 0 10px 40px rgb(0 0 0 / 8%);
	}
	.panel.narrow {
		max-width: 28rem;
		margin: 4rem auto;
	}
	.panel h1 {
		font: 700 2rem/1.1 var(--serif);
		margin-bottom: 1rem;
	}
	.panel form {
		display: grid;
		gap: 0.6rem;
	}
	label {
		font-weight: 700;
		font-size: 0.85rem;
	}
	input {
		min-height: 2.6rem;
		padding: 0 0.7rem;
		border: 1px solid #cdc7c0;
		border-radius: 0;
		background: #fff;
		font: inherit;
	}
	button,
	.ghost {
		display: inline-flex;
		align-items: center;
		min-height: 2.4rem;
		padding: 0 0.9rem;
		border: 0;
		border-radius: 0;
		font: 700 0.85rem/1 var(--sans);
		text-decoration: none;
		cursor: pointer;
		white-space: nowrap;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.primary {
		background: var(--brand);
		color: #fff;
	}
	.primary:hover:not(:disabled) {
		background: var(--brand-hover);
	}
	.secondary {
		background: #fff;
		color: var(--ink);
		box-shadow: inset 0 0 0 1px #cdc7c0;
	}
	.secondary:hover:not(:disabled) {
		box-shadow: inset 0 0 0 1px var(--ink);
	}
	.danger {
		background: none;
		color: var(--brand);
		padding: 0;
		min-height: 0;
		text-decoration: none;
	}
	.danger:hover {
		text-decoration: underline;
	}
	.ghost {
		background: rgb(255 255 255 / 10%);
		color: #fff;
	}
	.ghost:hover {
		background: rgb(255 255 255 / 20%);
	}
	.ghost.dark {
		background: #fff;
		color: var(--ink);
		box-shadow: inset 0 0 0 1px #cdc7c0;
	}
	.bar-actions form {
		display: contents;
	}
	.toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem;
		justify-content: space-between;
		align-items: center;
	}
	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.tabs button {
		background: #fff;
		color: var(--ink);
		box-shadow: inset 0 0 0 1px #e2dbd4;
	}
	.tabs button.active {
		background: var(--ink);
		color: #fff;
		box-shadow: none;
	}
	.count {
		margin-left: 0.35rem;
		opacity: 0.7;
	}
	.search {
		display: flex;
		gap: 0.4rem;
	}
	.search input {
		width: min(20rem, 60vw);
	}
	.notice {
		min-height: 1.6rem;
		margin: 0.6rem 0 !important;
		font-weight: 700;
		color: #2a8f6d;
	}
	.error {
		color: var(--brand);
		font-weight: 700;
	}
	.empty {
		padding: 3rem 0;
		text-align: center;
		color: #6b645e;
	}
	.entries {
		display: grid;
		gap: 0.8rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.entry {
		display: grid;
		gap: 0.6rem;
		padding: 1.1rem 1.2rem;
		background: #fff;
		border-left: 4px solid #cdc7c0;
	}
	.entry.published {
		border-left-color: #35b58b;
	}
	.entry.removed {
		border-left-color: #8b847e;
		opacity: 0.8;
	}
	.entry.private {
		border-left-color: var(--ink);
	}
	.entry[aria-busy='true'] {
		opacity: 0.55;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		align-items: center;
		font-size: 0.8rem;
		color: #6b645e;
	}
	.badge {
		padding: 0.15rem 0.45rem;
		background: #efebe6;
		color: var(--ink);
		font-weight: 700;
	}
	.badge.private {
		background: var(--ink);
		color: #fff;
	}
	.badge.ai.allow {
		background: #d6f0e5;
	}
	.badge.ai.review {
		background: #fbe7a1;
	}
	.badge.ai.block {
		background: var(--brand);
		color: #fff;
	}
	.badge.withdrawn {
		background: #fde4e4;
	}
	.reactions {
		margin-left: auto;
		font-weight: 700;
		color: var(--ink);
	}
	.body {
		font-size: 1.05rem;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	.reason {
		font-size: 0.85rem;
		color: #6b645e;
	}
	.wall {
		display: grid;
		gap: 0.3rem;
	}
	.wall-row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.wall-row input {
		flex: 1 1 18rem;
		font-family: var(--serif);
		font-size: 1.05rem;
	}
	.delete {
		justify-self: end;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	@media (max-width: 640px) {
		.title {
			display: none;
		}
		.bar-actions {
			flex-wrap: wrap;
			justify-content: flex-end;
		}
	}
</style>
