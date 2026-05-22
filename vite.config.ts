import fs from 'fs';
import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';

/** Serve legacy Gatsby HTML from /static in dev (Vercel does this in production). */
function serveLegacyStaticHtml(): Plugin {
	return {
		name: 'serve-legacy-static-html',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				const pathname = req.url?.split('?')[0] ?? '';
				let htmlPath: string | null = null;

				if (
					pathname === '/404' ||
					pathname === '/404/' ||
					pathname === '/404.html'
				) {
					htmlPath = path.join('static', '404.html');
				} else if (pathname.startsWith('/stories/') || pathname.startsWith('/reports/')) {
					htmlPath = path.join('static', pathname, 'index.html');
				}

				if (htmlPath && fs.existsSync(htmlPath)) {
					res.setHeader('Content-Type', 'text/html');
					fs.createReadStream(htmlPath).pipe(res);
					return;
				}
				next();
			});
		}
	};
}

const certKey = path.join('cert', 'localhost-key.pem');
const certFile = path.join('cert', 'localhost.pem');
const hasLocalCerts = fs.existsSync(certKey) && fs.existsSync(certFile);

export default defineConfig({
	server: hasLocalCerts
		? {
				https: {
					key: fs.readFileSync(certKey),
					cert: fs.readFileSync(certFile)
				}
			}
		: {},
	plugins: [serveLegacyStaticHtml(), tailwindcss(), sveltekit()],
	ssr: {
		noExternal: ['@storyblok/svelte'],
		// Exclude Node.js built-in modules from client bundling
		resolve: {
			conditions: ['node']
		}
	},
	optimizeDeps: {
		exclude: ['fs', 'path', '@storyblok/svelte']
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
