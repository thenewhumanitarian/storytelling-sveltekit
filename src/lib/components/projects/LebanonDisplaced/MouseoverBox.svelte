<script lang="ts">
	import { StoryblokComponent, storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	import FadeIn from '$lib/components/animations/FadeIn.svelte';
	import RichText from './RichText.svelte';

	// const marginClasses = blok.object || blok.photo ? 'mt-5' : 'mt-6 mb-3';

	const textObject = blok.text;
</script>

<article>
	<FadeIn duration={1000} yOffset={200} blurAmount={20}>
		<div class="box--wrapper" use:storyblokEditable={blok && blok._editable ? blok : undefined}>
			<div class="name">{blok.title}</div>
			<div class="text-content">
				{#if blok.text}
					<RichText blok={textObject} className="clamp-5" />
				{/if}
			</div>
			<div class="text-content--hover">
				<h2>Read more →</h2>
			</div>
			{#if blok.object}
				<div class="personal-object floating-rotate-left floating--delay">
					{#if blok.object.filename}
						<img src={blok.object.filename} alt={blok.object.alt || 'Object'} />
					{:else}
						<span>Object</span>
					{/if}
				</div>
			{/if}
			{#if blok.photo}
				<div class="polaroid-photo floating-rotate-right">
					<div class="polaroid-photo--inside">
						<img src={blok.photo.filename} alt={blok.photo.alt || 'Photo'} />
					</div>
				</div>
			{/if}
		</div>
	</FadeIn>
</article>

<style>
	h2 {
		font-family: 'Pacifico', cursive;
	}

	@media screen and (max-width: 640px) {
		h2 {
			font-size: 1.4rem;
			line-height: 1;
		}
	}

	article {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: left;
		padding: 15%;
	}

	@media screen and (max-width: 640px) {
		article {
			margin: 4rem auto 4rem auto;
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
		border: #ebe4cb 1px solid;
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
		font-family: 'GT Sectra Fine', sans-serif;
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
		height: calc(100% - 0.6rem);
		width: calc(100% - 0.6rem);
		border: 1px solid #ebe4cb;
		margin: 0.3rem;
		text-align: left;
		z-index: 1;
		background-color: rgba(255, 255, 255, 1);
		padding: 1.5rem 1.5rem 1rem 1.5rem;
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
		height: calc(100% - 0.6rem);
		width: calc(100% - 0.6rem);
		margin: 0.3rem;
		background-color: #e8c188;
		opacity: 0;
		transition: all 0.5s;
		z-index: -1;
		border: 1px solid #ebe4cb;
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
		scale: 1.5;
	}

	@media screen and (max-width: 640px) {
		.box--wrapper:hover .personal-object {
			left: -8%;
			scale: 1.1;
			bottom: -18%;
		}
	}

	.polaroid-photo {
		z-index: -1;
		position: absolute;
		top: 0;
		right: -5%;
		width: 30%;
		aspect-ratio: 35/42;
		background-color: #ebe4cb;
		box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.2);
		z-index: -1;
		transition: all 0.3s;
		transition-delay: 0.2s;
		will-change: left top scale transform;
	}

	.box--wrapper:hover .polaroid-photo {
		top: -15%;
		right: -10%;
		scale: 1.5;
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
