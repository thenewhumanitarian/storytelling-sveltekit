<script lang="ts">
	/*
	 * Other visitors as light on water instead of arrows. The thoughts drift differently in every
	 * browser, so pointing at a spot means little; motion still does. Moving, a visitor draws a soft
	 * faint trail of light with a small glowing drop at its head. Still for a moment, the drop sinks
	 * with one faint ripple and disappears. Moving again, it resurfaces with a faint ripple.
	 * No arrow, and (for now) no name: see SHOW_NAMES.
	 *
	 * Over a thought, a visitor's light sits on this screen's copy of that thought and follows it as
	 * it drifts (see cursorAnchor.ts). If this screen isn't showing that thought, the light sinks.
	 *
	 * Moving onto a thought, off it into open sky, or to another thought, the light's spot here can
	 * jump a long way, since every screen lays the thoughts out differently. So it doesn't jump: it
	 * keeps making the visitor's own moves from where it was, and glides over to its true spot as it
	 * goes (see Peer.blend).
	 *
	 * One canvas, one requestAnimationFrame loop that stops itself when nothing is moving.
	 */
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { locateAnchor, type CursorAnchor } from './cursorAnchor';
	import type { ClimateCursor } from './realtime';

	interface Props {
		cursors: ClimateCursor[];
		width: number;
		height: number;
	}

	let { cursors, width, height }: Props = $props();

	type Point = { x: number; y: number; t: number };
	type Peer = {
		id: string;
		name: string;
		tint: string;
		x: number;
		y: number;
		tx: number;
		ty: number;
		lastMove: number;
		/** The thought spot they are on, followed every frame; none in open sky. */
		anchor: CursorAnchor | undefined;
		/** Head visibility, 0–1. */
		alpha: number;
		sunk: boolean;
		gone: boolean;
		trail: Point[];
		/**
		 * After a jump in where the visitor is on this screen: the gap (pixels) between the spot the
		 * light was heading for and the new one. It is added to the new spot and eased away over
		 * `duration` ms, so the light glides across instead of jumping.
		 */
		blend: { x: number; y: number; start: number; duration: number } | null;
		/** The name, pinned where they surfaced or sank: when, where, and hello or goodbye. */
		label: { born: number; leaving: boolean; x: number; y: number } | null;
	};
	type Ring = {
		x: number;
		y: number;
		born: number;
		life: number;
		radius: number;
		tint: string;
		/** Starting opacity, fading to 0. */
		alpha: number;
	};

	// Soft white, TNH mint, warm sand, pale sky: calm on the dark photos, different enough to tell
	// two visitors apart.
	const tints = ['255 255 255', '120 214 178', '242 214 168', '190 210 255'];
	const TRAIL_LIFE = 2400;
	const STILL_AFTER = 900;
	// How long the glide to a new spot takes: a short hop quickly, a long way a little longer.
	const BLEND_MIN = 350;
	const BLEND_PER_PIXEL = 1.1;
	const BLEND_MAX = 1100;
	const LABEL_LIFE = 1700;
	// Visitor names when they surface and sink. Off for now: random names meant little to people.
	const SHOW_NAMES = false;
	function nameAt(born: number, leaving: boolean, x: number, y: number) {
		return SHOW_NAMES ? { born, leaving, x, y } : null;
	}

	let canvas: HTMLCanvasElement;
	let context: CanvasRenderingContext2D | null = null;
	// Plain on purpose: read only by the canvas loop, never by the template.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const peers = new Map<string, Peer>();
	let rings: Ring[] = [];
	let frame = 0;
	let last = 0;
	let fontFamily = 'sans-serif';

	function tintFor(id: string) {
		let hash = 0;
		for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
		return tints[hash % tints.length];
	}

	// Quiet on purpose: one faint ring when a light sinks or surfaces, a hint rather than a splash.
	function splash(x: number, y: number, tint: string, now: number, strength: 'sink' | 'surface') {
		rings.push({
			x,
			y,
			born: now,
			life: strength === 'sink' ? 1300 : 900,
			radius: strength === 'sink' ? 20 : 14,
			tint,
			alpha: strength === 'sink' ? 0.16 : 0.2
		});
	}

	/** Where a thought spot is on this screen, in canvas pixels; null if it isn't on screen. */
	function spotOf(anchor: CursorAnchor) {
		return canvas ? locateAnchor(anchor, canvas.getBoundingClientRect()) : null;
	}

	/** What is left of the glide's gap at `now` (eased in and out), clearing it once done. */
	function blendLeft(peer: Peer, now: number) {
		const blend = peer.blend;
		if (!blend) return { x: 0, y: 0 };
		const progress = (now - blend.start) / blend.duration;
		if (progress >= 1) {
			peer.blend = null;
			return { x: 0, y: 0 };
		}
		const left = 0.5 + 0.5 * Math.cos(Math.PI * Math.max(0, progress));
		return { x: blend.x * left, y: blend.y * left };
	}

	/** The visitor's spot here jumped to (tx, ty): glide there from where the light was heading. */
	function glideTo(peer: Peer, tx: number, ty: number, now: number) {
		const left = blendLeft(peer, now);
		const x = peer.tx + left.x - tx;
		const y = peer.ty + left.y - ty;
		const distance = Math.hypot(x, y);
		peer.blend =
			distance < 2 || prefersReducedMotion.current
				? null
				: {
						x,
						y,
						start: now,
						duration: Math.min(BLEND_MAX, BLEND_MIN + distance * BLEND_PER_PIXEL)
					};
	}

	function sink(peer: Peer, now: number) {
		peer.sunk = true;
		peer.label = nameAt(now, true, peer.x, peer.y);
		if (!prefersReducedMotion.current) splash(peer.x, peer.y, peer.tint, now, 'sink');
	}

	// Follow the incoming cursors as targets in pixels: on a thought, that thought's spot on this
	// screen; in open sky, the same share of the screen (normalised 0–1).
	$effect(() => {
		const now = performance.now();
		// Plain on purpose: read only by the canvas loop, never by the template.
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const seen = new Set<string>();
		for (const cursor of cursors) {
			seen.add(cursor.id);
			const spot = cursor.on ? spotOf(cursor.on) : { x: cursor.x * width, y: cursor.y * height };
			const peer = peers.get(cursor.id);
			if (!spot) {
				// On a thought this screen isn't showing: nowhere true to draw them, so out of sight.
				if (!peer) {
					const x = cursor.x * width;
					const y = cursor.y * height;
					peers.set(cursor.id, {
						id: cursor.id,
						name: cursor.name,
						tint: tintFor(cursor.id),
						x,
						y,
						tx: x,
						ty: y,
						lastMove: now,
						anchor: cursor.on,
						alpha: 0,
						sunk: true,
						gone: false,
						trail: [],
						blend: null,
						label: null
					});
				} else {
					if (!peer.sunk) sink(peer, now);
					peer.anchor = cursor.on;
					peer.lastMove = now;
					peer.gone = false;
				}
				continue;
			}
			const tx = spot.x;
			const ty = spot.y;
			if (!peer) {
				const tint = tintFor(cursor.id);
				peers.set(cursor.id, {
					id: cursor.id,
					name: cursor.name,
					tint,
					x: tx,
					y: ty,
					tx,
					ty,
					lastMove: now,
					anchor: cursor.on,
					alpha: 0,
					sunk: false,
					gone: false,
					trail: [],
					blend: null,
					label: nameAt(now, false, tx, ty)
				});
				splash(tx, ty, tint, now, 'surface');
				continue;
			}
			const sameSpot =
				cursor.on?.entryId === peer.anchor?.entryId &&
				cursor.on?.part === peer.anchor?.part &&
				cursor.on?.fx === peer.anchor?.fx &&
				cursor.on?.fy === peer.anchor?.fy;
			// Onto a thought, off it, to another thought or another part of it: the spot is now measured
			// from somewhere else, which on this screen can be far away.
			const switched =
				(cursor.on?.entryId ?? '') !== (peer.anchor?.entryId ?? '') ||
				cursor.on?.part !== peer.anchor?.part;
			peer.anchor = cursor.on;
			if (Math.hypot(tx - peer.tx, ty - peer.ty) < 0.5 && (sameSpot || !peer.sunk)) continue;
			if (!peer.sunk && switched) glideTo(peer, tx, ty, now);
			if (peer.sunk) {
				// Resurface where they are now, without a streak from where they sank.
				peer.x = tx;
				peer.y = ty;
				peer.blend = null;
				peer.trail = [];
				peer.sunk = false;
				peer.label = nameAt(now, false, tx, ty);
				splash(tx, ty, peer.tint, now, 'surface');
			}
			peer.tx = tx;
			peer.ty = ty;
			peer.lastMove = now;
			peer.gone = false;
		}
		for (const peer of peers.values()) {
			if (seen.has(peer.id) || peer.gone) continue;
			peer.gone = true;
			// A cursor that sat still has already sunk and said goodbye; the room drops it a few
			// seconds later, which needs no second goodbye.
			if (!peer.sunk) sink(peer, now);
		}
		start();
	});

	function start() {
		if (!frame && context) {
			last = performance.now();
			frame = requestAnimationFrame(tick);
		}
	}

	function tick(now: number) {
		frame = 0;
		const dt = Math.min(0.05, (now - last) / 1000);
		last = now;
		const still = prefersReducedMotion.current;
		let busy = rings.length > 0;

		for (const peer of peers.values()) {
			if (!peer.sunk && peer.anchor) {
				// Ride along with the thought as it drifts on this screen; sink if it leaves the screen.
				const spot = spotOf(peer.anchor);
				if (spot) {
					peer.tx = spot.x;
					peer.ty = spot.y;
				} else {
					sink(peer, now);
				}
			}
			if (!peer.sunk) {
				const left = blendLeft(peer, now);
				const tx = peer.tx + left.x;
				const ty = peer.ty + left.y;
				peer.x += (tx - peer.x) * Math.min(1, dt * (still ? 60 : 9));
				peer.y += (ty - peer.y) * Math.min(1, dt * (still ? 60 : 9));
				const tail = peer.trail[peer.trail.length - 1];
				if (!still && (!tail || Math.hypot(peer.x - tail.x, peer.y - tail.y) > 1.5)) {
					peer.trail.push({ x: peer.x, y: peer.y, t: now });
				}
				peer.alpha = Math.min(1, peer.alpha + dt * 3);
				// On a drifting thought the light trails it by a pixel or two, which still counts as settled.
				const settled = !peer.blend && Math.hypot(tx - peer.x, ty - peer.y) < (peer.anchor ? 6 : 1);
				if (settled && now - peer.lastMove > STILL_AFTER) sink(peer, now);
			} else {
				peer.alpha = Math.max(0, peer.alpha - dt * (still ? 60 : 2.2));
			}
			while (peer.trail.length && now - peer.trail[0].t > TRAIL_LIFE) peer.trail.shift();
			if (peer.label && now - peer.label.born > LABEL_LIFE) peer.label = null;
			const resting = peer.sunk && peer.alpha === 0 && !peer.trail.length && !peer.label;
			if (peer.gone && resting) peers.delete(peer.id);
			else if (!resting) busy = true;
		}
		rings = rings.filter((ring) => now - ring.born < ring.life);

		draw(now);
		if (busy) frame = requestAnimationFrame(tick);
	}

	function draw(now: number) {
		if (!context) return;
		const ctx = context;
		ctx.clearRect(0, 0, width, height);
		ctx.globalCompositeOperation = 'lighter';
		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		for (const peer of peers.values()) {
			// Trail: thin and faint at the tail, a little brighter and wider towards the head.
			const points = peer.trail;
			for (let i = 1; i < points.length; i++) {
				const a = points[i - 1];
				const b = points[i];
				const age = (now - b.t) / TRAIL_LIFE;
				const fade = Math.pow(Math.max(0, 1 - age), 1.6);
				const along = i / points.length;
				ctx.strokeStyle = `rgb(${peer.tint} / ${(0.34 * fade * (0.3 + 0.7 * along)).toFixed(3)})`;
				ctx.lineWidth = 0.7 + 2.2 * along * fade;
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
			// Head: a small drop of light.
			if (peer.alpha > 0.01) {
				const glow = ctx.createRadialGradient(peer.x, peer.y, 0, peer.x, peer.y, 16);
				glow.addColorStop(0, `rgb(${peer.tint} / ${(0.6 * peer.alpha).toFixed(3)})`);
				glow.addColorStop(0.2, `rgb(${peer.tint} / ${(0.3 * peer.alpha).toFixed(3)})`);
				glow.addColorStop(1, `rgb(${peer.tint} / 0)`);
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(peer.x, peer.y, 16, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		// Ripples: rings that widen, thin out and fade, like a drop landing in still water.
		for (const ring of rings) {
			const p = (now - ring.born) / ring.life;
			if (p < 0) continue;
			const eased = 1 - Math.pow(1 - p, 3);
			ctx.strokeStyle = `rgb(${ring.tint} / ${(ring.alpha * Math.pow(1 - p, 1.3)).toFixed(3)})`;
			ctx.lineWidth = 0.5 + 1 * (1 - p);
			ctx.beginPath();
			ctx.ellipse(
				ring.x,
				ring.y,
				ring.radius * eased + 2,
				(ring.radius * eased + 2) * 0.62,
				0,
				0,
				Math.PI * 2
			);
			ctx.stroke();
		}
		ctx.globalCompositeOperation = 'source-over';

		// Names on top, in normal blending so the tag stays crisp.
		for (const peer of peers.values()) if (peer.label) drawLabel(ctx, peer, now);
	}

	// The name: fades in on the spot, holds, then drifts up a little as it fades.
	function drawLabel(ctx: CanvasRenderingContext2D, peer: Peer, now: number) {
		if (!peer.label) return;
		const age = now - peer.label.born;
		const p = age / LABEL_LIFE;
		const fadeIn = Math.min(1, age / 220);
		const fadeOut = Math.min(1, (LABEL_LIFE - age) / 550);
		const alpha = Math.max(0, Math.min(fadeIn, fadeOut));
		if (alpha <= 0) return;
		const rise = prefersReducedMotion.current ? 0 : (1 - Math.pow(1 - p, 2)) * 8;
		// Centred on the spot where they surfaced or sank, inside the ripples.
		const { x } = peer.label;
		const y = peer.label.y - rise;
		ctx.save();
		ctx.globalAlpha = alpha;
		ctx.font = `700 13px ${fontFamily}`;
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#fff';
		// Just the name in white: a wide soft shadow lifts it off the photo, a tight one sharpens it.
		// Saying goodbye, it is a little quieter.
		if (peer.label.leaving) ctx.globalAlpha = alpha * 0.75;
		ctx.shadowColor = 'rgb(0 0 0 / 55%)';
		ctx.shadowBlur = 10;
		ctx.fillText(peer.name, x, y);
		ctx.shadowColor = 'rgb(0 0 0 / 70%)';
		ctx.shadowBlur = 2;
		ctx.shadowOffsetY = 1;
		ctx.fillText(peer.name, x, y);
		ctx.restore();
	}

	// Size the canvas for the device's pixel density.
	$effect(() => {
		if (!canvas || !width || !height) return;
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		canvas.width = Math.round(width * dpr);
		canvas.height = Math.round(height * dpr);
		context = canvas.getContext('2d');
		fontFamily = getComputedStyle(canvas).fontFamily || fontFamily;
		context?.setTransform(dpr, 0, 0, dpr, 0, 0);
		start();
	});

	onMount(() => () => cancelAnimationFrame(frame));
</script>

<canvas bind:this={canvas} class="trails" style:width={`${width}px`} style:height={`${height}px`}
></canvas>

<style>
	.trails {
		position: absolute;
		font-family: var(--sans);
		inset: 0;
		pointer-events: none;
	}
</style>
