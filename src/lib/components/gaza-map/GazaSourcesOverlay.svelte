<script lang="ts">
	import type { IncidentData } from './types';
	import moment from 'moment';

	export let incident: IncidentData;
	export let onClose: () => void;
</script>

<div
	class="absolute inset-0 z-40 flex items-center justify-center overflow-hidden bg-zinc-700 p-3 shadow-lg"
>
	<div class="relative flex h-full w-full flex-col">
		<button
			class="absolute right-0 -top-2 z-10 text-3xl text-zinc-200 hover:text-white"
			onclick={onClose}
			aria-label="Close sources overlay">×</button
		>
		
		<!-- Incident Info Header - Match card structure -->
		<div class="flex-grow">
			<div class="flex items-center justify-between gap-2 sm:gap-2 mb-3">
				<div class="flex items-center gap-2">
					<span class="bg-burgundy px-2 py-1 text-sm font-bold text-white">
						{incident.type === 'event' ? 'Event' : 'Incident'}
					</span>
					<span class="text-sm text-zinc-300">
						{moment(incident.date).format('DD MMMM YYYY')}
					</span>
				</div>
			</div>
			<div class="mb-3">
				<h3 class="mt-2 line-clamp-1 text-lg font-bold leading-tight sm:text-xl text-white">
					{incident.title}
				</h3>
				{#if incident.killedOrWounded}
					<h5 class="mb-2 text-sm italic text-zinc-300 sm:text-base">
						{incident.killedOrWounded} killed/wounded
					</h5>
				{/if}
			</div>
		</div>

		<!-- Sources Section - Match card bottom area -->
		{#if incident.sources && incident.sources.trim() !== ''}
			<div class="mt-3 border-t border-dashed border-zinc-600">
				<div class="sm:mt-4 sm:flex sm:justify-start">
					<h4 class="font-serif text-lg font-bold text-white mb-2">Sources</h4>
				</div>
				<div class="overflow-y-auto max-h-60">
					{#if incident.sources && incident.sources.includes('<')}
						<div class="text-base text-gray-50">{@html incident.sources}</div>
					{:else if incident.sources}
						<div class="text-sm sm:text-base text-gray-50">{incident.sources}</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
