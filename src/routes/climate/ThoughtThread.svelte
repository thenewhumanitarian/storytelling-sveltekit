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

	let comments = $state<Comment[]>([]);
	let loading = $state(true);
	let unavailable = $state(false);
	let draft = $state('');
	let sending = $state(false);
	let status = $state('');
	let list = $state<HTMLOListElement>();
	let field = $state<HTMLTextAreaElement>();
	const motion = $derived(prefersReducedMotion.current ? 0 : 1);

	async function load() {
		try {
			const response = await fetch(resolve(`/climate/comments/${entry.id}`), { cache: 'no-store' });
			const result: { comments: Comment[]; unavailable?: boolean } = await response.json();
			const grew = result.comments.length > comments.length;
			comments = result.comments;
			unavailable = Boolean(result.unavailable);
			if (grew) {
				await tick();
				list?.scrollTo({ top: list.scrollHeight, behavior: motion ? 'smooth' : 'auto' });
			}
		} catch {
			unavailable = true;
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void load();
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
		status = 'Checking your comment…';
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
			status = typeof data?.message === 'string' ? data.message : 'Couldn’t post. Try again.';
			if (result.type === 'success') {
				draft = '';
				if (data?.published) {
					await load();
					onposted();
				}
			}
		} catch {
			status = 'Couldn’t post. Try again.';
		} finally {
			sending = false;
		}
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

	<ol class="timeline" bind:this={list} aria-live="polite">
		{#if loading}
			<li class="placeholder">Loading the thread…</li>
		{:else if unavailable}
			<li class="placeholder">Comments aren’t available right now.</li>
		{:else if !comments.length}
			<li class="placeholder">No comments yet. Start the thread.</li>
		{/if}
		{#each comments as comment (comment.id)}
			<li class="comment" in:fly={{ y: 12, duration: 280 * motion }}>
				<span class="dot" aria-hidden="true"></span>
				<time datetime={comment.created_at}>{relative(comment.created_at)}</time>
				<p>{comment.body}</p>
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
				{sending ? 'Checking' : 'Post'}
			</button>
		</div>
		<p class="status" role="status" class:empty={!status}>{status}</p>
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
	.timeline {
		position: relative;
		margin: 0;
		padding: 1rem 0.4rem 0.4rem 1.6rem;
		overflow-y: auto;
		overscroll-behavior: contain;
		list-style: none;
		scrollbar-width: thin;
	}
	/* The thread line the dots sit on. */
	.timeline:has(.comment)::before {
		content: '';
		position: absolute;
		top: 1.2rem;
		bottom: 0.4rem;
		left: 0.45rem;
		width: 2px;
		background: rgb(255 255 255 / 18%);
	}
	.comment {
		position: relative;
		padding-bottom: 0.9rem;
	}
	.dot {
		position: absolute;
		top: 0.3rem;
		left: -1.2rem;
		width: 0.7rem;
		height: 0.7rem;
		border-radius: 50%;
		background: #35b58b;
		box-shadow: 0 0 0 3px rgb(255 255 255 / 25%);
	}
	time {
		display: block;
		font: 700 0.72rem/1.2 var(--sans);
		letter-spacing: 0.03em;
		color: rgb(255 255 255 / 60%);
		text-transform: uppercase;
	}
	.comment p {
		margin: 0.2rem 0 0;
		font: 400 1.05rem/1.45 var(--sans);
		overflow-wrap: anywhere;
	}
	.placeholder {
		margin-left: -1.6rem;
		padding: 1rem 0;
		color: rgb(255 255 255 / 70%);
		font: 400 0.95rem/1.4 var(--sans);
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
	.status {
		margin: 0.5rem 0 0;
		padding-inline: 0.9rem;
		font: 700 0.8rem/1.3 var(--sans);
		color: rgb(255 255 255 / 85%);
	}
	.status.empty {
		display: none;
	}
	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
</style>
