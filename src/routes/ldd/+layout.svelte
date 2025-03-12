<script lang="ts">
	import HeaderComponent from '$lib/components/projects/LebanonDisplaced/HeaderComponent.svelte';
</script>

<svelte:head>
	<title>TNH| Lebanon Displacement Diaries</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<HeaderComponent />

<main>
	<div class="intro-spacer"></div>
	<div class="background-image">
		<enhanced:img src="$lib/assets/ldd/bg-example-1.jpg" alt="Scrapbook background example" />
	</div>
	<slot />
</main>

<footer>
	<p>Footer tbd.</p>
</footer>

<style>
	main {
		margin: 0;
		overflow: hidden;
		/* padding-top: 7rem; */
		/* padding-top: 7rem; */
		/* border: 1px solid #eee; */
	}

	@media screen and (max-width: 640px) {
		main {
			margin-top: 7rem;
			padding-top: 0;
		}
	}

	footer {
		display: flex;
		justify-content: center;
		padding: 0.75rem;
		width: 100%;
		bottom: 0;
		background: black;
		color: white;
		box-shadow: 0px -10px 30px rgba(0, 0, 0, 0.2);
	}

	.background-image {
		position: fixed;
		z-index: -1;
		width: 100vw;
		height: 100vh;
		top: 0;
		left: 0;
	}

	.background-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.intro-spacer {
		height: 7rem;
		background-color: #ebe4cb;
	}
</style>
