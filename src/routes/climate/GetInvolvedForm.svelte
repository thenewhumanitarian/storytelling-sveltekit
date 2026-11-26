<script lang="ts">
	/*
	 * "Get involved": a private tips form for the research team. Used on /climate/landing and on
	 * its own at /climate/embed/forms/get-involved (for an iframe in Drupal). Both routes run the
	 * same "tip" action from $lib/server/climate-tips.
	 */
	import { enhance } from '$app/forms';

	type TipResult = {
		ok: boolean;
		message: string;
		values?: { message: string; name: string; email: string } | null;
	};
	interface Props {
		/** Signed page-render stamp from formStamp(), a bot trap. */
		stamp: string;
		/** The page's form prop: the last tip action result. */
		form: TipResult | null | undefined;
	}
	let { stamp, form }: Props = $props();

	let sending = $state(false);
	let sent = $state(false);
</script>

<section id="get-involved" class="involve" aria-labelledby="involve-title">
	<h2 id="involve-title">Get involved</h2>
	<p>
		The project is just getting started. If you work in this space, or have research, stories or
		ideas to share, we’d love to hear from you.
	</p>
	<p>
		As the research progresses, send us tips, leads, research topics or anything we should look
		into.
	</p>

	{#if sent && form?.ok}
		<p class="sent" role="status">{form.message}</p>
		<button class="text-button" type="button" onclick={() => (sent = false)}
			>Send another message</button
		>
	{:else}
		<form
			method="POST"
			action="?/tip"
			use:enhance={() => {
				sending = true;
				return async ({ result, update }) => {
					await update({ reset: result.type === 'success' });
					sending = false;
					if (result.type === 'success') sent = true;
				};
			}}
		>
			<input type="hidden" name="started" value={stamp} />
			<div class="trap" aria-hidden="true">
				<label for="tip-website">Website</label>
				<input id="tip-website" name="website" type="text" tabindex="-1" autocomplete="off" />
			</div>

			<label for="tip-message">Your tip, idea or lead</label>
			<textarea
				id="tip-message"
				name="message"
				rows="5"
				maxlength="780"
				required
				value={form?.values?.message ?? ''}
			></textarea>

			<div class="pair">
				<div>
					<label for="tip-name">Name <span>(optional)</span></label>
					<input
						id="tip-name"
						name="name"
						type="text"
						autocomplete="name"
						maxlength="80"
						value={form?.values?.name ?? ''}
					/>
				</div>
				<div>
					<label for="tip-email">Email <span>(optional, if you’d like a reply)</span></label>
					<input
						id="tip-email"
						name="email"
						type="email"
						autocomplete="email"
						maxlength="120"
						value={form?.values?.email ?? ''}
					/>
				</div>
			</div>

			<div class="send-row">
				<button class="button" type="submit" disabled={sending}>
					{sending ? 'Sending…' : 'Send to TNH'}
				</button>
				<p class="hint">Goes privately to the TNH team. It is never published.</p>
			</div>
			{#if form && !form.ok}<p class="error" role="alert">{form.message}</p>{/if}
		</form>
	{/if}
</section>

<style>
	.involve {
		--brand: #9f3e52;
		--brand-hover: #803244;
		--ink: #282828;
		--muted: #5c5550;
		--serif: 'Climate Sectra', Georgia, serif;
		--sans: 'Climate Roboto', Arial, sans-serif;
		color: var(--ink);
		font: 400 1rem/1.5 var(--sans);
	}
	.involve :where(h2, p) {
		margin: 0;
	}
	.involve :where(button, input, textarea):focus {
		outline: none;
	}
	.involve :where(button, input, textarea):focus-visible {
		outline: 2px solid var(--brand);
		outline-offset: 3px;
	}
	h2 {
		font: 700 clamp(1.6rem, 3.4vw, 2.1rem) / 1.15 var(--serif);
		letter-spacing: -0.01em;
	}
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 46px;
		padding: 0.7rem 1.2rem;
		border: 0;
		background: var(--brand);
		color: #fff;
		font: 700 0.98rem/1.2 var(--sans);
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	.button:hover:not(:disabled) {
		background: var(--brand-hover);
	}
	.button:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	/* Set off as a card. */
	.involve {
		padding: clamp(1.4rem, 4vw, 2.2rem);
		background: #f6f1ec;
		border-top: 5px solid var(--brand);
	}
	.involve > p {
		margin-top: 0.7rem;
	}
	form {
		display: grid;
		gap: 0.35rem;
		margin-top: 1.3rem;
	}
	label {
		margin-top: 0.6rem;
		font-weight: 700;
		font-size: 0.92rem;
	}
	label span {
		color: var(--muted);
		font-weight: 400;
	}
	textarea,
	input:not([type='hidden']) {
		width: 100%;
		min-height: 46px;
		padding: 0.6rem 0.7rem;
		border: 1px solid #8f8984;
		border-radius: 0;
		background: #fff;
		color: var(--ink);
		font: 400 1rem/1.45 var(--sans);
	}
	textarea {
		resize: vertical;
	}
	textarea:focus-visible,
	input:focus-visible {
		outline-offset: -2px;
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0 1rem;
	}
	.pair > div {
		display: grid;
		gap: 0.35rem;
	}
	.send-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		margin-top: 1rem;
	}
	.hint {
		color: var(--muted);
		font-size: 0.88rem;
	}
	.error {
		margin-top: 0.5rem;
		color: var(--brand);
		font-weight: 700;
	}
	.sent {
		margin-top: 1.3rem;
		padding: 0.9rem 1rem;
		background: #e3f4ec;
		border-left: 4px solid #35b58b;
		font-weight: 700;
	}
	.text-button {
		margin-top: 0.7rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--brand);
		font: 700 0.95rem/1.4 var(--sans);
		text-decoration: underline;
		cursor: pointer;
	}
	.trap {
		position: absolute;
		left: -5000px;
	}

	@media (max-width: 650px) {
		.pair {
			grid-template-columns: 1fr;
		}
	}
</style>
