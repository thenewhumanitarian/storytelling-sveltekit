<script lang="ts">
	import { dev } from '$app/environment';
	import { deserialize, enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Dialog } from 'bits-ui';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import PeerLayer, { type Ripple } from './PeerLayer.svelte';
	import ThoughtField, { type Pulse } from './ThoughtField.svelte';
	import SharePopover from './SharePopover.svelte';
	import NewsletterSignup from './NewsletterSignup.svelte';
	import { backdrops as photos, backdropSizes } from './backdrops';
	import { connectClimateRoom, handleFor, type ClimateCursor } from './realtime';
	import type { PageProps } from './$types';

	const eventUrl =
		'https://www.thenewhumanitarian.org/events/hidden-climate-costs-militarisation-and-conflict';

	type Entry = PageProps['data']['wall'][number];
	type Visibility = 'public' | 'private';
	type FormKind = 'contribute';
	type Launch = { key: number; text: string; kind: Visibility; from: DOMRect };

	const examples: Entry[] = [
		{
			id: 'sample-1',
			body: 'Clean water',
			topic: 'water',
			reactions: 12,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-2',
			body: 'Who pays to rebuild?',
			topic: 'rebuilding',
			reactions: 7,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-3',
			body: 'The loss of forests',
			topic: 'land',
			reactions: 4,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-6',
			body: 'Displacement',
			topic: null,
			reactions: 1,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-4',
			body: 'Restoring damaged farmland',
			topic: 'land',
			reactions: 2,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-5',
			body: 'Climate adaptation',
			topic: 'adaptation',
			reactions: 9,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-7',
			body: 'The long work of recovery',
			topic: 'rebuilding',
			reactions: 6,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-8',
			body: 'Missing evidence',
			topic: null,
			reactions: 3,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-9',
			body: 'Who measures the emissions of war?',
			topic: null,
			reactions: 5,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-10',
			body: 'Poisoned rivers',
			topic: 'water',
			reactions: 8,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-11',
			body: 'Landmines on farmland',
			topic: 'land',
			reactions: 3,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		},
		{
			id: 'sample-12',
			body: 'Communities need a say in how their land is restored after the fighting stops.',
			topic: 'rebuilding',
			reactions: 2,
			reacted: false,
			boosted: false,
			comments: 0,
			downvoted: false
		}
	];

	let { data, form }: PageProps = $props();
	let wallSnapshot = $state<Entry[] | null>(null);
	let previewEntries = $state<Entry[]>(examples);
	let visibility = $state<Visibility>('public');
	let drafts = $state({ public: '', private: '' });
	let ready = $state(false);
	let pendingForm = $state<FormKind | null>(null);
	let pendingEntry = $state<string | null>(null);
	let feedback = $state({ contribute: '', vote: '' });
	let wallUnavailable = $state(false);
	let cursors = $state<ClimateCursor[]>([]);
	// Local experiment: visitors as trails of light that sink with ripples when still. On for the
	// dev server only; the preview and production builds keep the named arrows.
	const trailCursors = dev;
	let simulatedCursors = $state<ClimateCursor[]>([]);
	const shownCursors = $derived(
		simulatedCursors.length ? [...cursors, ...simulatedCursors] : cursors
	);
	let ripples = $state<Ripple[]>([]);
	let launches = $state<Launch[]>([]);
	let here = $state(0);
	let connected = $state(false);
	let showCursors = $state(true);
	// Backdrop slideshow: `current` fades in over `previous`. Slides are mounted (and so fetched)
	// one ahead of the one showing, and only once the one showing has loaded.
	// Each visit starts on a random photo (picked on the server, see +page.server.ts).
	const firstPhoto = untrack(() =>
		Math.min(photos.length - 1, Math.floor((data.photoSeed ?? 0) * photos.length))
	);
	let current = $state(firstPhoto);
	let previous = $state(-1);
	let mountedSlides = $state<boolean[]>([]);
	let loadedSlides = $state<boolean[]>([]);
	const photoCredit = $derived(photos[current].credit);
	let motionPaused = $state(false);
	let keyboardViewportHeight = $state<number>();
	let sceneWidth = $state(0);
	let sceneHeight = $state(0);
	let pulses = $state<Record<string, Pulse>>({});
	let intro = $state<HTMLElement>();
	let wordmark: HTMLElement;
	let shoutBar: HTMLElement;
	let messageField: HTMLTextAreaElement;
	let room: ReturnType<typeof connectClimateRoom> | undefined;
	let reloadWall: (() => void) | undefined;
	let snapshotVersion = 0;
	let rippleKey = 0;
	const shareTitle = 'The climate cost of conflict | The New Humanitarian';
	const shareMessage = 'The climate cost of conflict: join the conversation';

	// Bumped on every live "wall changed" signal so an open comment thread refetches.
	let wallTick = $state(0);
	// Follows the editors' comments switch on each wall refresh, without a reload.
	let commentsLive = $state<boolean | null>(null);
	type Assist = { suggestions: string[]; matches: string[]; blocked: boolean };
	let assist = $state<Assist>({ suggestions: [], matches: [], blocked: false });
	let assistFor = $state('');
	let assistLoading = $state(false);
	// True while a public post is being screened and condensed by the AI on Send.
	let checking = $state(false);
	let assistSeen: string[] = [];
	let assistController: AbortController | undefined;

	const preview = $derived(dev && !data.configured);
	const interactive = $derived(data.configured || (preview && ready));
	const canReact = $derived(data.reactionsEnabled || (preview && ready));
	const wall = $derived(preview ? previewEntries : (wallSnapshot ?? data.wall));
	const isPrivate = $derived(visibility === 'private');
	const maxLength = $derived(isPrivate ? 1000 : 500);
	const draftLength = $derived(drafts[visibility].length);
	const narrow = $derived(sceneWidth > 0 && sceneWidth < 520);
	const matchedEntries = $derived(
		assist.matches.flatMap((id) => wall.find((entry) => entry.id === id) ?? []).slice(0, 2)
	);
	const showAssist = $derived(
		!isPrivate &&
			drafts.public.trim().length >= 3 &&
			(assistLoading ||
				assist.blocked ||
				assist.suggestions.length > 0 ||
				matchedEntries.length > 0)
	);

	const storageKeys = {
		draft: 'tnh-climate-public-draft-v1',
		cursors: 'tnh-climate-cursors-v1',
		motion: 'tnh-climate-motion-v1',
		wall: 'tnh-climate-preview-wall-v2',
		mine: 'tnh-climate-mine-v1'
	};
	// About opens by itself on every load for now. Later: only until the visitor has closed it once.
	let aboutOpen = $state(false);
	let aboutBox = $state<HTMLElement | null>(null);

	// What this browser posted: preview entry ids, and the (AI-condensed) terms of live posts,
	// which is all the browser knows about a post once an editor publishes it. Each live term
	// keeps the private token that lets its author take it off the wall again.
	type Mine = { ids: string[]; terms: string[]; tokens: Record<string, string> };
	let mine = $state<Mine>({ ids: [], terms: [], tokens: {} });
	const termKey = (text: string) =>
		text
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim();
	const isMine = (entry: Entry) =>
		mine.ids.includes(entry.id) || mine.terms.includes(termKey(entry.body));

	function rememberMine(update: { id?: string; term?: string; token?: string | null }) {
		const key = update.term ? termKey(update.term) : '';
		mine = {
			ids: update.id ? [...mine.ids, update.id].slice(-50) : mine.ids,
			terms: key ? [...mine.terms, key].slice(-50) : mine.terms,
			tokens: key && update.token ? { ...mine.tokens, [key]: update.token } : mine.tokens
		};
	}

	function forgetMine(entry: Entry) {
		const key = termKey(entry.body);
		const tokens = { ...mine.tokens };
		delete tokens[key];
		mine = {
			ids: mine.ids.filter((id) => id !== entry.id),
			terms: mine.terms.filter((term) => term !== key),
			tokens
		};
	}

	/** Take your own thought off the wall. TNH keeps it, privately. */
	async function withdraw(entry: Entry) {
		if (preview) {
			previewEntries = previewEntries.filter((item) => item.id !== entry.id);
			forgetMine(entry);
			feedback.vote = 'Removed from the wall (preview).';
			return;
		}
		const token = mine.tokens[termKey(entry.body)];
		if (!token) {
			feedback.vote = 'This thought can’t be removed from this browser.';
			return;
		}
		const body = new FormData();
		body.set('token', token);
		try {
			const response = await fetch('?/withdraw', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await response.text());
			if (result.type !== 'success' || !result.data?.ok) throw new Error('Not removed');
			snapshotVersion += 1;
			wallSnapshot = wall.filter((item) => item.id !== entry.id);
			forgetMine(entry);
			feedback.vote = 'Removed from the wall. TNH keeps it privately.';
			room?.wallChanged();
		} catch {
			feedback.vote = 'Couldn’t remove that thought. Try again.';
		}
		reloadWall?.();
	}

	function restoreWall(raw: string | null): Entry[] {
		try {
			const list: unknown = JSON.parse(raw ?? 'null');
			if (!Array.isArray(list)) return examples;
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- local de-duplication only
			const ids = new Set<string>();
			return list
				.slice(0, 80)
				.filter((entry): entry is Entry => {
					if (
						!entry ||
						typeof entry.id !== 'string' ||
						ids.has(entry.id) ||
						typeof entry.body !== 'string' ||
						!entry.body.trim() ||
						entry.body.length > 500 ||
						!(typeof entry.topic === 'string' || entry.topic === null) ||
						!Number.isSafeInteger(entry.reactions) ||
						entry.reactions < 0 ||
						typeof entry.reacted !== 'boolean'
					)
						return false;
					ids.add(entry.id);
					return true;
				})
				.map((entry) => ({
					...entry,
					boosted: entry.boosted === true,
					comments: Number.isSafeInteger(entry.comments) ? entry.comments : 0,
					downvoted: entry.downvoted === true
				}));
		} catch {
			return examples;
		}
	}

	function persist(key: string, value: string) {
		try {
			localStorage.setItem(key, value);
		} catch {
			// The conversation still works when browser storage is unavailable.
		}
	}

	// Dev only: /climate?peers=sim adds a few fake wandering visitors to try the cursor layer.
	onMount(() => {
		if (!dev || new URLSearchParams(location.search).get('peers') !== 'sim') return;
		let stop: (() => void) | undefined;
		let cancelled = false;
		void import('./peerSimulator').then(({ simulatePeers }) => {
			if (!cancelled) stop = simulatePeers(3, (list) => (simulatedCursors = list));
		});
		return () => {
			cancelled = true;
			stop?.();
		};
	});

	onMount(() => {
		try {
			drafts.public = localStorage.getItem(storageKeys.draft)?.slice(0, 500) ?? '';
			showCursors = localStorage.getItem(storageKeys.cursors) !== 'off';
			motionPaused = localStorage.getItem(storageKeys.motion) === 'paused';
			if (preview) previewEntries = restoreWall(localStorage.getItem(storageKeys.wall));
			const savedMine = JSON.parse(localStorage.getItem(storageKeys.mine) ?? 'null');
			if (Array.isArray(savedMine?.ids) && Array.isArray(savedMine?.terms)) {
				const tokens: Record<string, string> = {};
				for (const [key, token] of Object.entries(savedMine.tokens ?? {})) {
					if (typeof token === 'string' && /^[0-9a-f]{64}$/.test(token)) tokens[key] = token;
				}
				mine = {
					ids: savedMine.ids.filter((id: unknown) => typeof id === 'string').slice(-50),
					terms: savedMine.terms.filter((term: unknown) => typeof term === 'string').slice(-50),
					tokens
				};
			}
		} catch {
			// The defaults support private and sandboxed browsing.
		}
		ready = true;
		// A moment after load, so the scene shows first and the box arrives over it.
		const openAbout = setTimeout(() => (aboutOpen = true), 600);

		function syncPreview(event: StorageEvent) {
			if (preview && event.key === storageKeys.wall) previewEntries = restoreWall(event.newValue);
		}
		window.addEventListener('storage', syncPreview);
		const viewport = window.visualViewport;
		function fitComposerToKeyboard() {
			keyboardViewportHeight =
				viewport?.scale === 1 &&
				(document.activeElement?.id === 'climate-message' ||
					Boolean(document.activeElement?.closest('.thread'))) &&
				window.innerHeight - viewport.height > 100
					? viewport.height
					: undefined;
		}
		// focusout also fires when Svelte removes a focused element mid-update; writing state then
		// aborts the update. Measure on the next frame instead.
		let fitFrame = 0;
		function scheduleFit() {
			cancelAnimationFrame(fitFrame);
			fitFrame = requestAnimationFrame(fitComposerToKeyboard);
		}
		viewport?.addEventListener('resize', scheduleFit);
		document.addEventListener('focusin', scheduleFit);
		document.addEventListener('focusout', scheduleFit);
		const timer = setInterval(() => {
			const next = (current + 1) % photos.length;
			if (
				loadedSlides[next] &&
				!prefersReducedMotion.current &&
				!motionPaused &&
				document.visibilityState === 'visible'
			) {
				previous = current;
				current = next;
			}
		}, 30_000);

		return () => {
			window.removeEventListener('storage', syncPreview);
			cancelAnimationFrame(fitFrame);
			viewport?.removeEventListener('resize', scheduleFit);
			document.removeEventListener('focusin', scheduleFit);
			document.removeEventListener('focusout', scheduleFit);
			clearInterval(timer);
			clearTimeout(openAbout);
		};
	});

	$effect(() => {
		if (ready) persist(storageKeys.draft, drafts.public);
	});
	$effect(() => {
		if (ready) persist(storageKeys.cursors, showCursors ? 'on' : 'off');
	});
	$effect(() => {
		if (ready) persist(storageKeys.motion, motionPaused ? 'paused' : 'running');
	});
	$effect(() => {
		if (ready && preview) persist(storageKeys.wall, JSON.stringify(previewEntries));
	});
	$effect(() => {
		if (ready) persist(storageKeys.mine, JSON.stringify(mine));
	});

	function pulse(id: string, detail: Omit<Pulse, 'n'>) {
		if (!wall.some((entry) => entry.id === id)) return;
		if (Object.keys(pulses).length > 160) pulses = {};
		pulses[id] = { ...detail, n: (pulses[id]?.n ?? 0) + 1 };
	}

	function addRipple(x: number, y: number, name: string, label?: string) {
		if (prefersReducedMotion.current) return;
		const key = (rippleKey += 1);
		ripples = [...ripples.slice(-12), { key, x, y, name, label }];
		setTimeout(() => (ripples = ripples.filter((ripple) => ripple.key !== key)), 1200);
	}

	$effect(() => {
		const realtime = data.realtime;
		const localPreview = preview;
		if (!localPreview && !realtime) return;

		const connection = connectClimateRoom({
			url: realtime?.url,
			key: realtime?.key,
			preview: localPreview && !realtime,
			allowSampleReactions: localPreview,
			onReaction: ({ entryId, peerId, liked, boost }) => {
				pulse(entryId, { remote: true, liked, boost, by: handleFor(peerId) });
				const cursor = cursors.find((item) => item.id === peerId);
				if (cursor) addRipple(cursor.x, cursor.y, cursor.name);
			},
			onTap: (tap) => {
				if (showCursors) addRipple(tap.x, tap.y, tap.name);
			},
			onPresence: (count) => (here = count),
			onCursors: (peers) => (cursors = peers),
			onWallChanged: () => {
				wallTick += 1;
				reloadWall?.();
			},
			onConnection: (online) => (connected = online)
		});
		room = connection;
		return () => {
			connection.close();
			room = undefined;
		};
	});

	$effect(() => {
		if (!data.configured) return;

		const controller = new AbortController();
		let refreshing = false;
		let queued = false;
		let timer: ReturnType<typeof setTimeout>;

		async function refresh() {
			if (refreshing) {
				queued = true;
				return;
			}
			if (controller.signal.aborted || document.visibilityState !== 'visible') return;

			clearTimeout(timer);
			refreshing = true;
			const version = snapshotVersion;

			try {
				const response = await fetch(resolve('/climate/wall'), {
					signal: controller.signal,
					cache: 'no-store'
				});
				if (!response.ok) throw new Error('Wall refresh failed');
				const snapshot: { wall: Entry[]; commentsEnabled?: boolean } = await response.json();
				if (typeof snapshot.commentsEnabled === 'boolean') commentsLive = snapshot.commentsEnabled;
				if (!controller.signal.aborted && version === snapshotVersion) {
					wallSnapshot = snapshot.wall;
					wallUnavailable = false;
				}
			} catch {
				if (!controller.signal.aborted) wallUnavailable = true;
			} finally {
				refreshing = false;
				if (!controller.signal.aborted) {
					timer = setTimeout(refresh, queued ? 400 : wallUnavailable ? 25_000 : 8_000);
					queued = false;
				}
			}
		}

		reloadWall = refresh;
		timer = setTimeout(refresh, 8_000);
		document.addEventListener('visibilitychange', refresh);

		return () => {
			controller.abort();
			clearTimeout(timer);
			document.removeEventListener('visibilitychange', refresh);
			reloadWall = undefined;
		};
	});

	function launch(text: string, kind: Visibility) {
		if (prefersReducedMotion.current || !shoutBar) return;
		launches = [
			...launches,
			{ key: Date.now(), text, kind, from: shoutBar.getBoundingClientRect() }
		];
	}

	function flight(node: HTMLElement, item: Launch) {
		const target = wordmark?.getBoundingClientRect();
		const start = node.getBoundingClientRect();
		const toLogo =
			item.kind === 'private' && target
				? `translate(${target.left + target.width / 2 - (start.left + start.width / 2)}px, ${
						target.top + target.height / 2 - (start.top + start.height / 2)
					}px) scale(0.15)`
				: `translate(0, -${Math.min(260, item.from.top * 0.45)}px) scale(1.06)`;
		const animation = node.animate(
			[
				{ transform: 'translate(0, 0) scale(1)', opacity: 1 },
				{ transform: 'translate(0, -24px) scale(1.02)', opacity: 1, offset: 0.2 },
				{ transform: toLogo, opacity: 0 }
			],
			{ duration: item.kind === 'private' ? 1000 : 1300, easing: 'cubic-bezier(.5,0,.2,1)' }
		);
		animation.finished
			.catch(() => {})
			.finally(() => (launches = launches.filter((other) => other.key !== item.key)));
		return { destroy: () => animation.cancel() };
	}

	const submit =
		(kind: FormKind): SubmitFunction =>
		({ cancel, formData }) => {
			if (!interactive || pendingForm) {
				cancel();
				return;
			}

			const choice = formData.get('visibility');
			const submitted = choice === 'private' || choice === 'public' ? choice : null;
			const draft = submitted === null ? null : drafts[submitted];
			if (draft !== null) formData.set('message', draft);

			if (preview) {
				cancel();
				const body = draft?.trim();
				if (!body || submitted === null) return;
				const duplicate =
					submitted === 'public' ? wall.find((entry) => sameTerm(entry.body, body)) : undefined;
				if (duplicate) {
					plusOne(duplicate);
					return;
				}
				if (submitted === 'public') {
					void previewPublish(body);
				} else {
					launch(body, 'private');
					feedback.contribute = 'Sent privately to TNH (preview).';
					drafts[submitted] = '';
				}
				return;
			}

			pendingForm = kind;
			checking = kind === 'contribute' && submitted === 'public';
			return async ({ result, update }) => {
				try {
					await update({ reset: false, invalidateAll: false });
					if (
						result.type === 'success' &&
						result.data?.ok === true &&
						submitted !== null &&
						drafts[submitted] === draft
					) {
						if (kind === 'contribute' && draft) launch(draft, submitted);
						if (kind === 'contribute' && submitted === 'public') {
							rememberMine({
								term: typeof result.data?.term === 'string' ? result.data.term : (draft ?? ''),
								token: typeof result.data?.token === 'string' ? result.data.token : null
							});
						}
						if (typeof result.data?.duplicate === 'string') {
							pulse(result.data.duplicate, { remote: false, liked: true });
						}
						if (result.data?.published === true) {
							room?.wallChanged();
							reloadWall?.();
						}
						drafts[submitted] = '';
					}
				} finally {
					pendingForm = null;
					checking = false;
				}
			};
		};

	type Weight = -1 | 0 | 1 | 2;
	const weightOf = (entry: Entry): Weight =>
		entry.boosted ? 2 : entry.reacted ? 1 : entry.downvoted ? -1 : 0;
	const withWeight = (list: Entry[], id: string, weight: Weight, reactions: number) =>
		list.map((item) =>
			item.id === id
				? {
						...item,
						reactions,
						reacted: weight > 0,
						boosted: weight === 2,
						downvoted: weight === -1
					}
				: item
		);

	/**
	 * Set this visitor's reaction to a thought: 0 removes it, 1 is a +1, 2 is the hidden
	 * double-click boost. Optimistic, and a newer click always wins over a slower reply.
	 */
	async function setReaction(entry: Entry, weight: Weight) {
		if (!canReact) return;
		const before = weightOf(entry);
		if (before === weight && weight !== 2) return;
		const optimistic = Math.max(0, entry.reactions - before + weight);
		const liked = weight > 0;
		pulse(entry.id, { remote: false, liked, boost: weight === 2 });
		feedback.vote =
			weight === 2
				? 'Golden boost: +2'
				: weight === 1
					? '+1 added'
					: weight === -1
						? '−1 added'
						: 'Vote removed';

		if (preview) {
			previewEntries = withWeight(previewEntries, entry.id, weight, optimistic);
			room?.reaction(entry.id, liked, weight === 2);
			return;
		}

		const version = (snapshotVersion += 1);
		wallSnapshot = withWeight(wall, entry.id, weight, optimistic);
		pendingEntry = entry.id;
		const body = new FormData();
		body.set('entry', entry.id);
		body.set('weight', String(weight));
		try {
			const response = await fetch('?/react', {
				method: 'POST',
				body,
				headers: { 'x-sveltekit-action': 'true' }
			});
			const result = deserialize(await response.text());
			const data = result.type === 'success' || result.type === 'failure' ? result.data : undefined;
			if (result.type !== 'success' || !data?.ok || typeof data.reactions !== 'number') {
				throw new Error(typeof data?.message === 'string' ? data.message : 'Not saved');
			}
			if (version === snapshotVersion) {
				const saved: Weight =
					data.boosted === true ? 2 : data.reacted === true ? 1 : data.downvoted === true ? -1 : 0;
				snapshotVersion += 1;
				wallSnapshot = withWeight(wall, entry.id, saved, data.reactions);
			}
			room?.reaction(entry.id, liked, weight === 2);
			room?.wallChanged();
		} catch (error) {
			if (version === snapshotVersion) {
				snapshotVersion += 1;
				wallSnapshot = withWeight(wall, entry.id, before, entry.reactions);
			}
			feedback.vote =
				error instanceof Error && error.message !== 'Not saved'
					? error.message
					: 'Your vote could not be saved. Try again.';
		} finally {
			if (pendingEntry === entry.id) pendingEntry = null;
			reloadWall?.();
		}
	}

	/** The + / − buttons under each thought (and double-click + for the golden boost). */
	function vote(id: string, weight: Weight) {
		const entry = wall.find((item) => item.id === id);
		if (entry) void setReaction(entry, weight);
	}

	/** Marks a slide loaded, including an image that finished before hydration. */
	function slideImage(img: HTMLImageElement, index: number) {
		const done = () => {
			if (!img.naturalWidth) return;
			loadedSlides[index] = true;
		};
		if (img.complete) done();
		img.addEventListener('load', done);
		return { destroy: () => img.removeEventListener('load', done) };
	}

	// Fetch the next photo only once the one on screen has arrived, so it never competes with it.
	$effect(() => {
		if (!loadedSlides[current]) return;
		// Keep the one on screen mounted once it has moved on, so it stays under the next crossfade.
		if (!untrack(() => mountedSlides[current])) mountedSlides[current] = true;
		const next = (current + 1) % photos.length;
		if (untrack(() => mountedSlides[next])) return;
		const idle = window.requestIdleCallback ?? ((run: () => void) => setTimeout(run, 1500));
		idle(() => (mountedSlides[next] = true));
	});

	let thoughtField = $state<ReturnType<typeof ThoughtField>>();
	let backdrops: HTMLElement;
	let panning = $state(false);
	let pan: { pointer: number; lastX: number; samples: { t: number; x: number }[] } | null = null;
	// Anything people click or type in keeps its own behaviour; the open landscape pans.
	const ownPointer =
		'a, button, input, textarea, label, form, .term, .assist, .scene-footer, .thread';

	function panStart(event: PointerEvent & { currentTarget: HTMLElement }) {
		if (!event.isPrimary || event.button !== 0 || pan) return;
		// Phones don't pan the canvas: the backdrop drifts on its own instead.
		if (matchMedia('(max-width: 650px)').matches) return;
		if ((event.target as Element).closest(ownPointer)) return;
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {
			// Synthetic pointers can't be captured; panning still follows the moves we get.
		}
		pan = {
			pointer: event.pointerId,
			lastX: event.clientX,
			samples: [{ t: performance.now(), x: event.clientX }]
		};
		panning = true;
		thoughtField?.startPan();
	}

	function panMove(event: PointerEvent) {
		if (!pan || event.pointerId !== pan.pointer) return;
		const dx = event.clientX - pan.lastX;
		pan.lastX = event.clientX;
		thoughtField?.panBy(dx);
		const now = performance.now();
		pan.samples.push({ t: now, x: event.clientX });
		while (pan.samples.length > 2 && now - pan.samples[0].t > 100) pan.samples.shift();
	}

	function panEnd(event: PointerEvent) {
		if (!pan || event.pointerId !== pan.pointer) return;
		const first = pan.samples[0];
		const last = pan.samples[pan.samples.length - 1];
		const idle = performance.now() - last.t > 80;
		const velocity = idle ? 0 : ((last.x - first.x) / Math.max(16, last.t - first.t)) * 1000;
		thoughtField?.endPan(velocity);
		pan = null;
		panning = false;
	}

	// The backdrop moves at a fraction of the canvas speed (parallax). It is 24% wider than the
	// scene; 10 of those 12 points each side are travel, the rest absorbs the rubber-band overshoot.
	const parallax = 0.18;
	const cameraLimit = $derived((sceneWidth * 1.24 * 0.1) / parallax);

	function moveBackdrop(x: number) {
		backdrops?.style.setProperty('transform', `translate3d(${(x * parallax).toFixed(1)}px, 0, 0)`);
	}

	function scenePoint(event: PointerEvent) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (!rect.width || !rect.height) return null;
		return {
			x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
			y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height))
		};
	}

	function toggleCursors() {
		showCursors = !showCursors;
		if (!showCursors) room?.leave();
	}

	function clearAssist() {
		assistController?.abort();
		assist = { suggestions: [], matches: [], blocked: false };
		assistLoading = false;
		assistSeen = [];
	}

	/** Ask for shorter phrasings and existing matches. Public drafts only, never private ones. */
	async function fetchAssist(text: string, refresh = false) {
		assistController?.abort();
		const controller = (assistController = new AbortController());
		assistLoading = true;
		assistFor = text;
		try {
			const response = await fetch(resolve('/climate/suggest'), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				signal: controller.signal,
				body: JSON.stringify({
					text,
					wall: preview ? wall.map(({ id, body }) => ({ id, body })) : undefined,
					avoid: refresh ? assistSeen : []
				})
			});
			if (!response.ok) throw new Error('Suggestions unavailable');
			const next: Assist = await response.json();
			if (controller.signal.aborted || drafts.public.trim() !== text) return;
			assistSeen = [...assistSeen, ...next.suggestions].slice(-9);
			assist = {
				suggestions: next.suggestions.slice(0, 3),
				matches: next.matches.slice(0, 3),
				blocked: next.blocked
			};
		} catch {
			// Suggestions are a nicety; the bar works without them.
		} finally {
			if (assistController === controller) assistLoading = false;
		}
	}

	$effect(() => {
		const text = drafts.public.trim();
		if (!ready || isPrivate || text.length < 3) {
			untrack(clearAssist);
			return;
		}
		if (text === untrack(() => assistFor)) return;
		const timer = setTimeout(() => fetchAssist(text), 900);
		return () => clearTimeout(timer);
	});

	function useSuggestion(term: string) {
		drafts.public = term;
		assistFor = term;
		assist = { ...assist, suggestions: [], blocked: false };
		messageField?.focus();
	}

	const sameTerm = (a: string, b: string) =>
		a
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim() ===
		b
			.toLowerCase()
			.replace(/[^\p{L}\p{N}]+/gu, ' ')
			.trim();

	/** Join an existing thought instead of posting a near-duplicate. */
	function plusOne(entry: Entry) {
		drafts.public = '';
		clearAssist();
		if (entry.reacted) {
			pulse(entry.id, { remote: false, liked: true, boost: entry.boosted });
			feedback.vote = `You’ve already +1’d “${entry.body}”`;
			return;
		}
		void setReaction(entry, 1);
		feedback.vote = `+1 added to “${entry.body}”`;
	}

	/**
	 * The local preview has no database, but public posts still go through the same server-side
	 * screening (local checks + AI) before they appear, shown as their condensed term.
	 */
	async function previewPublish(body: string) {
		pendingForm = 'contribute';
		checking = true;
		feedback.contribute = '';
		try {
			const response = await fetch(resolve('/climate/suggest'), {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					text: body,
					wall: wall.map(({ id, body }) => ({ id, body })),
					screen: true
				})
			});
			if (!response.ok) throw new Error('Screening unavailable');
			const verdict: {
				verdict?: 'allow' | 'review' | 'block';
				term?: string | null;
				reason?: string;
			} = await response.json();

			if (verdict.verdict === 'block') {
				feedback.contribute =
					'This can’t go on the public wall. Try rephrasing, or switch to Private.';
				return;
			}
			const term = verdict.term?.trim() || body;
			const duplicate = wall.find((entry) => sameTerm(entry.body, term));
			drafts.public = '';
			if (duplicate) {
				plusOne(duplicate);
				return;
			}
			const id = crypto.randomUUID();
			rememberMine({ id });
			previewEntries = [
				{
					id,
					body: term,
					topic: null,
					reactions: 0,
					reacted: false,
					boosted: false,
					comments: 0,
					downvoted: false
				},
				...previewEntries.slice(0, 79)
			];
			feedback.contribute =
				verdict.verdict === 'allow'
					? term !== body
						? `Checked by AI. Shortened to “${term}”.`
						: 'Checked by AI. Floating up now.'
					: `An editor would review this first${verdict.reason ? ` (${verdict.reason.toLowerCase()})` : ''}. Shown here because this is a preview.`;
		} catch {
			feedback.contribute = 'Couldn’t check that post. Try again.';
		} finally {
			pendingForm = null;
			checking = false;
		}
	}

	function sendOnEnter(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
		if (event.key !== 'Enter' || event.shiftKey || event.isComposing) return;
		event.preventDefault();
		// An empty bar does nothing; no browser validation bubble.
		if (event.currentTarget.value.trim()) event.currentTarget.form?.requestSubmit();
	}

	const contributeMessage = $derived(
		preview
			? feedback.contribute
			: form?.kind === 'contribute' && typeof form.message === 'string'
				? form.message
				: ''
	);
	const presenceLabel = $derived(
		!connected ? 'Room open' : here <= 1 ? 'You’re here first' : `${here} here now`
	);
</script>

<svelte:head>
	<title>The climate cost of conflict | The New Humanitarian</title>
	<link
		rel="preload"
		as="image"
		type="image/avif"
		imagesrcset={photos[firstPhoto].avif}
		imagesizes={backdropSizes}
		fetchpriority="high"
	/>
	<noscript
		><style>
			.backdrop img {
				opacity: 1 !important;
			}
		</style></noscript
	>
	<link
		rel="preload"
		href="/fonts/GT-Sectra-Fine-Bold.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/GT-Sectra-Fine-Regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<link
		rel="preload"
		href="/fonts/roboto-v29-latin-regular.woff2"
		as="font"
		type="font/woff2"
		crossorigin="anonymous"
	/>
	<meta
		name="description"
		content="Explore the environmental toll of war and join The New Humanitarian’s climate conversation."
	/>
</svelte:head>

<Dialog.Root bind:open={aboutOpen}>
	<div
		class="climate"
		class:keyboard-open={keyboardViewportHeight !== undefined}
		style:--keyboard-viewport={keyboardViewportHeight ? `${keyboardViewportHeight}px` : undefined}
	>
		<header class="masthead">
			<div class="share">
				<!-- One plain share icon that opens a small share menu. -->
				<SharePopover title={shareTitle} message={shareMessage} />
			</div>
			<a
				class="wordmark"
				href="https://www.thenewhumanitarian.org/"
				aria-label="The New Humanitarian home"
				bind:this={wordmark}
			>
				<img
					src="/images/climate/tnh-wordmark-white.svg"
					alt="The New Humanitarian"
					width="165"
					height="44"
				/>
			</a>
			<!-- Bits UI's trigger only opens; while About is open, the header button closes it. -->
			<Dialog.Trigger
				class="climate-button about-trigger"
				aria-label="About the project"
				onclick={(event) => {
					if (!aboutOpen) return;
					event.preventDefault();
					aboutOpen = false;
				}}
			>
				<svg class="about-icon" viewBox="0 0 20 20" aria-hidden="true">
					<circle cx="10" cy="10" r="7.5" />
					<path d="M10 9v5" />
					<circle class="dot" cx="10" cy="6.2" r="0.6" />
				</svg>
				<span class="about-label">About</span>
			</Dialog.Trigger>
		</header>

		<main
			class={['scene', { still: motionPaused, panning }]}
			bind:clientWidth={sceneWidth}
			bind:clientHeight={sceneHeight}
			onpointermove={(event) => {
				panMove(event);
				const point = showCursors ? scenePoint(event) : null;
				if (point) room?.move(point.x, point.y);
			}}
			onpointerdown={(event) => {
				const point = showCursors ? scenePoint(event) : null;
				if (point) room?.tap(point.x, point.y);
				panStart(event);
			}}
			onpointerup={panEnd}
			onpointercancel={panEnd}
			onlostpointercapture={panEnd}
			onpointerleave={() => room?.leave()}
		>
			<div class="backdrops" aria-hidden="true" bind:this={backdrops}>
				<div class="breathe">
					{#each photos as photo, index (photo.slug)}
						<div
							class={[
								'backdrop',
								{
									current: index === current,
									previous: index === previous,
									showing: ready && index === current
								}
							]}
							style:--focus={photo.focus}
							style:--shade={photo.shade}
						>
							<div class="placeholder" style:background-image={`url(${photo.placeholder})`}></div>
							{#if mountedSlides[index] || index === current}
								<picture>
									<source type="image/avif" srcset={photo.avif} sizes={backdropSizes} />
									<img
										class:loaded={loadedSlides[index]}
										srcset={photo.webp}
										sizes={backdropSizes}
										src={photo.src}
										width={photo.width}
										height={photo.height}
										alt=""
										decoding="async"
										fetchpriority={index === firstPhoto ? 'high' : 'low'}
										use:slideImage={index}
									/>
								</picture>
							{/if}
						</div>
					{/each}
				</div>
			</div>

			<div class="scene-content">
				<div class="intro" bind:this={intro}>
					<h1>The climate cost of conflict</h1>
					<p class="deck">War carries a climate cost that extends far beyond the battlefield.</p>
					<a class="event-link" href={eventUrl} target="_blank" rel="noopener">
						Register for the webinar
						<svg viewBox="0 0 16 16" aria-hidden="true"
							><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" /></svg
						>
					</a>
				</div>

				<ThoughtField
					bind:this={thoughtField}
					oncamera={moveBackdrop}
					{cameraLimit}
					entries={wall}
					onvote={vote}
					{canReact}
					{pulses}
					{isMine}
					onwithdraw={withdraw}
					commentsEnabled={data.configured && (commentsLive ?? data.commentsEnabled)}
					formStamp={data.formStamp}
					refreshKey={wallTick}
					onposted={() => {
						room?.wallChanged();
						reloadWall?.();
					}}
					paused={motionPaused}
					avoid={[intro]}
				/>

				<form class="shout" method="POST" action="?/contribute" use:enhance={submit('contribute')}>
					<input type="hidden" name="visibility" value={visibility} />
					<input type="hidden" name="started" value={data.formStamp} />
					<input
						class="visually-hidden"
						type="text"
						name="website"
						tabindex="-1"
						autocomplete="off"
						aria-hidden="true"
					/>
					{#if checking}
						<div class="assist" aria-live="polite">
							<p class="checking">
								<svg class="checking-leaf" viewBox="0 0 20 20" aria-hidden="true">
									<path d="M10 1C16 5 17 13 10 19C3 13 4 5 10 1Z" />
								</svg>
								<span>Checking with ethical AI and condensing your thought…</span>
								<span class="checking-bar" aria-hidden="true"></span>
							</p>
						</div>
					{:else if showAssist}
						<div class="assist" aria-live="polite">
							{#if assist.blocked}
								<p class="assist-warning">
									This can’t go on the public wall. Try rephrasing, or switch to Private.
								</p>
							{:else}
								{#each matchedEntries as entry (entry.id)}
									<button
										type="button"
										class="chip match"
										onclick={() => plusOne(entry)}
										title="Already on the wall. Add your +1 instead of posting it again"
									>
										<span class="chip-label">On the wall</span>
										{entry.body}
										<span class="chip-count">+{entry.reactions + (entry.reacted ? 0 : 1)}</span>
									</button>
								{/each}
								{#each assist.suggestions as suggestion (suggestion)}
									<button type="button" class="chip" onclick={() => useSuggestion(suggestion)}>
										{suggestion}
									</button>
								{/each}
								<button
									type="button"
									class={['chip refresh', { spinning: assistLoading }]}
									aria-label="Suggest other phrasings"
									title="Suggest other phrasings (AI)"
									disabled={assistLoading}
									onclick={() => fetchAssist(drafts.public.trim(), true)}
								>
									<svg viewBox="0 0 20 20" aria-hidden="true">
										<path d="M16 10a6 6 0 1 1-1.8-4.3M16 3.5v3.2h-3.2" />
									</svg>
								</button>
							{/if}
						</div>
					{/if}
					<div class={['bar', { private: isPrivate }]} bind:this={shoutBar}>
						<button
							type="button"
							class="mode"
							role="switch"
							aria-checked={isPrivate}
							aria-label="Send privately to TNH"
							title={isPrivate
								? 'Private: only TNH will read this'
								: 'Public: may appear on the wall'}
							onclick={() => {
								visibility = isPrivate ? 'public' : 'private';
								messageField?.focus();
							}}
						>
							<svg viewBox="0 0 20 20" aria-hidden="true">
								{#if isPrivate}
									<rect x="4.5" y="9" width="11" height="8" />
									<path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
								{:else}
									<circle cx="10" cy="10" r="7" />
									<path d="M3 10h14M10 3c2.2 2 2.2 12 0 14M10 3c-2.2 2-2.2 12 0 14" />
								{/if}
							</svg>
							<span class="mode-label">{isPrivate ? 'Private' : 'Public'}</span>
						</button>
						<label class="visually-hidden" for="climate-message">
							{isPrivate ? 'Your private message to TNH' : 'Your thought or question'}
						</label>
						<textarea
							id="climate-message"
							name="message"
							bind:this={messageField}
							bind:value={drafts[visibility]}
							placeholder={isPrivate
								? narrow
									? 'Write to TNH…'
									: 'Write privately to the TNH team…'
								: 'What’s on your mind?'}
							autocomplete="off"
							maxlength={maxLength}
							rows="1"
							aria-describedby="visibility-note"
							enterkeyhint="send"
							readonly={!interactive}
							onkeydown={sendOnEnter}
						></textarea>
						<button
							class="send"
							type="submit"
							disabled={!interactive || pendingForm !== null || !drafts[visibility].trim()}
						>
							<span class="send-label"
								>{checking ? 'Checking' : pendingForm === 'contribute' ? 'Sending' : 'Send'}</span
							>
							<svg viewBox="0 0 20 20" aria-hidden="true">
								<path d="M10 16V4M4.5 9.5 10 4l5.5 5.5" />
							</svg>
						</button>
					</div>
					<div class="notes">
						<p id="visibility-note">
							{#if !interactive && !preview}
								Submissions are temporarily unavailable.
							{:else if isPrivate}
								<strong>Private.</strong> Only the TNH team will read this.
							{/if}
						</p>
						<p class="status" role="status">
							{#if draftLength > maxLength * 0.8}
								{maxLength - draftLength} characters left
							{:else}
								{contributeMessage || feedback.vote}
							{/if}
						</p>
					</div>
				</form>

				<footer class="scene-footer">
					<div class="room">
						<span class={['presence', { live: connected && here > 1 }]}>
							<span class="dot" aria-hidden="true"></span>{presenceLabel}
						</span>
						{#if connected}
							<button
								class="cursor-toggle"
								type="button"
								aria-pressed={showCursors}
								onclick={toggleCursors}
							>
								{showCursors ? 'Hide cursors' : 'Show cursors'}
							</button>
						{/if}
						{#if !prefersReducedMotion.current}
							<button
								type="button"
								aria-pressed={motionPaused}
								onclick={() => (motionPaused = !motionPaused)}
							>
								{motionPaused ? 'Play motion' : 'Pause motion'}
							</button>
						{/if}
						{#if wallUnavailable}<span>Reconnecting…</span>{/if}
					</div>
					<div class="credits">
						<!-- Credit for the photo on screen (the About dialog lists them all). It sits first, so
						     a longer or shorter name never shifts the links to its right. -->
						{#key current}
							<span class="photo-credit">
								Photo:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={photoCredit.profile} target="_blank" rel="noopener">{photoCredit.name}</a>
								/
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={photoCredit.page} target="_blank" rel="noopener">{photoCredit.source}</a>
							</span>
						{/key}
						<Dialog.Trigger class="ethical-link"
							><span class="long-ethics">Moderated with ethical AI</span><span class="short-ethics"
								>Ethical AI</span
							></Dialog.Trigger
						>
						<a href="https://www.thenewhumanitarian.org/legal/privacy-policy">Privacy</a>
					</div>
				</footer>
			</div>

			{#if showCursors}
				<PeerLayer
					cursors={shownCursors}
					{ripples}
					width={sceneWidth}
					height={sceneHeight}
					trails={trailCursors}
				/>
			{/if}
		</main>

		{#each launches as item (item.key)}
			<div
				class="launch"
				style:left={`${item.from.left + 24}px`}
				style:top={`${item.from.top + item.from.height / 2}px`}
				style:max-width={`${item.from.width - 48}px`}
				use:flight={item}
				aria-hidden="true"
			>
				{item.text}
			</div>
		{/each}
	</div>

	<Dialog.Portal>
		<Dialog.Overlay class="climate-overlay" />
		<!-- Focus the box itself on open, not the close button: no ring greets every visitor, and
		     keyboard users still Tab straight to the close button. -->
		<Dialog.Content
			class="climate-dialog"
			bind:ref={aboutBox}
			onOpenAutoFocus={(event) => {
				event.preventDefault();
				aboutBox?.focus({ preventScroll: true });
			}}
			onInteractOutside={(event) => {
				// The header's About button closes the box itself (it toggles); without this the outside
				// press would close it first and the click would open it again.
				if ((event.target as Element | null)?.closest?.('.about-trigger')) event.preventDefault();
			}}
		>
			<Dialog.Close class="climate-close" aria-label="Close About">
				<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 5l10 10M15 5 5 15" /></svg>
			</Dialog.Close>
			<!-- Scrolls inside the glass, so the scrollbar sits inset from the edges and the close
			     button stays put. -->
			<div class="dialog-body">
				<Dialog.Title class="climate-dialog-title">About the project</Dialog.Title>
				<Dialog.Description class="climate-description">
					War carries a climate cost that extends far beyond the battlefield and persists long after
					the fighting ends.
				</Dialog.Description>
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
					troops and equipment. Once fighting begins, war destroys forests and other carbon stores,
					damages water systems and farmland, disrupts climate adaptation and diverts public money
					from climate action. When it ends, debris, unexploded munitions and toxic waste leave
					pollutants in soil and water for years. Rebuilding then adds further emissions.
				</p>
				<p>
					We often hear how climate change drives conflict. Far less is known about how conflict
					damages the climate. The New Humanitarian is bringing this hidden toll into view. Our
					project combines data, on-the-ground reporting and conversations among climate,
					humanitarian and peacebuilding experts to show what conflict is doing to the planet and to
					the people living with the consequences. Here’s what we bring:
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
						<strong>Beyond carbon.</strong> We look at the harms that outlast the fighting: poisoned water,
						ruined farmland, displacement and land left unusable for years.
					</li>
					<li>
						<strong>Making sense of scattered evidence.</strong> We bring the research together to show
						what we know, what remains unknown and where action is most needed.
					</li>
				</ul>
				<p>
					<strong>Get involved.</strong> The project is just getting started. If you work in this
					space, or have research, stories or ideas to share, we’d love to hear from you.
					<a href="https://www.thenewhumanitarian.org/about-us/contact-us">Get in touch</a>.
				</p>
				<ul class="project-links" aria-label="Project links">
					<li><a href={eventUrl} target="_blank" rel="noopener">Register for the webinar</a></li>
					<!-- Placeholder until the op-ed is published. -->
					<li><span class="soon">Tammam’s op-ed <em>coming soon</em></span></li>
				</ul>
				<Dialog.Close class="climate-button enter-button">Join the conversation</Dialog.Close>
				<section class="dialog-updates" aria-labelledby="updates-title">
					<h2 id="updates-title">Stay engaged</h2>
					<p>Get updates on TNH’s reporting, research and events.</p>
					<NewsletterSignup />
				</section>
				<section class="dialog-ethics" aria-labelledby="ethics-title">
					<h2 id="ethics-title">Moderated with ethical AI</h2>
					<p>
						Public thoughts and comments are checked by
						<a href="https://thaura.ai" target="_blank" rel="noopener">Thaura</a>, an ethical AI. It
						runs an open-weights model on its own servers in Finland, powered largely by renewable
						energy, and it never trains on or keeps what you write. It only screens out hate,
						harassment, threats and spam, and suggests shorter wording. TNH editors review anything
						it flags.
					</p>
					<p>Private messages to TNH are never sent to any AI.</p>
				</section>
				<section class="dialog-photos" aria-labelledby="photos-title">
					<h2 id="photos-title">Photos</h2>
					<ul>
						{#each photos as photo (photo.slug)}
							<li>
								{photo.alt}:
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={photo.credit.profile} target="_blank" rel="noopener">{photo.credit.name}</a
								>
								on
								<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
								<a href={photo.credit.page} target="_blank" rel="noopener">{photo.credit.source}</a>
							</li>
						{/each}
					</ul>
				</section>
			</div>
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>

<style>
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-regular.woff2') format('woff2');
		font-display: optional;
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Roboto';
		src: url('/fonts/roboto-v29-latin-700.woff2') format('woff2');
		font-display: optional;
		font-weight: 700;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Regular.woff2') format('woff2');
		font-display: optional;
		font-weight: 400;
	}
	@font-face {
		font-family: 'Climate Sectra';
		src: url('/fonts/GT-Sectra-Fine-Bold.woff2') format('woff2');
		font-display: optional;
		font-weight: 700;
	}

	:global(html:has(.climate)),
	:global(body:has(.climate)) {
		overflow: hidden;
		overscroll-behavior: none;
		background: #282828;
	}
	.climate,
	:global(.climate-dialog) {
		--brand: #9f3e52;
		--brand-hover: #803244;
		--ink: #282828;
		--serif: 'Climate Sectra', Georgia, serif;
		--sans: 'Climate Roboto', Arial, sans-serif;
		font: 400 1rem/1.5 var(--sans);
	}
	.climate :where(h1, h2, p),
	:global(.climate-dialog) :where(p, h2) {
		margin: 0;
	}
	.climate {
		--masthead-height: clamp(3.5rem, 8svh, 4.5rem);
		/* Header and footer edge: the same as the gap above and below the 2.75rem header buttons. */
		--edge-x: max(0.5rem, calc((var(--masthead-height) - 2.75rem) / 2));
		--pad-x: clamp(1.05rem, 5.3vw, 6.4rem);
		display: grid;
		grid-template-rows: var(--masthead-height) minmax(0, 1fr);
		height: 100vh;
		height: var(--keyboard-viewport, 100dvh);
		overflow: clip;
	}
	/* One focus treatment everywhere, including the buttons Bits UI renders (scoped rules never reach
	   them): never the browser's blue; a single white ring, only when focus came from the keyboard.
	   Component rules can still set their own (the white share menu uses burgundy). */
	:global(:where(.climate, .climate-dialog, .share-menu) :focus) {
		outline: none;
	}
	:global(:where(.climate, .climate-dialog) :focus-visible) {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}
	.climate :where(a, button, input, textarea):focus {
		outline: none;
		box-shadow: none;
	}
	.climate :where(a, button):focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}
	:global(.climate-dialog) :where(a, button, input):focus {
		box-shadow: none;
	}
	:global(.climate-dialog) :where(a, button, input):focus-visible {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}
	.climate a {
		color: inherit;
	}
	:global(.climate-button) {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.68rem 1.15rem;
		background: var(--brand);
		border: 0;
		border-radius: 0;
		color: white;
		font: 700 0.93rem/1.3 var(--sans);
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	:global(.climate-button:hover:not(:disabled)) {
		background: var(--brand-hover);
	}
	:global(.climate-button:disabled) {
		cursor: default;
		opacity: 0.58;
	}

	/* Masthead */
	.masthead {
		position: relative;
		z-index: 10;
		/* Bits UI blocks pointer events on the page while About is open; the header stays usable. */
		pointer-events: auto;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		padding-inline: var(--edge-x);
		gap: 0.75rem;
		background: var(--ink);
		color: #fff;
	}
	.wordmark {
		grid-column: 2;
	}
	.share {
		position: relative;
		grid-column: 1;
		grid-row: 1;
		justify-self: start;
		display: flex;
		align-items: center;
	}
	.wordmark img {
		display: block;
		width: clamp(120px, 14vw, 165px);
		aspect-ratio: 405.32 / 109.7;
		height: auto;
	}
	:global(.about-trigger) {
		grid-column: 3;
		justify-self: end;
	}
	:global(.about-icon) {
		display: none;
		width: 1.35rem;
		height: 1.35rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}
	:global(.about-icon .dot) {
		fill: currentColor;
	}
	/* Phones: plain info icon, no box. */
	@media (max-width: 650px) {
		.climate {
			--edge-x: 1rem;
		}

		:global(.about-trigger) {
			width: 2.75rem;
			min-height: 2.75rem;
			margin-right: -0.6rem;
			padding: 0;
			background: none;
		}
		:global(.about-trigger:hover:not(:disabled)) {
			background: rgb(255 255 255 / 10%);
		}
		:global(.about-icon) {
			display: block;
		}
		:global(.about-label) {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
	}
	/* Bits UI renders this button, so the scoped focus rule above never reaches it. Without this the
	   browser draws its own two-tone ring; use the same single white ring as everything else. */
	:global(.climate-button:focus) {
		outline: none;
		box-shadow: none;
	}
	:global(.climate .climate-button:focus-visible) {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}

	/* Scene */
	.scene {
		position: relative;
		isolation: isolate;
		display: grid;
		min-height: 0;
		overflow: clip;
		background: #25271d;
		color: #fffdf5;
		/* Horizontal drags pan the canvas, on touch as well as with a mouse. */
		touch-action: none;
		cursor: grab;
	}
	.scene.panning {
		cursor: grabbing;
		user-select: none;
		-webkit-user-select: none;
	}
	/* Wider than the scene so the parallax shift never reveals an edge. */
	.backdrops {
		position: absolute;
		inset: 0 -12%;
		will-change: transform;
		z-index: -2;
		overflow: hidden;
	}
	/* One slide per photo, stacked. The current one fades in over the previous one, which stays
	   opaque underneath, so the crossfade never dips through to the background colour. */
	.backdrop {
		position: absolute;
		inset: 0;
		overflow: hidden;
		opacity: 0;
		transition: opacity 4s ease-in-out;
	}
	.backdrop.previous {
		z-index: 1;
		opacity: 1;
		transition: none;
	}
	.backdrop.current {
		z-index: 2;
		opacity: 1;
	}
	/* Blur-up: a 24px preview, blurred, until the real image has decoded. */
	.placeholder {
		position: absolute;
		inset: -6%;
		background-position: var(--focus);
		background-size: cover;
		filter: blur(22px);
	}
	.backdrop img {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: var(--focus);
		opacity: 0;
		transition: opacity 700ms ease;
	}
	.backdrop img.loaded {
		opacity: 1;
	}
	/* Per-photo shade, so bright daylight shots sit in the page's dark palette with the dusk ones. */
	.backdrop::after {
		content: '';
		position: absolute;
		inset: 0;
		background: rgb(18 18 14 / calc(var(--shade, 0) * 100%));
	}
	/* One slow zoom for both images, so a crossfade never looks like the motion restarting. */
	.breathe {
		position: absolute;
		inset: 0;
		transform-origin: 55% 50%;
		animation: breathe 70s ease-in-out infinite alternate;
	}
	.scene.still .breathe {
		animation-play-state: paused;
	}
	@keyframes breathe {
		from {
			transform: scale(1.02) translate3d(0, 0, 0);
		}
		to {
			transform: scale(1.12) translate3d(-1.5%, -1%, 0);
		}
	}
	.scene::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		background:
			radial-gradient(ellipse 120% 90% at 70% 45%, transparent 30%, rgb(16 16 12 / 55%) 100%),
			linear-gradient(
				180deg,
				rgb(20 20 13 / 45%),
				transparent 30%,
				transparent 62%,
				rgb(14 16 12 / 80%)
			),
			linear-gradient(90deg, rgb(20 20 15 / 62%), rgb(20 20 15 / 18%) 55%, transparent);
	}
	.scene-content {
		display: grid;
		grid-template-rows: auto minmax(0, 1fr) auto auto;
		grid-template-columns: minmax(0, 1fr);
		min-width: 0;
		min-height: 0;
		padding: clamp(1.1rem, 4vh, 3.2rem) var(--pad-x) 0;
	}
	.intro {
		position: relative;
		z-index: 2;
		grid-row: 1;
		grid-column: 1;
		align-self: start;
		justify-self: start;
		max-width: min(100%, 62rem);
		padding-bottom: 0.5rem;
		pointer-events: none;
	}
	.intro a {
		pointer-events: auto;
	}
	.intro h1 {
		font: 700 clamp(2.35rem, 6.1vw, 7rem) / 0.98 var(--serif);
		letter-spacing: -0.038em;
		text-wrap: balance;
		text-shadow: 0 2px 30px rgb(0 0 0 / 35%);
	}
	.deck {
		margin-block-start: 0.6rem;
		font-size: clamp(0.98rem, 1.6vw, 1.25rem);
		text-shadow: 0 1px 12px rgb(0 0 0 / 50%);
	}
	.event-link {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		margin-top: 0.45rem;
		font-size: 0.93rem;
		font-weight: 700;
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.27em;
	}
	.event-link svg {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		transition: transform 200ms ease;
	}
	.event-link:hover svg {
		transform: translateX(3px);
	}

	/* The thought field spans the intro and the open stage, edge to edge. */
	.scene-content > :global(.field) {
		z-index: 3;
		grid-row: 1 / 3;
		grid-column: 1;
		margin-inline: calc(-1 * var(--pad-x));
		margin-top: calc(-1 * clamp(1.1rem, 4vh, 3.2rem));
	}

	/* A comment thread covering the headline and shout bar (shorter screens): lift the field above
	   the shout bar and fade what's underneath, so only one text box shows. */
	.intro,
	.shout {
		transition:
			opacity 220ms ease,
			visibility 220ms;
	}
	.scene-content:has(:global(.thread.cover)) > :global(.field) {
		z-index: 7;
	}
	.scene-content:has(:global(.thread.cover)) .intro,
	.scene-content:has(:global(.thread.cover)) .shout {
		opacity: 0;
		visibility: hidden;
	}

	/* Shout bar */
	.shout {
		position: relative;
		z-index: 5;
		grid-row: 3;
		min-width: 0;
		padding-top: clamp(0.4rem, 1.5vh, 1rem);
	}
	.bar {
		--bar-h: clamp(3.6rem, 8.5vh, 5.1rem);
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: 0.5rem;
		height: var(--bar-h);
		/* Same inset on every side, so both pills sit concentric inside the bar. */
		--bar-pad: 0.5rem;
		padding: var(--bar-pad);
		border-radius: 100vmax;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 26%), rgb(255 255 255 / 10%)), rgb(40 40 40 / 16%);
		backdrop-filter: blur(22px) saturate(170%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 45%),
			inset 0 -1px 1px rgb(255 255 255 / 10%),
			0 20px 60px rgb(0 0 0 / 45%),
			0 2px 6px rgb(0 0 0 / 25%);
		transition:
			background-color 250ms ease,
			box-shadow 250ms ease;
	}
	.bar:focus-within {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 32%), rgb(255 255 255 / 14%)), rgb(40 40 40 / 10%);
		box-shadow:
			inset 0 0 0 1.5px rgb(255 255 255 / 75%),
			0 24px 70px rgb(0 0 0 / 50%),
			0 2px 6px rgb(0 0 0 / 25%);
	}
	.bar.private {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 14%), rgb(255 255 255 / 4%)), rgb(28 28 28 / 58%);
	}
	.mode {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 100%;
		padding-inline: 0.95rem 1.1rem;
		border: 0;
		border-radius: 100vmax;
		background: rgb(255 255 255 / 14%);
		color: #fff;
		font: 700 0.9rem/1 var(--sans);
		cursor: pointer;
		transition:
			background-color 200ms ease,
			color 200ms ease;
	}
	.mode:hover {
		background: rgb(255 255 255 / 24%);
	}
	.mode[aria-checked='true'] {
		background: #fff;
		color: var(--ink);
	}
	.mode svg,
	.send svg {
		width: 1.15rem;
		height: 1.15rem;
		flex: none;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.7;
	}
	.climate .mode:focus-visible,
	.climate .send:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	textarea {
		display: block;
		width: 100%;
		min-width: 0;
		height: 100%;
		border: 0;
		border-radius: 0;
		/* Centre one line of text in the space the bar's inset leaves. */
		padding: calc((var(--bar-h) - 2 * var(--bar-pad) - 1.3em) / 2) 0.6rem;
		background: transparent;
		color: #fff;
		font: 400 clamp(1.05rem, 1.7vw, 1.4rem) / 1.3 var(--sans);
		resize: none;
		scrollbar-width: none;
		caret-color: #fff;
	}
	textarea::placeholder {
		color: rgb(255 255 255 / 85%);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.climate textarea:focus {
		border: 0;
		outline: none;
		box-shadow: none;
	}
	.send {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		height: 100%;
		min-width: clamp(7.5rem, 11vw, 10rem);
		padding-inline: 1.75rem 1.6rem;
		border: 0;
		border-radius: 100vmax;
		background: var(--brand);
		color: #fff;
		font: 700 clamp(0.95rem, 1.4vw, 1.1rem) / 1 var(--sans);
		cursor: pointer;
		box-shadow: inset 0 1px 0 rgb(255 255 255 / 25%);
		transition:
			background-color 150ms ease,
			opacity 150ms ease;
	}
	.send:hover:not(:disabled) {
		background: var(--brand-hover);
	}
	.send:hover:not(:disabled) svg {
		animation: nudge 600ms ease-in-out;
	}
	.send:disabled {
		cursor: default;
		opacity: 0.72;
	}
	@keyframes nudge {
		50% {
			transform: translateY(-3px);
		}
	}
	.notes {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		height: 2.1rem;
		padding: 0.5rem 1.4rem 0;
		font-size: 0.84rem;
		line-height: 1.3;
		color: #fff;
		text-shadow: 0 1px 8px rgb(0 0 0 / 60%);
	}
	.notes p {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.status {
		text-align: end;
		font-weight: 700;
	}

	/* AI phrasing suggestions float just above the bar, so they never shift the layout. */
	.assist {
		position: absolute;
		bottom: calc(100% - clamp(0.4rem, 1.5vh, 1rem) + 0.6rem);
		left: 0.6rem;
		right: 0.6rem;
		display: flex;
		flex-wrap: nowrap;
		align-items: center;
		gap: 0.45rem;
		overflow-x: auto;
		overscroll-behavior-x: contain;
		scrollbar-width: none;
		padding-block: 0.4rem;
		margin-block: -0.4rem;
		animation: assist-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes assist-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		min-height: 2.3rem;
		max-width: 100%;
		padding: 0.35rem 0.95rem;
		border: 0;
		border-radius: 100vmax;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 24%), rgb(255 255 255 / 10%)), rgb(40 40 40 / 30%);
		backdrop-filter: blur(16px) saturate(160%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 40%),
			0 8px 24px rgb(0 0 0 / 30%);
		flex: none;
		color: #fff;
		font: 400 0.95rem/1.15 var(--sans);
		text-align: left;
		white-space: nowrap;
		cursor: pointer;
		transition: background-color 180ms ease;
	}
	.chip:hover:not(:disabled) {
		background:
			linear-gradient(180deg, rgb(255 255 255 / 34%), rgb(255 255 255 / 16%)), rgb(40 40 40 / 25%);
	}
	.chip.match {
		background: #35b58b;
		color: var(--ink);
		box-shadow: 0 8px 24px rgb(0 0 0 / 30%);
	}
	.chip.match:hover {
		background: #2fa37d;
	}
	.chip-label {
		font: 700 0.7rem/1 var(--sans);
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}
	.chip-count {
		font: 700 0.85rem/1 var(--sans);
	}
	.chip.refresh {
		width: 2.3rem;
		padding: 0;
		justify-content: center;
	}
	.chip.refresh svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
	}
	.chip.refresh.spinning svg {
		animation: spin 900ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.checking {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 2.3rem;
		padding: 0.35rem 1rem 0.35rem 0.8rem;
		overflow: hidden;
		border-radius: 100vmax;
		background:
			linear-gradient(180deg, rgb(255 255 255 / 24%), rgb(255 255 255 / 10%)), rgb(40 40 40 / 30%);
		backdrop-filter: blur(16px) saturate(160%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 40%),
			0 8px 24px rgb(0 0 0 / 30%);
		color: #fff;
		font-size: 0.9rem;
		font-weight: 700;
		white-space: nowrap;
	}
	.checking-leaf {
		width: 1.05rem;
		height: 1.05rem;
		flex: none;
		fill: #35b58b;
		transform-origin: 50% 90%;
		animation: sway 1.4s ease-in-out infinite;
	}
	@keyframes sway {
		50% {
			transform: rotate(18deg) scale(1.12);
		}
	}
	/* An indeterminate shimmer along the bottom edge while the model works. */
	.checking-bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent, #35b58b, transparent);
		background-size: 40% 100%;
		background-repeat: no-repeat;
		animation: scan 1.2s linear infinite;
	}
	@keyframes scan {
		from {
			background-position: -40% 0;
		}
		to {
			background-position: 140% 0;
		}
	}
	.assist-warning {
		padding: 0.5rem 0.95rem;
		background: #9f3e52;
		color: #fff;
		font-size: 0.88rem;
		font-weight: 700;
	}

	/* Footer */
	.scene-footer {
		position: relative;
		z-index: 5;
		grid-row: 4;
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		height: 2.6rem;
		/* Reach out past the page gutter to line up with the header buttons. */
		margin-inline: calc(var(--edge-x) - var(--pad-x));
		border-top: 1px solid rgb(255 255 255 / 22%);
		font-size: 0.78rem;
		color: #fff;
		white-space: nowrap;
	}
	.room,
	.credits {
		display: flex;
		align-items: center;
		gap: clamp(0.6rem, 1.6vw, 1.2rem);
		min-width: 0;
	}
	/* The credit fades in with each new photo. */
	.photo-credit {
		animation: credit-in 900ms ease;
	}
	@keyframes credit-in {
		from {
			opacity: 0;
		}
	}
	.room button,
	.credits a,
	.credits :global(.ethical-link) {
		display: inline-flex;
		align-items: center;
		min-height: 2.4rem;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-decoration: underline;
		text-underline-offset: 0.22em;
		cursor: pointer;
	}
	.presence {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-weight: 700;
	}
	.dot {
		position: relative;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background: rgb(255 255 255 / 70%);
	}
	.presence.live .dot {
		background: #fff;
	}
	.presence.live .dot::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: #fff;
		animation: beacon 2s ease-out infinite;
	}
	@keyframes beacon {
		to {
			transform: scale(3);
			opacity: 0;
		}
	}

	/* Message launches out of the bar */
	.launch {
		position: fixed;
		z-index: 20;
		translate: 0 -50%;
		overflow: hidden;
		color: #fff;
		font: 400 clamp(1.05rem, 1.7vw, 1.4rem) / 1.3 var(--sans);
		white-space: nowrap;
		text-overflow: ellipsis;
		text-shadow: 0 2px 14px rgb(0 0 0 / 60%);
		pointer-events: none;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	/* About dialog: the same liquid glass and frame as the big thread panel, between the TNH
	   header and the footer, so the two read as one family. It is portalled out of .climate, so it
	   repeats the header measurements. */
	/* Starts below the header, so the TNH bar and its buttons stay clear and usable while About is open. */
	:global(.climate-overlay) {
		position: fixed;
		inset: clamp(3.5rem, 8svh, 4.5rem) 0 0;
		z-index: 90;
		background: rgb(19 17 15 / 60%);
		backdrop-filter: blur(10px);
	}
	:global(.climate-overlay[data-state='open']) {
		animation: overlay-in 260ms ease-out;
	}
	:global(.climate-dialog) {
		--masthead-height: clamp(3.5rem, 8svh, 4.5rem);
		--edge-x: max(0.5rem, calc((var(--masthead-height) - 2.75rem) / 2));
		position: fixed;
		z-index: 91;
		top: calc(var(--masthead-height) + var(--edge-x));
		bottom: calc(2.6rem + var(--edge-x));
		left: 50%;
		translate: -50% 0;
		display: flex;
		width: min(52rem, calc(100vw - 2rem));
		overflow: hidden;
		/* Room on the right and at the ends, so the scrollbar sits inset from the edges. */
		padding: 0.9rem 0.45rem 0.9rem 0;
		border-radius: 0;
		/* Nearly solid so long text reads cleanly; just a hint of glass in the sheen and edge. */
		background:
			linear-gradient(160deg, rgb(255 255 255 / 10%), rgb(255 255 255 / 2%) 55%),
			rgb(30 30 28 / 92%);
		backdrop-filter: blur(28px) saturate(170%);
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 50%),
			inset 0 -1px 1px rgb(255 255 255 / 12%),
			0 30px 80px rgb(0 0 0 / 45%),
			0 2px 8px rgb(0 0 0 / 25%);
		color: #fff;
		text-shadow: 0 1px 8px rgb(0 0 0 / 35%);
	}
	/* Bits UI focuses the box itself on open; that needs no ring. Controls inside keep theirs. */
	:global(.climate-dialog:focus),
	:global(.climate-dialog:focus-visible) {
		outline: none;
	}
	:global(.climate-dialog[data-state='open']) {
		animation: dialog-in 320ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.dialog-body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
		/* The top band is the close button's row: text fades out there as it scrolls under it. */
		--fade-top: 2.4rem;
		padding: var(--fade-top) clamp(0.85rem, 3.6vw, 2.15rem) clamp(0.4rem, 3vw, 1.7rem);
		scrollbar-width: thin;
		scrollbar-color: rgb(255 255 255 / 28%) transparent;
		scrollbar-gutter: stable;
		/* Text fades out at the top and bottom edges instead of being cut off. */
		mask-image: linear-gradient(
			transparent,
			#000 var(--fade-top),
			#000 calc(100% - 1rem),
			transparent
		);
	}
	.dialog-body::-webkit-scrollbar {
		width: 6px;
	}
	.dialog-body::-webkit-scrollbar-thumb {
		border-radius: 3px;
		background: rgb(255 255 255 / 28%);
	}
	@keyframes overlay-in {
		from {
			opacity: 0;
		}
	}
	@keyframes dialog-in {
		from {
			opacity: 0;
			translate: -50% 18px;
			scale: 0.98;
		}
	}
	:global(.climate-dialog-title) {
		margin: 0 2.6rem 0 0;
		font: 700 clamp(2rem, 4.4vw, 3.2rem) / 1.02 var(--serif);
		letter-spacing: -0.025em;
	}
	:global(.climate-dialog .climate-description) {
		margin-top: 0.9rem;
		font-weight: 700;
		font-size: 1.1rem;
		line-height: 1.45;
	}
	.dialog-body > p {
		margin-top: 1rem;
	}
	:global(.climate-dialog) a {
		color: #fff;
		font-weight: 700;
		text-decoration: underline;
		text-decoration-color: rgb(255 255 255 / 40%);
		text-underline-offset: 0.22em;
	}
	:global(.climate-dialog) a:hover {
		text-decoration-color: #fff;
	}
	.bring {
		display: grid;
		gap: 0.6rem;
		margin: 1rem 0 0;
		padding: 0;
		list-style: none;
	}
	.bring li {
		padding-left: 1rem;
		border-left: 3px solid var(--brand);
	}
	:global(.climate-close) {
		position: absolute;
		/* Above the scrolling text: its fade mask makes it a layer that would otherwise take the click. */
		z-index: 1;
		top: 1rem;
		right: 1rem;
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
	:global(.climate-close svg) {
		width: 1rem;
		height: 1rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
	}
	:global(.climate-close:hover) {
		background: rgb(255 255 255 / 22%);
	}
	.project-links {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.45rem 1.4rem;
		margin: 1.3rem 0 0;
		padding: 0;
		list-style: none;
	}
	.soon {
		font-weight: 700;
		color: rgb(255 255 255 / 70%);
	}
	.soon em {
		margin-left: 0.35rem;
		padding: 0.1rem 0.4rem;
		background: rgb(255 255 255 / 14%);
		font: 700 0.72rem/1 var(--sans);
		font-style: normal;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		vertical-align: 0.12em;
	}
	:global(.climate-dialog .enter-button) {
		margin: 1.4rem 0 1.6rem;
		text-shadow: none;
	}
	.credits :global(.ethical-link:focus) {
		outline: none;
		box-shadow: none;
	}
	.credits :global(.ethical-link:focus-visible) {
		outline: 2px solid #fff;
		outline-offset: 3px;
	}
	.dialog-photos {
		margin-top: 1.4rem;
		font-size: 0.85rem;
		color: rgb(255 255 255 / 72%);
	}
	.dialog-photos h2 {
		margin: 0 0 0.35rem;
		font: 700 1rem/1.2 var(--serif);
		color: #fff;
	}
	.dialog-photos ul {
		display: grid;
		gap: 0.2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.dialog-ethics {
		margin-top: 1.4rem;
		padding: 1rem 1.1rem;
		background: rgb(120 214 178 / 12%);
		border-left: 4px solid #35b58b;
	}
	.dialog-ethics h2 {
		margin: 0 0 0.4rem;
		font: 700 1.25rem/1.2 var(--serif);
	}
	.dialog-ethics p + p {
		margin-top: 0.5rem;
	}
	.dialog-updates {
		border-top: 1px solid rgb(255 255 255 / 15%);
		padding-top: 1.15rem;
	}
	.dialog-updates h2 {
		font: 700 1.8rem/1.1 var(--serif);
	}

	@media (max-width: 650px) {
		.scene::before {
			background: linear-gradient(
				180deg,
				rgb(19 19 19 / 72%),
				rgb(20 20 20 / 28%) 45%,
				rgb(20 20 20 / 34%) 70%,
				rgb(20 20 20 / 82%)
			);
		}
		.intro h1 {
			font-size: clamp(2.2rem, 10vw, 3.4rem);
		}
		.deck {
			font-size: 0.95rem;
		}
		.bar {
			--bar-h: 3.5rem;
			gap: 0.3rem;
			--bar-pad: 0.4rem;
		}
		.mode {
			padding-inline: 0.8rem;
		}
		.mode-label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		.send {
			min-width: 0;
			padding-inline: 1.15rem;
		}
		.notes {
			padding-inline: 0.9rem;
			font-size: 0.78rem;
			grid-template-columns: minmax(0, 1fr);
		}
		.status:empty {
			display: none;
		}
		.notes:has(.status:not(:empty)) #visibility-note {
			display: none;
		}
		.credits > span {
			display: none;
		}
		/* Phone footer: no cursors on touch, and a short link so nothing overprints. */
		.room .cursor-toggle {
			display: none;
		}
		/* An open comment thread is a full-screen sheet: lift it above the shout bar and footer,
		   and hide those so only one text box is on screen. */
		.scene-content:has(:global(.thread)) > :global(.field) {
			z-index: 7;
		}
		.scene-content:has(:global(.thread)) .shout,
		.scene-content:has(:global(.thread)) .scene-footer {
			visibility: hidden;
		}
		.credits :global(.ethical-link .long-ethics) {
			display: none;
		}
		.credits :global(.ethical-link .short-ethics) {
			display: inline;
		}
		.scene-footer {
			gap: 0.6rem;
			font-size: 0.75rem;
		}
		/* Round icon-only Public/Private and Send, so the text gets the room. */
		.mode,
		.send {
			width: calc(var(--bar-h) - 2 * var(--bar-pad));
			min-width: 0;
			padding: 0;
			justify-content: center;
		}
		.send-label {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip-path: inset(50%);
		}
		textarea {
			font-size: 1rem;
			padding-inline: 0.4rem;
		}
	}
	.credits :global(.short-ethics) {
		display: none;
	}

	@keyframes sheet-in {
		from {
			opacity: 0;
			translate: 0 18px;
		}
	}
	/* Phones: a calmer About dialog with smaller headings and more room for text. */
	@media (max-width: 650px) {
		/* Like the thread sheet on phones: full width under the TNH header. */
		:global(.climate-dialog) {
			top: var(--masthead-height);
			bottom: 0;
			left: 0;
			translate: none;
			width: 100%;
			padding: 0.6rem 0.25rem env(safe-area-inset-bottom) 0;
			border-radius: 0;
			background:
				linear-gradient(180deg, rgb(255 255 255 / 8%), rgb(255 255 255 / 2%)), rgb(28 28 26 / 95%);
			box-shadow: none;
			font-size: 0.95rem;
		}
		:global(.climate-dialog[data-state='open']) {
			animation-name: sheet-in;
		}
		.dialog-body {
			--fade-top: 2.7rem;
			padding: var(--fade-top) 0.85rem 1.5rem 1.1rem;
		}
		:global(.climate-dialog-title) {
			margin-right: 2.4rem;
			font-size: 1.65rem;
		}
		:global(.climate-dialog .climate-description) {
			font-size: 0.98rem;
			line-height: 1.4;
		}
		:global(.climate-close) {
			top: 0.9rem;
			right: 0.9rem;
		}
		.dialog-updates h2 {
			font-size: 1.35rem;
		}
		.dialog-ethics h2 {
			font-size: 1.1rem;
		}
		.project-links {
			flex-direction: column;
			gap: 0.5rem;
		}
	}

	/* Phones: no panning. Each image glides slowly left to right while it shows, then crossfades;
	   it slides back while hidden, so the drift never visibly jumps. */
	@media (max-width: 650px) {
		.scene {
			touch-action: manipulation;
			cursor: auto;
		}
	}
	@media (max-width: 650px) and (prefers-reduced-motion: no-preference) {
		.backdrop {
			transform: translateX(-7%);
			transition:
				opacity 4s ease-in-out,
				transform 0s linear 4s;
		}
		.backdrop.showing {
			transform: translateX(7%);
			transition:
				opacity 4s ease-in-out,
				transform 34s linear;
		}
		/* Keep drifting while the next photo fades in over it; reset only once it's hidden. */
		.backdrop.previous {
			transform: translateX(7%);
			transition: transform 34s linear;
		}
	}

	@media (max-height: 560px) {
		.scene-content {
			padding-top: 0.65rem;
		}
		.scene-content > :global(.field) {
			margin-top: -0.65rem;
		}
		.intro h1 {
			font-size: clamp(1.7rem, 5.8vw, 3rem);
		}
		.deck {
			display: none;
		}
		.bar {
			--bar-h: 3rem;
		}
		.notes {
			height: 1.7rem;
			padding-top: 0.3rem;
		}
		.scene-footer {
			height: 2.1rem;
		}
	}

	.keyboard-open .scene-content {
		padding-top: 0.55rem;
	}
	.keyboard-open .intro h1 {
		font-size: clamp(1.6rem, 6.5vw, 2.3rem);
	}
	.keyboard-open .deck,
	.keyboard-open .scene-footer {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.breathe {
			animation: none;
		}
		.backdrop,
		.backdrop img {
			transition: none;
		}
		.photo-credit {
			animation: none;
		}
		.presence.live .dot::after,
		.assist,
		.checking-leaf,
		.checking-bar,
		.chip.refresh.spinning svg,
		.send:hover:not(:disabled) svg,
		:global(.climate-overlay[data-state='open']),
		:global(.climate-dialog[data-state='open']) {
			animation: none;
		}
	}
</style>
