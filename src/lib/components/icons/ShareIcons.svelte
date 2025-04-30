<script lang="ts">
	import { browser } from '$app/environment';

	let showIcons = false;

	function toggleShare() {
		showIcons = !showIcons;
	}

	let siteUrl = '';
	let encodedUrl = '';
	let message = '';
	let linkedInUrl = '';
	let whatsappUrl = '';
	let emailUrl = '';
	let blueskyShareUrl = '';

	if (browser) {
		siteUrl = window.location.href.replace(
			'https://localhost:5173',
			'https://storytelling-sveltekit-git-preview-thenewhumanitarian.vercel.app'
		);
		encodedUrl = encodeURIComponent(siteUrl);
		message = encodeURIComponent(
			'Check out The Lebanon Displacement Diaries'
		);

		const socialHandles: object = {
			bluesky: '@newhumanitarian.bsky.social',
			whatsapp: 'https://wa.me/?text=Check%20out%20The%20Lebanon%20Displacement%20Diaries%20by'
		};

		linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
		whatsappUrl = `https://wa.me/?text=${message}%20by%20The%20New%20Humanitarian:%20${encodedUrl}`;
		emailUrl = `mailto:?subject=The Lebanon Displacement Diaries&body=${message}%20by%20The%20New%20Humanitarian:%20${encodedUrl}`;
		blueskyShareUrl = `https://bsky.app/intent/compose?text=${message}%20by%20${socialHandles.bluesky}:%0A${encodedUrl}%0A%0Ahttps://bsky.app/profile/newhumanitarian.bsky.social`;
	}
</script>

<div class="share-icons flex items-center justify-center gap-2">
	<!-- Share label only on mobile when icons are hidden -->
	<button
		class="block cursor-pointer text-sm text-lebblack sm:hidden"
		on:click={toggleShare}
		class:hidden={showIcons}
	>
		Share
	</button>

	<!-- Icons -->
	<div class={`flex items-center gap-2 ${showIcons ? 'block' : 'hidden'} sm:flex`}>
		<!-- BlueSky -->
		<a
			class="text-lebblack hover:text-burgundy"
			href={blueskyShareUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on BlueSky"
			title="Share on BlueSky"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 63 63"
				fill="none"
				class="inline h-full w-auto"
			>
				<path
					class="fill-current transition-colors duration-500"
					d="M14.4393 6.76949C21.5475 12.2437 29.1931 23.3431 32.0002 29.2997C34.8075 23.3436 42.4527 12.2436 49.561 6.76949C54.6899 2.81951 63 -0.236753 63 9.48845C63 11.4307 61.9145 25.8044 61.2778 28.1379C59.0647 36.2508 51.0004 38.3201 43.827 37.0677C56.3659 39.2569 59.5557 46.5083 52.667 53.7597C39.584 67.5316 33.8629 50.3043 32.3963 45.8901C32.1276 45.0808 32.0018 44.7022 32 45.0241C31.9981 44.7022 31.8724 45.0808 31.6037 45.8901C30.1377 50.3043 24.4167 67.5321 11.333 53.7597C4.44419 46.5083 7.63385 39.2564 20.173 37.0677C12.9994 38.3201 4.93495 36.2508 2.7222 28.1379C2.08551 25.8042 1 11.4305 1 9.48845C1 -0.236753 9.3103 2.81951 14.439 6.76949H14.4393Z"
					fill="black"
				/>
			</svg>
		</a>
		<!-- LinkedIn -->
		<a
			class="text-lebblack hover:text-burgundy"
			href={linkedInUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on LinkedIn"
			title="Share on LinkedIn"
		>
			<!-- LinkedIn SVG -->
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 38 38"
				fill="none"
				class="inline h-full w-auto pb-1"
			>
				<path
					d="M8.6 5c0 2.2-1.7 4-4.4 4C1.7 9 0 7.2 0 5s1.7-4.1 4.3-4.1C6.9.9 8.6 2.7 8.6 5ZM.2 38.3V12.2H8.3v26.1H.2ZM13.2 20.6c0-3.3-.1-6-.2-8.3h6.8l.4 3.6h.2c1-1.7 3.6-4.2 8-4.2 5.3 0 9.3 3.6 9.3 11.3v15.4h-8.1V23.9c0-3.4-1.2-6-4.1-6-2.2 0-3.5 1.5-4 3-.1.5-.2 1.3-.2 2v15.5h-8.1V20.6Z"
					class="fill-current transition-colors duration-500"
				/>
			</svg>
		</a>

		<!-- WhatsApp -->
		<a
			class="text-lebblack hover:text-burgundy"
			href={whatsappUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share on WhatsApp"
			title="Share on WhatsApp"
		>
			<svg class="pt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
				<path
					class="fill-current transition-colors duration-500"
					d="M17.1 2.9A9.9 9.9 0 0 0 10 0 10 10 0 0 0 0 10c0 1.7.4 3.2 1.3 4.9L0 20l5.2-1.2a10 10 0 0 0 4.8 1.2c5.5 0 10-4.5 10-10a10 10 0 0 0-2.9-7.1Zm-2.2 10.6c-.2.6-1.2 1.1-1.7 1.2-.5 0-.9.2-3-.6-2.5-1-4.1-3.6-4.3-3.8C5.8 10 5 8.8 5 7.6s.6-1.8.9-2.1c.2-.2.4-.3.7-.3.2 0 .3 0 .5 0 .2 0 .4 0 .6.4.2.5.7 1.7.8 1.9.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.1-.3.3-.4.4-.1.1-.3.3-.1.5.2.2.6 1.1 1.4 1.7.9.8 1.8 1.1 2 1.2.2.1.4.1.5-.1.1-.1.6-.7.8-1 .2-.2.3-.2.6-.1.2.1 1.5.7 1.7.8.3.1.4.2.5.3 0 .1 0 .6-.1 1.2Z"
				/>
			</svg>
		</a>

		<!-- Email -->
		<a
			class="text-lebblack hover:text-burgundy"
			href={emailUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="Share via Email"
			title="Share via Email"
		>
			<svg class="pt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
				<path
					d="M8 971.4c-2.2 0-4 1.8-4 4v54c0 2.2 1.8 4 4 4h84c2.2 0 4-1.8 4-4v-54c0-2.2-1.8-4-4-4H8zm6.6 6h70.9L50 1010.3l-35.4-32.9zm-4.6 3.9 38 35.2c1.1 1.1 2.9 1.1 4.1 0l38-35.2v46.1H10v-46.1z"
					class="fill-current transition-colors duration-500"
					transform="translate(0 -952.362)"
				/>
			</svg>
		</a>
	</div>
</div>

<style>
	.share-icons a {
		height: 100%;
		width: auto;
	}
	.share-icons a svg {
		width: 20px;
		height: 24px;
	}
</style>
