import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { Mode, plugin as markdown } from "vite-plugin-markdown";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, ".", "");
	return {
		server: {
			port: 3000,
			host: "0.0.0.0",
		},
		plugins: [tailwindcss(), react(), markdown({ mode: [Mode.HTML] })],
		define: {
			"process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
			"process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "."),
			},
		},
	};
});
