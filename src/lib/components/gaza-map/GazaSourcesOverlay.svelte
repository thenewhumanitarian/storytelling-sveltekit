<script lang="ts">
	import type { IncidentData } from './types';
	import moment from 'moment';

	export let incident: IncidentData;
	export let onClose: () => void;
</script>

<div
	class="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-zinc-700 p-3 sources-overlay sm:bg-zinc-200"
>
	<div class="relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-4 sm:flex sm:h-full sm:w-full sm:max-w-none sm:bg-transparent sm:p-0 flex-col">
		<button
			class="absolute right-[12px] top-1 z-10 text-3xl text-zinc-400 hover:text-burgundy sm:-top-2 sm:right-0 sm:text-burgundy sm:hover:text-burgundy/80"
			onclick={onClose}
			aria-label="Close sources overlay">×</button
		>

		<!-- Incident Info Header - Match card structure exactly -->
		<div class="flex-grow">
			<div class="flex items-center justify-between gap-2 sm:gap-2">
				<div class="flex items-center gap-2">
					<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">
						{incident.type === 'event' ? 'Event' : 'Incident'}
					</span>
					<span class="text-sm text-gray-700 sm:text-zinc-700">
						{moment(incident.date).format('DD MMMM YYYY')}
					</span>
				</div>
			</div>
			<div class="mb-3">
				<h3 class="mt-2 line-clamp-1 text-lg font-bold leading-tight text-black sm:text-xl">
					{incident.title}
				</h3>
				{#if incident.killedOrWounded}
					<h5 class="mb-2 text-sm italic text-gray-600 sm:text-zinc-600 sm:text-base">
						{incident.killedOrWounded} killed/wounded
					</h5>
				{/if}
			</div>
		</div>

		<!-- Sources Section - Match card bottom area exactly -->
		{#if incident.sources && incident.sources.trim() !== ''}
			<div class="mt-3 border-t border-dashed border-zinc-300">
				<div class="sm:mt-4 sm:flex sm:justify-start">
					<h4 class="mb-1 mt-2 font-serif text-lg font-bold text-black">Sources</h4>
				</div>
				<div class="overflow-y-auto">
					{#if incident.sources && incident.sources.includes('<')}
						<div class="text-base text-gray-700">{@html incident.sources}</div>
					{:else if incident.sources}
						<div class="text-sm text-gray-700 sm:text-base">{incident.sources}</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	/* Style links within the sources overlay */
	:global(.sources-overlay a) {
		font-weight: bold;
		text-decoration: underline;
		color: #9f3e52; /* burgundy color to match the theme */
		transition: color 0.2s ease;
	}

	:global(.sources-overlay a:hover) {
		color: #7c2d3f; /* darker burgundy on hover */
		text-decoration: underline;
	}

	:global(.sources-overlay a:focus) {
		outline: 2px solid #9f3e52;
		outline-offset: 2px;
	}
</style>
