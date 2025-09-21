(function () {
    // Self-executing function to keep variables scoped and avoid globals
    try {
        // 1) Resolve the current <script> element and read optional data-attributes
        //
        // data-target: id of the container element to mount into (default: 'gaza-aid-killings')
        // data-src:    URL of the iframe source (defaults to the production Gaza dashboard)
        // data-track:  Optional override for the tracking endpoint; if omitted we derive it
        var scriptEl = document.currentScript;
        var targetId = (scriptEl && scriptEl.getAttribute('data-target')) || 'gaza-aid-killings';
        var src =
            (scriptEl && scriptEl.getAttribute('data-src')) ||
            'https://interactive.thenewhumanitarian.org/embeddable/map/2025-09/gaza';

        // Ensure the target container exists (create one if it doesn't)
        var target = document.getElementById(targetId);
        if (!target) {
            target = document.createElement('div');
            target.id = targetId;
            document.body.appendChild(target);
        }

        // 2) Inject minimal CSS for the responsive iframe and a simple shimmer while loading
        var css =
            '' +
            // Wrapper fills available width
            '.tnh-gaza-embed { position: relative; width: 100%; }\n' +
            // Iframe keeps a responsive aspect ratio and has no chrome
            '.tnh-gaza-dashboard { width: 100%; aspect-ratio: 4 / 3; border: none; outline: none; box-shadow: none; }\n' +
            // Tweak aspect ratios for narrower viewports
            '@media screen and (max-width: 980px) { .tnh-gaza-dashboard { aspect-ratio: 1; } }\n' +
            '@media screen and (max-width: 640px) { .tnh-gaza-dashboard { aspect-ratio: 1 / 1.6; } }\n' +
            // Loading shimmer while the iframe contents arrive
            '.tnh-gaza-dashboard { --light-grey:#eee; --dark-grey:#ddd; background: repeating-linear-gradient(to right, var(--light-grey) 0%, var(--dark-grey) 50%, var(--light-grey) 100%); background-size: 200% auto; background-position: 0 100%; animation: tnh-gaza-loading 2s infinite linear; }\n' +
            '@keyframes tnh-gaza-loading { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }';

        var style = document.createElement('style');
        style.type = 'text/css';
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        // 3) Build the iframe element and apply safe attributes
        var wrapper = document.createElement('div');
        wrapper.className = 'tnh-gaza-embed';

        var iframe = document.createElement('iframe');
        iframe.className = 'tnh-gaza-dashboard';
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('scrolling', 'no');
        iframe.setAttribute('allowtransparency', 'true');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('title', 'Gaza Aid Seekers Dashboard');
        iframe.src = src;

        // Once the iframe loads, remove the shimmer styles
        iframe.addEventListener('load', function () {
            iframe.style.background = 'none';
            iframe.style.animation = 'none';
        });

        // 4) Fire-and-forget tracking beacon so every embed view is counted
        //    Prefer navigator.sendBeacon (non-blocking, reliable). Fallback to a GET image ping.
        try {
            // Derive tracker endpoint if not explicitly provided via data-track
            var trackUrl = (scriptEl && scriptEl.getAttribute('data-track')) || (src.replace(/\/gaza$/, '') + '/gaza/track');

            // Minimal payload — GA event wiring happens server-side
            var payload = {
                v: 1,
                t: 'embed',
                referrer: (document.referrer || ''),
                location: (window.location && window.location.href) || ''
            };

            var json = JSON.stringify(payload);
            if (navigator && typeof navigator.sendBeacon === 'function') {
                // POST JSON using sendBeacon (does not block page unload)
                navigator.sendBeacon(trackUrl, new Blob([json], { type: 'application/json' }));
            } else {
                // Fallback: cache-busted GET request via Image
                var img = new Image();
                var ts = Date.now();
                img.src = trackUrl + '?v=1&ts=' + ts + '&referrer=' + encodeURIComponent(payload.referrer);
            }
        } catch (e) {
            // Tracking failures should never break the embed
            /* ignore tracking errors */
        }

        // 5) Mount the iframe
        wrapper.appendChild(iframe);
        target.innerHTML = '';
        target.appendChild(wrapper);
    } catch (e) {
        // Fail safe: if anything goes wrong, log and do not throw
        console.error('[TNH Gaza Embed] Failed to initialize embed:', e);
    }
})();
