<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	// @ts-ignore
	import Matter from 'matter-js';

	let container: HTMLDivElement | null = null;
	let engine: Matter.Engine;
	let render: Matter.Render;
	let runner: Matter.Runner;
	let world: Matter.World;
	let mouseConstraint: Matter.MouseConstraint;
	let interval: NodeJS.Timeout | null = null;

	const imageTextures: string[] = [
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100',
		'https://picsum.photos/100'
	];

	let objects: Matter.Body[] = [];

	function createImageBody(
		x: number,
		y: number,
		width: number,
		height: number,
		texture: string
	): Matter.Body {
		return Matter.Bodies.rectangle(x, y, width, height, {
			render: {
				sprite: {
					texture,
					xScale: width / 100,
					yScale: height / 100
				}
			}
		});
	}

	onMount(() => {
		if (!container) return;

		engine = Matter.Engine.create();
		world = engine.world;

		// ✅ Remove Matter.js capturing scroll events
		const enablePageScroll = () => {
			if (mouseConstraint && mouseConstraint.mouse.element) {
				mouseConstraint.mouse.element.removeEventListener(
					'wheel',
					mouseConstraint.mouse.mousewheel
				);
				mouseConstraint.mouse.element.removeEventListener(
					'DOMMouseScroll',
					mouseConstraint.mouse.mousewheel
				);
				mouseConstraint.mouse.element.removeEventListener(
					'touchmove',
					mouseConstraint.mouse.mousetouchmove
				);
			}
		};

		render = Matter.Render.create({
			element: container,
			engine: engine,
			options: {
				width: container.clientWidth,
				height: container.clientHeight,
				wireframes: false,
				background: 'transparent'
			}
		});

		Matter.Render.run(render);
		runner = Matter.Runner.create();
		Matter.Runner.run(runner, engine);

		const addWalls = () => {
			Matter.Composite.clear(world, false);
			Matter.Composite.add(world, objects);

			const width = container.clientWidth;
			const height = container.clientHeight;

			const wallWidth = 50;

			const ground = Matter.Bodies.rectangle(width / 2, height + 25, width, wallWidth, {
				isStatic: true
			});
			const ceiling = Matter.Bodies.rectangle(width / 2, -25, width, wallWidth, { isStatic: true });
			const leftWall = Matter.Bodies.rectangle(-26, height / 2, wallWidth, height, {
				isStatic: true
			});
			const rightWall = Matter.Bodies.rectangle(width + 26, height / 2, wallWidth, height, {
				isStatic: true
			});

			Matter.Composite.add(world, [ground, ceiling, leftWall, rightWall]);
		};

		addWalls();

		const mouse = Matter.Mouse.create(render.canvas);
		mouseConstraint = Matter.MouseConstraint.create(engine, {
			mouse,
			constraint: {
				stiffness: 0.2,
				render: { visible: false }
			}
		});

		Matter.Composite.add(world, mouseConstraint);
		render.mouse = mouse;

		// ✅ **Disable Matter.js scroll blocking**
		enablePageScroll();

		// ✅ Add new object every 100ms, stop at array length
		interval = setInterval(() => {
			if (!container || objects.length >= imageTextures.length) {
				if (interval) clearInterval(interval); // Stop adding when limit is reached
				return;
			}

			const texture = imageTextures[objects.length]; // Pick in order

			const newObject = createImageBody(
				Math.random() * container.clientWidth, // Random X position
				0, // Start at the top
				100, // Width
				100, // Height
				texture
			);

			objects.push(newObject);
			Matter.Composite.add(world, newObject);
		}, 100);

		// ✅ Prevent scrolling while dragging objects
		const preventScroll = (event: Event) => {
			if (mouseConstraint.body) {
				event.preventDefault();
			}
		};

		// document.addEventListener('wheel', preventScroll, { passive: false });
		// document.addEventListener('touchmove', preventScroll, { passive: false });

		document.addEventListener('wheel', () => {
			console.log('wheel');
		});

		// ✅ **Fix Resize: Fully refresh Matter.js**
		const handleResize = () => {
			if (!container) return;

			// Update canvas size
			render.canvas.width = container.clientWidth;
			render.canvas.height = container.clientHeight;
			render.options.width = container.clientWidth;
			render.options.height = container.clientHeight;

			// Recreate walls to match new size
			addWalls();

			// Force Matter.js to detect changes
			Matter.Render.lookAt(render, {
				min: { x: 0, y: 0 },
				max: { x: container.clientWidth, y: container.clientHeight }
			});
		};

		window.addEventListener('resize', handleResize);

		onDestroy(() => {
			Matter.Render.stop(render);
			Matter.Runner.stop(runner);
			Matter.Engine.clear(engine);
			window.removeEventListener('resize', handleResize);
			document.removeEventListener('wheel', preventScroll);
			document.removeEventListener('touchmove', preventScroll);

			if (interval) clearInterval(interval);
		});
	});
</script>

<!-- Animation Container -->
<div bind:this={container} class="animation-container"></div>

<style>
	.animation-container {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}
</style>
