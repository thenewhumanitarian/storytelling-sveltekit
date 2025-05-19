<script lang="ts">
	import { getContext } from 'svelte';
	import { storyblokEditable } from '@storyblok/svelte';

	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import RichText from './RichText.svelte';

	const lang = getContext('lang') as string;
	const { blok } = $props();
</script>

<article>
	<FadeIn duration={1000} yOffset={200} blurAmount={20}>
		<div class="box--wrapper" use:storyblokEditable={blok}>
			<div class={`name ${blok.textColor}`}>{blok.title}</div>

			<div class="text-content">
				{#if blok.text}
					<RichText
						blok={blok.text}
						className="prose-p:text-sm prose-p:lg:text-md prose-p:xl:text-xl"
					/>
				{/if}
			</div>

			<div class="text-content--hover font-serif">
				<h2 class:hidden={lang === 'ar'}>Read more→</h2>
				<h2 class:hidden={lang !== 'ar'} dir="rtl">اقرأ المزيد←</h2>
			</div>

			{#if blok.object?.filename}
				<div
					class={`personal-object floating--delay ${
						lang === 'ar' ? 'rtl-object floating-rotate-right' : 'floating-rotate-left'
					}`}
				>
					<img src={blok.object.filename} alt={blok.object.alt || 'Object'} />
				</div>
			{/if}
		</div>
	</FadeIn>
</article>

<style>
	h2 {
		font-weight: bold;
	}

	@media screen and (max-width: 640px) {
		h2 {
			font-size: 1.4rem;
			line-height: 1;
		}
	}

	:global(h2.en) {
		display: block;
	}

	:global(.arabic h2.en) {
		display: none;
	}

	:global(.arabic h2.ar) {
		display: block;
	}

	article {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 10% 15% 8% 15%;
	}

	@media screen and (max-width: 640px) {
		article {
			margin: 3rem auto;
			padding: 1rem;
		}
	}

	article .box--wrapper {
		will-change: background;
		z-index: 1;
		position: relative;
		background-color: transparent;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		align-items: start;
		border: 0.5px solid #282828;
		background: #ffe0b5;
		aspect-ratio: 3/2;
		width: 100%;
		max-width: 640px;
		padding: 2rem 1rem 1rem 1rem;
		transition: background 1s;
		will-change: background;
		cursor: pointer;
	}

	.box--wrapper .name {
		position: absolute;
		top: -1.5rem;
		font-family: 'GT Sectra Bold', sans-serif;
		font-weight: bold;
		font-size: 2rem;
		padding: 0.5rem 1rem;
		z-index: 2;
		background-color: black;
		color: white;
	}

	@media screen and (max-width: 640px) {
		.box--wrapper .name {
			top: -1rem;
			font-size: 1rem;
			padding: 0.2rem 0.5rem;
		}
	}

	.box--wrapper .text-content {
		position: absolute;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		border: 0.5px solid #282828;
		text-align: left;
		z-index: 1;
		background: #ffe0b5;
		background-size: contain;
		border-color: transparent;
		background-repeat: no-repeat;
		background-position: center;
		padding: 2rem 1.5rem;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		/* padding: 2rem 4rem 1rem 4rem; */
		/* background-color: rgba(255, 255, 255, 1); */
	}

	@media screen and (max-width: 640px) {
		.box--wrapper .text-content {
			padding: 1rem 1rem 0.5rem 1rem;
		}
	}

	.text-content {
		display: block;
		width: 100%;
		max-width: 100%;
		text-align: left;
	}

	.box--wrapper:hover .text-content {
		opacity: 0;
	}

	.box--wrapper .text-content--hover {
		position: absolute;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: left;
		top: 0;
		left: 0;
		height: 100%;
		width: 100%;
		background-color: transparent;
		opacity: 0;
		transition: all 0.5s;
		z-index: -1;
		color: #003d14;
		background-size: contain;
		border-color: transparent;
		background-repeat: no-repeat;
		background-position: center;
		box-shadow: rgba(0, 0, 0, 0.45) 0px 25px 20px -20px;
		/* border: 4px solid #003d14; */
		/* background-color: #e8c188; */
		/* background-color: #ede580; */
	}

	.box--wrapper:hover .text-content--hover {
		opacity: 1;
	}

	.box--wrapper .personal-object {
		left: -10%;
		bottom: -20%;
		width: 30%;
		height: 80%;
		position: absolute;
		z-index: -1;
		will-change: bottom left scale transform;
		transition: all 0.5s;
	}

	.personal-object img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.box--wrapper:hover .personal-object {
		bottom: -14%;
		left: -16%;
		scale: 1.4;
	}

	@media screen and (max-width: 640px) {
		.box--wrapper:hover .personal-object {
			left: -8%;
			scale: 1.1;
			bottom: -18%;
		}
	}

	/* RTL override: object floats on the right */
	.rtl-object {
		right: -10%;
		left: auto;
		transform-origin: center right;
	}

	.box--wrapper:hover .rtl-object {
		right: -16%;
		left: auto;
		scale: 1.4;
	}

	@media screen and (max-width: 640px) {
		.box--wrapper:hover .rtl-object {
			right: -8%;
			scale: 1.1;
		}
	}

	.polaroid-photo {
		z-index: -1;
		position: absolute;
		top: 0;
		right: -10%;
		width: 35%;
		aspect-ratio: 35/42;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.3);
		z-index: -1;
		transition: all 0.3s;
		transition-delay: 0.2s;
		will-change: left top scale transform;
		background-color: white;
	}

	.box--wrapper:hover .polaroid-photo {
		top: -15%;
		right: -10%;
		scale: 1.3;
	}

	@media screen and (max-width: 640px) {
		.box--wrapper:hover .polaroid-photo {
			right: -4%;
			scale: 1.25;
		}
	}

	.polaroid-photo--inside {
		position: absolute;
		top: 5%;
		left: 5%;
		width: 90%;
		aspect-ratio: 1/1;
		background-color: white;
		z-index: 1;
	}

	/* Animations */

	.floating--delay {
		animation-delay: 0.5s;
	}

	.floating-rotate-left {
		display: inline-block;
		animation: floating-rotate-left 3s ease-in-out infinite;
		will-change: transform;
	}

	.floating-rotate-right {
		display: inline-block;
		animation: floating-rotate-right 4s ease-in-out infinite;
		will-change: transform;
	}

	@keyframes floating-rotate-left {
		0% {
			transform: translateY(0) rotate(-15deg);
		}
		50% {
			transform: translateY(-8px) rotate(-14deg);
		}
		100% {
			transform: translateY(0) rotate(-15deg);
		}
	}

	@keyframes floating-rotate-right {
		0% {
			transform: translateY(0) rotate(20deg);
		}
		50% {
			transform: translateY(-8px) rotate(19deg);
		}
		100% {
			transform: translateY(0) rotate(20deg);
		}
	}
</style>
