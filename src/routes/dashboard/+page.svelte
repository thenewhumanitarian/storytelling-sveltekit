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

	async function checkStatus() {
		console.log('Checking status for deploymentId:', deploymentId);
		if (!deploymentId) {
			status = 'error';
			clearInterval(pollInterval);
			return;
		}

		const res = await fetch(`/api/deploy/${deploymentId}/status`);
		if (!res.ok) {
			console.error(await res.text());
			clearInterval(pollInterval);
			status = 'error';
			return;
		}

		const data = await res.json();
		console.log('✅ Deployment status response:', data);
		status = data.state;

		if (
			!['INITIALIZING', 'QUEUED', 'BUILDING', 'READY', 'ERROR', 'CANCELED'].includes(data.state)
		) {
			console.warn('⚠️ Unknown status:', data.state);
			status = 'error';
			clearInterval(pollInterval);
			return;
		}

		if (['READY', 'ERROR', 'CANCELED'].includes(data.state)) {
			clearInterval(pollInterval);
		}
	}

	function startPolling() {
		pollInterval = setInterval(checkStatus, 4000);
	}

	$effect(() => {
		console.log('Status changed:', status);
	});
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-gray-100">
	<h1 class="mb-0">Deployment Dashboard</h1>
	<button
		type="button"
		onclick={deploy}
		disabled={['loading', 'BUILDING', 'QUEUED', 'INITIALIZING'].includes(status)}
		class="rounded-full bg-burgundy px-3 py-1 font-bold text-white"
	>
		{#if status === 'loading'}
			Triggering...
		{:else}
			Trigger Deployment
		{/if}
	</button>

	{#if status.toLocaleUpperCase() === 'INITIALIZING'}
		<p>🔄 Deployment is initializing...</p>
	{:else if status.toLocaleUpperCase() === 'LOADING'}
		<p>⚡️ Deployment loading.</p>
	{:else if status.toLocaleUpperCase() === 'IDLE'}
		<p>✨ Click to trigger a deploy...</p>
	{:else if status.toLocaleUpperCase() === 'QUEUED'}
		<p>🚦 Deployment is queued...</p>
	{:else if status.toLocaleUpperCase() === 'BUILDING'}
		<p>🏗️ Deployment in progress...</p>
	{:else if status.toLocaleUpperCase() === 'READY'}
		<p>✅ Deployment successful!</p>
	{:else if status.toLocaleUpperCase() === 'ERROR'}
		<p style="color: red;">❌ Deployment failed</p>
	{:else if status.toLocaleUpperCase() === 'CANCELED'}
		<p style="color: red;">🚫 Deployment was canceled</p>
	{:else}
		<p>⚠️ Unknown status: {status}</p>
	{/if}
</div>
