<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
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
	// Optimistic changes, shown immediately and dropped once the server agrees.
	let overrides = $state<Record<string, Entry['status'] | 'deleted'>>({});
	let fresh = $state<Record<string, true>>({});
	let autoOverride = $state<boolean | null>(null);
	let commentsOverride = $state<boolean | null>(null);
	const commentsOn = $derived(
		commentsOverride ?? (data.state === 'ready' ? data.commentsEnabled : true)
	);
	let seen: Set<string> | null = null;

	const serverEntries = $derived(data.state === 'ready' ? data.entries : []);
	const entries = $derived(
		serverEntries.flatMap((entry) => {
			const override = overrides[entry.id];
			if (override === 'deleted') return [];
			return override ? [{ ...entry, status: override }] : [entry];
		})
	);
	const autoPublish = $derived(autoOverride ?? (data.state === 'ready' ? data.autoPublish : true));

	// Reconcile with each refresh: drop overrides the server now reflects, and mark arrivals as new.
	$effect(() => {
		const list = serverEntries;
		const byId = new Map(list.map((entry) => [entry.id, entry]));
		const pending = Object.entries(overrides).filter(([id, value]) =>
			value === 'deleted' ? byId.has(id) : byId.get(id)?.status !== value
		);
		if (pending.length !== Object.keys(overrides).length) overrides = Object.fromEntries(pending);
		if (data.state === 'ready' && autoOverride === data.autoPublish) autoOverride = null;
		if (data.state === 'ready' && commentsOverride === data.commentsEnabled)
			commentsOverride = null;

		const arrivals = seen ? list.filter((entry) => !seen!.has(entry.id)) : [];
		seen = new Set(list.map((entry) => entry.id));
		if (arrivals.length) {
			fresh = { ...fresh, ...Object.fromEntries(arrivals.map((entry) => [entry.id, true])) };
			setTimeout(() => {
				const next = { ...fresh };
				arrivals.forEach((entry) => delete next[entry.id]);
				fresh = next;
			}, 60_000);
		}
	});

	// Live: new posts and changes from other editors appear without reloading.
	onMount(() => {
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible' && !busy && data.state === 'ready') {
				void invalidate('climate:admin');
			}
		}, 4000);
		return () => clearInterval(timer);
	});
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
		{ id: 'wall', label: 'Live on the wall' },
		{ id: 'hidden', label: 'Blocked' },
		{ id: 'private', label: 'Private messages' },
		{ id: 'all', label: 'All' }
	];

	const statusLabel = { pending: 'In queue', published: 'Live', removed: 'Blocked' };
	const when = (iso: string) =>
		new Date(iso).toLocaleString('en-GB', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		});

	const threads = $derived.by(() => {
		const grouped: Record<string, NonNullable<typeof data.comments>> = {};
		if (data.state !== 'ready') return grouped;
		for (const comment of data.comments) {
			(grouped[comment.contribution_id] ??= []).push(comment);
		}
		return grouped;
	});
	const commentStatus = { pending: 'In queue', published: 'Live', removed: 'Blocked' };

	const commentAct =
		(id: string): SubmitFunction =>
		({ cancel, submitter }) => {
			const value = (submitter as HTMLButtonElement | null)?.value;
			if (value === 'delete' && !confirm('Delete this comment permanently?')) {
				cancel();
				return;
			}
			busy = id;
			return async ({ result, update }) => {
				await update({ reset: false, invalidateAll: false });
				await invalidate('climate:admin');
				busy = null;
				if (result.type === 'success') notice = value === 'delete' ? 'Comment deleted.' : 'Saved.';
			};
		};

	function wallText(entry: Entry) {
		return drafts[entry.id] ?? entry.published_body ?? entry.moderation_term ?? entry.body;
	}

	const act =
		(id: string, done: string): SubmitFunction =>
		({ cancel, action, submitter }) => {
			const deleting = action.search.includes('delete');
			if (deleting && !confirm('Delete this entry permanently?')) {
				cancel();
				return;
			}
			const status = (submitter as HTMLButtonElement | null)?.value as Entry['status'] | undefined;
			const before = overrides[id];
			// Show the change straight away; the server confirms in the background.
			overrides = { ...overrides, [id]: deleting ? 'deleted' : (status ?? overrides[id]) };
			busy = id;
			notice = '';
			return async ({ result, update }) => {
				await update({ reset: false, invalidateAll: false });
				await invalidate('climate:admin');
				busy = null;
				if (result.type === 'success') {
					notice = done;
					const next = { ...drafts };
					delete next[id];
					drafts = next;
				} else {
					const next = { ...overrides };
					if (before) next[id] = before;
					else delete next[id];
					overrides = next;
				}
			};
		};

	const toggleComments: SubmitFunction = ({ formData }) => {
		commentsOverride = formData.get('enabled') === 'true';
		return async ({ result, update }) => {
			await update({ reset: false, invalidateAll: false });
			await invalidate('climate:admin');
			if (result.type !== 'success') commentsOverride = null;
		};
	};

	const toggleAuto: SubmitFunction = ({ formData }) => {
		autoOverride = formData.get('enabled') === 'true';
		return async ({ result, update }) => {
			await update({ reset: false, invalidateAll: false });
			await invalidate('climate:admin');
			if (result.type !== 'success') autoOverride = null;
		};
	};
</script>

<svelte:head>
	<title>{counts.queue ? `(${counts.queue}) ` : ''}Climate wall admin | The New Humanitarian</title>
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
			{#if data.settingsReady}
				<form method="POST" action="?/autopublish" use:enhance={toggleAuto} class="auto">
					<input type="hidden" name="enabled" value={autoPublish ? 'false' : 'true'} />
					<button type="submit" class="switch" role="switch" aria-checked={autoPublish}>
						<span class="knob" aria-hidden="true"></span>
						Auto-publish {autoPublish ? 'on' : 'off'}
					</button>
					<span class="auto-note">
						{autoPublish
							? 'Posts the AI passes go straight onto the wall. Block anything you don’t want.'
							: 'Every new post waits in the review queue until you publish it.'}
					</span>
				</form>
				{#if data.commentsSetting}
					<form method="POST" action="?/comments" use:enhance={toggleComments} class="auto">
						<input type="hidden" name="enabled" value={commentsOn ? 'false' : 'true'} />
						<button type="submit" class="switch" role="switch" aria-checked={commentsOn}>
							<span class="knob" aria-hidden="true"></span>
							Comments {commentsOn ? 'on' : 'off'}
						</button>
						<span class="auto-note">
							{commentsOn
								? 'Visitors can open threads and comment on thoughts.'
								: 'Threads are hidden and new comments are refused. Existing comments are kept.'}
						</span>
					</form>
				{/if}
			{:else}
				<p class="auto-note">
					Auto-publish is {autoPublish ? 'on' : 'off'} (set by environment). Apply
					<code>20261126110000_climate_settings.sql</code> to switch it here.
				</p>
			{/if}

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
					<span class="live" title="Updates every few seconds"
						><span class="dot" aria-hidden="true"></span>Live</span
					>
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
					<li
						class={['entry', entry.status, entry.visibility, { fresh: fresh[entry.id] }]}
						aria-busy={busy === entry.id}
					>
						<div class="meta">
							{#if fresh[entry.id]}<span class="badge new">New</span>{/if}
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
										<button class="secondary" name="status" value="published">Save text</button>
										<button class="block" name="status" value="removed">Block</button>
										<button class="link" name="status" value="pending">Back to queue</button>
									{:else if entry.status === 'removed'}
										<button class="primary" name="status" value="published">Unblock</button>
										<button class="link" name="status" value="pending">Back to queue</button>
									{:else}
										<button class="primary" name="status" value="published">Publish</button>
										<button class="block" name="status" value="removed">Block</button>
									{/if}
								</div>
							</form>
						{/if}

						{#if threads[entry.id]?.length}
							<details
								class="thread"
								open={threads[entry.id].some((c) => c.status !== 'published')}
							>
								<summary>
									{threads[entry.id].length}
									{threads[entry.id].length === 1 ? 'comment' : 'comments'}
									{#if threads[entry.id].some((c) => c.status === 'pending')}
										<span class="badge">needs review</span>
									{/if}
								</summary>
								<ol>
									{#each threads[entry.id] as comment (comment.id)}
										<li class={['comment', comment.status]} aria-busy={busy === comment.id}>
											<div class="meta">
												<time datetime={comment.created_at}>{when(comment.created_at)}</time>
												<span class="badge status">{commentStatus[comment.status]}</span>
												{#if comment.moderation_verdict}
													<span
														class="badge ai {comment.moderation_verdict}"
														title={comment.moderation_reason ?? ''}
														>AI: {comment.moderation_verdict}</span
													>
												{/if}
											</div>
											<p>{comment.body}</p>
											<form method="POST" action="?/comment" use:enhance={commentAct(comment.id)}>
												<input type="hidden" name="id" value={comment.id} />
												{#if comment.status === 'published'}
													<button class="block" name="status" value="removed">Block</button>
												{:else if comment.status === 'removed'}
													<button class="primary" name="status" value="published">Unblock</button>
												{:else}
													<button class="primary" name="status" value="published">Publish</button>
													<button class="block" name="status" value="removed">Block</button>
												{/if}
												<button class="danger" name="status" value="delete">Delete</button>
											</form>
										</li>
									{/each}
								</ol>
							</details>
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
	.auto {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem;
		margin-bottom: 1rem;
		padding: 0.8rem 1rem;
		background: #fff;
	}
	.auto-note {
		color: #6b645e;
		font-size: 0.88rem;
	}
	p.auto-note {
		margin-bottom: 1rem !important;
	}
	.switch {
		gap: 0.6rem;
		background: none;
		color: var(--ink);
		padding: 0;
	}
	.knob {
		position: relative;
		width: 2.6rem;
		height: 1.5rem;
		border-radius: 100vmax;
		background: #cdc7c0;
		transition: background-color 180ms ease;
	}
	.knob::after {
		content: '';
		position: absolute;
		top: 0.2rem;
		left: 0.2rem;
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
		transition: transform 180ms ease;
	}
	.switch[aria-checked='true'] .knob {
		background: #35b58b;
	}
	.switch[aria-checked='true'] .knob::after {
		transform: translateX(1.1rem);
	}
	.live {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 700;
		color: #2a8f6d;
	}
	.live .dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: #35b58b;
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.35;
		}
	}
	.block {
		background: var(--ink);
		color: #fff;
	}
	.block:hover {
		background: #000;
	}
	.link {
		background: none;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 0.2em;
		padding-inline: 0.4rem;
	}
	.badge.new {
		background: #35b58b;
		color: var(--ink);
	}
	.entry.fresh {
		animation: arrive 1.2s ease-out;
	}
	@keyframes arrive {
		from {
			box-shadow: 0 0 0 3px #35b58b;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.live .dot,
		.entry.fresh {
			animation: none;
		}
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
	details.thread {
		border-top: 1px solid var(--line);
		padding-top: 0.6rem;
	}
	details.thread summary {
		cursor: pointer;
		font-weight: 700;
		font-size: 0.88rem;
	}
	details.thread ol {
		display: grid;
		gap: 0.5rem;
		margin: 0.6rem 0 0;
		padding: 0 0 0 0.9rem;
		list-style: none;
		border-left: 2px solid var(--line);
	}
	li.comment {
		display: grid;
		gap: 0.3rem;
	}
	li.comment.removed {
		opacity: 0.7;
	}
	li.comment[aria-busy='true'] {
		opacity: 0.5;
	}
	li.comment p {
		white-space: pre-wrap;
		overflow-wrap: anywhere;
	}
	li.comment form {
		display: flex;
		gap: 0.4rem;
		align-items: center;
	}
	li.comment button {
		min-height: 2rem;
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
