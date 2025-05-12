<script lang="ts">
	let status = $state('idle');
	let deploymentId = $state('');
	let deploymentUrl = $state('');
	let pollInterval = $state(null);

	async function deploy(event: MouseEvent) {
		event.preventDefault();
		status = 'loading';

		const res = await fetch('/api/deploy', { method: 'POST' });
		const data = await res.json();

		if (res.ok) {
			deploymentId = data.deploymentId;
			deploymentUrl = data.url;
			status = 'queued';
			startPolling();
		} else {
			status = 'error';
		}
	}

	function startPolling() {
		clearPolling();
		pollInterval = setInterval(checkStatus, 4000);
	}

	function clearPolling() {
		if (pollInterval) {
			clearInterval(pollInterval);
			pollInterval = null;
		}
	}

	async function checkStatus() {
		console.log('Checking status for deploymentId:', deploymentId);

		if (!deploymentId) {
			console.warn('No deploymentId set yet.');
			status = 'error';
			clearPolling();
			return;
		}

		const res = await fetch(`/api/deploy/${deploymentId}/status`);
		if (!res.ok) {
			const errorText = await res.text();
			console.error('Status check failed:', errorText);
			status = 'error';
			clearPolling();
			return;
		}

		const data = await res.json();
		console.log('Deployment status response:', data);

		if (['queued', 'building', 'ready', 'error', 'canceled'].includes(data.state)) {
			status = data.state;
		} else {
			console.warn('Unknown status:', data.state);
			status = 'error';
			clearPolling();
		}

		if (['ready', 'error', 'canceled'].includes(status)) {
			clearPolling();
		}
	}

	$effect(() => {
		console.log('Status changed:', status);
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-gray-100">
	<h1 class="text-xl font-bold">Deployment Dashboard</h1>
	<button
		type="button"
		onclick={deploy}
		disabled={status === 'loading' || status === 'building' || status === 'queued'}
		class="rounded bg-burgundy px-3 py-1 font-bold text-white"
	>
		{#if status === 'loading'}
			Triggering...
		{:else}
			Trigger Deployment
		{/if}
	</button>

	{#if status === 'queued'}
		<p>🚦 Deployment is queued...</p>
	{:else if status === 'building'}
		<p>🏗️ Deployment in progress...</p>
	{:else if status === 'ready'}
		<p>✅ Deployment successful! <a href={'https://' + deploymentUrl} target="_blank">View</a></p>
	{:else if status === 'error'}
		<p class="text-red-600">❌ Deployment failed</p>
	{/if}
</div>
