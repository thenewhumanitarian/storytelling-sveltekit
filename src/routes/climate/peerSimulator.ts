// Dev-only: a few fake visitors wandering the scene, so the cursor layer can be tried locally
// without real people (and without broadcasting test cursors to the shared room).
// Open /climate?peers=sim on the dev server.
// Now and then a visitor goes to a thought and hovers its text or a button, the way real cursors
// are tied to thoughts (cursorAnchor.ts). Some of those visits are to a thought this screen isn't
// showing, so the light sinks out of view as it would for a real visitor.
import { anchorParts, type CursorAnchor } from './cursorAnchor';
import { handleFor, type ClimateCursor } from './realtime';

type Walker = {
	id: string;
	name: string;
	x: number;
	y: number;
	angle: number;
	pauseUntil: number;
	/** Left the page until this time; comes back somewhere else. */
	awayUntil: number;
	/** On a thought until this time; it fidgets there for the first moment, then rests. */
	visit: { on: CursorAnchor; until: number; restFrom: number } | null;
};

/** A spot on one of the thoughts on screen, or now and then on one this screen isn't showing. */
function pickThought(): CursorAnchor | null {
	const terms = Array.from(document.querySelectorAll<HTMLElement>('[data-term]'));
	const hidden = !terms.length || Math.random() < 0.25;
	const entryId = hidden
		? 'sim-not-on-this-screen'
		: terms[(Math.random() * terms.length) | 0].dataset.term;
	if (!entryId) return null;
	const part = anchorParts[(Math.random() * anchorParts.length) | 0];
	return { entryId, part, fx: 0.3 + Math.random() * 0.4, fy: 0.3 + Math.random() * 0.4 };
}

/** Where a thought spot is, as a share of the scene, so the walk carries on from there. */
function scenePosition(on: CursorAnchor) {
	const term = document.querySelector<HTMLElement>(`[data-term="${CSS.escape(on.entryId)}"]`);
	const scene = document.querySelector<HTMLElement>('.scene');
	if (!term || !scene) return null;
	const box = term.getBoundingClientRect();
	const frame = scene.getBoundingClientRect();
	return {
		x: (box.left + box.width * on.fx - frame.left) / frame.width,
		y: (box.top + box.height * on.fy - frame.top) / frame.height
	};
}

export function simulatePeers(count: number, onCursors: (cursors: ClimateCursor[]) => void) {
	const walkers: Walker[] = Array.from({ length: count }, () => {
		// Same id shape as real peers, so the names come from the same list.
		const id = crypto.randomUUID().replaceAll('-', '');
		return { id, name: handleFor(id), ...start() };
	});
	function start() {
		return {
			x: 0.2 + Math.random() * 0.6,
			y: 0.25 + Math.random() * 0.5,
			angle: Math.random() * Math.PI * 2,
			pauseUntil: 0,
			awayUntil: 0,
			visit: null as Walker['visit']
		};
	}
	// Same rhythm as the real room: updates every ~120ms, only while moving.
	const timer = setInterval(() => {
		const now = performance.now();
		for (const walker of walkers) {
			if (walker.awayUntil) {
				if (now < walker.awayUntil) continue;
				Object.assign(walker, start());
			}
			if (walker.visit) {
				if (now < walker.visit.until) {
					// Fidget on the spot for a moment (which counts as moving), then rest there and sink.
					if (now < walker.visit.restFrom) {
						const on = walker.visit.on;
						on.fx = Math.min(0.95, Math.max(0.05, on.fx + (Math.random() - 0.5) * 0.08));
						on.fy = Math.min(0.95, Math.max(0.05, on.fy + (Math.random() - 0.5) * 0.08));
						walker.visit.on = { ...on };
					}
					continue;
				}
				const from = scenePosition(walker.visit.on);
				if (from) Object.assign(walker, { x: from.x, y: from.y });
				walker.visit = null;
			}
			if (now < walker.pauseUntil) continue;
			// Now and then, go and hover a thought.
			if (Math.random() < 0.02) {
				const on = pickThought();
				if (on) {
					walker.visit = { on, until: now + 2500 + Math.random() * 2500, restFrom: now + 1200 };
					continue;
				}
			}
			// Rarely, leave the page for a few seconds so the goodbye and hello show.
			if (Math.random() < 0.004) {
				walker.awayUntil = now + 3000 + Math.random() * 3000;
				continue;
			}
			// Like a real visitor: move in short bursts, then rest a while (and sink) before moving on.
			if (Math.random() < 0.05) {
				walker.pauseUntil = now + 3000 + Math.random() * 6000;
				continue;
			}
			walker.angle += (Math.random() - 0.5) * 0.7;
			walker.x += Math.cos(walker.angle) * 0.012;
			walker.y += Math.sin(walker.angle) * 0.012;
			if (walker.x < 0.05 || walker.x > 0.95) walker.angle = Math.PI - walker.angle;
			if (walker.y < 0.1 || walker.y > 0.9) walker.angle = -walker.angle;
			walker.x = Math.min(0.95, Math.max(0.05, walker.x));
			walker.y = Math.min(0.9, Math.max(0.1, walker.y));
		}
		onCursors(
			walkers
				.filter((walker) => !walker.awayUntil)
				.map(({ id, name, x, y, visit }) => ({ id, name, x, y, on: visit?.on }))
		);
	}, 120);
	return () => clearInterval(timer);
}
