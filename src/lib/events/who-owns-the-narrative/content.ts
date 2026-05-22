import type { EventContent } from '../types';

export const content: EventContent = {
	intro: {
		eyebrow: 'The New Humanitarian · New York',
		title: 'Stories of migration deserve better tellers',
		text: 'The evening explores how migration and displacement stories are shaped across journalism, culture, and public discourse — and what changes when the people most affected lead the storytelling. Chaired by TNH Migration Editor Eric Reidy.'
	},
	speakers: [
		{
			id: 'bridgit-evans',
			name: 'Bridgit Antoinette Evans',
			role: 'Artist, culture change strategist, and CEO of the Pop Culture Collaborative',
			bio: 'Bridgit Antoinette Evans works at the intersection of art, narrative change, and culture — building strategies that shift how audiences understand migration, identity, and justice.',
			image: '/images/events/who-owns-the-narrative/speakers/photos/bridgit-evans-photo.png',
			imageAlt: 'Portrait of Bridgit Antoinette Evans'
		},
		{
			id: 'arian-moayed',
			name: 'Arian Moayed',
			role: 'Actor, writer, and director; co-founder of Waterwell',
			bio: 'Arian Moayed is an actor, writer, and director whose work spans stage and screen. As co-founder of Waterwell, he champions stories that centre immigrant and diaspora experiences.',
			image: '/images/events/who-owns-the-narrative/speakers/photos/event--arian--only-photo.png',
			imageAlt: 'Portrait of Arian Moayed'
		},
		{
			id: 'mazin-sidahmed',
			name: 'Mazin Sidahmed',
			role: 'Co-Founder and Executive Director, Documented',
			bio: 'Mazin Sidahmed co-founded Documented to report on immigration with and for communities directly affected — challenging who gets to define the narrative.',
			image: '/images/events/who-owns-the-narrative/speakers/photos/mazin-sidahmed-photo.png',
			imageAlt: 'Portrait of Mazin Sidahmed'
		},
		{
			id: 'annie-slemrod',
			name: 'Annie Slemrod',
			role: 'Journalist, storyteller, and Middle East Editor at The New Humanitarian',
			bio: 'Annie Slemrod brings years of reporting from conflict and displacement zones to TNH’s Middle East coverage — asking whose voices shape how crises are understood.',
			image: '/images/events/who-owns-the-narrative/speakers/photos/annie-slemrod-photo.png',
			imageAlt: 'Portrait of Annie Slemrod'
		}
	],
	programme: [
		{
			id: 'doors',
			time: '6:30pm EDT',
			title: 'Doors open & refreshments',
			description:
				'Arrive at Victor Borge Hall, Scandinavia House. Refreshments provided by Cardamom & Rose Catering.'
		},
		{
			id: 'main',
			time: '6:45–8:00pm EDT',
			title: 'Welcome, film screening, panel & Q&A',
			description:
				'Opening remarks, a screening of We Were the Scenery, followed by a conversation with our guest speakers and audience Q&A.'
		},
		{
			id: 'reception',
			time: '8:00–8:30pm EDT',
			title: 'Closing reception',
			description: 'Refreshments and conversation to close the evening.'
		}
	],
	film: {
		title: 'We Were the Scenery',
		year: 2025,
		runtime: '15 minutes',
		director: 'Christopher Radcliff',
		writer: 'Cathy Linh Che',
		producers: 'Jess X. Snow (Producer & Cinematographer)',
		description:
			'Filmed on location in Vietnam, the Philippines, and Long Beach, California, We Were the Scenery is a short documentary based on the experiences of writer Cathy Linh Che’s parents — two Vietnam War refugees who, while in a refugee camp in the Philippines, were utilised as background extras in Apocalypse Now.',
		credits: [
			'U.S.A. & Canada · Vietnamese with English subtitles',
			'Writer and Producer: Cathy Linh Che',
			'Producer & Cinematographer: Jess X. Snow'
		],
		awards: [
			'Shortlisted for the 98th Academy Awards — Best Documentary Short Film',
			'Sundance Film Festival 2025 — Short Film Jury Prize for Nonfiction',
			'2025 DOC NYC Short List',
			'2026 Cinema Eye Honors nominee'
		],
		poster: '/images/events/who-owns-the-narrative/film-poster.png',
		posterAlt:
			'We Were the Scenery — film poster with motion-blurred green foliage and Sundance Film Festival award laurel'
	},
	details: {
		catering:
			'Refreshments provided by Cardamom & Rose Catering, who support newly resettled Afghan refugee women while showcasing Afghan cuisine across the NYC/Jersey City area.',
		partnershipNote:
			'Presented in partnership with the New York Office of the Rosa Luxemburg Foundation.'
	},
	chapters: [
		{
			id: 'speakers',
			number: 1,
			eyebrow: 'In conversation',
			title: 'Guest speakers',
			subtitle:
				'Journalists, artists, and culture-makers on who tells migration stories — and who should.',
			accent: 'burgundy',
			vizSide: 'right',
			steps: [
				{
					id: 'bridgit',
					eyebrow: 'Guest speaker',
					title: 'Bridgit Antoinette Evans',
					text: 'Artist, culture change strategist, and CEO of the Pop Culture Collaborative — building narrative strategies that shift public understanding of migration and justice.',
					viz: { type: 'speaker', speakerId: 'bridgit-evans' }
				},
				{
					id: 'arian',
					eyebrow: 'Guest speaker',
					title: 'Arian Moayed',
					text: 'Actor, writer, and director; co-founder of Waterwell — championing stage and screen stories that centre immigrant and diaspora experiences.',
					viz: { type: 'speaker', speakerId: 'arian-moayed' }
				},
				{
					id: 'mazin',
					eyebrow: 'Guest speaker',
					title: 'Mazin Sidahmed',
					text: 'Co-Founder and Executive Director of Documented — reporting on immigration with and for communities directly affected by policy.',
					viz: { type: 'speaker', speakerId: 'mazin-sidahmed' }
				},
				{
					id: 'annie',
					eyebrow: 'Guest speaker',
					title: 'Annie Slemrod',
					text: 'Journalist, storyteller, and Middle East Editor at The New Humanitarian — reporting from displacement and conflict with a focus on whose voices are heard.',
					viz: { type: 'speaker', speakerId: 'annie-slemrod' }
				}
			]
		},
		{
			id: 'programme',
			number: 2,
			eyebrow: 'On the night',
			title: 'Programme',
			subtitle:
				'An evening of film, conversation, and community — 8 June 2026 at Scandinavia House.',
			accent: 'cream',
			vizSide: 'left',
			steps: [
				{
					id: 'doors-step',
					eyebrow: '6:30pm EDT',
					title: 'Doors open & refreshments',
					text: 'Arrive at Victor Borge Hall. Refreshments provided by Cardamom & Rose Catering.',
					viz: { type: 'programme', programmeId: 'doors' }
				},
				{
					id: 'main-step',
					eyebrow: '6:45–8:00pm EDT',
					title: 'Welcome, film, panel & Q&A',
					text: 'Opening remarks, screening of We Were the Scenery, and a panel conversation chaired by Eric Reidy with audience Q&A.',
					viz: { type: 'programme', programmeId: 'main' }
				},
				{
					id: 'reception-step',
					eyebrow: '8:00–8:30pm EDT',
					title: 'Closing reception',
					text: 'Refreshments and conversation to close the evening.',
					viz: { type: 'programme', programmeId: 'reception' }
				}
			]
		}
	]
};
