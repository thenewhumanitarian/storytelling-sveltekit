import type { Attachment } from 'svelte/attachments';

export interface RevealOptions {
	y?: number;
	delay?: number;
	threshold?: number;
	once?: boolean;
}

export function reveal(options: RevealOptions = {}): Attachment {
	return (root) => {
		const element = root as HTMLElement;
		const { y = 24, delay = 0, threshold = 0.15, once = true } = options;
		const prefersReducedMotion =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		if (prefersReducedMotion) return;

		element.style.opacity = '0';
		element.style.transform = `translate3d(0, ${y}px, 0)`;
		element.style.transition = `opacity 700ms ease-out ${delay}ms, transform 700ms ease-out ${delay}ms`;
		element.style.willChange = 'opacity, transform';

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						element.style.opacity = '1';
						element.style.transform = 'translate3d(0, 0, 0)';
						if (once) observer.disconnect();
					} else if (!once) {
						element.style.opacity = '0';
						element.style.transform = `translate3d(0, ${y}px, 0)`;
					}
				}
			},
			{ threshold }
		);
		observer.observe(element);

		return () => observer.disconnect();
	};
}
