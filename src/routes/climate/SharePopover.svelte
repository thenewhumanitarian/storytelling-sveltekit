<script lang="ts">
	import { Popover } from 'bits-ui';
	import { onMount } from 'svelte';

	interface Props {
		title: string;
		message: string;
	}

	let { title, message }: Props = $props();
	let url = $state('');
	let copied = $state(false);

	onMount(() => {
		url = location.href.split('#')[0];
	});

	const text = $derived(`${message} by The New Humanitarian: ${url}`);
	const options = $derived([
		{
			label: 'WhatsApp',
			href: `https://wa.me/?text=${encodeURIComponent(text)}`,
			viewBox: '0 0 24 24',
			path: 'M19.1 4.90049C18.1689 3.96918 17.0614 3.23299 15.8422 2.73503C14.6231 2.23707 13.3169 1.98735 12 2.00049C9.34784 2.00049 6.8043 3.05406 4.92893 4.92943C3.05357 6.80479 2 9.34833 2 12.0005C2 13.7005 2.4 15.2005 3.3 16.9005L2 22.0005L7.2 20.8005C8.67422 21.5962 10.3247 22.0089 12 22.0005C17.5 22.0005 22 17.5005 22 12.0005C22.0076 10.6844 21.7554 9.3798 21.2577 8.16143C20.7601 6.94305 20.0268 5.83489 19.1 4.90049ZM16.9 15.5005C16.7 16.1005 15.7 16.6005 15.2 16.7005C14.7 16.7005 14.3 16.9005 12.2 16.1005C9.7 15.1005 8.1 12.5005 7.9 12.3005C7.8 12.0005 7 10.8005 7 9.60049C7 8.40049 7.6 7.80049 7.9 7.50049C8.1 7.30049 8.3 7.20049 8.6 7.20049C8.8 7.20049 8.9 7.20049 9.1 7.20049C9.3 7.20049 9.5 7.20049 9.7 7.60049C9.9 8.10049 10.4 9.30049 10.5 9.50049C10.6 9.60049 10.6 9.80049 10.5 9.90049C10.4 10.1005 10.4 10.2005 10.2 10.3005C10.1 10.4005 9.9 10.6005 9.8 10.7005C9.7 10.8005 9.5 11.0005 9.7 11.2005C9.9 11.4005 10.3 12.3005 11.1 12.9005C12 13.7005 12.9 14.0005 13.1 14.1005C13.3 14.2005 13.5 14.2005 13.6 14.0005C13.7 13.9005 14.2 13.3005 14.4 13.0005C14.6 12.8005 14.7 12.8005 15 12.9005C15.2 13.0005 16.5 13.6005 16.7 13.7005C17 13.8005 17.1 13.9005 17.2 14.0005C17.2 14.1005 17.2 14.6005 17.1 15.2005L16.9 15.5005Z'
		},
		{
			label: 'Email',
			href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text)}`,
			viewBox: '0 0 99 99',
			path: 'M4.30435 17C1.93696 17 0 18.9452 0 21.3226V79.6774C0 82.0548 1.93696 84 4.30435 84H94.6957C97.063 84 99 82.0548 99 79.6774V21.3226C99 18.9452 97.063 17 94.6957 17H4.30435ZM11.4065 23.4839H87.7011L49.5 59.0371L11.4065 23.4839ZM6.45652 27.6983L47.3478 65.7371C48.5315 66.9258 50.4685 66.9258 51.7598 65.7371L92.6511 27.6983V77.5161H6.45652V27.6983Z'
		},
		{
			label: 'Bluesky',
			href: `https://bsky.app/intent/compose?text=${encodeURIComponent(`${message} by @newhumanitarian.bsky.social:\n${url}`)}`,
			viewBox: '0 0 63 63',
			path: 'M13.6561 6.8368C20.8789 12.4088 28.6478 23.7064 31.5002 29.7693C34.3528 23.7069 42.1213 12.4087 49.3442 6.8368C54.5559 2.81629 63 -0.294551 63 9.60432C63 11.5812 61.897 26.2116 61.25 28.5868C59.0012 36.8446 50.8069 38.9508 43.5178 37.6761C56.2589 39.9043 59.5001 47.2852 52.5003 54.6661C39.2063 68.684 33.3929 51.149 31.9027 46.656C31.6297 45.8322 31.5018 45.4469 31.5 45.7745C31.4981 45.4469 31.3703 45.8322 31.0973 46.656C29.6077 51.149 23.7944 68.6845 10.4997 54.6661C3.49974 47.2852 6.74085 39.9038 19.4822 37.6761C12.1929 38.9508 3.99842 36.8446 1.74998 28.5868C1.10302 26.2114 0 11.581 0 9.60432C0 -0.294551 8.44464 2.81629 13.6561 6.8368Z'
		},
		{
			label: 'LinkedIn',
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
			viewBox: '0 0 38 38',
			path: 'M8.6 5c0 2.2-1.7 4-4.4 4C1.7 9 0 7.2 0 5s1.7-4.1 4.3-4.1C6.9.9 8.6 2.7 8.6 5ZM.2 38.3V12.2H8.3v26.1H.2ZM13.2 20.6c0-3.3-.1-6-.2-8.3h6.8l.4 3.6h.2c1-1.7 3.6-4.2 8-4.2 5.3 0 9.3 3.6 9.3 11.3v15.4h-8.1V23.9c0-3.4-1.2-6-4.1-6-2.2 0-3.5 1.5-4 3-.1.5-.2 1.3-.2 2v15.5h-8.1V20.6Z'
		}
	]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			copied = false;
		}
	}
</script>

<Popover.Root>
	<Popover.Trigger class="share-trigger" aria-label="Share this page">
		<svg viewBox="0 0 20 20" aria-hidden="true">
			<circle cx="15" cy="4.5" r="2.2" />
			<circle cx="5" cy="10" r="2.2" />
			<circle cx="15" cy="15.5" r="2.2" />
			<path d="M7 8.9 13 5.6M7 11.1l6 3.3" />
		</svg>
	</Popover.Trigger>
	<Popover.Portal>
		<Popover.Content
			class="share-menu"
			side="bottom"
			align="start"
			sideOffset={10}
			collisionPadding={12}
		>
			<p class="share-title">Share</p>
			<ul>
				{#each options as option (option.label)}
					<li>
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
						<a href={option.href} target="_blank" rel="noopener noreferrer">
							<svg viewBox={option.viewBox} aria-hidden="true"><path d={option.path} /></svg>
							{option.label}
						</a>
					</li>
				{/each}
				<li>
					<button type="button" onclick={copy}>
						<svg viewBox="0 0 20 20" aria-hidden="true" class="stroke">
							<path d="M8.5 11.5a3 3 0 0 0 4.2 0l3-3a3 3 0 0 0-4.2-4.2l-1 1" />
							<path d="M11.5 8.5a3 3 0 0 0-4.2 0l-3 3a3 3 0 0 0 4.2 4.2l1-1" />
						</svg>
						<span role="status">{copied ? 'Link copied' : 'Copy link'}</span>
					</button>
				</li>
			</ul>
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>

<style>
	:global(.share-trigger) {
		display: grid;
		place-items: center;
		width: 2.75rem;
		height: 2.75rem;
		border: 0;
		background: none;
		color: rgb(255 255 255 / 85%);
		cursor: pointer;
		transition:
			color 150ms ease,
			background-color 150ms ease;
	}
	:global(.share-trigger:hover),
	:global(.share-trigger[data-state='open']) {
		color: #fff;
		background: rgb(255 255 255 / 10%);
	}
	:global(.share-trigger svg) {
		width: 1.35rem;
		height: 1.35rem;
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
	}
	/* Phones: no box, so pull the bare icon into line with the page edge. */
	@media (max-width: 650px) {
		:global(.share-trigger) {
			margin-left: -0.6rem;
		}
	}
	:global(.share-trigger:focus) {
		outline: none;
	}
	:global(.share-trigger:focus-visible) {
		outline: 2px solid #fff;
		outline-offset: 2px;
	}
	:global(.share-menu) {
		z-index: 95;
		min-width: 14rem;
		padding: 0.85rem 0.75rem 0.75rem;
		background: #fff;
		border-top: 4px solid #9f3e52;
		box-shadow:
			0 0 0 1px rgb(0 0 0 / 6%),
			0 20px 50px rgb(0 0 0 / 40%);
		color: #282828;
		font:
			400 1rem/1.3 'Climate Roboto',
			Arial,
			sans-serif;
	}
	:global(.share-menu[data-state='open']) {
		animation: share-in 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
	}
	@keyframes share-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
	}
	.share-title {
		margin: 0.2rem 0.5rem 0.4rem;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: #6b645e;
	}
	ul {
		display: grid;
		gap: 0.2rem;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	a,
	button {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		width: 100%;
		min-height: 2.9rem;
		padding: 0 0.75rem;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		font-weight: 700;
		text-decoration: none;
		text-align: left;
		cursor: pointer;
	}
	a:hover,
	button:hover {
		background: #f4e8e7;
		color: #9f3e52;
	}
	a:focus,
	button:focus {
		outline: none;
	}
	a:focus-visible,
	button:focus-visible {
		outline: 2px solid #9f3e52;
		outline-offset: -2px;
	}
	svg {
		width: 1.2rem;
		height: 1.2rem;
		flex: none;
		fill: currentColor;
	}
	svg.stroke {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.7;
		stroke-linecap: round;
	}
	@media (prefers-reduced-motion: reduce) {
		:global(.share-menu[data-state='open']) {
			animation: none;
		}
	}
</style>
