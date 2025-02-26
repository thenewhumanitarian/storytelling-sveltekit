<script>
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import StoryGridPanel from '$lib/components/projects/LebanonDisplaced/StoryGridPanel.svelte';

	const panelsArray = [
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-002.svg',
			boxShadow: false
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-001.svg',
			boxShadow: true
		},
		{
			text: '“I should probably get up–things to do.”',
			boxShadow: false,
			gridColumn: 'auto',
			textAlign: 'right'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-003.svg',
			boxShadow: true
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-004.sÈvg',
			boxShadow: true
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-005.svg',
			boxShadow: true,
			gridColumn: 'auto'
		},
		{
			text: '“Naaah.”',
			boxShadow: false,
			gridColumn: 'span 2',
			textAlign: 'center'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-007.svg',
			boxShadow: true,
			gridColumn: 'span 2'
		},
		{
			image: 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/210284/cat-008.svg',
			boxShadow: true
		}
	];
</script>

<section class="story-grid--wrapper">
	<section class="story-grid--container">
		<div class="story-grid--panel panel-title">
			<FadeIn yOffset={50} containerClasses={'flex flex-col items-center gap-y-4'}>
				<h1>Barry’s Cushion</h1>
				<p>A tale of lethargy and soft furnishings</p>
			</FadeIn>
		</div>
		{#each panelsArray as panel, i}
			<StoryGridPanel
				{i}
				bgImage={panel.image}
				text={panel.text}
				boxShadow={panel.boxShadow}
				gridColumn={panel.gridColumn}
				textAlign={panel.textAlign}
			/>
		{/each}
	</section>
</section>

<style>
	/* The grid */
	.story-grid--wrapper {
		/* background: rgba(248, 247, 242, 0.5); */
		background: rgba(227, 192, 154, 0.3);
		/* padding: 5rem; */
		padding: 4rem 0 2rem 0;
	}
	.story-grid--container {
		display: grid;
		width: 100%;
		max-width: 770px;
		margin: 0 auto;
		grid-template-columns: 1fr;
		grid-template-rows: auto 200px 200px auto 200px 200px 200px auto 200px 200px auto;
		grid-gap: 25px;
	}

	/* General panel (global) class */
	:global(.story-grid--panel) {
		color: white;
		background-repeat: no-repeat;
		background-position: center center;
		background-size: cover;
		box-shadow: 0 0px 0px 5px #251b19;
	}
	:global(.story-grid--panel p) {
		font-family: 'Pacifico', cursive;
		font-size: 1.6rem;
		line-height: 1.25;
	}

	/* Individual panels */
	.panel-title {
		box-shadow: none;
		color: white;
		text-shadow: 0 0 10px rgba(0, 0, 0, 0.6);
	}
	.panel-title h1 {
		font-family: 'Pacifico', cursive;
		font-size: 3rem;
	}
	.panel-title p {
		font-family: 'Roboto', sans-serif;
		font-size: 1.5rem;
	}

	@media only screen and (min-width: 400px) {
		.story-grid--container {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: auto 200px auto 200px 200px auto 200px auto;
		}
		.panel-title {
			grid-column: span 2;
		}
	}

	@media only screen and (min-width: 600px) {
		.story-grid--container {
			grid-template-columns: repeat(3, 1fr);
			grid-template-rows: auto 200px 200px auto 200px auto;
		}
		.panel-title {
			grid-column: span 3;
		}
	}
</style>
