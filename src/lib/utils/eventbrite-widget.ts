export interface EventbriteThemeSettings {
	brandColor: string;
	fontColor: string;
	background: string;
}

export interface EventbriteCheckoutWidgetOptions {
	eventId: string;
	iframeContainerId: string;
	iframeContainerHeight?: number;
	iframeAutoAdapt?: number;
	promoCode?: string;
	themeSettings?: EventbriteThemeSettings;
	onOrderComplete?: () => void;
}

export interface EventbriteModalWidgetOptions {
	eventId: string;
	modalTriggerElementId: string;
	promoCode?: string;
	themeSettings?: EventbriteThemeSettings;
	onOrderComplete?: () => void;
}

let scriptPromise: Promise<void> | null = null;

export function loadEventbriteWidgets(): Promise<void> {
	if (typeof window === 'undefined') return Promise.resolve();
	if (window.EBWidgets) return Promise.resolve();

	if (!scriptPromise) {
		scriptPromise = new Promise((resolve, reject) => {
			const existing = document.querySelector<HTMLScriptElement>(
				'script[src*="eb_widgets.js"]'
			);

			if (existing) {
				if (existing.dataset.loaded === 'true') {
					resolve();
					return;
				}
				existing.addEventListener('load', () => resolve(), { once: true });
				existing.addEventListener('error', () => reject(new Error('Eventbrite widget failed to load')), {
					once: true
				});
				return;
			}

			const script = document.createElement('script');
			script.src = 'https://www.eventbrite.com/static/widgets/eb_widgets.js';
			script.async = true;
			script.dataset.loaded = 'false';
			script.onload = () => {
				script.dataset.loaded = 'true';
				resolve();
			};
			script.onerror = () => reject(new Error('Eventbrite widget failed to load'));
			document.head.appendChild(script);
		});
	}

	return scriptPromise;
}

export async function createInlineCheckoutWidget(
	options: EventbriteCheckoutWidgetOptions
): Promise<void> {
	await loadEventbriteWidgets();
	if (!window.EBWidgets) return;

	window.EBWidgets.createWidget({
		widgetType: 'checkout',
		eventId: options.eventId,
		iframeContainerId: options.iframeContainerId,
		iframeContainerHeight: options.iframeContainerHeight ?? 520,
		iframeAutoAdapt: options.iframeAutoAdapt ?? 100,
		promoCode: options.promoCode,
		themeSettings: options.themeSettings,
		onOrderComplete: options.onOrderComplete
	});
}

export async function createModalCheckoutWidget(
	options: EventbriteModalWidgetOptions
): Promise<void> {
	await loadEventbriteWidgets();
	if (!window.EBWidgets) return;

	window.EBWidgets.createWidget({
		widgetType: 'checkout',
		eventId: options.eventId,
		modal: true,
		modalTriggerElementId: options.modalTriggerElementId,
		promoCode: options.promoCode,
		themeSettings: options.themeSettings,
		onOrderComplete: options.onOrderComplete
	});
}
