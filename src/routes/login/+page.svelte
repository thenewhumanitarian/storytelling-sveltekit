<script lang="ts">
	let email_valid = $state(false);
	let password_valid = $state(false);
	let error = $state('');
	let disabled = $derived(!email_valid || !password_valid);

	async function login(e: SubmitEvent) {
		e.preventDefault();
		if (disabled) return;

		const form = e.target as HTMLFormElement;
		const data = new FormData(form);

		const res = await fetch('/api/login', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				username: data.get('username'),
				password: data.get('password')
			})
		});

		if (res.ok) {
			window.location.href = '/dashboard';
		} else {
			error = 'Login failed. Check your credentials.';
		}
	}
</script>

<div class="flex h-screen w-screen items-center justify-center bg-gray-100">
	<form on:submit={login} class="flex flex-col gap-4 bg-white p-6 shadow-md">
		<label>
			Username
			<input
				name="username"
				required
				minlength="3"
				on:input={(e) => (email_valid = e.target.validity.valid)}
			/>
		</label>

		<label>
			Password
			<input
				name="password"
				type="password"
				required
				minlength="3"
				on:input={(e) => (password_valid = e.target.validity.valid)}
			/>
		</label>

		<button
			class="cursor-pointer bg-burgundy px-3 py-1 font-bold text-white"
			type="submit"
			{disabled}>Login</button
		>

		{#if error}
			<p style="color: red;">{error}</p>
		{/if}
	</form>
</div>
