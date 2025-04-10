<script>
	import { page } from '$app/stores';
	import { PUBLIC_BASE_PATH, PUBLIC_AR_PATH } from '$env/static/public';

	// Reactive current path
	$: currentPath = $page.url.pathname;

	// Dynamically compute language URLs using env variables
	$: englishUrl = currentPath.startsWith(PUBLIC_AR_PATH)
		? currentPath.replace(PUBLIC_AR_PATH, PUBLIC_BASE_PATH)
		: currentPath;

	$: arabicUrl = currentPath.startsWith(PUBLIC_AR_PATH)
		? currentPath
		: currentPath.replace(PUBLIC_BASE_PATH, PUBLIC_AR_PATH);
</script>

<nav>
	<ul>
		<li class={`${currentPath === englishUrl ? 'active bg-brown underline' : ''} px-1`}>
			<a href={englishUrl} rel="alternate" lang="en">English</a>
		</li>
		<li class={`${currentPath === arabicUrl ? 'active bg-brown underline' : ''} px-1`}>
			<a href={arabicUrl} rel="alternate" lang="ar">العربية</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: end;
		gap: 1rem;
	}

	ul {
		display: flex;
		list-style: none;
		padding: 0;
	}

	li {
		margin: 0 0.2rem;
	}

	a {
		text-decoration: none;
		color: #333;
		font-weight: normal;
	}

	/* Ensure active link is styled correctly */
	li.active a {
		font-weight: bold;
		color: black;
	}

	a:hover {
		text-decoration: underline;
	}
</style>
