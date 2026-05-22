import type { Attachment } from 'svelte/attachments';

export interface ScrollyOptions {
	onProgress?: (progress: number, activeStep: number, stepProgress: number) => void;
}

let pluginRegistered = false;

const TRIGGER_LINE_PCT = 70;

export function scrolly(options: ScrollyOptions = {}): Attachment {
	return (root) => {
		const element = root as HTMLElement;
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const stepNodes = Array.from(element.querySelectorAll<HTMLElement>('[data-scrolly-step]'));

		if (stepNodes.length === 0) return;
		const total = stepNodes.length;

		if (prefersReducedMotion) {
			const observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							const index = stepNodes.indexOf(entry.target as HTMLElement);
							if (index >= 0) options.onProgress?.(index / total, index, 0.5);
						}
					}
				},
				{
					rootMargin: `-${TRIGGER_LINE_PCT}% 0px -${100 - TRIGGER_LINE_PCT - 4}% 0px`,
					threshold: 0
				}
			);
			stepNodes.forEach((node) => observer.observe(node));
			return () => observer.disconnect();
		}

		let triggers: Array<{ kill: () => void }> = [];
		let cancelled = false;
		let currentActive = 0;

		(async () => {
			const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
				import('gsap'),
				import('gsap/ScrollTrigger')
			]);

			if (cancelled) return;

			if (!pluginRegistered) {
				gsap.registerPlugin(ScrollTrigger);
				pluginRegistered = true;
			}

			const setActive = (i: number, stepProgress: number) => {
				currentActive = i;
				options.onProgress?.((i + stepProgress) / total, i, stepProgress);
			};

			stepNodes.forEach((node, i) => {
				const t = ScrollTrigger.create({
					trigger: node,
					start: `top ${TRIGGER_LINE_PCT}%`,
					end: `bottom ${TRIGGER_LINE_PCT}%`,
					onToggle: (self) => {
						if (self.isActive) setActive(i, self.progress);
					},
					onUpdate: (self) => {
						if (self.isActive && currentActive === i) {
							setActive(i, self.progress);
						}
					}
				});
				triggers.push(t);
			});
		})();

		return () => {
			cancelled = true;
			triggers.forEach((t) => t.kill());
			triggers = [];
		};
	};
}
