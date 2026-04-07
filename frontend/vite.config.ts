import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const mainnetProxyTarget =
    env.VITE_STACKS_MAINNET_API_BASE || "https://api.mainnet.hiro.so";
  const testnetProxyTarget =
    env.VITE_STACKS_TESTNET_API_BASE || "https://api.testnet.hiro.so";

  return ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: {
      "/stacks-mainnet": {
        target: mainnetProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stacks-mainnet/, ""),
      },
      "/stacks-testnet": {
        target: testnetProxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/stacks-testnet/, ""),
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  });
});