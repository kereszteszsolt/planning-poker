import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");
  return {
    base: environment.VITE_BASE_PATH || "/",
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/socket.io": {
          target:
            environment.VITE_SOCKET_PROXY_TARGET || "http://127.0.0.1:3000",
          ws: true,
        },
      },
    },
  };
});
