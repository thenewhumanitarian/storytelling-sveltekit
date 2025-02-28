import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import fs from 'fs';

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync('./cert/localhost-key.pem'),
			cert: fs.readFileSync('./cert/localhost.pem')
		}
	},
	plugins: [sveltekit()]
});
