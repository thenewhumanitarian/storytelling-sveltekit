<script lang="ts">
	export let videoUrl: string | null | undefined = null;
	export let imageUrl: string | null | undefined = null;
	export let title: string = '';
	export let videoCaption: string | null | undefined = null;
	// Control rounding and autoplay to adapt to different placements
	export let rounded: boolean = true;
	export let autoplay: boolean = true;
	// Optional extra classes to apply to the media element (video or img)
	export let mediaClass: string = '';

	function isDirectVideoUrl(url: string | null | undefined): boolean {
		if (!url) return false;
		const pattern = /(\.mp4|\.webm|\.ogg|\.ogv|\.m4v)(?:\?.*)?(?:#.*)?$/i;
		return pattern.test(url.trim());
	}

	const isDirect = isDirectVideoUrl(videoUrl);
</script>


{#if videoUrl && isDirect}
	<video
		class={`max-h-full max-w-full shadow-lg ${rounded ? 'rounded-lg' : ''} ${mediaClass}`}
		src={videoUrl}
		controls
		autoplay={autoplay}
		aria-label={videoCaption || title}
	></video>
{:else if videoUrl}
	{#if imageUrl}
		<a
			href={videoUrl}
			target="_blank"
			rel="noopener noreferrer"
			class={`group relative block max-w-full overflow-hidden shadow-lg focus:outline-none focus:ring-2 focus:ring-burgundy ${rounded ? 'rounded-lg' : ''}`}
			aria-label="Open media in new window"
		>
			<img
				src={imageUrl}
				alt={title}
				class={`max-h-full max-w-full select-none object-contain sm:object-cover ${mediaClass}`}
			/>
			<div class="absolute inset-0 bg-black/40 transition-colors group-hover:bg-black/50"></div>
			<div class="absolute inset-x-0 bottom-0 m-4">
				<span
					class="inline-flex items-center gap-2 bg-white/95 px-3 py-2 font-semibold text-burgundy shadow"
				>
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
						<path d="M15 3h6v6" />
						<path d="M10 14L21 3" />
					</svg>
					Open media in new window
				</span>
			</div>
		</a>
	{:else}
		<a
			href={videoUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="flex items-center gap-2 bg-white/95 px-4 py-3 font-semibold text-burgundy shadow-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-burgundy"
			aria-label="Open media in new window"
		>
			<svg
				class="h-5 w-5"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
				<path d="M15 3h6v6" />
				<path d="M10 14L21 3" />
			</svg>
			Open media in new window
		</a>
	{/if}
{/if}
