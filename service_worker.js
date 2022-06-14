const cacheName = 'cache'
const precacheResources = ['minesweeper.html', 'minesweeper.css', 'minesweeper.js', 'fancy_input.js', 'minesweeper_manifest.json', 'DMSans-Regular.woff2', 'DMSans-Bold.woff2', 'JetBrainsMono-Regular.woff2', 'JetBrainsMono-Bold.woff2', 'favicon.svg']

self.addEventListener('install', (e) => {
	e.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)))
})

self.addEventListener('fetch', (e) => {
	e.respondWith(
		caches.match(e.request).then((cachedResponse) => {
			if (cachedResponse) return cachedResponse
		})
	)
})