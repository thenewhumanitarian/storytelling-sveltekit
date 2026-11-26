// Backdrop photos for /climate. Files are generated AVIF/WebP size sets (most toned darker and
// less saturated at build time to suit the page), imported through Vite so they get hashed,
// long-cached URLs. `placeholder` is a 24px WebP shown blurred until the full image arrives.

const files = import.meta.glob<string>('$lib/assets/climate/backdrops/*.{avif,webp}', {
	eager: true,
	query: '?url',
	import: 'default'
});

function srcset(slug: string, format: 'avif' | 'webp', widths: number[]) {
	return widths
		.map((w) => `${files[`/src/lib/assets/climate/backdrops/${slug}-${w}.${format}`]} ${w}w`)
		.join(', ');
}

export type Backdrop = {
	slug: string;
	alt: string;
	width: number;
	height: number;
	/** object-position: keeps the subject in frame on narrow, tall screens. */
	focus: string;
	/** Extra darkening (0–1) on top of the page vignette, so each photo sits in the dark palette. */
	shade: number;
	placeholder: string;
	avif: string;
	webp: string;
	/** Fallback src for the rare browser without srcset support. */
	src: string;
	credit: { name: string; profile: string; page: string; source: 'Unsplash' | 'Pexels' };
};

function photo(
	slug: string,
	widths: number[],
	rest: Omit<Backdrop, 'slug' | 'avif' | 'webp' | 'src'>
): Backdrop {
	const mid = widths.find((w) => w >= 1280) ?? widths[widths.length - 1];
	return {
		slug,
		...rest,
		avif: srcset(slug, 'avif', widths),
		webp: srcset(slug, 'webp', widths),
		src: files[`/src/lib/assets/climate/backdrops/${slug}-${mid}.webp`]
	};
}

// The cover crop is driven by height on tall screens, and the layer is 124% of the scene's width
// (for the parallax) and zooms up to 1.12x.
export const backdropSizes = '(max-aspect-ratio: 5/4) 170vh, 140vw';

export const backdrops: Backdrop[] = [
	photo('wildfire', [640, 960, 1280, 1600, 2000], {
		alt: 'Wildfire burning across a hillside at dusk',
		width: 2000,
		height: 1334,
		focus: '42% 60%',
		shade: 0.04,
		placeholder:
			'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAADQBACdASoYABAAPu1iqU2ppaOiMAgBMB2JagCdMoHgd5/8BAczDBjcMU6cbS4PgADhfnr+tKiKPLOU4JYfAxKRJTiID6z9eE7Z0uRqdra6adusGsY/CQEJZhO2GIsed9luDxBEpkPl6Mldp4tAiu8nshWgAA==',
		credit: {
			name: 'Conservation Commons',
			profile:
				'https://unsplash.com/@conservationcommons?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			page: 'https://unsplash.com/photos/wildfire-burning-across-hillside-at-dusk-kbTp7dBzHyY?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			source: 'Unsplash'
		}
	}),
	photo('cleared-forest', [640, 960, 1280, 1500], {
		alt: 'A cleared forest with one small cluster of trees left standing',
		width: 1500,
		height: 1000,
		focus: '50% 45%',
		shade: 0.24,
		placeholder:
			'data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAABwBACdASoYABAAPu1iqU2ppaQiMAgBMB2JQBOkEUk/wHdcERk3vyRX8V6VAADymQBXMJ1ANHv2o9xvMdaNv00F8kRFs2ptkgW0ZlEn32CU0EjSdvqgetYGKADLyptfGtjoVDg7MBYWVZR7KhbKVkUIlewAAA==',
		credit: {
			name: 'Conservation Commons',
			profile:
				'https://unsplash.com/@conservationcommons?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			page: 'https://unsplash.com/photos/cleared-forest-with-small-tree-cluster-K5KmnZHv1Pg?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			source: 'Unsplash'
		}
	}),
	photo('drought', [640, 960, 1280, 1500], {
		alt: 'Cracked, dried-out field of cut rice stalks',
		width: 1500,
		height: 1125,
		focus: '50% 50%',
		shade: 0.4,
		placeholder:
			'data:image/webp;base64,UklGRoIAAABXRUJQVlA4IHYAAADQAwCdASoYABIAPuVgpE2pJaOiMAwBIByJZwAAcDa7FVEsQlcFSLAA/iaSVgoARECnZ4mA1hkMsTl2yb4xH5ub3VvNCJL796GbFNTPow70DDeEkwfpj4W9MLJAWSfOdiUWSgGVAbCXjytYT9oliXUzx/2AAAAA',
		credit: {
			name: 'Md. Hasanuzzaman Himel',
			profile:
				'https://unsplash.com/@himel_bd?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			page: 'https://unsplash.com/photos/a-large-field-of-dead-plants-in-the-middle-of-the-day-mz278SNa2ek?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText',
			source: 'Unsplash'
		}
	}),
	photo('idlib', [640, 960, 1280, 1600, 2000], {
		alt: 'A man looks over destroyed homes in Idlib, Syria',
		width: 2000,
		height: 1333,
		focus: '66% 50%',
		shade: 0.34,
		placeholder:
			'data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAADQAwCdASoYABAAPu1iqk2ppaQiMAgBMB2JZQDE2BQU1RoBa79xViAA4P1CiLJ/lOD23ahw6iiez2sjYH84aLrO3tgB8gzTQI1QoO1gejdymfb38IJqS0GHF32GT5KBRVjbPhNFn9QHS7RqBPZWjabkmUzspPtqBIUgJQ/lv7zr9JAA',
		credit: {
			name: 'Ahmed akacha',
			profile: 'https://www.pexels.com/@ahmed-akacha-3313934/',
			page: 'https://www.pexels.com/photo/6471683/',
			source: 'Pexels'
		}
	})
];
