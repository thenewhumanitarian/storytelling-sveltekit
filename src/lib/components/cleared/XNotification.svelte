<script lang="ts">
	interface Tweet {
		id: string;
		text: string;
		date: string;
		link: string;
	}

	interface Props {
		tweet: Tweet;
		index: number;
		animationStarted: boolean;
	}

	let { tweet, index, animationStarted }: Props = $props();
</script>

<div
	class="x-notification"
	class:visible={animationStarted}
	style="--delay: {index * 3};"
>
	<div class="notification-header">
		<!-- X Logo -->
		<svg class="x-logo" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
		</svg>
		<div class="author-info">
			<span class="author-name">Himanta Biswa Sarma</span>
			<span class="author-handle">@himantabiswa</span>
		</div>
	</div>

	<p class="tweet-text">{tweet.text}</p>

	<div class="notification-footer">
		<span class="tweet-date">{tweet.date}</span>
		<a
			href={tweet.link}
			target="_blank"
			rel="noopener noreferrer"
			class="tweet-link"
		>
			View on X
			<svg class="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
			</svg>
		</a>
	</div>
</div>

<style>
	.x-notification {
		background: #16181c;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 16px;
		padding: 16px;
		max-width: 500px;
		margin: 0 auto 16px auto;
		opacity: 0;
		transform: translateY(50px);
		transition:
			opacity 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) calc(var(--delay) * 0.2s),
			transform 0.5s cubic-bezier(0.165, 0.84, 0.44, 1) calc(var(--delay) * 0.2s);
	}

	.x-notification.visible {
		opacity: 1;
		transform: translateY(0);
	}

	.notification-header {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 12px;
	}

	.x-logo {
		width: 20px;
		height: 20px;
		fill: #fff;
		flex-shrink: 0;
	}

	.author-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.author-name {
		color: #fff;
		font-weight: 700;
		font-size: 15px;
		line-height: 1.2;
	}

	.author-handle {
		color: #71767b;
		font-size: 14px;
		line-height: 1.2;
	}

	.tweet-text {
		color: #e7e9ea;
		font-size: 15px;
		line-height: 1.5;
		margin: 0 0 12px 0;
		word-wrap: break-word;
	}

	.notification-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.tweet-date {
		color: #71767b;
		font-size: 13px;
	}

	.tweet-link {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		color: #1d9bf0;
		font-size: 13px;
		text-decoration: none;
		transition: color 0.2s;
	}

	.tweet-link:hover {
		color: #4db1f5;
		text-decoration: underline;
	}

	.external-icon {
		width: 12px;
		height: 12px;
	}

	@media (max-width: 600px) {
		.x-notification {
			max-width: 100%;
			margin: 0 0 12px 0;
		}

		.tweet-text {
			font-size: 14px;
		}
	}
</style>
