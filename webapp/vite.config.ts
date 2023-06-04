import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const port = 3000;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port,
    host: true, // expose in LAN -- needed to run containerized
  },
  preview: {
    port,
    host: true, // expose in LAN
  },
  base: "/wipman",
});
