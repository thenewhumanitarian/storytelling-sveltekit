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
 * The thoughts carry the hooks: data-term="<entry id>" on each thought, data-part on its parts.
 */

export const anchorParts = ['term', 'word', 'up', 'down', 'comment'] as const;
export type AnchorPart = (typeof anchorParts)[number];

/** A spot on a thought: which thought, which part of it, and where inside that part (0–1). */
export type CursorAnchor = { entryId: string; part: AnchorPart; fx: number; fy: number };

const clamp = (value: number) => Math.min(1, Math.max(0, value));
const round = (value: number) => Math.round(value * 1000) / 1000;

export function isAnchorPart(value: unknown): value is AnchorPart {
	return typeof value === 'string' && (anchorParts as readonly string[]).includes(value);
}

/** Sender: the thought spot under the pointer, if it is over a thought. */
export function anchorAt(
	target: EventTarget | null,
	clientX: number,
	clientY: number
): CursorAnchor | undefined {
	if (!(target instanceof Element)) return undefined;
	const term = target.closest<HTMLElement>('[data-term]');
	const entryId = term?.dataset.term;
	if (!term || !entryId) return undefined;
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
