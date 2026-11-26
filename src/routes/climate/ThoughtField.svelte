<script lang="ts" module>
	export type Pulse = { n: number; remote: boolean; liked: boolean; boost?: boolean; by?: string };
</script>

<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { fly } from 'svelte/transition';
	import ThoughtThread from './ThoughtThread.svelte';
	import type { PageData } from './$types';

	type Entry = PageData['wall'][number];
	type Mode = 'pop' | 'edge' | 'rise';
	type Body = {
		id: string;
		mode: Mode;
		placed: boolean;
		x: number;
		y: number;
		w: number;
		h: number;
		vx: number;
		vy: number;
		bx: number;
		by: number;
		phase: number;
		bob: number;
		age: number;
		life: number;
		state: 'in' | 'live' | 'out';
		alpha: number;
		held: boolean;
		dragging: boolean;
		/** Parallax: how strongly the term follows a pan (nearer terms move more). */
		depth: number;
		/** Still drifting in from beyond the edge; don't retire it for being off-screen yet. */
		entering: boolean;
		/** Selected by a click: it stays still until deselected. */
		pinned: boolean;
	};
	type Grab = {
		id: string;
		pointer: number;
		startX: number;
		startY: number;
		offsetX: number;
		offsetY: number;
		samples: { t: number; x: number; y: number }[];
		moved: boolean;
	};

	interface Props {
		entries: Entry[];
		react: SubmitFunction;
		canReact: boolean;
		pendingEntry: string | null;
		pulses: Record<string, Pulse>;
		paused: boolean;
		avoid?: (HTMLElement | undefined)[];
		/** Reports the camera offset so the page can move the backdrop with parallax. */
		oncamera?: (x: number) => void;
		/** How far the canvas pans each way: as far as the backdrop image can travel. */
		cameraLimit?: number;
		/** Hidden easter egg: a double-click boosts a thought to +2. */
		onboost?: (id: string) => void;
		/** Thoughts this browser posted. They get a remove button only their author sees. */
		isMine?: (entry: Entry) => boolean;
		/** Author takes their thought off the wall (TNH keeps it privately). */
		onwithdraw?: (entry: Entry) => void;
		/** Comment threads (needs the database). */
		commentsEnabled?: boolean;
		formStamp?: string;
		refreshKey?: number;
		onposted?: () => void;
	}

	let {
		entries,
		react,
		canReact,
		pendingEntry,
		pulses,
		paused,
		avoid = [],
		oncamera,
		cameraLimit = Infinity,
		onboost,
		isMine = () => false,
		onwithdraw,
		commentsEnabled = false,
		formStamp = '',
		refreshKey = 0,
		onposted = () => {}
	}: Props = $props();

	// The field is a window onto a wider canvas: panning slides every term past it.
	let camera = 0;
	let panVelocity = 0;
	let panning = false;
	let lastPanAt = -Infinity;
	let panDirection = 0;

	function overshoot() {
		return camera > cameraLimit
			? camera - cameraLimit
			: camera < -cameraLimit
				? camera + cameraLimit
				: 0;
	}

	/**
	 * Slide the canvas by dx pixels. Nearer terms move a little more than farther ones.
	 * Past either end of the canvas the drag meets growing resistance, like a rubber band.
	 */
	export function panBy(dx: number, resist = true) {
		if (!dx) return;
		const over = overshoot();
		if (resist && over && Math.sign(dx) === Math.sign(over)) {
			dx *= Math.max(0.08, 1 - Math.abs(over) / 160) * 0.5;
		}
		camera += dx;
		panDirection = Math.sign(dx);
		lastPanAt = performance.now();
		for (const body of bodies.values()) {
			if (!body.dragging) body.x += dx * body.depth;
		}
		oncamera?.(camera);
	}

	export function startPan() {
		panning = true;
		panVelocity = 0;
	}

	/** Let go of the canvas: it glides on and slows down. */
	export function endPan(velocity: number) {
		panning = false;
		panVelocity = prefersReducedMotion.current ? 0 : Math.max(-1300, Math.min(1300, velocity));
	}

	let field: HTMLDivElement;
	let width = $state(0);
	let height = $state(0);
	let active = $state<string[]>([]);
	let fresh = $state<Record<string, true>>({});
	// The thought whose remove button is waiting for a second, confirming click.
	let confirming = $state<string | null>(null);
	// Clicking a thought pins it and offers a Comment button; opening the thread pushes others aside.
	let selectedId = $state<string | null>(null);
	let openId = $state<string | null>(null);
	let threadPanel = $state<HTMLElement>();

	function select(id: string | null) {
		if (selectedId && selectedId !== id) {
			const previous = bodies.get(selectedId);
			if (previous) previous.pinned = false;
		}
		selectedId = id;
		const body = id ? bodies.get(id) : undefined;
		if (body) {
			body.pinned = true;
			body.age = Math.min(body.age, body.life * 0.3);
			if (body.state === 'out') body.state = 'live';
		}
	}

	// Open the thread just below the headline block, not over it.
	let threadTop = $state(16);

	function openThread(id: string) {
		select(id);
		const intro = avoid.find(Boolean);
		if (intro && field) {
			const below = intro.getBoundingClientRect().bottom - field.getBoundingClientRect().top;
			threadTop = Math.max(16, Math.round(below + 12));
		}
		openId = id;
		requestAnimationFrame(measureAvoid);
	}

	function closeThread() {
		openId = null;
		threadPanel = undefined;
		select(null);
		requestAnimationFrame(measureAvoid);
	}

	// Clicking anywhere else lets the selected thought drift again and closes an open thread.
	function outside(event: PointerEvent) {
		const target = event.target as Element | null;
		if (!selectedId || !target) return;
		if (target.closest(`.term[data-term="${CSS.escape(selectedId)}"], .thread`)) return;
		if (openId) closeThread();
		else select(null);
	}
	// Each thought keeps the size it arrived with, so a +1 never re-wraps it while it's on screen.
	let sizeAtSpawn = $state<Record<string, number>>({});
	let grab: Grab | null = null;
	let suppressClickUntil = 0;

	// Physics state changes every frame, so it deliberately lives outside Svelte's reactivity.
	/* eslint-disable svelte/prefer-svelte-reactivity */
	const bodies = new Map<string, Body>();
	const nodes = new Map<string, HTMLElement>();
	const lastShown = new Map<string, number>();
	const seenPulses = new Map<string, number>();
	/* eslint-enable svelte/prefer-svelte-reactivity */
	const queue: { id: string; mode: Mode }[] = [];
	let knownIds: Set<string> | null = null;
	let avoidRects: { x: number; y: number; w: number; h: number }[] = [];

	const byId = $derived(new Map(entries.map((entry) => [entry.id, entry])));
	const shown = $derived(
		active.flatMap((id) => {
			const entry = byId.get(id);
			return entry ? [{ entry, id }] : [];
		})
	);

	const still = $derived(paused || prefersReducedMotion.current);
	const capacity = $derived(
		Math.min(entries.length, Math.max(4, Math.min(10, Math.round((width * height) / 105_000))))
	);

	const random = (min: number, max: number) => min + Math.random() * (max - min);
	const sign = () => (Math.random() < 0.5 ? -1 : 1);

	function tier(entry: Entry) {
		return entry.body.length <= 40 ? 'short' : entry.body.length <= 90 ? 'mid' : 'long';
	}

	function popularity(entry: Entry) {
		return 1 + Math.min(0.42, Math.log2(1 + entry.reactions) * 0.1);
	}

	function measureAvoid() {
		if (!field) return;
		const origin = field.getBoundingClientRect();
		const zone = (node: HTMLElement, padX: number, padY: number) => {
			const rect = node.getBoundingClientRect();
			return {
				x: rect.left - origin.left - padX,
				y: rect.top - origin.top - padY,
				w: rect.width + padX * 2,
				h: rect.height + padY * 2
			};
		};
		avoidRects = avoid
			.filter((node): node is HTMLElement => Boolean(node))
			.map((node) => zone(node, 18, 14));
		// An open thread clears a generous space: every other thought is pushed aside.
		if (threadPanel) avoidRects.push(zone(threadPanel, 32, 24));
	}

	function overlapScore(x: number, y: number, w: number, h: number, ignore: string) {
		let score = 0;
		const cx = x + w / 2;
		const cy = y + h / 2;
		for (const rect of avoidRects) {
			const ox = Math.min(x + w, rect.x + rect.w) - Math.max(x, rect.x);
			const oy = Math.min(y + h, rect.y + rect.h) - Math.max(y, rect.y);
			if (ox > 0 && oy > 0) score -= ox * oy * 4;
		}
		let nearest = Infinity;
		for (const other of bodies.values()) {
			if (!other.placed || other.id === ignore) continue;
			const ox = Math.min(x + w, other.x + other.w) - Math.max(x, other.x) + 24;
			const oy = Math.min(y + h, other.y + other.h) - Math.max(y, other.y) + 24;
			if (ox > 0 && oy > 0) score -= ox * oy * 2;
			nearest = Math.min(
				nearest,
				Math.hypot(cx - (other.x + other.w / 2), cy - (other.y + other.h / 2))
			);
		}
		return score + Math.min(nearest, 600);
	}

	function place(body: Body) {
		measureAvoid();
		const { w, h } = body;
		const maxX = Math.max(0, width - w);
		const maxY = Math.max(0, height - h);
		let best = { x: random(0, maxX), y: random(0, maxY), score: -Infinity };

		for (let attempt = 0; attempt < 18; attempt += 1) {
			let x: number;
			let y = random(0, maxY);
			if (body.mode === 'edge') {
				x = body.bx > 0 ? -w - 12 : width + 12;
			} else if (body.mode === 'rise') {
				x = width / 2 - w / 2 + random(-0.22, 0.22) * width;
				y = maxY;
			} else {
				x = random(0, maxX);
			}
			// Score edge entrants as if they were already inside, so their lane is clear.
			const probeX = body.mode === 'edge' ? (body.bx > 0 ? 0 : maxX) : x;
			const score = overlapScore(probeX, y, w, h, body.id);
			if (score > best.score) best = { x, y, score };
		}

		body.x = best.x;
		body.y = best.y;
		body.placed = true;
	}

	function spawn(id: string, mode: Mode, opts: { age?: number; side?: number } = {}) {
		const entry = byId.get(id);
		if (!entry || bodies.has(id)) return;
		const speed = random(9, 22);
		const body: Body = {
			id,
			mode,
			placed: false,
			x: 0,
			y: 0,
			w: 0,
			h: 0,
			vx: 0,
			vy: 0,
			bx: 0,
			by: random(-4, 4),
			phase: random(0, Math.PI * 2),
			bob: 0,
			age: opts.age ?? 0,
			life: random(15, 26) + Math.min(12, entry.reactions * 0.8),
			state: 'in',
			alpha: 0,
			held: false,
			dragging: false,
			depth: random(0.82, 1.14),
			entering: mode === 'edge',
			pinned: false
		};
		if (mode === 'edge') {
			// side: +1 enters from the left heading right, -1 from the right heading left.
			body.bx = (opts.side ?? sign()) * random(16, 32);
			body.by = random(-9, 9);
			// Revealed by a pan: glide in briskly, then settle into the gentle drift.
			if (opts.side) body.vx = opts.side * random(110, 170);
		} else if (mode === 'rise') {
			body.bx = sign() * random(4, 12);
			body.by = -random(3, 7);
			body.vy = -random(80, 120);
		} else body.bx = sign() * speed;
		if (!(mode === 'edge' && opts.side)) body.vx = body.bx;
		bodies.set(id, body);
		lastShown.set(id, performance.now());
		sizeAtSpawn = { ...sizeAtSpawn, [id]: popularity(entry) };
		active = [...active, id];
	}

	function remove(id: string) {
		if (sizeAtSpawn[id]) {
			const sizes = { ...sizeAtSpawn };
			delete sizes[id];
			sizeAtSpawn = sizes;
		}
		bodies.delete(id);
		active = active.filter((item) => item !== id);
		if (fresh[id]) {
			const next = { ...fresh };
			delete next[id];
			fresh = next;
		}
	}

	function nextCandidate() {
		while (queue.length) {
			const next = queue.shift()!;
			if (byId.has(next.id) && !bodies.has(next.id)) return next;
		}
		let pick: string | undefined;
		let oldest = Infinity;
		for (const entry of entries) {
			if (bodies.has(entry.id)) continue;
			const shown =
				(lastShown.get(entry.id) ?? -1e9) - entry.reactions * 400 + Math.random() * 1500;
			if (shown < oldest) {
				oldest = shown;
				pick = entry.id;
			}
		}
		if (!pick) return undefined;
		// Mix thoughts that surface in place with ones drifting in from beyond the screen edges.
		const roll = Math.random();
		const mode: Mode = roll < 0.5 ? 'edge' : roll < 0.62 ? 'rise' : 'pop';
		return { id: pick, mode };
	}

	/**
	 * A wrapped flex item keeps the width of its unwrapped text, leaving a gap before the counter.
	 * Shrink the text block to its widest rendered line so the counter hugs it.
	 */
	function fitText(node: HTMLElement) {
		const text = node.querySelector<HTMLElement>('.text');
		if (!text) return;
		text.style.width = '';
		// Where the text starts inside the term, so the action row lines up under it.
		const ratio = node.getBoundingClientRect().width / (node.offsetWidth || 1) || 1;
		const indent = (text.getBoundingClientRect().left - node.getBoundingClientRect().left) / ratio;
		node.style.setProperty('--text-indent', `${Math.max(0, Math.round(indent))}px`);
		const range = document.createRange();
		range.selectNodeContents(text);
		const lines = Array.from(range.getClientRects());
		// One line: the counter centres on it. Several: it top-aligns with the first.
		node.dataset.lines = lines.length > 1 ? 'multi' : 'single';
		if (lines.length < 2) return;
		const widest = Math.max(...lines.map((line) => line.width));
		// Measured on screen, so undo the term's current scale before applying it as a CSS width.
		const scale = node.getBoundingClientRect().width / (node.offsetWidth || 1);
		text.style.width = `${Math.ceil(widest / (scale || 1)) + 1}px`;
	}

	function register(node: HTMLElement, id: string) {
		nodes.set(id, node);
		if (!capMeasured) measureCapTop();
		fitText(node);
		const body = bodies.get(id);
		if (body) {
			body.w = node.offsetWidth;
			body.h = node.offsetHeight;
			place(body);
			paint(body, performance.now());
		}
		resizeObserver?.observe(node);
		return {
			destroy() {
				resizeObserver?.unobserve(node);
				nodes.delete(id);
			}
		};
	}

	let resizeObserver: ResizeObserver | undefined;

	function paint(body: Body, now: number) {
		const node = nodes.get(body.id);
		if (!node) return;
		// Freeze the bob where it is on hover or grab, so the term never shifts under the pointer.
		if (!still && !body.held && !body.dragging && !body.pinned) {
			body.bob = Math.sin(now / 1800 + body.phase) * 5;
		}
		const bob = body.bob;
		const settle = 0.92 + 0.08 * easeOut(body.alpha);
		node.style.transform = `translate3d(${body.x.toFixed(1)}px, ${(body.y + bob).toFixed(1)}px, 0) scale(${settle.toFixed(3)})`;
		node.style.opacity = body.alpha.toFixed(3);
	}

	function easeOut(t: number) {
		return 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);
	}

	function separate(list: Body[], dt: number) {
		const strength = Math.min(1, dt * 5);
		for (let i = 0; i < list.length; i += 1) {
			for (let j = i + 1; j < list.length; j += 1) {
				const a = list[i];
				const b = list[j];
				const pad = 16;
				const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) + pad;
				const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) + pad;
				if (ox <= 0 || oy <= 0) continue;
				const aFixed = a.held || a.dragging || a.pinned;
				const bFixed = b.held || b.dragging || b.pinned;
				if (aFixed && bFixed) continue;
				const share = aFixed ? 0 : bFixed ? 1 : 0.5;
				if (ox < oy) {
					const direction = a.x + a.w / 2 < b.x + b.w / 2 ? -1 : 1;
					const push = ox * strength;
					a.x += direction * push * share;
					b.x -= direction * push * (1 - share);
				} else {
					const direction = a.y + a.h / 2 < b.y + b.h / 2 ? -1 : 1;
					const push = oy * strength;
					a.y += direction * push * share;
					b.y -= direction * push * (1 - share);
				}
			}
		}
	}

	function avoidZones(body: Body, dt: number) {
		if (body.dragging) return;
		const strength = Math.min(1, dt * 12);
		for (const rect of avoidRects) {
			const left = body.x + body.w - rect.x;
			const right = rect.x + rect.w - body.x;
			const top = body.y + body.h - rect.y;
			const bottom = rect.y + rect.h - body.y;
			if (left <= 0 || right <= 0 || top <= 0 || bottom <= 0) continue;
			const least = Math.min(left, right, top, bottom);
			if (least === bottom) body.y += bottom * strength;
			else if (least === top) body.y -= top * strength;
			else if (least === right) body.x += right * strength;
			else body.x -= left * strength;
		}
	}

	function step(now: number, dt: number) {
		const moving = !still;
		const list: Body[] = [];
		for (const body of bodies.values()) {
			if (!body.placed) continue;
			list.push(body);
			const frozen = body.held || body.dragging || body.pinned;

			if (body.state === 'in') {
				body.alpha = Math.min(1, body.alpha + dt / 0.9);
				if (body.alpha >= 1) body.state = 'live';
			} else if (body.state === 'out') {
				body.alpha -= dt / 1.1;
				if (body.alpha <= 0) {
					remove(body.id);
					continue;
				}
			}

			if (!moving || frozen) {
				if (!body.dragging && !moving) {
					// Let a throw settle even when ambient motion is off.
					body.vx *= Math.exp(-dt * 6);
					body.vy *= Math.exp(-dt * 6);
					body.x += body.vx * dt;
					body.y += body.vy * dt;
				}
				continue;
			}

			body.age += dt;
			if (body.state === 'live' && body.age > body.life) body.state = 'out';
			const relax = 1 - Math.exp(-dt * 0.9);
			body.vx += (body.bx - body.vx) * relax;
			body.vy += (body.by - body.vy) * relax;
			body.x += body.vx * dt;
			body.y += body.vy * dt;
		}

		separate(list, dt);

		for (const body of list) {
			if (!bodies.has(body.id)) continue;
			avoidZones(body, dt);
			if (!body.dragging) {
				const wall = Math.min(1, dt * 3);
				if (body.y < 4) {
					body.y += (4 - body.y) * wall;
					body.by = Math.abs(body.by);
				} else if (body.y + body.h > height - 4) {
					body.y -= (body.y + body.h - height + 4) * wall;
					body.by = -Math.abs(body.by);
				}
				// Thoughts float or get panned off-screen and make way for the next one.
				const outside = Math.max(body.x - width, -(body.x + body.w));
				if (body.entering && body.x >= -2 && body.x + body.w <= width + 2) body.entering = false;
				const gone = body.entering ? outside > 260 || body.age > 14 : outside > 24;
				if (gone) {
					remove(body.id);
					continue;
				}
			}
			paint(body, now);
		}
	}

	let spawnTimer = 0;
	function maintain(dt: number) {
		if (!width || !height) return;
		let live = 0;
		let leaving = false;
		let oldest: Body | undefined;
		for (const body of bodies.values()) {
			if (body.state === 'out') {
				leaving = true;
				continue;
			}
			live += 1;
			if (!body.held && !body.dragging && (!oldest || body.age > oldest.age)) oldest = body;
		}
		if (live >= capacity) {
			// Make room promptly for a brand-new or just-liked thought.
			if (queue.length && !leaving && oldest) oldest.state = 'out';
			return;
		}
		spawnTimer -= dt;
		// While someone explores the canvas, new thoughts come in on the side being revealed.
		const exploring = performance.now() - lastPanAt < 1200 && !overshoot();
		// After a big pan the view can be nearly empty: refill it quickly.
		const sparse = live < capacity / 2;
		if (!exploring && !still && spawnTimer > 0 && !queue.length) return;
		if (exploring && spawnTimer > 0) return;
		const next = nextCandidate();
		if (next && exploring && !still) spawn(next.id, 'edge', { side: panDirection || 1 });
		else if (next) spawn(next.id, still || sparse ? 'pop' : next.mode);
		spawnTimer = exploring || sparse ? random(0.18, 0.35) : random(0.7, 1.6);
	}

	/**
	 * Where capital letters start inside a line box, as a fraction of the font size. Used to put the
	 * counter's top edge exactly on the first line's cap height, whichever serif actually loaded.
	 */
	let capMeasured = false;
	function measureCapTop() {
		const probe = document.createElement('canvas').getContext('2d');
		const text = field?.querySelector('.text');
		if (!probe || !text) return;
		const family = getComputedStyle(text).fontFamily;
		probe.font = `400 100px ${family}`;
		const metrics = probe.measureText('H');
		const ascent = metrics.fontBoundingBoxAscent;
		const descent = metrics.fontBoundingBoxDescent;
		if (!ascent || !metrics.actualBoundingBoxAscent) return;
		const halfLeading = (106 - (ascent + descent)) / 2;
		const capTop = (halfLeading + ascent - metrics.actualBoundingBoxAscent) / 100;
		field.style.setProperty('--cap-top', capTop.toFixed(3));
		capMeasured = true;
	}

	onMount(() => {
		void document.fonts?.ready.then(() => requestAnimationFrame(measureCapTop));
		resizeObserver = new ResizeObserver((records) => {
			for (const record of records) {
				const id = (record.target as HTMLElement).dataset.term;
				const body = id ? bodies.get(id) : undefined;
				const fittedHeight = Number((record.target as HTMLElement).dataset.fit ?? 0);
				// Refit when the font changes size (popularity), without looping on our own width change.
				if (Math.abs(record.contentRect.height - fittedHeight) > 1) {
					(record.target as HTMLElement).dataset.fit = String(record.contentRect.height);
					fitText(record.target as HTMLElement);
				}
				if (body) {
					body.w = (record.target as HTMLElement).offsetWidth;
					body.h = (record.target as HTMLElement).offsetHeight;
				}
			}
		});
		for (const [id, node] of nodes) {
			resizeObserver.observe(node);
			const body = bodies.get(id);
			if (body) {
				body.w = node.offsetWidth;
				body.h = node.offsetHeight;
			}
		}

		width = field.clientWidth;
		height = field.clientHeight;
		measureAvoid();
		// Open with a full, desynchronised field so the page never starts empty.
		const opening = [...entries]
			.sort((a, b) => b.reactions - a.reactions)
			.slice(0, capacity)
			.sort(() => Math.random() - 0.5);
		opening.forEach((entry) => spawn(entry.id, 'pop', { age: random(0, 12) }));
		knownIds = new Set(entries.map((entry) => entry.id));

		let frame = 0;
		let last = performance.now();
		let avoidClock = 0;
		const tickFrame = (now: number) => {
			frame = requestAnimationFrame(tickFrame);
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;
			if (document.visibilityState !== 'visible') return;
			avoidClock -= dt;
			if (avoidClock <= 0) {
				measureAvoid();
				avoidClock = 0.5;
			}
			if (!panning) {
				const over = overshoot();
				if (over && Math.sign(panVelocity) === Math.sign(over)) {
					// Momentum running into the end of the canvas soaks up quickly.
					panVelocity *= Math.exp(-dt * 22);
				}
				if (Math.abs(panVelocity) > 4) {
					panBy(panVelocity * dt, false);
					panVelocity *= Math.exp(-dt * 4.6);
				} else {
					panVelocity = 0;
					// Then the canvas eases back inside its end.
					if (Math.abs(over) > 0.5) panBy(-over * (1 - Math.exp(-dt * 7)), false);
				}
			}
			maintain(dt);
			step(now, dt);
		};
		frame = requestAnimationFrame(tickFrame);

		document.addEventListener('pointerdown', outside, true);

		return () => {
			cancelAnimationFrame(frame);
			resizeObserver?.disconnect();
			document.removeEventListener('pointerdown', outside, true);
		};
	});

	// New contributions rise out of the shout bar; removed ones fade away.
	$effect(() => {
		const ids = new Set(entries.map((entry) => entry.id));
		untrack(() => arrivals(ids));
	});

	function arrivals(ids: Set<string>) {
		if (!knownIds) return;
		for (const id of ids) {
			if (!knownIds.has(id)) {
				queue.unshift({ id, mode: 'rise' });
				fresh = { ...fresh, [id]: true };
				spawnTimer = 0;
			}
		}
		for (const id of knownIds) {
			const body = bodies.get(id);
			if (!ids.has(id) && body) body.state = 'out';
		}
		knownIds = ids;
	}

	// Every +1, local or remote, makes its counter jump. Remote ones bring hidden thoughts into view.
	$effect(() => {
		const current = Object.entries(pulses);
		untrack(() => current.forEach(([id, pulse]) => onPulse(id, pulse)));
	});

	function onPulse(id: string, pulse: Pulse) {
		if (seenPulses.get(id) === pulse.n) return;
		seenPulses.set(id, pulse.n);
		const body = bodies.get(id);
		if (body) {
			body.age = Math.min(body.age, body.life * 0.35);
			if (body.state === 'out') body.state = 'live';
			body.alpha = Math.max(body.alpha, 0.6);
		} else if (byId.has(id)) {
			queue.unshift({ id, mode: 'pop' });
			spawnTimer = 0;
		}
		const node = nodes.get(id);
		if (node) burst(node, pulse);
	}

	// TNH mint ($color-theme-migration) and its tints, for anything that grows.
	const mint = '#35b58b';
	const leafColours = [mint, '#7fd3b4', '#2a8f6d', '#f2c94c', '#bfe8d6'];
	const leafPath = 'M10 1C16 5 17 13 10 19C3 13 4 5 10 1Z';

	function svgBit(className: string, size: number, inner: string) {
		const wrap = document.createElement('span');
		wrap.className = className;
		wrap.innerHTML = `<svg viewBox="0 0 20 20" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;
		return wrap;
	}

	/** Leaves lift off the counter and flutter upwards on the breeze. */
	function leaves(host: HTMLElement, count: number) {
		for (let i = 0; i < count; i += 1) {
			const colour = leafColours[i % leafColours.length];
			const leaf = svgBit(
				'leaf',
				random(10, 16),
				`<path d="${leafPath}" fill="${colour}"/><path d="M10 18V5" stroke="rgb(0 0 0 / 22%)" stroke-width="1"/>`
			);
			host.append(leaf);
			const side = i % 2 ? 1 : -1;
			const spread = random(14, 46) * side;
			const turn = random(80, 260) * side;
			leaf
				.animate(
					[
						{ transform: 'translate(-50%, -50%) scale(0.2) rotate(0deg)', opacity: 0 },
						{
							transform: `translate(calc(-50% + ${spread * 0.5}px), calc(-50% - 26px)) scale(1) rotate(${turn * 0.3}deg)`,
							opacity: 1,
							offset: 0.25
						},
						{
							transform: `translate(calc(-50% + ${spread * 1.3}px), calc(-50% - 52px)) rotate(${turn * 0.65}deg)`,
							opacity: 1,
							offset: 0.6
						},
						{
							transform: `translate(calc(-50% + ${spread * 0.7}px), calc(-50% - 84px)) scale(0.85) rotate(${turn}deg)`,
							opacity: 0
						}
					],
					{
						duration: random(1300, 1900),
						delay: 160 + i * 55,
						easing: 'cubic-bezier(.25,.6,.35,1)',
						fill: 'backwards'
					}
				)
				.finished.finally(() => leaf.remove());
		}
	}

	type Seedling = { offset: number; delay: number; size: number; lean: number; mirror: boolean };

	/** One seedling: the stem draws itself, then two leaves unfurl, then it fades upwards. */
	function sprout(host: HTMLElement, { offset, delay, size, lean, mirror }: Seedling) {
		const [first, second] = mirror ? ['#7fd3b4', mint] : [mint, '#7fd3b4'];
		const plant = document.createElement('span');
		plant.className = 'sprout';
		plant.innerHTML = `<svg viewBox="0 0 28 34" width="${Math.round(28 * size)}" height="${Math.round(34 * size)}" aria-hidden="true">
			<path class="stem" d="M14 34C14 26 13 20 14 12" fill="none" stroke="#2a8f6d" stroke-width="2.4" stroke-linecap="round" pathLength="1"/>
			<path class="leaf-left" d="M14 19C8 19 4 15 3 10C9 10 13 13 14 19Z" fill="${first}"/>
			<path class="leaf-right" d="M14 14C20 14 24 10 25 5C19 5 15 8 14 14Z" fill="${second}"/>
		</svg>`;
		host.append(plant);
		plant.querySelector('.stem')?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
			duration: 380,
			delay,
			easing: 'ease-out',
			fill: 'both'
		});
		for (const [selector, after] of [
			['.leaf-left', 260],
			['.leaf-right', 360]
		] as const) {
			plant
				.querySelector(selector)
				?.animate(
					[
						{ transform: 'scale(0) rotate(-25deg)' },
						{ transform: 'scale(1.15) rotate(4deg)', offset: 0.7 },
						{ transform: 'scale(1) rotate(0deg)' }
					],
					{ duration: 420, delay: delay + after, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'both' }
				);
		}
		const total = delay + 1700;
		const place = `translate(calc(-50% + ${offset}px), 0) rotate(${lean}deg)`;
		plant
			.animate(
				[
					{ opacity: 1, transform: place },
					{ opacity: 1, transform: place, offset: (delay + 1150) / total },
					{ opacity: 0, transform: `${place} translateY(-10px)` }
				],
				{ duration: total, easing: 'ease-in' }
			)
			.finished.finally(() => plant.remove());
	}

	/** A little grove sprouts along the top of the counter, one seedling after another. */
	function grove(host: HTMLElement, count: number) {
		const width = Math.min(host.offsetWidth, 64);
		const order = Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5);
		order.forEach((slot, i) => {
			const position = count === 1 ? 0 : slot / (count - 1) - 0.5;
			sprout(host, {
				offset: position * width + random(-3, 3),
				delay: i * 110 + random(0, 40),
				size: (1 - Math.abs(position) * 0.55) * random(0.85, 1.05),
				lean: position * 30 + random(-5, 5),
				mirror: Math.random() < 0.5
			});
		});
	}

	/** Rays of light fan out from the counter: the sun comes out. */
	function sunburst(host: HTMLElement, rays: number) {
		const sun = document.createElement('span');
		sun.className = 'sunburst';
		for (let i = 0; i < rays; i += 1) {
			const ray = document.createElement('span');
			ray.className = 'ray';
			ray.style.setProperty('--angle', `${(360 / rays) * i}deg`);
			sun.append(ray);
		}
		host.append(sun);
		sun
			.animate(
				[
					{ opacity: 0, transform: 'translate(-50%, -50%) scale(0.3) rotate(0deg)' },
					{ opacity: 1, transform: 'translate(-50%, -50%) scale(1) rotate(20deg)', offset: 0.35 },
					{ opacity: 0, transform: 'translate(-50%, -50%) scale(1.5) rotate(45deg)' }
				],
				{ duration: 1100, easing: 'cubic-bezier(.2,.7,.3,1)' }
			)
			.finished.finally(() => sun.remove());
	}

	/** A sapling: the trunk draws itself, then a canopy of leaves puffs out in gold and mint. */
	function tree(host: HTMLElement) {
		const sapling = document.createElement('span');
		sapling.className = 'tree';
		sapling.innerHTML = `<svg viewBox="0 0 48 56" width="48" height="56" aria-hidden="true">
			<path class="trunk" d="M24 56C24 46 23 40 24 30M24 40C20 37 18 35 16 31M24 36C28 33 30 31 32 27" fill="none" stroke="#7a5a2e" stroke-width="2.6" stroke-linecap="round" pathLength="1"/>
			<circle class="crown" cx="24" cy="20" r="12" fill="${mint}"/>
			<circle class="crown" cx="14" cy="26" r="8" fill="#2a8f6d"/>
			<circle class="crown" cx="34" cy="25" r="9" fill="#f2c94c"/>
			<circle class="crown" cx="22" cy="10" r="7" fill="#7fd3b4"/>
			<circle class="crown" cx="31" cy="14" r="6" fill="#f7d774"/>
		</svg>`;
		host.append(sapling);
		sapling.querySelector('.trunk')?.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], {
			duration: 420,
			easing: 'ease-out',
			fill: 'both'
		});
		sapling.querySelectorAll('.crown').forEach((crown, i) => {
			crown.animate(
				[
					{ transform: 'scale(0)' },
					{ transform: 'scale(1.18)', offset: 0.65 },
					{ transform: 'scale(1)' }
				],
				{ duration: 460, delay: 330 + i * 70, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'both' }
			);
		});
		sapling
			.animate(
				[
					{ opacity: 1, transform: 'translate(-50%, 0)' },
					{ opacity: 1, transform: 'translate(-50%, 0)', offset: 0.72 },
					{ opacity: 0, transform: 'translate(-50%, -14px)' }
				],
				{ duration: 2300, easing: 'ease-in' }
			)
			.finished.finally(() => sapling.remove());
	}

	/** The hidden double-click: the box flips to gold, the sun comes out and a tree grows. */
	function goldenBoost(count: HTMLElement, word: HTMLElement, remote: boolean) {
		count.animate(
			[
				{ transform: 'perspective(240px) rotateY(0deg) scale(1)' },
				{ transform: 'perspective(240px) rotateY(180deg) scale(1.35)', offset: 0.45 },
				{ transform: 'perspective(240px) rotateY(360deg) scale(0.95)', offset: 0.8 },
				{ transform: 'perspective(240px) rotateY(360deg) scale(1)' }
			],
			{ duration: 760, easing: 'cubic-bezier(.3,.7,.3,1)' }
		);
		count.animate(
			[
				{ boxShadow: '0 0 0 0 rgb(247 215 116 / 0.95)' },
				{ boxShadow: '0 0 0 30px rgb(247 215 116 / 0)' }
			],
			{ duration: 1100, easing: 'ease-out' }
		);
		word.animate(
			[
				{ scale: 1, filter: 'drop-shadow(0 0 0 rgb(247 215 116 / 0))' },
				{ scale: 1.08, filter: 'drop-shadow(0 0 14px rgb(247 215 116 / 0.9))', offset: 0.3 },
				{ scale: 1, filter: 'drop-shadow(0 0 0 rgb(247 215 116 / 0))' }
			],
			{ duration: 1100, easing: 'ease-out' }
		);
		sunburst(count, remote ? 8 : 14);
		if (!remote) tree(count);
		else grove(count, 2);
		leaves(count, remote ? 4 : 10);
	}

	/** Taking a +1 back: one leaf browns, wilts and drifts down. */
	function wilt(host: HTMLElement) {
		const leaf = svgBit('leaf', 15, `<path d="${leafPath}" fill="${mint}"/>`);
		host.append(leaf);
		const path = leaf.querySelector('path');
		path?.animate([{ fill: mint }, { fill: '#a07a4c' }], { duration: 700, fill: 'forwards' });
		leaf
			.animate(
				[
					{ transform: 'translate(-50%, -140%) rotate(0deg)', opacity: 1 },
					{ transform: 'translate(calc(-50% - 10px), -60%) rotate(40deg)', offset: 0.35 },
					{ transform: 'translate(calc(-50% + 8px), 40%) rotate(95deg)', offset: 0.7 },
					{ transform: 'translate(calc(-50% - 4px), 130%) rotate(150deg)', opacity: 0 }
				],
				{ duration: 1300, easing: 'ease-in' }
			)
			.finished.finally(() => leaf.remove());
	}

	function burst(node: HTMLElement, pulse: Pulse) {
		const count = node.querySelector<HTMLElement>('.count');
		const word = node.querySelector<HTMLElement>('.word');
		if (!count || !word) return;
		if (prefersReducedMotion.current) {
			count.animate([{ outline: '2px solid #fff', outlineOffset: '2px' }, {}], { duration: 600 });
			return;
		}

		if (pulse.liked && pulse.boost) {
			goldenBoost(count, word, pulse.remote);
		} else if (pulse.liked) {
			// The counter springs, a seedling grows out of it and leaves lift away.
			count.animate(
				[
					{ transform: 'scale(1)', filter: 'brightness(1)' },
					{ transform: 'scale(1.3, 0.82)', filter: 'brightness(1.35)', offset: 0.18 },
					{ transform: 'scale(0.9, 1.14)', offset: 0.42 },
					{ transform: 'scale(1.05, 0.97)', offset: 0.65 },
					{ transform: 'scale(1)', filter: 'brightness(1)' }
				],
				{ duration: 640, easing: 'ease-out' }
			);
			const glow = pulse.remote ? '255 255 255' : '53 181 139';
			count.animate(
				[
					{ boxShadow: `0 0 0 0 rgb(${glow} / 0.85)` },
					{ boxShadow: `0 0 0 22px rgb(${glow} / 0)` }
				],
				{ duration: 900, easing: 'ease-out' }
			);
			word.animate([{ scale: 1 }, { scale: 1.06 }, { scale: 0.995 }, { scale: 1 }], {
				duration: 560,
				easing: 'ease-out'
			});
			grove(count, pulse.remote ? 2 : 5);
			leaves(count, pulse.remote ? 3 : 6);
		} else {
			// A little deflating head-shake when a +1 is taken back.
			count.animate(
				[
					{ transform: 'translateX(0) scale(1)' },
					{ transform: 'translateX(-5px) scale(0.92)', offset: 0.2 },
					{ transform: 'translateX(5px) scale(0.92)', offset: 0.4 },
					{ transform: 'translateX(-3px) scale(0.96)', offset: 0.6 },
					{ transform: 'translateX(2px) scale(0.98)', offset: 0.8 },
					{ transform: 'translateX(0) scale(1)' }
				],
				{ duration: 480, easing: 'ease-out' }
			);
			word.animate([{ scale: 1 }, { scale: 0.96 }, { scale: 1 }], {
				duration: 420,
				easing: 'ease-out'
			});
			wilt(count);
		}

		const spark = document.createElement('span');
		spark.className = `spark${pulse.remote ? ' remote' : ''}${pulse.liked ? '' : ' minus'}`;
		spark.className += pulse.boost && pulse.liked ? ' golden' : '';
		spark.textContent = `${pulse.boost && pulse.liked ? '+2' : pulse.liked ? '+1' : '−1'}${pulse.remote && pulse.by ? ` ${pulse.by}` : ''}`;
		count.append(spark);
		spark
			.animate(
				[
					{ opacity: 0, transform: 'translate(-50%, 0) scale(0.6)' },
					{ opacity: 1, transform: 'translate(-50%, -20px) scale(1.15)', offset: 0.22 },
					{ opacity: 1, transform: 'translate(-50%, -38px) scale(1)', offset: 0.6 },
					{ opacity: 0, transform: 'translate(-50%, -66px) scale(0.95)' }
				],
				{
					duration: 1150,
					delay: pulse.liked && !pulse.remote ? 250 : 0,
					easing: 'cubic-bezier(.2,.7,.3,1)',
					fill: 'backwards'
				}
			)
			.finished.finally(() => spark.remove());
	}

	function pointerDown(event: PointerEvent, id: string) {
		if (!event.isPrimary || event.button !== 0 || grab) return;
		const body = bodies.get(id);
		if (!body) return;
		const origin = field.getBoundingClientRect();
		try {
			(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
		} catch {
			// Synthetic or already-released pointers cannot be captured; dragging still works.
		}
		body.held = true;
		grab = {
			id,
			pointer: event.pointerId,
			startX: event.clientX,
			startY: event.clientY,
			offsetX: event.clientX - origin.left - body.x,
			offsetY: event.clientY - origin.top - body.y,
			samples: [{ t: performance.now(), x: event.clientX, y: event.clientY }],
			moved: false
		};
	}

	function pointerMove(event: PointerEvent) {
		if (!grab || event.pointerId !== grab.pointer) return;
		const body = bodies.get(grab.id);
		if (!body) return;
		if (!grab.moved && Math.hypot(event.clientX - grab.startX, event.clientY - grab.startY) < 6) {
			return;
		}
		grab.moved = true;
		body.dragging = true;
		const origin = field.getBoundingClientRect();
		body.x = event.clientX - origin.left - grab.offsetX;
		body.y = event.clientY - origin.top - grab.offsetY;
		body.vx = 0;
		body.vy = 0;
		const now = performance.now();
		grab.samples.push({ t: now, x: event.clientX, y: event.clientY });
		while (grab.samples.length > 2 && now - grab.samples[0].t > 110) grab.samples.shift();
	}

	function pointerUp(event: PointerEvent) {
		if (!grab || event.pointerId !== grab.pointer) return;
		const body = bodies.get(grab.id);
		const released = grab;
		grab = null;
		if (!body) return;
		body.dragging = false;
		body.held = event.pointerType === 'mouse' && event.type === 'pointerup';
		if (!released.moved) return;
		suppressClickUntil = performance.now() + 300;
		const first = released.samples[0];
		const last = released.samples[released.samples.length - 1];
		const elapsed = Math.max(16, last.t - first.t) / 1000;
		// A dropped thought stays roughly where it lands: just a hint of the release, then it
		// rejoins the slow drift. No long slides across the screen.
		const limit = 60;
		body.vx = Math.max(-limit, Math.min(limit, ((last.x - first.x) / elapsed) * 0.08));
		body.vy = Math.max(-limit, Math.min(limit, ((last.y - first.y) / elapsed) * 0.08));
		body.held = false;
		body.age = Math.min(body.age, body.life * 0.5);
	}

	let lastClick = { id: '', at: 0 };

	/** Swallows the click that ends a drag, and turns a quick second click into the golden boost. */
	function clickCapture(event: MouseEvent, id: string) {
		const now = performance.now();
		if (now < suppressClickUntil) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		// Keyboard activation (detail 0) never counts as a double-click.
		if (event.detail > 0 && lastClick.id === id && now - lastClick.at < 380 && onboost) {
			event.preventDefault();
			event.stopPropagation();
			lastClick = { id: '', at: 0 };
			onboost(id);
			return;
		}
		lastClick = { id, at: now };
		select(id);
	}

	function setHeld(id: string, held: boolean) {
		const body = bodies.get(id);
		if (body && !body.dragging) body.held = held;
	}
</script>

<div
	class="field"
	bind:this={field}
	bind:clientWidth={width}
	bind:clientHeight={height}
	role="group"
	aria-label="Thoughts from the room. Select one to give it +1; select again to remove it."
>
	{#each shown as { entry, id } (id)}
		<div
			class={['term', tier(entry), { fresh: fresh[id], open: openId === id }]}
			data-term={id}
			style:--pop={sizeAtSpawn[id] ?? 1}
			use:register={id}
			role="presentation"
			onpointerenter={(event) => event.pointerType === 'mouse' && setHeld(id, true)}
			onpointerleave={(event) => {
				if (event.pointerType !== 'mouse') return;
				setHeld(id, false);
				if (confirming === id) confirming = null;
			}}
		>
			<form method="POST" action="?/react" use:enhance={react}>
				<input type="hidden" name="entry" value={entry.id} />
				<input type="hidden" name="weight" value={entry.reacted ? '0' : '1'} />
				<button
					type="submit"
					class={['word', { reacted: entry.reacted, boosted: entry.boosted }]}
					aria-pressed={entry.reacted}
					aria-disabled={!canReact || pendingEntry === entry.id}
					aria-label={`${entry.body}. ${entry.reactions} ${entry.reactions === 1 ? 'person agrees' : 'people agree'}. ${entry.reacted ? 'Remove your +1' : 'Give +1'}`}
					onclickcapture={(event) => clickCapture(event, id)}
					onpointerdown={(event) => pointerDown(event, id)}
					onpointermove={pointerMove}
					onpointerup={pointerUp}
					onpointercancel={pointerUp}
					onfocus={() => setHeld(id, true)}
					onblur={() => setHeld(id, false)}
				>
					<span class="count" aria-hidden="true">
						{#if entry.boosted}
							<svg class="golden-leaf" viewBox="0 0 20 20" aria-hidden="true">
								<path d="M10 1C16 5 17 13 10 19C3 13 4 5 10 1Z" />
								<path class="vein" d="M10 17V5" />
							</svg>
						{:else}
							<svg class="plus" viewBox="0 0 12 12" aria-hidden="true">
								<path d="M6 1v10M1 6h10" />
							</svg>
						{/if}
						<span class="number">
							{#key entry.reactions}
								<span in:fly={{ y: 10, duration: prefersReducedMotion.current ? 0 : 280 }}
									>{entry.reactions}</span
								>
							{/key}
						</span>
					</span>
					<span class="text">{entry.body}</span>
				</button>
			</form>
			{#if (isMine(entry) && onwithdraw) || (commentsEnabled && (selectedId === id || entry.comments > 0))}
				<!-- Actions sit on a row under the text, starting at the text's left edge. -->
				<div class="actions">
					{#if isMine(entry) && onwithdraw}
						<!-- Only the author's browser shows this, so it doubles as the "yours" marker. -->
						<button
							type="button"
							class={['remove', { confirming: confirming === id }]}
							aria-label={confirming === id
								? `Confirm: take “${entry.body}” off the wall`
								: `Remove your thought “${entry.body}” from the wall`}
							title={confirming === id
								? 'Click again to remove'
								: 'Your thought. Remove it from the wall'}
							onfocus={() => setHeld(id, true)}
							onblur={() => {
								setHeld(id, false);
								if (confirming === id) confirming = null;
							}}
							onclick={() => {
								if (confirming === id) {
									confirming = null;
									onwithdraw(entry);
								} else {
									confirming = id;
								}
							}}
						>
							<svg viewBox="0 0 20 20" aria-hidden="true">
								<path d="M4 6h12M8 6V4h4v2M6 6l.8 10h6.4L14 6M9 9v5M11 9v5" />
							</svg>
							{#if confirming === id}<span>Remove</span>{/if}
						</button>
					{/if}
					{#if commentsEnabled && (selectedId === id || entry.comments > 0)}
						<button
							type="button"
							class={['comment', { expanded: selectedId === id }]}
							aria-label={entry.comments
								? `Open ${entry.comments} ${entry.comments === 1 ? 'comment' : 'comments'} on “${entry.body}”`
								: `Comment on “${entry.body}”`}
							onfocus={() => setHeld(id, true)}
							onblur={() => setHeld(id, false)}
							onclick={() => openThread(id)}
						>
							<svg viewBox="0 0 20 20" aria-hidden="true">
								<path
									d="M4 4.5h12a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5H9l-4 3v-3H4A1.5 1.5 0 0 1 2.5 13V6A1.5 1.5 0 0 1 4 4.5Z"
								/>
							</svg>
							{#if selectedId === id}<span>Comment</span>{/if}
							{#if entry.comments}<span class="n">{entry.comments}</span>{/if}
						</button>
					{/if}
				</div>
			{/if}
		</div>
	{/each}

	{#if openId && byId.get(openId)}
		{#key openId}
			<ThoughtThread
				entry={byId.get(openId)!}
				{formStamp}
				{refreshKey}
				onclose={closeThread}
				{onposted}
				top={threadTop}
				bind:panel={threadPanel}
			/>
		{/key}
	{/if}

	{#if !entries.length}
		<p class="empty">Be the first to add a thought. Approved posts float up here.</p>
	{/if}
</div>

<style>
	.field {
		position: relative;
		min-width: 0;
		min-height: 0;
		pointer-events: none;
		overflow: clip;
		overflow-clip-margin: 0;
	}
	.term {
		position: absolute;
		top: 0;
		left: 0;
		opacity: 0;
		width: max-content;
		max-width: min(30rem, 82vw);
		will-change: transform;
		pointer-events: auto;
		--base: clamp(1.3rem, 2.05vw, 2.25rem);
	}
	.term.mid {
		--base: clamp(1.1rem, 1.55vw, 1.6rem);
		max-width: min(24rem, 78vw);
	}
	.term.long {
		--base: clamp(1rem, 1.2vw, 1.18rem);
		max-width: min(26rem, 80vw);
	}
	.term form {
		display: contents;
	}
	/* Counter first, then the text; on multi-line thoughts the counter lines up with the first line. */
	.word {
		--fs: calc(var(--base) * var(--pop, 1));
		--count-fs: max(1.02rem, calc(var(--fs) * 0.5));
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.25em 0.3em;
		border: 0;
		background: transparent;
		color: #fff;
		font: 400 var(--fs) / 1.06 var(--serif);
		letter-spacing: -0.01em;
		text-align: left;
		text-wrap: balance;
		overflow-wrap: break-word;
		text-shadow:
			0 1px 2px rgb(20 20 18 / 70%),
			0 2px 18px rgb(20 20 18 / 80%);
		cursor: grab;
		touch-action: none;
		user-select: none;
		-webkit-user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.word:active {
		cursor: grabbing;
	}
	.word:focus {
		outline: none;
		box-shadow: none;
	}
	.word:focus-visible .text {
		text-decoration: underline;
		text-decoration-thickness: 2px;
		text-underline-offset: 0.18em;
	}
	.text {
		transition: text-shadow 200ms ease;
	}
	/* Hover: a plain underline. The term also stops drifting, so it never moves under the pointer. */
	.word:hover .text {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.16em;
	}
	.count {
		position: relative;
		flex: none;
		align-self: center;
		display: inline-flex;
		white-space: nowrap;
		align-items: center;
		justify-content: center;
		gap: 0.35em;
		min-width: 3.6em;
		height: 2.1em;
		padding: 0 0.7em;
		line-height: 1;
		background: #9f3e52;
		color: #fff;
		box-shadow: 0 6px 22px rgb(0 0 0 / 28%);
		font: 700 var(--count-fs) / 1 var(--sans);
		font-variant-numeric: tabular-nums;
		text-shadow: none;
		transition:
			background-color 260ms ease,
			color 260ms ease;
	}
	/* Burgundy until you +1 it, green once you have. */
	.word:hover .count {
		background: #b24a60;
	}
	/* While its thread is open, the thought itself shows in the panel header instead. */
	.term.open {
		visibility: hidden;
	}
	/* Round Comment button: appears when a thought is selected, or as a count when it has comments. */
	.comment {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 2.3rem;
		min-width: 2.3rem;
		justify-content: center;
		padding: 0 0.6rem;
		border: 0;
		border-radius: 100vmax;
		background: rgb(30 30 28 / 55%);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 25%);
		color: #fff;
		font: 700 0.85rem/1 var(--sans);
		cursor: pointer;
		pointer-events: auto;
		animation: comment-in 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.comment.expanded {
		padding-inline: 0.75rem 0.9rem;
		background: #fff;
		color: #282828;
		box-shadow: 0 8px 22px rgb(0 0 0 / 30%);
	}
	.comment:hover {
		background: #fff;
		color: #282828;
	}
	.comment svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linejoin: round;
	}
	.comment .n {
		min-width: 1.2rem;
		padding: 0.15rem 0.35rem;
		border-radius: 100vmax;
		background: #35b58b;
		color: #282828;
		font-size: 0.75rem;
	}
	.comment:focus {
		outline: none;
		box-shadow: none;
	}
	.comment:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	@keyframes comment-in {
		from {
			opacity: 0;
			transform: scale(0.7);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.comment {
			animation: none;
		}
	}
	/* Remove button after the text: only the author ever sees it. */
	.term {
		display: grid;
		justify-items: start;
	}
	.actions {
		display: flex;
		gap: 0.4rem;
		margin: 0.1rem 0 0 var(--text-indent, 0px);
	}
	.remove {
		flex: none;
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		height: 2.3rem;
		min-width: 2.3rem;
		justify-content: center;
		padding: 0 0.5rem;
		border: 0;
		border-radius: 100vmax;
		background: rgb(30 30 28 / 55%);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		box-shadow: inset 0 0 0 1px rgb(255 255 255 / 25%);
		color: #fff;
		font: 700 0.85rem/1 var(--sans);
		cursor: pointer;
		opacity: 0.9;
		transition:
			opacity 160ms ease,
			background-color 160ms ease,
			color 160ms ease;
	}
	.term:hover .remove,
	.remove:focus-visible {
		opacity: 1;
	}
	.remove:hover {
		background: rgb(30 30 28 / 70%);
		color: #fff;
	}
	.remove.confirming {
		opacity: 1;
		padding-inline: 0.6rem 0.75rem;
		background: #9f3e52;
		color: #fff;
	}
	.remove:focus {
		outline: none;
		box-shadow: none;
	}
	.remove:focus-visible {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	.remove svg {
		width: 1.2rem;
		height: 1.2rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	/* Multi-line thoughts: the counter's top edge sits on the first line's cap height. */
	.term:global([data-lines='multi']) .word {
		align-items: flex-start;
	}
	.term:global([data-lines='multi']) .count {
		align-self: flex-start;
		margin-top: calc(var(--cap-top, 0.17) * var(--fs));
	}
	/* Golden boost: the double-click easter egg. */
	.word.reacted.boosted .count,
	.word.reacted.boosted:hover .count {
		background: linear-gradient(135deg, #fbe7a1 0%, #f2c94c 45%, #d9a033 100%);
		color: #1c1c1a;
		box-shadow:
			inset 0 1px 0 rgb(255 255 255 / 70%),
			inset 0 -2px 0 rgb(150 100 20 / 35%),
			0 6px 26px rgb(242 201 76 / 45%);
		overflow: hidden;
	}
	.word.boosted .count::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(
			105deg,
			transparent 35%,
			rgb(255 255 255 / 75%) 50%,
			transparent 65%
		);
		transform: translateX(-120%);
		animation: sheen 3.6s ease-in-out 0.8s infinite;
		pointer-events: none;
	}
	@keyframes sheen {
		0%,
		60% {
			transform: translateX(-120%);
		}
		100% {
			transform: translateX(120%);
		}
	}
	.golden-leaf {
		width: 0.95em;
		height: 0.95em;
		flex: none;
	}
	.golden-leaf path {
		fill: #2a8f6d;
	}
	.golden-leaf .vein {
		fill: none;
		stroke: #fbe7a1;
		stroke-width: 1.2;
	}
	.word.reacted .count {
		background: #35b58b;
		color: #282828;
	}
	.word.reacted:hover .count {
		background: #2fa37d;
	}
	.word:active .count {
		background: #282828;
	}
	.word[aria-disabled='true'] {
		cursor: grab;
	}
	.plus {
		width: 0.8em;
		height: 0.8em;
		flex: none;
		stroke: currentColor;
		stroke-width: 2.2;
		stroke-linecap: square;
		fill: none;
		transition: transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	.word.reacted .plus {
		transform: rotate(90deg);
	}
	.number {
		display: inline-grid;
		min-width: 1.2ch;
		overflow: hidden;
	}
	.number > span {
		grid-area: 1 / 1;
	}
	.count :global(.spark) {
		position: absolute;
		left: 50%;
		bottom: 100%;
		padding: 0.25em 0.5em;
		background: #9f3e52;
		color: #fff;
		font: 700 0.85rem/1 var(--sans);
		white-space: nowrap;
		pointer-events: none;
	}
	.count :global(.spark.remote) {
		background: #fff;
		color: #282828;
	}
	.count :global(.spark:not(.remote)) {
		background: #35b58b;
		color: #282828;
	}
	.count :global(.spark.golden) {
		background: linear-gradient(135deg, #fbe7a1, #f2c94c 50%, #d9a033);
		color: #1c1c1a;
	}
	.count :global(.sunburst) {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		pointer-events: none;
	}
	.count :global(.ray) {
		position: absolute;
		left: 0;
		top: 0;
		width: 34px;
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(90deg, transparent 20%, #f7d774);
		transform-origin: 0 50%;
		transform: rotate(var(--angle)) translateX(18px);
	}
	.count :global(.tree) {
		position: absolute;
		bottom: calc(100% - 6px);
		left: 50%;
		line-height: 0;
		pointer-events: none;
		filter: drop-shadow(0 3px 6px rgb(0 0 0 / 35%));
	}
	.count :global(.tree circle) {
		transform-box: fill-box;
		transform-origin: 50% 80%;
	}
	.count :global(.tree .trunk) {
		stroke-dasharray: 1;
	}
	.count :global(.spark.minus) {
		background: #9f3e52;
		color: #fff;
	}
	.count :global(.leaf) {
		position: absolute;
		top: 50%;
		left: 50%;
		display: block;
		line-height: 0;
		pointer-events: none;
		filter: drop-shadow(0 2px 3px rgb(0 0 0 / 35%));
	}
	.count :global(.sprout) {
		position: absolute;
		transform-origin: 50% 100%;
		bottom: calc(100% - 4px);
		left: 50%;
		line-height: 0;
		pointer-events: none;
		filter: drop-shadow(0 2px 4px rgb(0 0 0 / 35%));
	}
	.count :global(.sprout path) {
		transform-box: fill-box;
	}
	.count :global(.sprout .stem) {
		stroke-dasharray: 1;
	}
	.count :global(.sprout .leaf-left) {
		transform-origin: right bottom;
	}
	.count :global(.sprout .leaf-right) {
		transform-origin: left bottom;
	}
	.term.fresh .text {
		animation: arrive 3.2s ease-out both;
	}
	@keyframes arrive {
		0%,
		35% {
			text-shadow:
				0 0 18px rgb(255 255 255 / 90%),
				0 0 42px rgb(159 62 82 / 90%);
		}
	}
	/* The field runs edge to edge, so pad this back in line with the page margins. */
	.empty {
		position: absolute;
		inset: 50% 0 auto;
		margin: 0;
		padding-inline: var(--pad-x, 1.25rem);
		text-wrap: balance;
		transform: translateY(-50%);
		text-align: center;
		color: #fff;
		font: 400 clamp(1.1rem, 2vw, 1.6rem) / 1.2 var(--serif);
		text-shadow: 0 2px 14px rgb(0 0 0 / 70%);
	}

	@media (max-width: 640px) {
		.term {
			--base: clamp(1.25rem, 5.6vw, 1.7rem);
		}
		.term.mid {
			--base: clamp(1.05rem, 4.4vw, 1.3rem);
		}
		.term.long {
			--base: 0.98rem;
		}
		.word {
			--count-fs: 1rem;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.term.fresh .text {
			animation: none;
		}
		.plus,
		.count,
		.text {
			transition: none;
		}
		.word.boosted .count::after {
			animation: none;
		}
	}
</style>
