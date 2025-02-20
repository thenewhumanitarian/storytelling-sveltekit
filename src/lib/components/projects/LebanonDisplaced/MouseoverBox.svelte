<script lang="ts">
	import FadeIn from '$lib/components/animations/FadeIn.svelte';

	export let object = true;
	export let photo = true;

	const marginClasses = object || photo ? 'mt-20' : 'mt-6 mb-3';
</script>

<article class={`${marginClasses}`}>
	<FadeIn duration={1000} yOffset={200} blurAmount={20}>
		<div class="box--wrapper">
			<div class="name">Layal Haddad</div>
			<div>Text</div>
			<div>Buttons</div>
			{#if object}
				<div class="personal-object">Object</div>
			{/if}
			{#if photo}
				<div class="polaroid-photo">
					<div class="polaroid-photo--inside">Image</div>
				</div>
			{/if}
		</div>
	</FadeIn>
</article>

<style>
	article {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8rem;
		background: rgba(255, 0, 0, 0.5);
	}

	@media screen and (max-width: 640px) {
		article {
			margin: 4rem auto 0.5rem auto;
			padding: 1rem 0;
		}
	}

	.box--wrapper {
		z-index: 1;
		position: relative;
		background-color: transparent;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		border: #ebe4cb 3px solid;
		aspect-ratio: 3/2;
		width: 100%;
		max-width: 640px;
		padding: 2rem 1rem 1rem 1rem;
		background-color: rgba(255, 255, 255, 0.95);
	}

	.box--wrapper .name {
		position: absolute;
		top: -1.5rem;
		font-family: 'Pacifico', cursive;
		background-color: #33765d;
		color: white;
		font-size: 2rem;
		padding: 0.5rem 1rem;
	}

	.box--wrapper .personal-object {
		position: absolute;
		top: -20%;
		left: -20%;
		width: 30%;
		height: 80%;
		background-color: #bc3734;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		z-index: -1;
	}

	.polaroid-photo {
		position: absolute;
		top: -15%;
		left: 85%;
		width: 30%;
		aspect-ratio: 35/42;
		background-color: #ebe4cb;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		z-index: -1;
	}

	.polaroid-photo--inside {
		position: absolute;
		top: 5%;
		left: 5%;
		width: 90%;
		aspect-ratio: 1/1;
		background-color: white;
	}
</style>
