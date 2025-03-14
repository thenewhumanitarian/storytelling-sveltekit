<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Matter from 'matter-js';

	let container: HTMLDivElement | null = null;
	let engine: Matter.Engine;
	let render: Matter.Render;
	let runner: Matter.Runner;
	let world: Matter.World;
	let mouseConstraint: Matter.MouseConstraint;
	let interval: NodeJS.Timeout | null = null;

	let numberOfTextures = 10;
	let imageTextureSource = [
		'https://localhost:5173/assets/ldd/objects/diary-lantern.png',
		'https://localhost:5173/assets/ldd/objects/diary-camera.png',
		'https://localhost:5173/assets/ldd/objects/diary-vase.png'
	];
	let imageTextures: string[] = ['https://localhost:5173/assets/ldd/objects/diary-lantern.png'];

	for (let i = 0; i < numberOfTextures; i++) {
		imageTextures.push(imageTextureSource[Math.floor(Math.random() * imageTextureSource.length)]);
	}

	let objects: Matter.Body[] = [];

	function preloadImages(urls: string[]): Promise<void[]> {
		return Promise.all(
			urls.map(
				(url) =>
					new Promise((resolve, reject) => {
						const img = new Image();
						img.onload = () => resolve();
						img.onerror = reject;
						img.src = url;
					})
			)
		);
	}

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

	onMount(async () => {
		if (!container) return;

		await preloadImages(imageTextures);

		engine = Matter.Engine.create();
		world = engine.world;

		const enablePageScroll = () => {
			if (mouseConstraint?.mouse?.element) {
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

			const { clientWidth: width, clientHeight: height } = container;
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
			const rampLeft = Matter.Bodies.rectangle(width / 6, height / 1.75, width / 2, wallWidth / 5, {
				isStatic: true,
				angle: Math.PI * 0.08,
				render: { fillStyle: '#003D14' }
			});
			const rampRight = Matter.Bodies.rectangle(width * 0.8, height / 3, width / 2, wallWidth / 5, {
				isStatic: true,
				angle: -Math.PI * 0.08,
				render: { fillStyle: '#003D14' }
			});

			Matter.Composite.add(world, [ground, ceiling, leftWall, rightWall, rampLeft, rampRight]);
		};

		addWalls();

		const mouse = Matter.Mouse.create(render.canvas);
		mouseConstraint = Matter.MouseConstraint.create(engine, {
			mouse,
			constraint: { stiffness: 0.2, render: { visible: false } }
		});

		Matter.Composite.add(world, mouseConstraint);
		render.mouse = mouse;

		enablePageScroll();

		interval = setInterval(() => {
			if (!container || objects.length >= imageTextures.length) {
				if (interval) clearInterval(interval);
				return;
			}

			const texture = imageTextures[objects.length];
			const newObject = createImageBody(
				Math.random() * container.clientWidth,
				0,
				100,
				100,
				texture
			);
			objects.push(newObject);
			Matter.Composite.add(world, newObject);
		}, 100);

		const handleResize = () => {
			if (!container) return;

			render.canvas.width = container.clientWidth;
			render.canvas.height = container.clientHeight;
			render.options.width = container.clientWidth;
			render.options.height = container.clientHeight;

			addWalls();
		};

		window.addEventListener('resize', handleResize);

		onDestroy(() => {
			Matter.Render.stop(render);
			Matter.Runner.stop(runner);
			Matter.Engine.clear(engine);
			window.removeEventListener('resize', handleResize);
			if (interval) clearInterval(interval);
		});
	});
</script>

<div bind:this={container} class="animation-container"></div>

<style>
	.animation-container {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		overflow: hidden;
	}
</style>
