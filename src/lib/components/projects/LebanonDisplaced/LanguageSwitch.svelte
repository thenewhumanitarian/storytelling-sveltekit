<script>
	import { page } from '$app/stores';
	import { PUBLIC_LDD_EN_BASE_PATH, PUBLIC_LDD_AR_BASE_PATH } from '$env/static/public';

	// Reactive current path
	$: currentPath = $page.url.pathname;

	$: englishUrl = currentPath.startsWith(PUBLIC_LDD_AR_BASE_PATH)
		? currentPath.replace(PUBLIC_LDD_AR_BASE_PATH, PUBLIC_LDD_EN_BASE_PATH)
		: currentPath;

	$: arabicUrl = currentPath.startsWith(PUBLIC_LDD_AR_BASE_PATH)
		? currentPath
		: currentPath.replace(PUBLIC_LDD_EN_BASE_PATH, PUBLIC_LDD_AR_BASE_PATH);

	function handleChange(event) {
		event.preventDefault();
		if (event.target?.value) {
			window.location.href = event.target.value;
		}
	}
</script>

<nav class="flex items-center justify-end gap-2 bg-transparent px-2 py-1 sm:px-0">
	<label for="lang-switcher" class="sr-only">Language selector</label>
	<select
		id="lang-switcher"
		class="appearance-none bg-transparent px-3 py-2 pr-6 text-xs text-lebblack focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy sm:pr-8 sm:text-base cursor-pointer"
		onchange={handleChange}
	>
		<option value={englishUrl} selected={currentPath === englishUrl}>English</option>
		<option value={arabicUrl} selected={currentPath === arabicUrl}>العربية</option>
	</select>
</nav>
