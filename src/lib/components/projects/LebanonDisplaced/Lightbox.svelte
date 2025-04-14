<script lang="ts">
	import { lightboxItems, currentIndex } from '$lib/stores/lightbox';

	type LightboxItem = {
		src: string;
		type: 'image' | 'video';
	};

	const state = $state<{
		index: number | null;
		isVisible: boolean;
	}>({
		index: null,
		isVisible: false
	});

	// Track and react to currentIndex changes only
	$effect(() => {
		state.index = $currentIndex;
		state.isVisible = $currentIndex !== null;
		// console.log('Updated state', {
		// 	index: state.index,
		// 	isVisible: state.isVisible,
		// 	items: $lightboxItems
		// });
	});

	const close = () => currentIndex.set(null);

	const next = () => {
		const items = $lightboxItems;
		currentIndex.update((i) => (i !== null ? (i < items.length - 1 ? i + 1 : 0) : null));
	};

	const prev = () => {
		const items = $lightboxItems;
		currentIndex.update((i) => (i !== null ? (i > 0 ? i - 1 : items.length - 1) : null));
	};
</script>

{#if state.isVisible && state.index !== null && $lightboxItems[state.index]}
	<div>
		<div
			class="lightbox-overlay"
			onclick={close}
			onkeydown={(e) => e.key === 'Escape' && close()}
			aria-label="Close lightbox"
		>
			<div
				class="lightbox-media"
				role="dialog"
				aria-modal="true"
				onclick={(e) => e.stopPropagation()}
			>
				{#if $lightboxItems[state.index].type === 'image'}
					<img src={$lightboxItems[state.index].src} alt="" />
				{:else if $lightboxItems[state.index].type === 'video'}
					<video src={$lightboxItems[state.index].src} autoplay controls playsinline>
						<track kind="captions" />
					</video>
				{/if}
			</div>
		</div>

		<!-- Navigation buttons -->
		<button class="lightbox-prev" onclick={prev}>←</button>
		<button class="lightbox-next" onclick={next}>→</button>
		<button class="lightbox-close" onclick={close}>×</button>
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
