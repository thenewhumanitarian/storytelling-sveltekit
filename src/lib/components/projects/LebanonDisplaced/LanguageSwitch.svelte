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

	// Active language detection
	$: isEnglishActive =
		currentPath.startsWith(PUBLIC_BASE_PATH) && !currentPath.startsWith(PUBLIC_AR_PATH);
	$: isArabicActive = currentPath.startsWith(PUBLIC_AR_PATH);

	// Debugging (optional)
	// $: console.log('Current Path:', currentPath);
	// $: console.log('English URL:', englishUrl);
	// $: console.log('Arabic URL:', arabicUrl);
</script>

<nav>
	<ul>
		<li class={`${currentPath === englishUrl ? 'active bg-sun underline' : ''} px-1`}>
			<a href={englishUrl} rel="alternate" lang="en">English</a>
		</li>
		<li class={`${currentPath === arabicUrl ? 'active bg-sun underline' : ''} px-1`}>
			<a href={arabicUrl} rel="alternate" lang="ar">العربية</a>
		</li>
	</ul>
</nav>

<style>
	nav {
		display: flex;
		justify-content: center;
		border: 2px solid black;
		border-top-left-radius: 255px 15px;
		border-top-right-radius: 15px 225px;
		border-bottom-right-radius: 225px 15px;
		border-bottom-left-radius: 15px 255px;
		padding: 0.5rem;
	}

	ul {
		display: flex;
		list-style: none;
		padding: 0;
	}

	li {
		margin: 0 0.5rem;
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
