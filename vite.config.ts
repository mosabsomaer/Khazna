import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { Mode, plugin as markdown } from "vite-plugin-markdown";
import { VitePWA } from "vite-plugin-pwa";

const MONTH = 60 * 60 * 24 * 30;

export default defineConfig(() => {
	return {
		server: {
			port: 3000,
			host: "0.0.0.0",
		},
		plugins: [
			tailwindcss(),
			react(),
			markdown({ mode: [Mode.HTML] }),
			VitePWA({
				// lib/pwa.ts registers the worker and decides when an update is applied.
				registerType: "prompt",
				injectRegister: false,
				manifest: {
					id: "/",
					name: "Khazna",
					short_name: "Khazna",
					description:
						"Libyan bank, payment method and payment gateway logos, plus mobile banking UI screenshots.",
					lang: "en",
					dir: "ltr",
					start_url: "/",
					scope: "/",
					display: "standalone",
					theme_color: "#ffffff",
					background_color: "#ffffff",
					categories: ["design", "finance", "utilities"],
					launch_handler: { client_mode: ["navigate-existing", "auto"] },
					// Lets Chromium tell a browser tab that the app is installed already (lib/pwa.ts).
					related_applications: [
						{ platform: "webapp", url: "https://khazna.ly/manifest.webmanifest" },
					],
					prefer_related_applications: false,
					icons: [
						{ src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
						{ src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
						{
							src: "/pwa/maskable-192x192.png",
							sizes: "192x192",
							type: "image/png",
							purpose: "maskable",
						},
						{
							src: "/pwa/maskable-512x512.png",
							sizes: "512x512",
							type: "image/png",
							purpose: "maskable",
						},
					],
					shortcuts: [
						{
							name: "Logos",
							url: "/",
							icons: [{ src: "/pwa/shortcut-logos.png", sizes: "96x96", type: "image/png" }],
						},
						{
							name: "App UI",
							url: "/apps",
							icons: [{ src: "/pwa/shortcut-apps.png", sizes: "96x96", type: "image/png" }],
						},
					],
					screenshots: [
						{
							src: "/pwa/screenshot-logos.webp",
							sizes: "786x1704",
							type: "image/webp",
							form_factor: "narrow",
							label: "Every Libyan bank and payment logo in one place",
						},
						{
							src: "/pwa/screenshot-details.webp",
							sizes: "786x1704",
							type: "image/webp",
							form_factor: "narrow",
							label: "Download a logo as SVG, PNG or WebP, or copy it as code",
						},
						{
							src: "/pwa/screenshot-apps.webp",
							sizes: "786x1704",
							type: "image/webp",
							form_factor: "narrow",
							label: "Browse the screens of Libyan banking apps",
						},
						{
							src: "/pwa/screenshot-wide.webp",
							sizes: "1280x800",
							type: "image/webp",
							form_factor: "wide",
							label: "Khazna logo library",
						},
					],
				},
				workbox: {
					// The app shell plus every logo, so the library opens and downloads work offline.
					globPatterns: [
						"**/*.{js,css,html}",
						"*.svg",
						"fonts/*",
						"apple-touch-icon.png",
						"founders/sm/*.webp",
						"contributors/*.webp",
						"cdn/v1/logos/**/*.svg",
						// Precached, not runtime cached: <audio> fetches byte ranges, and a 206 can't be cached.
						"sounds/*.{wav,m4a}",
					],
					navigateFallback: "/index.html",
					// Real files (logos on the CDN path, screenshots, sounds) are never answered with the app.
					// Workbox tests the path with its query, so only a dot in the last path segment counts.
					navigateFallbackDenylist: [/^[^?]*\.[^/?]+(?:\?.*)?$/],
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					runtimeCaching: [
						{
							// App screenshots (the installed app saves them all, lib/offline.ts) show straight
							// from the device and refresh in the background when online, so an updated screen
							// still arrives and a saved one never expires.
							urlPattern: ({ url, sameOrigin }) =>
								sameOrigin && /^\/screenshots\/.+\.webp$/.test(url.pathname),
							handler: "StaleWhileRevalidate",
							options: {
								// lib/offline.ts counts what's saved by this name.
								cacheName: "khazna-screens",
								expiration: { maxEntries: 1000, purgeOnQuotaError: true },
							},
						},
						{
							urlPattern: ({ url, sameOrigin }) =>
								sameOrigin && /^\/founders\/.+\.webp$/.test(url.pathname),
							handler: "CacheFirst",
							options: {
								cacheName: "khazna-images",
								expiration: { maxEntries: 60, maxAgeSeconds: MONTH, purgeOnQuotaError: true },
							},
						},
						{
							urlPattern: ({ url }) => url.origin === "https://fonts.googleapis.com",
							handler: "StaleWhileRevalidate",
							options: { cacheName: "google-fonts-stylesheets" },
						},
						{
							urlPattern: ({ url }) => url.origin === "https://fonts.gstatic.com",
							handler: "CacheFirst",
							options: {
								cacheName: "google-fonts-webfonts",
								cacheableResponse: { statuses: [0, 200] },
								expiration: { maxEntries: 30, maxAgeSeconds: MONTH * 12 },
							},
						},
					],
				},
			}),
		],
		build: {
			rollupOptions: {
				output: {
					manualChunks: {
						"react-vendor": ["react", "react-dom", "react-router-dom", "react-router"],
						i18n: ["i18next", "react-i18next"],
						ui: ["@radix-ui/react-tabs", "@radix-ui/react-tooltip", "lucide-react"],
					},
				},
			},
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "."),
			},
		},
	};
});
