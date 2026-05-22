export type HeroArtifactType = 'headline' | 'quote' | 'voice' | 'tag';

export interface HeroArtifact {
	id: string;
	type: HeroArtifactType;
	text: string;
	attribution?: string;
	href?: string;
	x: number;
	y: number;
	depth: number;
	rotation: number;
	size: 'sm' | 'md' | 'lg';
}

/**
 * Floating narrative fragments for the event hero.
 * Headlines link to real TNH pieces; quotes paraphrase or echo published
 * editorial themes — attributed to series or genre, never to fabricated speakers.
 */
export const heroArtifacts: HeroArtifact[] = [
	{
		id: 'decolonise-story',
		type: 'headline',
		text: 'Decolonise How? Who owns the story?',
		href: 'https://www.thenewhumanitarian.org/column/2025/04/23/decolonise-how-who-owns-story',
		x: 6,
		y: 12,
		depth: 0.88,
		rotation: -3,
		size: 'md'
	},
	{
		id: 'cleared',
		type: 'headline',
		text: 'Cleared: Assam’s mass eviction campaign',
		href: 'https://www.thenewhumanitarian.org/investigation/2026/03/24/india-assam-evictions-forced-displacement',
		x: 74,
		y: 8,
		depth: 0.72,
		rotation: 4,
		size: 'sm'
	},
	{
		id: 'lebanon',
		type: 'headline',
		text: 'Lebanon Displacement Diaries',
		href: 'https://www.thenewhumanitarian.org/interactive-storytelling/2025/05/22/lebanon-displacement-diaries',
		x: 82,
		y: 34,
		depth: 0.58,
		rotation: 5,
		size: 'sm'
	},
	{
		id: 'quote-extraction',
		type: 'quote',
		text: '“Shift from extraction to relationship — from telling the story to honouring community.”',
		attribution: 'Decolonise How?, TNH',
		href: 'https://www.thenewhumanitarian.org/column/2025/04/23/decolonise-how-who-owns-story',
		x: 54,
		y: 20,
		depth: 0.92,
		rotation: 2,
		size: 'lg'
	},
	{
		id: 'quote-film',
		type: 'quote',
		text: '“We were the scenery — not the story.”',
		attribution: 'We Were the Scenery',
		x: 10,
		y: 38,
		depth: 0.78,
		rotation: -5,
		size: 'md'
	},
	{
		id: 'voice-mic',
		type: 'voice',
		text: 'Who gets the mic, the byline, the frame?',
		x: 68,
		y: 52,
		depth: 0.7,
		rotation: 3,
		size: 'md'
	},
	{
		id: 'voice-listen',
		type: 'voice',
		text: 'Voice is not bestowed — it is respected and acted upon',
		x: 14,
		y: 58,
		depth: 0.65,
		rotation: -4,
		size: 'sm'
	},
	{
		id: 'tag-decolonise',
		type: 'tag',
		text: 'Decolonise How?',
		href: 'https://www.thenewhumanitarian.org/column/2025/04/23/decolonise-how-who-owns-story',
		x: 38,
		y: 6,
		depth: 0.42,
		rotation: -7,
		size: 'sm'
	},
	{
		id: 'tag-neutrality',
		type: 'tag',
		text: 'Journalism is not neutral',
		x: 26,
		y: 70,
		depth: 0.38,
		rotation: 4,
		size: 'sm'
	},
	{
		id: 'tag-local',
		type: 'tag',
		text: 'Local voices, not local fixers',
		x: 90,
		y: 68,
		depth: 0.48,
		rotation: -2,
		size: 'sm'
	},
	{
		id: 'headline-listen',
		type: 'headline',
		text: 'Humanitarians have a responsibility to listen',
		href: 'https://www.thenewhumanitarian.org/opinion/2025/05/22/humanitarians-have-responsibility-listen-displacement',
		x: 4,
		y: 76,
		depth: 0.62,
		rotation: -2,
		size: 'sm'
	},
	{
		id: 'quote-witness',
		type: 'quote',
		text: '“Witness with people — not only bear witness to them.”',
		attribution: 'Humanitarian reporting',
		x: 46,
		y: 48,
		depth: 0.5,
		rotation: -1,
		size: 'md'
	},
	{
		id: 'voice-parachute',
		type: 'voice',
		text: 'Parachute in, interpret, publish — whose story is that?',
		x: 58,
		y: 76,
		depth: 0.82,
		rotation: 6,
		size: 'sm'
	},
	{
		id: 'headline-ethics',
		type: 'headline',
		text: 'When ethics become alibis',
		href: 'https://www.thenewhumanitarian.org/column/2025/05/27/decolonise-how-when-ethics-become-alibis',
		x: 32,
		y: 26,
		depth: 0.56,
		rotation: -4,
		size: 'sm'
	},
	{
		id: 'quote-needs-met',
		type: 'quote',
		text: '“A story of needs met — not of dispossession and injustice.”',
		attribution: 'Decolonise How?, TNH',
		href: 'https://www.thenewhumanitarian.org/column/2025/05/27/decolonise-how-when-ethics-become-alibis',
		x: 20,
		y: 22,
		depth: 0.44,
		rotation: 3,
		size: 'sm'
	},
	{
		id: 'voice-speak-back',
		type: 'voice',
		text: 'Space to speak back to aid systems and institutions',
		x: 78,
		y: 18,
		depth: 0.36,
		rotation: 7,
		size: 'sm'
	},
	{
		id: 'headline-narrative',
		type: 'headline',
		text: 'Ten ways to build a new narrative for humanitarianism',
		href: 'https://www.thenewhumanitarian.org/opinion/2026/02/05/ten-ways-build-new-narrative-humanitarianism',
		x: 66,
		y: 42,
		depth: 0.74,
		rotation: -3,
		size: 'sm'
	},
	{
		id: 'quote-complexity',
		type: 'quote',
		text: '“Treat your audience with respect. Tell the fuller story.”',
		attribution: 'TNH Opinion',
		href: 'https://www.thenewhumanitarian.org/opinion/2026/02/05/ten-ways-build-new-narrative-humanitarianism',
		x: 88,
		y: 14,
		depth: 0.4,
		rotation: 5,
		size: 'sm'
	},
	{
		id: 'tag-mission',
		type: 'tag',
		text: 'Mission-oriented journalism',
		x: 50,
		y: 86,
		depth: 0.45,
		rotation: -3,
		size: 'sm'
	},
	{
		id: 'voice-coauthor',
		type: 'voice',
		text: 'Co-authors of the frameworks that govern their lives',
		x: 8,
		y: 48,
		depth: 0.55,
		rotation: 5,
		size: 'md'
	}
];
