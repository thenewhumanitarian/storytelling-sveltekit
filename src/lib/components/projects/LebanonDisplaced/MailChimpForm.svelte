<script lang="ts">
	import { storyblokEditable } from '@storyblok/svelte';
	const { blok } = $props();

	let formId = `form-${blok._uid}`;

	// Optional: load external Mailchimp JS only once
	let scriptLoaded = false;
	function loadMailchimpScript() {
		if (scriptLoaded) return;
		scriptLoaded = true;
		const script = document.createElement('script');
		script.src = '//s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
		script.async = true;
		document.body.appendChild(script);
	}
</script>

<div
	use:storyblokEditable={blok}
	id={formId}
	class="mailchimp-form-container my-4 border-[0.5px] border-lebblack bg-transparent p-4"
>
	<form action={blok.formActionUrl} method="post" target="_blank" novalidate class="validate">
		{#if blok.formTitle}
			<h3>{blok.formTitle}</h3>
		{/if}

		<!-- Email field (basic example) -->
		<div class="mc-field-group font-amman">
			<label for="mce-EMAIL">Email <span class="asterisk">*</span></label>
			<input
				type="email"
				name="EMAIL"
				class="required email border-lebgreen focus:border-lebgreen focus:outline-burgundy focus:ring-lebgreen"
				id="mce-EMAIL"
				placeholder="Enter your email"
				required
			/>
		</div>

		<!-- Additional dynamic fields (optional) -->
		{#each blok.fields || [] as field}
			{#if field.type === 'checkbox'}
				<div class="mc-field-group input-group">
					<label>
						<input type="checkbox" name={field.name} id={field.id} value="true" />
						{field.label}
					</label>
				</div>
			{:else if field.type === 'text'}
				<div class="mc-field-group">
					<label for={field.id}>{field.label}</label>
					<input type="text" name={field.name} id={field.id} />
				</div>
			{/if}
		{/each}

		<!-- Honeypot -->
		<div style="position: absolute; left: -5000px;" aria-hidden="true">
			<input type="text" name="b_fake_field" tabindex="-1" />
		</div>

		<!-- Submit -->
		<div class="clear cursor-pointer bg-lebgreen px-3 py-1 hover:bg-burgundy">
			<input
				type="submit"
				class="button font-amman text-white"
				value={blok.submitText || 'Subscribe'}
			/>
		</div>
	</form>
</div>

<style>
	/* .mailchimp-form-container {
		background: #fff;
		padding: 1rem;
		border: 1px solid #ccc;
		width: 100%;
		max-width: 600px;
	} */
	label {
		display: block;
		margin-bottom: 0.5rem;
		text-align: left;
		padding-left: 0.25rem;
	}
	input[type='email'],
	input[type='text'] {
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 1rem;
	}
</style>
