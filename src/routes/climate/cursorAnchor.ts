/*
 * Cursors tied to the thought under them.
 *
 * Every browser lays out its own wall: its own pick of thoughts, positions, drift and pan. A
 * cursor sent as "38% across, 52% down" therefore points at empty sky on someone else's screen.
 * So when a cursor is over a thought, the sender also says which thought, which part of it (the
 * text, +1, −1 or the comment button) and where inside that part. The receiver draws the cursor
 * on its own copy of that thought, wherever that copy happens to be drifting. If the receiver is
 * not showing the thought, there is nowhere sensible to draw it, and the cursor sinks out of view.
 *
 * Near a thought counts too. A cursor approaching a button, or just past the edge, would otherwise
 * flip to screen coordinates and jump far away on other screens. Within NEAR of a thought (and
 * until it is FAR from the thought it was last on), the spot is given relative to that thought's
 * box, beyond its edges if need be.
 *
 * The thoughts carry the hooks: data-term="<entry id>" on each thought, data-part on its parts.
 */

export const anchorParts = ['term', 'word', 'up', 'down', 'comment'] as const;
export type AnchorPart = (typeof anchorParts)[number];

/**
 * A spot on a thought: which thought, which part of it, and where inside that part (0–1). For the
 * whole thought ('term') the spot may lie a little outside its box (NEAR_MIN to NEAR_MAX).
 */
export type CursorAnchor = { entryId: string; part: AnchorPart; fx: number; fy: number };

/** Pixels from a thought's box within which the cursor counts as at that thought. */
const NEAR = 110;
/** Pixels from the box before the cursor lets go of the thought it was already at. */
const FAR = 200;
const NEAR_MIN = -5;
const NEAR_MAX = 6;

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const round = (value: number) => Math.round(value * 1000) / 1000;

export function isAnchorPart(value: unknown): value is AnchorPart {
	return typeof value === 'string' && (anchorParts as readonly string[]).includes(value);
}

/** Whether `value` is a valid fraction for that part: 0–1 inside a part, a wider band around a thought. */
export function isAnchorFraction(part: AnchorPart, value: unknown): value is number {
	if (typeof value !== 'number' || !Number.isFinite(value)) return false;
	return part === 'term' ? value >= NEAR_MIN && value <= NEAR_MAX : value >= 0 && value <= 1;
}

/** Distance in pixels from a point to a box (0 inside it). */
function distanceTo(rect: DOMRect, x: number, y: number) {
	const dx = Math.max(rect.left - x, 0, x - rect.right);
	const dy = Math.max(rect.top - y, 0, y - rect.bottom);
	return Math.hypot(dx, dy);
}

/**
 * Sender: the thought spot under the pointer or near it. `heldEntryId` is the thought the cursor was
 * last at; it is kept until the cursor is FAR from it, so the light doesn't flicker at the edge.
 */
export function anchorAt(
	target: EventTarget | null,
	clientX: number,
	clientY: number,
	heldEntryId?: string
): CursorAnchor | undefined {
	const term = target instanceof Element ? target.closest<HTMLElement>('[data-term]') : null;
	const entryId = term?.dataset.term;
	if (!term || !entryId || !(target instanceof Element))
		return nearAnchor(clientX, clientY, heldEntryId);
	const partNode = target.closest<HTMLElement>('[data-part]');
	const inTerm = partNode && term.contains(partNode) ? partNode : null;
	const part = isAnchorPart(inTerm?.dataset.part) ? inTerm.dataset.part : 'term';
	const rect = (inTerm ?? term).getBoundingClientRect();
	if (!rect.width || !rect.height) return undefined;
	return {
		entryId,
		part,
		fx: round(clamp((clientX - rect.left) / rect.width)),
		fy: round(clamp((clientY - rect.top) / rect.height))
	};
}

/** Sender: the nearest thought within reach of the pointer, as a spot relative to its box. */
function nearAnchor(
	clientX: number,
	clientY: number,
	heldEntryId?: string
): CursorAnchor | undefined {
	let best: { entryId: string; rect: DOMRect; distance: number } | undefined;
	for (const term of document.querySelectorAll<HTMLElement>('[data-term]')) {
		const entryId = term.dataset.term;
		const rect = term.getBoundingClientRect();
		if (!entryId || !rect.width || !rect.height) continue;
		const distance = distanceTo(rect, clientX, clientY);
		const reach = entryId === heldEntryId ? FAR : NEAR;
		// The thought already held wins ties, so two thoughts close together don't trade the light.
		const score = entryId === heldEntryId ? distance - 40 : distance;
		if (distance <= reach && (!best || score < best.distance)) {
			best = { entryId, rect, distance: score };
		}
	}
	if (!best) return undefined;
	const { entryId, rect } = best;
	return {
		entryId,
		part: 'term',
		fx: round(clamp((clientX - rect.left) / rect.width, NEAR_MIN, NEAR_MAX)),
		fy: round(clamp((clientY - rect.top) / rect.height, NEAR_MIN, NEAR_MAX))
	};
}

/**
 * Receiver: where that spot is on this screen, in pixels from the top left of `frame`, or null
 * when this screen is not showing that thought (or it is outside the frame).
 */
export function locateAnchor(
	anchor: CursorAnchor,
	frame: DOMRect
): { x: number; y: number } | null {
	const term = document.querySelector<HTMLElement>(`[data-term="${CSS.escape(anchor.entryId)}"]`);
	if (!term) return null;
	const partNode =
		anchor.part === 'term' ? null : term.querySelector<HTMLElement>(`[data-part="${anchor.part}"]`);
	const rect = (partNode ?? term).getBoundingClientRect();
	if (!rect.width || !rect.height) return null;
	// A part this screen doesn't have (no comment button, say): the middle of the thought.
	const fx = partNode || anchor.part === 'term' ? anchor.fx : 0.5;
	const fy = partNode || anchor.part === 'term' ? anchor.fy : 0.5;
	const x = rect.left + fx * rect.width - frame.left;
	const y = rect.top + fy * rect.height - frame.top;
	// Drifting in from beyond the edge or panned out of view: not on this screen.
	const margin = 8;
	if (x < -margin || y < -margin || x > frame.width + margin || y > frame.height + margin) {
		return null;
	}
	return { x, y };
}
