import sharp from 'sharp';
import { readdir, stat, writeFile } from 'fs/promises';
import { join, parse } from 'path';

const STATIC_DIR = new URL('../static/images/cleared', import.meta.url).pathname;
const PLACEHOLDER_OUT = new URL('../src/lib/data/cleared/image-placeholders.json', import.meta.url)
	.pathname;
const SKIP_DIRS = ['social'];
const TARGET_WIDTHS = [480, 800, 1200];
const WEBP_QUALITY = 80;
const PLACEHOLDER_WIDTH = 20;
const EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

async function getImageFiles(dir) {
	const files = [];
	const entries = await readdir(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.includes(entry.name)) {
				files.push(...(await getImageFiles(fullPath)));
			}
		} else {
			const { ext, name } = parse(entry.name);
			const isOptimized = /-\d+w$/.test(name);
			if (EXTENSIONS.includes(ext.toLowerCase()) && !isOptimized) {
				files.push(fullPath);
			}
		}
	}
	return files;
}

async function optimizeImage(filePath) {
	const { dir, name } = parse(filePath);
	const image = sharp(filePath);
	const metadata = await image.metadata();
	const srcWidth = metadata.width;
	const srcHeight = metadata.height;
	const srcSize = (await stat(filePath)).size;
	const results = [];

	for (const width of TARGET_WIDTHS) {
		if (width >= srcWidth) continue;
		const outPath = join(dir, `${name}-${width}w.webp`);
		await sharp(filePath).resize(width).webp({ quality: WEBP_QUALITY }).toFile(outPath);
		const outSize = (await stat(outPath)).size;
		results.push({ width, outPath, outSize });
	}

	const fullWebpPath = join(dir, `${name}-${srcWidth}w.webp`);
	await sharp(filePath).webp({ quality: WEBP_QUALITY }).toFile(fullWebpPath);
	const fullSize = (await stat(fullWebpPath)).size;
	results.push({ width: srcWidth, outPath: fullWebpPath, outSize: fullSize });

	// Generate tiny base64 placeholder for blur-up
	const placeholderBuf = await sharp(filePath)
		.resize(PLACEHOLDER_WIDTH)
		.webp({ quality: 20 })
		.toBuffer();
	const placeholder = `data:image/webp;base64,${placeholderBuf.toString('base64')}`;

	return { filePath, srcWidth, srcHeight, srcSize, results, placeholder };
}

async function main() {
	console.log('Optimizing cleared images...\n');
	const files = await getImageFiles(STATIC_DIR);
	console.log(`Found ${files.length} source images.\n`);

	let totalSrcBytes = 0;
	let totalOutBytes = 0;
	let totalFiles = 0;
	const placeholders = {};

	for (const file of files) {
		const { filePath, srcWidth, srcHeight, srcSize, results, placeholder } =
			await optimizeImage(file);
		const relativePath = filePath.replace(STATIC_DIR + '/', '');
		const publicPath = `/images/cleared/${relativePath}`;
		console.log(`${relativePath} (${srcWidth}×${srcHeight}, ${(srcSize / 1024).toFixed(0)}KB)`);

		placeholders[publicPath] = {
			placeholder,
			width: srcWidth,
			height: srcHeight,
			srcset: results.map((r) => `${r.width}w`).join(', ')
		};

		totalSrcBytes += srcSize;
		for (const r of results) {
			const relOut = r.outPath.replace(STATIC_DIR + '/', '');
			console.log(`  → ${relOut} (${(r.outSize / 1024).toFixed(0)}KB)`);
			totalOutBytes += r.outSize;
			totalFiles++;
		}
	}

	await writeFile(PLACEHOLDER_OUT, JSON.stringify(placeholders, null, '\t'));
	console.log(`\nPlaceholder manifest → ${PLACEHOLDER_OUT}`);

	console.log(`\n${'─'.repeat(50)}`);
	console.log(`Generated ${totalFiles} optimized WebP files.`);
	console.log(`Source total: ${(totalSrcBytes / 1024 / 1024).toFixed(1)}MB`);
	console.log(`WebP total:  ${(totalOutBytes / 1024 / 1024).toFixed(1)}MB`);
	console.log(`Savings:     ${((1 - totalOutBytes / totalSrcBytes) * 100).toFixed(0)}%`);
}

main().catch(console.error);
