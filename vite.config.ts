import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tutorialArticlesPlugin from "./scripts/tutorial-articles-plugin.mjs";

export default defineConfig({
  plugins: [react(), tutorialArticlesPlugin()],
});
