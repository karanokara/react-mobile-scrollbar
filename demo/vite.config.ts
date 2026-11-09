import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// import path from 'path';
// import babel from '@rolldown/plugin-babel';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // babel({ presets: [reactCompilerPreset()] })
  ],

  base: '/react-mobile-scrollbar/', // <-- Add this line to handle assets find from  https://xxx.github.io/my-project

  // define: {
  //   // Forces React to run its development build checks even during `vite build`
  //   'process.env.NODE_ENV': JSON.stringify('development'),
  // },

  server: {
    open: true,
    port: 5555,
  },
  preview: {
    port: 5551,
  },
  build: {
    // minify: false,
    // sourcemap: true,
  },
  resolve: {
    // Configure Vite Deduplication, since lib framework has node_modules using different react package
    // Force Vite and Rollup to always resolve react and react- dom to a single instance located in your root project
    dedupe: ['react', 'react-dom'],

    // alias: {
    //   // Forcefully lock React imports to the root project node_modules
    //   react: path.resolve(__dirname, './node_modules/react'),
    //   'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
    //   'react/jsx-runtime': path.resolve(__dirname, './node_modules/react/jsx-runtime'),
    //   'react/jsx-dev-runtime': path.resolve(__dirname, './node_modules/react/jsx-dev-runtime'),
    // },
  },
});
