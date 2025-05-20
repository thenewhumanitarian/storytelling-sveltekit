<script lang="ts">
	import { onMount } from 'svelte';

	onMount(async () => {
		// Load Mailchimp validation script dynamically
		const script = document.createElement('script');
		script.src = 'https://s3.amazonaws.com/downloads.mailchimp.com/js/mc-validate.js';
		script.onload = () => {
			(function ($) {
				window.fnames = [
					'EMAIL',
					'FNAME',
					'LNAME',
					'ORG',
					'ORGTYPE',
					'UPDATES',
					'MMERGE6',
					'',
					'COUNTRY'
				];
				window.ftypes = [
					'email',
					'text',
					'text',
					'text',
					'dropdown',
					'radio',
					'text',
					'',
					'dropdown'
				];
			})(window.jQuery);
			window.$mcj = window.jQuery.noConflict(true);
		};
		document.body.appendChild(script);
	});
</script>

<div id="mc_embed_signup">
	<form
		action="https://thenewhumanitarian.us12.list-manage.com/subscribe/post?u=31c0c755a8105c17c23d89842&amp;id=d842d98289&amp;f_id=002838e0f0"
		method="post"
		id="mc-embedded-subscribe-form"
		name="mc-embedded-subscribe-form"
		class="validate"
		target="_blank"
		novalidate
	>
		<div id="mc_embed_signup_scroll">
			<div class="indicates-required"><span class="asterisk">*</span> indicates required</div>

			<div class="mc-field-group">
				<label for="mce-EMAIL">Email address (required)* <span class="asterisk">*</span></label>
				<input type="email" name="EMAIL" class="required email" id="mce-EMAIL" required />
				<span id="mce-EMAIL-HELPERTEXT" class="helper_text">Please put your email address</span>
			</div>

			<div class="mc-field-group input-group">
				<strong>Sign up for our weekly newsletter</strong>
				<ul>
					<li>
						<input
							type="checkbox"
							name="group[3777][67108864]"
							id="mce-group[3777]-3777-0"
							value=""
						/>
						<label for="mce-group[3777]-3777-0">English</label>
					</li>
				</ul>
			</div>

			<div id="mce-responses" class="clear">
				<div class="response" id="mce-error-response" style="display:none"></div>
				<div class="response" id="mce-success-response" style="display:none"></div>
			</div>

			<div aria-hidden="true" style="position: absolute; left: -5000px;">
				<input type="text" name="b_31c0c755a8105c17c23d89842_d842d98289" tabindex="-1" value="" />
			</div>

			<div class="clear">
				<input
					type="submit"
					name="subscribe"
					id="mc-embedded-subscribe"
					class="button"
					value="Subscribe"
				/>
			</div>
		</div>
	</form>
</div>

<style>
	@import url('https://cdn-images.mailchimp.com/embedcode/classic-061523.css');

	#mc_embed_signup {
		background: #fff;
		clear: left;
		font:
			14px Helvetica,
			Arial,
			sans-serif;
		max-width: 600px;
	}
</style>
