import fs from 'fs';
import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

function serveStaticStories(): Plugin {
	return {
		name: 'serve-static-stories',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				if (!req.url?.startsWith('/stories/')) return next();
				const htmlPath = path.join('static', req.url, 'index.html');
				if (fs.existsSync(htmlPath)) {
					res.setHeader('Content-Type', 'text/html');
					fs.createReadStream(htmlPath).pipe(res);
					return;
				}
				next();
			});
		}
	};
}

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync('./cert/localhost-key.pem'),
			cert: fs.readFileSync('./cert/localhost.pem')
		}
	},
	plugins: [serveStaticStories(), tailwindcss(), sveltekit()],
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
