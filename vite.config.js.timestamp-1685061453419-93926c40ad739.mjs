// vite.config.js
import {
  defineConfig
} from "file:///E:/web3D/project/test_project/project/3D_project/node_modules/_vite@4.3.8@vite/dist/node/index.js";
import react from "file:///E:/web3D/project/test_project/project/3D_project/node_modules/_@vitejs_plugin-react@4.0.0@@vitejs/plugin-react/dist/index.mjs";
import glsl from "file:///E:/web3D/project/test_project/project/3D_project/node_modules/_vite-plugin-glsl@1.1.2@vite-plugin-glsl/src/index.js";
var vite_config_default = defineConfig({
  plugins: [react(), glsl()],
  assetsInclude: ["**/*.glb", "**/*.gltf"]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJFOlxcXFx3ZWIzRFxcXFxwcm9qZWN0XFxcXHRlc3RfcHJvamVjdFxcXFxwcm9qZWN0XFxcXDNEX3Byb2plY3RcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkU6XFxcXHdlYjNEXFxcXHByb2plY3RcXFxcdGVzdF9wcm9qZWN0XFxcXHByb2plY3RcXFxcM0RfcHJvamVjdFxcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRTovd2ViM0QvcHJvamVjdC90ZXN0X3Byb2plY3QvcHJvamVjdC8zRF9wcm9qZWN0L3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHtcclxuICAgIGRlZmluZUNvbmZpZ1xyXG59IGZyb20gJ3ZpdGUnXHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCdcclxuaW1wb3J0IGdsc2wgZnJvbSAndml0ZS1wbHVnaW4tZ2xzbCc7XHJcblxyXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xyXG4gICAgcGx1Z2luczogW3JlYWN0KCksIGdsc2woKV0sXHJcbiAgICBhc3NldHNJbmNsdWRlOiBbXCIqKi8qLmdsYlwiLCBcIioqLyouZ2x0ZlwiXSxcclxufSkiXSwKICAibWFwcGluZ3MiOiAiO0FBQThVO0FBQUEsRUFDMVU7QUFBQSxPQUNHO0FBQ1AsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUdqQixJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUN4QixTQUFTLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUFBLEVBQ3pCLGVBQWUsQ0FBQyxZQUFZLFdBQVc7QUFDM0MsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K