<script>
	let { children } = $props();
</script>

<svelte:head>
	<title>TNH| Title is missing</title>
	<meta name="description" content="This is a prototype." />
	<meta name="robots" content="noindex" />
	<!-- Need to add more meta data here later -->
</svelte:head>

<div class="arabic" dir="rtl">
	{@render children()}
</div>
