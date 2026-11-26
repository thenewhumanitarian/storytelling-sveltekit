<script lang="ts">
	import { deserialize } from '$app/forms';
	import { resolve } from '$app/paths';
	import { onMount, tick } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import type { PageData } from './$types';

	type Entry = PageData['wall'][number];
	type Comment = { id: string; created_at: string; body: string };

	interface Props {
		entry: Entry;
		formStamp: string;
		/** Bumped by the page whenever the live channel says the wall changed. */
		refreshKey: number;
		onclose: () => void;
		onposted: () => void;
		/** Distance from the top of the field, so the panel opens below the headline. */
		top?: number;
		panel?: HTMLElement;
	}

	let {
		entry,
		formStamp,
		refreshKey,
		onclose,
		onposted,
		top = 16,
		panel = $bindable()
	}: Props = $props();

	type Mine = {
		key: string;
		entry: string;
		body: string;
		at: string;
		state: 'checking' | 'sent' | 'review' | 'blocked' | 'failed';
		note?: string;
	};

	const mineKey = 'tnh-climate-my-comments-v1';
	let comments = $state<Comment[]>([]);
	let loading = $state(true);
	let unavailable = $state(false);
	let draft = $state('');
	let sending = $state(false);
	// Comments this browser wrote: shown on the right, and kept visible while they're checked or
	// waiting for review, even before they appear in the published thread.
	let mine = $state<Mine[]>([]);
	let list = $state<HTMLOListElement>();
	let field = $state<HTMLTextAreaElement>();
	const motion = $derived(prefersReducedMotion.current ? 0 : 1);

	const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();
	const mineHere = $derived(mine.filter((item) => item.entry === entry.id));

	type Bubble =
		| { kind: 'comment'; key: string; at: string; body: string; own: boolean }
		| { kind: 'mine'; key: string; at: string; body: string; own: true; item: Mine };

	const bubbles = $derived.by((): Bubble[] => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local to this derivation
		const claimed = new Set<string>();
		const published: Bubble[] = comments.map((comment) => {
			const match = mineHere.find(
				(item) => !claimed.has(item.key) && same(item.body, comment.body)
			);
			if (match) claimed.add(match.key);
			return {
				kind: 'comment',
				key: comment.id,
				at: comment.created_at,
				body: comment.body,
				own: Boolean(match)
			};
		});
		// Your comments that aren't (yet) in the published thread: checking, in review, blocked.
		const local: Bubble[] = mineHere
			.filter((item) => !claimed.has(item.key) && item.state !== 'sent')
			.map((item) => ({
				kind: 'mine',
				key: item.key,
				at: item.at,
				body: item.body,
				own: true,
				item
			}));
		return [...published, ...local].sort((a, b) => a.at.localeCompare(b.at));
	});

	function saveMine(next: Mine[]) {
		mine = next.slice(-100);
		try {
			localStorage.setItem(mineKey, JSON.stringify(mine));
		} catch {
			// Still works for this visit without storage.
		}
	}

	function updateMine(key: string, patch: Partial<Mine>) {
		saveMine(mine.map((item) => (item.key === key ? { ...item, ...patch } : item)));
	}

	async function scrollToEnd() {
		await tick();
		list?.scrollTo({ top: list.scrollHeight, behavior: motion ? 'smooth' : 'auto' });
	}

	async function load() {
		try {
			const response = await fetch(resolve(`/climate/comments/${entry.id}`), { cache: 'no-store' });
			const result: { comments: Comment[]; unavailable?: boolean } = await response.json();
			const grew = result.comments.length > comments.length;
			comments = result.comments;
			unavailable = Boolean(result.unavailable);
			if (grew) await scrollToEnd();
		} catch {
			unavailable = true;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		try {
			const saved: unknown = JSON.parse(localStorage.getItem(mineKey) ?? '[]');
			if (Array.isArray(saved)) {
				mine = saved
					.filter(
						(item): item is Mine =>
							item &&
							typeof item.key === 'string' &&
							typeof item.entry === 'string' &&
							typeof item.body === 'string' &&
							typeof item.at === 'string'
					)
					// A check that never finished (tab closed) shows as in review.
					.map((item) => (item.state === 'checking' ? { ...item, state: 'review' } : item));
			}
		} catch {
			mine = [];
		}
		void load().then(scrollToEnd);
		field?.focus({ preventScroll: true });
		const timer = setInterval(() => {
			if (document.visibilityState === 'visible') void load();
		}, 8000);
		const escape = (event: KeyboardEvent) => event.key === 'Escape' && onclose();
		document.addEventListener('keydown', escape);
		return () => {
			clearInterval(timer);
			document.removeEventListener('keydown', escape);
		};
	});

	// Someone else commented (live channel): fetch straight away.
	$effect(() => {
		if (refreshKey) void load();
	});

	async function send(event: SubmitEvent) {
		event.preventDefault();
		const text = draft.trim();
		if (!text || sending) return;
		sending = true;
		// Your bubble appears at once; its label follows the check. Nothing else on the panel moves.
		const key = crypto.randomUUID();
		saveMine([
			...mine,
			{ key, entry: entry.id, body: text, at: new Date().toISOString(), state: 'checking' }
		]);
		draft = '';
		if (field) field.style.height = '';
		void scrollToEnd();

		const body = new FormData();
		body.set('entry', entry.id);
		body.set('message', text);
		body.set('started', formStamp);
		body.set('website', '');
		try {
			const response = await fetch(resolve('/climate') + '?/comment', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await response.text());
			const data = result.type === 'success' || result.type === 'failure' ? result.data : undefined;
			const message = typeof data?.message === 'string' ? data.message : undefined;
			if (result.type === 'success') {
				if (data?.published) {
					updateMine(key, { state: 'sent' });
					await load();
					onposted();
				} else {
					updateMine(key, { state: 'review' });
				}
			} else if (result.type === 'failure' && result.status === 422) {
				updateMine(key, { state: 'blocked', note: message });
			} else {
				updateMine(key, { state: 'failed', note: message ?? 'Couldn’t post. Try again.' });
			}
		} catch {
			updateMine(key, { state: 'failed', note: 'Couldn’t post. Try again.' });
		} finally {
			sending = false;
		}
	}

	function dismiss(key: string) {
		saveMine(mine.filter((item) => item.key !== key));
	}

	/** Grow the box with the text, up to a few lines, instead of showing a scrollbar. */
	function grow(node: HTMLTextAreaElement) {
		const fit = () => {
			node.style.height = 'auto';
			node.style.height = `${Math.min(node.scrollHeight, 132)}px`;
		};
		node.addEventListener('input', fit);
		return { destroy: () => node.removeEventListener('input', fit) };
	}

	function sendOnEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
		event.preventDefault();
		(event.currentTarget as HTMLTextAreaElement).form?.requestSubmit();
	}

	const relative = (iso: string) => {
		const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes} min ago`;
		const hours = Math.round(minutes / 60);
		if (hours < 24) return `${hours} h ago`;
		return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
	};
</script>

<div
	class="thread"
	role="dialog"
	aria-modal="false"
	aria-label={`Comments on “${entry.body}”`}
	style:--top={`${top}px`}
	bind:this={panel}
	transition:fly={{ y: 24, duration: 320 * motion }}
>
	<header>
		<span class="count" aria-label={`${entry.reactions} people agree`}>+{entry.reactions}</span>
		<h2>{entry.body}</h2>
		<button type="button" class="close" aria-label="Close comments" onclick={onclose}>
			<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" /></svg>
		</button>
	</header>

	<ol class="chat" bind:this={list} aria-live="polite">
		{#if loading}
			<li class="placeholder">Loading the thread…</li>
		{:else if unavailable && !bubbles.length}
			<li class="placeholder">Comments aren’t available right now.</li>
		{:else if !bubbles.length}
			<li class="placeholder">No comments yet. Start the conversation.</li>
		{/if}
		{#each bubbles as bubble (bubble.key)}
			<li
				class={['bubble', { own: bubble.own }, bubble.kind === 'mine' && bubble.item.state]}
				in:fly={{ y: 12, duration: 260 * motion }}
			>
				<p>{bubble.body}</p>
				<span class="meta">
					{#if bubble.kind === 'mine'}
						{#if bubble.item.state === 'checking'}
							<span class="pulse" aria-hidden="true"></span>Checking with ethical AI…
						{:else if bubble.item.state === 'review'}
							Waiting for a quick TNH review
						{:else}
							{bubble.item.note ?? 'Not posted.'}
							<button type="button" class="dismiss" onclick={() => dismiss(bubble.key)}
								>Dismiss</button
							>
						{/if}
					{:else}
						<time datetime={bubble.at}>{relative(bubble.at)}</time>{bubble.own ? ' · You' : ''}
					{/if}
				</span>
			</li>
		{/each}
	</ol>

	<form onsubmit={send}>
		<label class="visually-hidden" for="comment-{entry.id}">Your comment</label>
		<div class="composer">
			<textarea
				id="comment-{entry.id}"
				bind:this={field}
				bind:value={draft}
				maxlength="300"
				rows="1"
				use:grow
				placeholder="Add to the conversation…"
				onkeydown={sendOnEnter}
				disabled={unavailable}
			></textarea>
			<button type="submit" class="send" disabled={!draft.trim() || sending || unavailable}>
				Post
			</button>
		</div>
	</form>
</div>

<style>
	/* Liquid glass, like the shout bar; sits below the headline and fills the space under it. */
	.thread {
		position: absolute;
		top: var(--top);
		left: 50%;
		z-index: 8;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto;
		width: min(46rem, calc(100% - 2rem));
		height: max(18rem, min(40rem, calc(100% - var(--top) - 1rem)));
		translate: -50% 0;
		padding: 1.4rem 1.4rem 1.2rem;
		border-radius: 1.75rem;
		background:
			linear-gradient(160deg, rgb(255 255 255 / 24%), rgb(255 255 255 / 8%) 55%),
			rgb(40 40 38 / 38%);
		backdrop-filter: blur(28px) saturate(170%);
		-webkit-backdrop-filter: blur(28px) saturate(170%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 50%),
			inset 0 -1px 1px rgb(255 255 255 / 12%),
			0 30px 80px rgb(0 0 0 / 45%),
			0 2px 8px rgb(0 0 0 / 25%);
		color: #fff;
		text-shadow: 0 1px 8px rgb(0 0 0 / 35%);
		pointer-events: auto;
	}
	header {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		padding-bottom: 0.8rem;
		border-bottom: 1px solid rgb(255 255 255 / 15%);
	}
	.count {
		flex: none;
		display: inline-grid;
		place-items: center;
		min-width: 3rem;
		height: 2rem;
		padding: 0 0.6rem;
		background: #9f3e52;
		font: 700 0.95rem/1 var(--sans);
	}
	h2 {
		flex: 1;
		margin: 0;
		font: 400 clamp(1.3rem, 2.4vw, 1.7rem) / 1.15 var(--serif);
		text-wrap: balance;
	}
	.close {
		flex: none;
		display: grid;
		place-items: center;
		width: 2.2rem;
		height: 2.2rem;
		border: 0;
		border-radius: 50%;
		background: rgb(255 255 255 / 12%);
		color: #fff;
		cursor: pointer;
	}
	.close:hover {
		background: rgb(255 255 255 / 22%);
	}
	.close svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
	}
	/* Group-chat thread: other people on the left, you on the right. */
	.chat {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		margin: 0;
		padding: 1rem 0.2rem 0.6rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		list-style: none;
		scrollbar-width: thin;
	}
	.bubble {
		align-self: flex-start;
		display: grid;
		gap: 0.25rem;
		max-width: min(80%, 30rem);
		padding: 0.6rem 0.85rem 0.5rem;
		border-radius: 1.1rem 1.1rem 1.1rem 0.3rem;
		background: rgb(255 255 255 / 16%);
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 22%);
		text-shadow: none;
	}
	.bubble.own {
		align-self: flex-end;
		border-radius: 1.1rem 1.1rem 0.3rem 1.1rem;
		background: #8ed9bd;
		color: #1c1c1a;
		box-shadow: 0 4px 14px rgb(0 0 0 / 20%);
	}
	.bubble.checking,
	.bubble.review {
		background: rgb(142 217 189 / 82%);
		color: #1c1c1a;
	}
	.bubble.blocked,
	.bubble.failed {
		background: #9f3e52;
		color: #fff;
	}
	.bubble p {
		margin: 0;
		font: 400 1.02rem/1.4 var(--sans);
		overflow-wrap: anywhere;
		white-space: pre-wrap;
	}
	.meta {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		font: 700 0.72rem/1.2 var(--sans);
		letter-spacing: 0.02em;
		opacity: 0.8;
	}
	.bubble.own .meta {
		justify-self: end;
	}
	.pulse {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: currentColor;
		animation: pulse 1s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			opacity: 0.25;
		}
	}
	.dismiss {
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-decoration: underline;
		cursor: pointer;
		padding: 0;
	}
	.placeholder {
		align-self: center;
		padding: 1rem 0;
		color: rgb(255 255 255 / 75%);
		font: 400 0.95rem/1.4 var(--sans);
	}
	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
		}
	}
	form {
		padding-top: 0.9rem;
		border-top: 1px solid rgb(255 255 255 / 18%);
	}
	.composer {
		display: flex;
		align-items: flex-end;
		gap: 0.4rem;
		padding: 0.35rem;
		border-radius: 1.6rem;
		background: rgb(255 255 255 / 16%);
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 30%);
	}
	.composer:focus-within {
		box-shadow: inset 0 0 0 1.5px rgb(255 255 255 / 70%);
	}
	textarea {
		flex: 1;
		min-width: 0;
		height: 2.6rem;
		max-height: 8.25rem;
		padding: 0.7rem 0.9rem;
		border: 0;
		background: transparent;
		color: #fff;
		font: 400 1.02rem/1.2 var(--sans);
		resize: none;
		overflow-y: auto;
		scrollbar-width: none;
	}
	textarea::-webkit-scrollbar {
		display: none;
	}
	textarea::placeholder {
		color: rgb(255 255 255 / 70%);
	}
	textarea:focus {
		outline: none;
		box-shadow: none;
	}
	.send {
		flex: none;
		height: 2.6rem;
		min-width: 5.2rem;
		border: 0;
		border-radius: 100vmax;
		background: #9f3e52;
		color: #fff;
		font: 700 0.9rem/1 var(--sans);
		cursor: pointer;
	}
	.send:hover:not(:disabled) {
		background: #803244;
	}
	.send:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.close:focus-visible,
	.send:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
