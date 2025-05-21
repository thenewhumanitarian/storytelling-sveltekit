<script lang="ts">
	import { getContext } from 'svelte';

	import { storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	const lang = getContext('lang');
	const isRtl = lang === 'ar';

	const formId = `form-${blok._uid}`;
	const formActionUrl =
		blok.formActionUrl ||
		'https://thenewhumanitarian.us12.list-manage.com/subscribe/post?u=31c0c755a8105c17c23d89842&id=d842d98289&f_id=002838e0f0';

	const state = $state({
		submitting: false,
		success: false,
		error: ''
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		state.submitting = true;
		state.success = false;
		state.error = '';

		const form = event.target as HTMLFormElement;
		const formData = new FormData(form);

		try {
			await fetch(form.action, {
				method: 'POST',
				mode: 'no-cors',
				body: formData
			});

			state.success = true;
			form.reset();
		} catch (err) {
			state.error = 'There was a problem submitting the form.';
			console.error('Mailchimp error:', err);
		} finally {
			state.submitting = false;
		}
	}
</script>

<div use:storyblokEditable={blok} id={formId} class="mailchimp-form-container my-4 bg-transparent">
	<form
		class="signup"
		action={formActionUrl}
		method="post"
		target="_blank"
		novalidate
		on:submit={handleSubmit}
	>
		{#if blok.formTitle}
			<h3 class="mb-3 font-amman text-xl">{blok.formTitle}</h3>
		{/if}

		<!-- Email -->
		{#if !state.success}
			<div class="mc-field-group mb-3 text-left font-amman">
				<label for="mce-EMAIL" class="mb-1 block text-left font-bold">
					{#if isRtl}
						البريد الإلكتروني
					{:else}
						Email
					{/if}<span class="asterisk text-burgundy">*</span>
				</label>
				<input
					type="email"
					name="EMAIL"
					id="mce-EMAIL"
					required
					class="required email w-full border-lebgreen bg-brown px-3 py-2 text-lebblack focus:border-lebgreen focus:outline-burgundy focus:ring-lebgreen"
					placeholder={isRtl ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
					aria-label={isRtl ? 'البريد الإلكتروني' : 'Email'}
					aria-required="true"
				/>
			</div>

			<!-- Weekly newsletter checkboxes -->
			<div class="mc-field-group input-group mb-4 text-left font-amman" dir={isRtl ? 'rtl' : 'ltr'}>
				<strong class="mb-1 block"> </strong>
				<ul class="pl-2">
					<li class="mb-1">
						<input
							class="checkbox focus:ring-burgundy focus:outline-burgundy bg-brown focus:border-lebgreen"
							type="checkbox"
							name="group[3777][67108864]"
							id="mce-group[3777]-3777-0"
							value="true"
						/>
						<label for="mce-group[3777]-3777-0" class="ml-1">
							{#if isRtl}
								اشترك في النشرة الإخبارية الأسبوعية
							{:else}
								Also subscribe to our weekly newsletter
							{/if}
						</label>
					</li>
				</ul>
			</div>

			<!-- Hidden tag for LDD -->
			<input type="hidden" name="tags" value="12166124" />

			<!-- Honeypot -->
			<div style="position: absolute; left: -5000px;" aria-hidden="true">
				<input type="text" name="b_fake_field" tabindex="-1" />
			</div>
		{/if}

		<!-- Feedback messages -->
		{#if state.success}
			<p class="w-full bg-brown p-2 text-center font-amman text-lebblack">
				{#if isRtl}
					<span class="font-bold">شكرا على الاشتراك!</span><br />
					يرجى التحقق من صندوق بريدك الإلكتروني لتأكيد الاشتراك.
				{:else}
					<span class="font-bold">Thank you for subscribing!</span><br />Please check your email
					inbox to confirm the subscription.
				{/if}
			</p>
		{:else if state.error}
			<p class="font-amman text-sm text-red-600">{state.error}</p>
		{/if}

		<!-- Submit -->
		{#if !state.success}
			<div class="mt-4 text-center">
				<button
					type="submit"
					disabled={state.submitting}
					class="button w-full cursor-pointer bg-lebgreen px-4 py-2 font-amman text-white hover:bg-burgundy disabled:cursor-not-allowed disabled:opacity-60"
				>
					{state.submitting ? 'Sending' : blok.submitText || 'Subscribe'}
				</button>
			</div>
		{/if}
	</form>
</div>

<style>
	:global(.arabic .signup *) {
		direction: rtl;
		/* text-align: right; */
	}

	.asterisk {
		margin-left: 0.25rem;
	}

	.checkbox:checked,
	.checkbox:focus,
	.checkbox:active {
		background-color: #9f3e52 !important;
		border-color: #9f3e52 !important;
		outline: none !important;
	}
</style>
