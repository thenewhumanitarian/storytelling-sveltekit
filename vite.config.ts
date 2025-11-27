import fs from 'fs';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { enhancedImages } from '@sveltejs/enhanced-img';

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync('./cert/localhost-key.pem'),
			cert: fs.readFileSync('./cert/localhost.pem')
		}
	},
	plugins: [sveltekit(), enhancedImages()],
	ssr: {
		noExternal: [],
		// Exclude Node.js built-in modules from client bundling
		resolve: {
			conditions: ['node']
		}
	},
	optimizeDeps: {
		exclude: ['fs', 'path']
	},
	build: {
		rollupOptions: {
			external: (id) => {
				// Exclude Node.js built-in modules from bundling
				return id === 'fs' || id === 'path' || id.startsWith('node:');
			}
		}
	}
});
