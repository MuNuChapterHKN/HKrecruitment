import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.REACT_APP_API_ENDPOINT': JSON.stringify(env.REACT_APP_API_ENDPOINT)
  },
  plugins: [react()],
});
