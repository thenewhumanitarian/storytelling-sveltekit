<script lang="ts">
	/*
	 * Newsletter signup straight into TNH's Mailchimp audience, from TNH's own embed form for
	 * "Environment and Disasters" updates (group 157, interest 256, pre-ticked and hidden there too).
	 *
	 * With JavaScript, the browser sends the address to Mailchimp's public post-json endpoint (the
	 * same one Mailchimp's embed script uses, as JSONP) and shows Mailchimp's answer in place.
	 * Without JavaScript, the form posts to Mailchimp in a new tab, exactly like the embed.
	 * No API key is involved and the address never touches this site's server.
	 */
	interface Props {
		/** 'dark' on the glass panels, 'light' on a light page. */
		tone?: 'dark' | 'light';
	}
	let { tone = 'dark' }: Props = $props();

	const account = 'https://thenewhumanitarian.us12.list-manage.com/subscribe';
	const ids = { u: '31c0c755a8105c17c23d89842', id: 'd842d98289', f_id: '00a8c0e3f0' };
	const query = new URLSearchParams(ids).toString();
	const group = 'group[157][256]'; // Environment and Disasters
	const honeypot = `b_${ids.u}_${ids.id}`; // Mailchimp's bot trap: must stay empty

	let email = $state('');
	let trap = $state('');
	let status = $state<'idle' | 'sending' | 'done' | 'error'>('idle');
	let message = $state('');

	// Mailchimp's messages can carry HTML (a profile link) and a "0 - " field prefix.
	function plain(text: unknown) {
		const html = typeof text === 'string' ? text : '';
		const doc = new DOMParser().parseFromString(html, 'text/html');
		return (doc.body.textContent ?? '').replace(/^\d+\s*-\s*/, '').trim();
	}

	function jsonp(params: URLSearchParams): Promise<{ result?: string; msg?: unknown }> {
		return new Promise((resolve, reject) => {
			const callback = `tnhMailchimp${Date.now()}${Math.floor(Math.random() * 1e6)}`;
			const script = document.createElement('script');
			const callbacks = window as unknown as Record<string, unknown>;
			const timer = setTimeout(() => finish(new Error('timeout')), 12_000);
			function finish(error: Error | null, data?: { result?: string; msg?: unknown }) {
				clearTimeout(timer);
				delete callbacks[callback];
				script.remove();
				if (error) reject(error);
				else resolve(data ?? {});
			}
			callbacks[callback] = (data: { result?: string; msg?: unknown }) => finish(null, data);
			script.src = `${account}/post-json?${params}&c=${callback}`;
			script.onerror = () => finish(new Error('network'));
			document.head.append(script);
		});
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		if (status === 'sending') return;
		const address = email.trim();
		if (!address) return;
		status = 'sending';
		message = '';
		const params = new URLSearchParams({ ...ids, EMAIL: address, [group]: '', [honeypot]: trap });
		try {
			const reply = await jsonp(params);
			const text = plain(reply.msg);
			if (reply.result === 'success') {
				status = 'done';
				message = text || 'Thank you for signing up.';
				email = '';
			} else if (/already subscribed/i.test(text)) {
				status = 'done';
				message = 'You’re already signed up. Thank you!';
			} else {
				status = 'error';
				message = text || 'Couldn’t sign you up. Please try again.';
			}
		} catch {
			status = 'error';
			message = 'Couldn’t reach the signup service. Please try again.';
		}
	}
</script>

<form
	class={tone}
	method="POST"
	action={`${account}/post?${query}`}
	target="_blank"
	rel="noopener"
	onsubmit={submit}
>
	<label for="updates-email">Email address</label>
	<div class="email-row">
		<input
			id="updates-email"
			name="EMAIL"
			type="email"
			autocomplete="email"
			required
			bind:value={email}
		/>
		<button class="signup-button" type="submit" disabled={status === 'sending'}>
			{status === 'sending' ? 'Signing up…' : 'Sign up'}
		</button>
	</div>
	<input type="hidden" name={group} value="" />
	<div class="trap" aria-hidden="true">
		<input type="text" name={honeypot} tabindex="-1" autocomplete="off" bind:value={trap} />
	</div>
	<p class="field-note" class:error={status === 'error'} role="status">{message}</p>
</form>

<style>
	form {
		margin-top: 0.8rem;
	}
	label {
		font-weight: 700;
		font-size: 0.9rem;
	}
	.email-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.6rem;
		margin-top: 0.3rem;
	}
	.email-row input {
		min-width: 0;
		border: 1px solid #cdc7c0;
		border-radius: 0;
		background: #fff;
		color: #282828;
		text-shadow: none;
		padding-inline: 0.65rem;
	}
	.email-row input:focus {
		border-color: #cdc7c0;
		box-shadow: none;
		outline: 2px solid #9f3e52;
		outline-offset: -2px;
	}
	.signup-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 0.68rem 1.15rem;
		border: 0;
		border-radius: 0;
		background: #9f3e52;
		color: #fff;
		font: 700 0.93rem/1.3 var(--sans, 'Roboto', Arial, sans-serif);
		text-shadow: none;
		cursor: pointer;
		transition: background-color 150ms ease;
	}
	.signup-button:hover:not(:disabled) {
		background: #803244;
	}
	.signup-button:disabled {
		opacity: 0.7;
		cursor: wait;
	}
	.trap {
		position: absolute;
		left: -5000px;
	}
	.field-note {
		margin: 0.5rem 0 0;
		color: rgb(255 255 255 / 85%);
		font-size: 0.875rem;
	}
	.field-note:empty {
		display: none;
	}
	.field-note.error {
		color: #ffc9d2;
	}
	.light .field-note {
		color: #282828;
	}
	.light .field-note.error {
		color: #9f3e52;
		font-weight: 700;
	}
	.light .email-row input {
		border-color: #8f8984;
	}
</style>
