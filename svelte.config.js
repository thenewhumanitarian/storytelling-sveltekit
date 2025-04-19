import vercel from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	compilerOptions: {

	},

	kit: {
		adapter: vercel(),
		prerender: {
			entries: ['*'] // or let dynamic ones be discovered via your entries() fn
		}
	}
};

export default config;
