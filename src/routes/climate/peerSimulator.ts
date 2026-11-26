// Dev-only: a few fake visitors wandering the scene, so the cursor layer can be tried locally
// without real people (and without broadcasting test cursors to the shared room).
// Open /climate?peers=sim on the dev server.
import type { ClimateCursor } from './realtime';

type Walker = { id: string; name: string; x: number; y: number; angle: number; pauseUntil: number };

export function simulatePeers(count: number, onCursors: (cursors: ClimateCursor[]) => void) {
	const walkers: Walker[] = Array.from({ length: count }, (_, i) => ({
		id: `sim-${i}`,
		name: `Visitor ${i + 1}`,
		x: 0.2 + Math.random() * 0.6,
		y: 0.25 + Math.random() * 0.5,
		angle: Math.random() * Math.PI * 2,
		pauseUntil: 0
	}));
	// Same rhythm as the real room: updates every ~120ms, only while moving.
	const timer = setInterval(() => {
		const now = performance.now();
		for (const walker of walkers) {
			if (now < walker.pauseUntil) continue;
			// Now and then, stop for a couple of seconds so the sink-and-resurface shows.
			if (Math.random() < 0.012) {
				walker.pauseUntil = now + 1500 + Math.random() * 2500;
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
		onCursors(walkers.map(({ id, name, x, y }) => ({ id, name, x, y })));
	}, 120);
	return () => clearInterval(timer);
}
