import { isAnchorFraction, isAnchorPart, type CursorAnchor } from './cursorAnchor';

const topic = 'tnh-climate-cloud-v1';
const cursorLifetime = 6500;
// Background tabs (Zoom in front) still count, and browsers throttle their timers to ~1/min.
const presenceLifetime = 75_000;
const heartbeatInterval = 8000;
const maxCursors = 15;
const reactionInterval = 180;
const tapInterval = 220;
const publicEntryId = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;
const sampleEntryId = /^sample-[1-9]\d{0,2}$/;
const peerIdPattern = /^[\da-f]{24}$/;

// Anonymous, landscape-themed handles: cursors feel like people without identifying anyone.
const handles = [
	'Delta',
	'Cedar',
	'Estuary',
	'Basalt',
	'Monsoon',
	'Mangrove',
	'Steppe',
	'Lagoon',
	'Savanna',
	'Fjord',
	'Marsh',
	'Dune',
	'Tundra',
	'Prairie',
	'Atoll',
	'Canyon',
	'Wadi',
	'Oasis',
	'Ridge',
	'Harmattan'
];

export function handleFor(peerId: string) {
	return handles[parseInt(peerId.slice(0, 6), 16) % handles.length];
}

/** `on`: the thought spot under the cursor, so others can draw it on their own copy of it. */
export type ClimateCursor = { id: string; x: number; y: number; name: string; on?: CursorAnchor };
export type ClimateTap = ClimateCursor;
export type ClimateReaction = { entryId: string; peerId: string; liked: boolean; boost: boolean };

const events = [
	'cursor',
	'cursor-leave',
	'reaction',
	'wall-changed',
	'hello',
	'bye',
	'tap'
] as const;
type RoomEvent = (typeof events)[number];
type RoomOptions = {
	url?: string;
	key?: string;
	preview: boolean;
	allowSampleReactions?: boolean;
	onCursors: (cursors: ClimateCursor[]) => void;
	onReaction: (reaction: ClimateReaction) => void;
	onTap?: (tap: ClimateTap) => void;
	onPresence?: (count: number) => void;
	onWallChanged: () => void;
	onConnection: (connected: boolean) => void;
};

function isCoordinate(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
}

const round = (value: number) => Math.round(value * 1000) / 1000;

function sameAnchor(a: CursorAnchor | undefined, b: CursorAnchor | undefined) {
	return (
		a === b ||
		(!!a && !!b && a.entryId === b.entryId && a.part === b.part && a.fx === b.fx && a.fy === b.fy)
	);
}

export function connectClimateRoom(options: RoomOptions) {
	const samplesAllowed = options.preview || options.allowSampleReactions === true;
	const id = Array.from(crypto.getRandomValues(new Uint8Array(12)), (byte) =>
		byte.toString(16).padStart(2, '0')
	).join('');
	const peers = new Map<string, { cursor: ClimateCursor; lastSeen: number }>();
	const present = new Map<string, number>();
	let connected = false;
	let closed = false;
	let sentCursor = false;
	let lastCursorAt = -Infinity;
	let lastReactionSentAt = -Infinity;
	let lastReactionReceivedAt = -Infinity;
	let lastTapSentAt = -Infinity;
	let lastWallSentAt = -Infinity;
	let lastWallReceivedAt = -Infinity;
	let lastPresence = -1;
	let queuedPosition: { x: number; y: number; on?: CursorAnchor } | undefined;
	let cursorTimer: ReturnType<typeof setTimeout> | undefined;
	let heartbeatTimer: ReturnType<typeof setInterval> | undefined;
	let expiryTimer: ReturnType<typeof setInterval> | undefined;
	let send: ((event: RoomEvent, payload: object) => void) | undefined;
	let disconnect: (() => void) | undefined;

	function publishCursors() {
		options.onCursors(Array.from(peers.values(), ({ cursor }) => cursor));
	}

	function publishPresence() {
		const count = connected ? present.size + 1 : 0;
		if (count === lastPresence) return;
		lastPresence = count;
		options.onPresence?.(count);
	}

	function cancelPosition() {
		clearTimeout(cursorTimer);
		cursorTimer = undefined;
		queuedPosition = undefined;
	}

	function hello() {
		if (connected) send?.('hello', { id });
	}

	function connectionChanged(next: boolean) {
		if (connected === next) return;
		connected = next;
		if (!next) {
			cancelPosition();
			sentCursor = false;
			present.clear();
			if (peers.size) {
				peers.clear();
				publishCursors();
			}
		}
		publishPresence();
		options.onConnection(next);
		if (next) hello();
	}

	function isEntryId(entryId: unknown): entryId is string {
		return (
			typeof entryId === 'string' &&
			(publicEntryId.test(entryId) || (samplesAllowed && sampleEntryId.test(entryId)))
		);
	}

	/** Accept a thought spot only if it is well formed and names a thought this room allows. */
	function readAnchor(value: unknown): CursorAnchor | undefined {
		if (!value || typeof value !== 'object') return undefined;
		const { entryId, part, fx, fy } = value as Record<string, unknown>;
		if (
			!isEntryId(entryId) ||
			!isAnchorPart(part) ||
			!isAnchorFraction(part, fx) ||
			!isAnchorFraction(part, fy)
		) {
			return undefined;
		}
		return { entryId, part, fx, fy };
	}

	function receive(event: unknown, payload: unknown) {
		if (closed || !connected || !payload || typeof payload !== 'object') return;
		const now = Date.now();
		if (event === 'wall-changed') {
			// A socket event is only a hint to fetch the authoritative wall.
			if (now - lastWallReceivedAt < 1000) return;
			lastWallReceivedAt = now;
			options.onWallChanged();
			return;
		}

		const {
			id: peerId,
			x,
			y,
			on: rawAnchor,
			entryId,
			liked,
			boost
		} = payload as {
			id?: unknown;
			x?: unknown;
			y?: unknown;
			on?: unknown;
			entryId?: unknown;
			liked?: unknown;
			boost?: unknown;
		};
		const on = readAnchor(rawAnchor);
		if (typeof peerId !== 'string' || !peerIdPattern.test(peerId) || peerId === id) return;

		if (event === 'bye') {
			if (present.delete(peerId)) publishPresence();
			if (peers.delete(peerId)) publishCursors();
			return;
		}
		const newcomer = !present.has(peerId);
		present.set(peerId, now);
		if (newcomer) {
			publishPresence();
			// Answer newcomers straight away so they see the room without waiting for a heartbeat.
			if (event === 'hello') hello();
		}

		if (event === 'reaction') {
			if (!isEntryId(entryId) || now - lastReactionReceivedAt < reactionInterval) return;
			lastReactionReceivedAt = now;
			options.onReaction({ entryId, peerId, liked: liked !== false, boost: boost === true });
			return;
		}
		if (event === 'tap') {
			if (isCoordinate(x) && isCoordinate(y)) {
				options.onTap?.({ id: peerId, x, y, name: handleFor(peerId), on });
			}
			return;
		}
		if (event === 'cursor-leave' && peers.delete(peerId)) publishCursors();
		if (event !== 'cursor' || !isCoordinate(x) || !isCoordinate(y)) return;

		const previous = peers.get(peerId);
		if (previous && now - previous.lastSeen < 40) return;
		if (!previous && peers.size >= maxCursors) return;
		peers.set(peerId, {
			cursor: { id: peerId, x, y, name: handleFor(peerId), on },
			lastSeen: now
		});
		if (
			previous?.cursor.x !== x ||
			previous.cursor.y !== y ||
			!sameAnchor(previous.cursor.on, on)
		) {
			publishCursors();
		}
	}

	function leave() {
		cancelPosition();
		if (connected && sentCursor) send?.('cursor-leave', { id });
		sentCursor = false;
	}

	function goodbye() {
		leave();
		if (connected) send?.('bye', { id });
	}

	function visibilityChanged() {
		if (document.visibilityState === 'hidden') leave();
		else hello();
	}

	function start() {
		expiryTimer = setInterval(() => {
			const now = Date.now();
			const cursorsBefore = peers.size;
			for (const [peerId, { lastSeen }] of peers) {
				if (lastSeen < now - cursorLifetime) peers.delete(peerId);
			}
			if (peers.size !== cursorsBefore) publishCursors();

			const presentBefore = present.size;
			for (const [peerId, lastSeen] of present) {
				if (lastSeen < now - presenceLifetime) present.delete(peerId);
			}
			if (present.size !== presentBefore) publishPresence();
		}, 1000);
		heartbeatTimer = setInterval(hello, heartbeatInterval);
		window.addEventListener('pagehide', goodbye);
		document.addEventListener('visibilitychange', visibilityChanged);
	}

	if (options.preview && typeof BroadcastChannel !== 'undefined') {
		const channel = new BroadcastChannel(`${topic}-preview`);
		channel.onmessage = ({ data }) => {
			if (data && typeof data === 'object') receive(data.event, data.payload);
		};
		send = (event, payload) => channel.postMessage({ event, payload });
		disconnect = () => channel.close();
		start();
		connectionChanged(true);
	} else if (!options.preview && options.url && options.key?.startsWith('sb_publishable_')) {
		const { url, key } = options;
		void import('@supabase/supabase-js')
			.then(({ createClient }) => {
				if (closed) return;
				const supabase = createClient(url, key, { accessToken: async () => null });
				const roomTopic = samplesAllowed ? `${topic}-sample` : topic;
				const channel = supabase.channel(roomTopic, { config: { broadcast: { self: false } } });
				send = (event, payload) => {
					void channel.send({ type: 'broadcast', event, payload }).catch(() => {});
				};
				disconnect = () => {
					void supabase.removeAllChannels().catch(() => {});
				};
				start();
				for (const event of events) {
					channel.on('broadcast', { event }, ({ payload }) => receive(event, payload));
				}
				channel.subscribe((status) => {
					if (!closed) connectionChanged(status === 'SUBSCRIBED');
				});
			})
			.catch(() => connectionChanged(false));
	}

	return {
		id,
		name: handleFor(id),
		move(x: number, y: number, on?: CursorAnchor) {
			if (!connected || !isCoordinate(x) || !isCoordinate(y)) return;
			queuedPosition = { x: round(x), y: round(y), ...(on && { on }) };
			if (cursorTimer !== undefined) return;

			// Broadcast is billed on delivery. Slow updates as the visible room gets busier.
			const spacing = options.preview ? 50 : 200 + Math.floor(peers.size / 3) * 120;
			cursorTimer = setTimeout(
				() => {
					const position = queuedPosition;
					cancelPosition();
					if (!connected || !position) return;
					send?.('cursor', { id, ...position });
					lastCursorAt = Date.now();
					sentCursor = true;
				},
				Math.max(0, spacing - (Date.now() - lastCursorAt))
			);
		},
		tap(x: number, y: number, on?: CursorAnchor) {
			const now = Date.now();
			if (!connected || !isCoordinate(x) || !isCoordinate(y) || now - lastTapSentAt < tapInterval) {
				return;
			}
			lastTapSentAt = now;
			send?.('tap', { id, x: round(x), y: round(y), ...(on && { on }) });
		},
		leave,
		reaction(entryId: string, liked: boolean, boost = false) {
			const now = Date.now();
			if (!connected || !isEntryId(entryId) || now - lastReactionSentAt < reactionInterval) return;
			lastReactionSentAt = now;
			send?.('reaction', { id, entryId, liked, boost });
		},
		wallChanged() {
			const now = Date.now();
			if (!connected || now - lastWallSentAt < 500) return;
			lastWallSentAt = now;
			send?.('wall-changed', {});
		},
		close() {
			if (closed) return;
			goodbye();
			closed = true;
			clearInterval(expiryTimer);
			clearInterval(heartbeatTimer);
			window.removeEventListener('pagehide', goodbye);
			document.removeEventListener('visibilitychange', visibilityChanged);
			disconnect?.();
			connectionChanged(false);
		}
	};
}
