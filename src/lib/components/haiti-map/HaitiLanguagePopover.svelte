<script lang="ts">
	import { Check, ChevronDown, Globe } from '@lucide/svelte';
	import { Popover } from 'bits-ui';
	import type { HaitiLang } from './copy';
	import { copy } from './copy';

	let {
		lang,
		setLang
	}: {
		lang: HaitiLang;
		setLang: (lang: HaitiLang) => void;
	} = $props();

	let open = $state(false);

	const languages: { code: HaitiLang; label: string }[] = [
		{ code: 'en', label: 'English' },
		{ code: 'fr', label: 'Français' }
	];

	function selectLanguage(next: HaitiLang) {
		setLang(next);
		open = false;
	}
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="inline-flex h-8 items-center gap-1.5 border border-zinc-200 bg-white/90 px-2 text-xs font-semibold text-zinc-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-1"
		aria-label={`${copy[lang].language}: ${lang.toUpperCase()}`}
	>
		<Globe size={16} strokeWidth={2} aria-hidden="true" />
		<span>{lang.toUpperCase()}</span>
		<ChevronDown
			size={13}
			strokeWidth={2}
			aria-hidden="true"
			class={`transition-transform ${open ? 'rotate-180' : ''}`}
		/>
	</Popover.Trigger>

	<Popover.Portal>
		<Popover.Content
			side="bottom"
			align="start"
			sideOffset={6}
			class="z-[100] min-w-40 border border-zinc-200 bg-white p-1 shadow-lg focus:outline-none"
			role="menu"
			aria-label={copy[lang].language}
		>
			<p class="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
				{copy[lang].language}
			</p>
			{#each languages as language (language.code)}
				<button
					type="button"
					class={`flex w-full items-center justify-between gap-4 px-2 py-2 text-left text-sm transition-colors hover:bg-zinc-100 focus-visible:bg-zinc-100 focus-visible:outline-none ${lang === language.code ? 'font-semibold text-burgundy' : 'text-zinc-700'}`}
					onclick={() => selectLanguage(language.code)}
					role="menuitemradio"
					aria-checked={lang === language.code}
				>
					<span>{language.label}</span>
					{#if lang === language.code}
						<Check size={15} strokeWidth={2.5} aria-hidden="true" />
					{/if}
				</button>
			{/each}
		</Popover.Content>
	</Popover.Portal>
</Popover.Root>
