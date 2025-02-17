<script>
	import FadeIn from '$lib/components/animations/FadeIn.svelte';
</script>

<div class="box--wrapper">
	<div class="name">Layal Haddad</div>
	<div>Text</div>
	<div>Buttons</div>
	<div class="personal-object">Object</div>
	<div class="polaroid-photo">
		<div class="polaroid-photo--inside">Image</div>
	</div>
</div>

<style>
	.box--wrapper {
    z-index: -1;
		position: relative;
		background-color: transparent;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: center;
		border: #ebe4cb 3px solid;
		aspect-ratio: 3/2;
		width: 100%;
		max-width: 480px;
    padding: 2rem 1rem 1rem 1rem;
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
		background-color: #ebe4cb;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
	}

	.polaroid-photo {
		position: absolute;
		top: -15%;
		left: 85%;
		width: 30%;
		aspect-ratio: 35/42;
		background-color: #ebe4cb;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
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
