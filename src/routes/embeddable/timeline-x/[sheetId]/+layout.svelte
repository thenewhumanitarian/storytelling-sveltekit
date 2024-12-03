<svelte:head>
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
	/>
</svelte:head>

<div id="timeline" class="bg-zinc-50 font-body">
	<main>
		<slot />
	</main>
</div>

<style>
	:global(
			.tl-timeline .tl-caption,
			.tl-timeline .tl-credit,
			.tl-timeline .tl-slidenav-next,
			.tl-timeline .tl-slidenav-previous
		) {
		font-size: 14px !important;
		line-height: 17px !important;
	}

	:global(.tl-timeline p) {
		font-size: 17px !important;
		line-height: 1.25 !important;
	}

	:global(.tl-slide.tl-full-image-background a:hover, .tl-slide.tl-full-color-background a:hover) {
		color: rgb(160, 60, 80) !important;
	}

	:global(.tl-medium .tl-text h2.tl-headline-title, .tl-medium .tl-text h2.tl-headline) {
		font-size: 28px;
		line-height: 32px;
	}

	:global(.tl-slide.tl-full-image-background .tl-caption) {
		border-top: 1px solid white;
		padding-top: 0.6rem;
	}

	@media screen and (max-width: 600px) {
		:global(.tl-skinny .tl-slide .tl-slide-content-container .tl-slide-content) {
			padding-bottom: 10px;
		}
		:global(
				.tl-skinny
					.tl-slide.tl-slide.tl-full-color-background
					.tl-slide-content-container
					.tl-slide-content
					.tl-media,
				.tl-skinny .tl-slide .tl-slide-content-container .tl-slide-content .tl-media
			) {
			display: flex;
			justify-content: center;
			padding-bottom: 20px;
			align-items: center;
		}
	}
</style>
