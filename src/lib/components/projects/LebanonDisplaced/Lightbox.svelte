<script lang="ts">
	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	type LightboxItem = {
		src: string;
		type: 'image' | 'video';
	};

	const state = $state<{
		items: LightboxItem[];
		index: number | null;
		isVisible: boolean;
	}>({
		items: [],
		index: null,
		isVisible: false
	});

	$effect(() => {
		state.items = $lightboxItems;
		state.index = $currentIndex;
		state.isVisible = $currentIndex !== null;
	});

	const close = () => currentIndex.set(null);
	const next = () =>
		currentIndex.update((i) => (i !== null && i < state.items.length - 1 ? i + 1 : i));
	const prev = () => currentIndex.update((i) => (i !== null && i > 0 ? i - 1 : i));
</script>

{#if state.isVisible && state.index !== null}
	<div>
		<div
			class="lightbox-overlay"
			onclick={close}
			onkeydown={(e) => (e.key === 'Escape' ? close() : null)}
			aria-label="Close lightbox"
		>
			<div
				class="lightbox-media"
				role="dialog"
				aria-modal="true"
				onclick={(e) => e.stopPropagation()}
			>
				{#if state.items[state.index]?.type === 'image'}
					<img src={state.items[state.index].src} alt="" />
				{:else if state.items[state.index]?.type === 'video'}
					<video src={state.items[state.index].src} autoplay controls playsinline>
						<track kind="captions" />
					</video>
				{/if}
			</div>
		</div>

		<!-- Accessible navigation buttons -->
		<button class="lightbox-prev" onclick={prev} aria-label="Previous media">←</button>
		<button class="lightbox-next" onclick={next} aria-label="Next media">→</button>
		<button class="lightbox-close" onclick={close} aria-label="Close lightbox">×</button>
	</div>
{/if}

<style>
	.lightbox-overlay {
		position: fixed;
		inset: 0;
		/* background: rgba(0, 0, 0, 0.9); */
    background: #ffe0b5;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		padding: 10rem 10rem 4rem 10rem;
	}
	.lightbox-media img,
	.lightbox-media video {
		max-width: 90vw;
		max-height: 90vh;
		box-shadow: 0 0 2rem rgba(0, 0, 0, 0.5);
	}
	button {
		position: fixed;
		background: none;
		color: white;
		font-size: 2rem;
		border: none;
		cursor: pointer;
		z-index: 1001;
	}
	.lightbox-prev {
		left: 2rem;
		top: 50%;
		transform: translateY(-50%);
	}
	.lightbox-next {
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
	}
	.lightbox-close {
		top: 2rem;
		right: 2rem;
		font-size: 3rem;
	}
</style>
